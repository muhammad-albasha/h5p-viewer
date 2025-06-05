class PinyPhone {
    constructor() {
        const _this = this;

        this.version = 3;

        this.runs_in_piny = false;
        this.snapTimer = null;

        this.observer = null;
        this.observer_enabled = false;

        this.debug = false;

        this.log(`PinyPhone version ${this.version} is loaded. Not yet active.`)

        this.id_count = 1;
        this.id_to_el = {}

        this.react_key = null;

        this.options = {
            fiber_use_loc: true
        }

        window.addEventListener("message", function(event) {
            const m = event.data;
            if(m?.from === 'pinegrow') {
                switch(m.message) {
                    case 'hello':
                        _this.runs_in_piny = true;
                        if(m.options) {
                            _this.options = {..._this.options, ...m.options};
                        }
                        _this.sendMessage('hello', {});
                        break;

                    case 'scroll':
                        if(window.getComputedStyle(document.scrollingElement).scrollBehavior === 'smooth') {
                            document.scrollingElement.style.scrollBehavior = 'auto';
                        }
                        document.scrollingElement.scrollTop = m.scrollTop;
                        document.scrollingElement.scrollLeft = m.scrollLeft;
                        break;

                    case 'request_snap':
                        _this.snap(false);
                        break;

                    case 'request_debug':
                        _this.getDebugSnapshot(false);
                        break;

                    case 'enable_observer':
                        _this.enableObserver();
                        break;

                    case 'disable_observer':
                        _this.disableObserver();
                        break;

                    case 'request_sync_scroll':
                        _this.sendMessage('sync_scroll', {
                            scrollTop: document.scrollingElement.scrollTop,
                            scrollLeft: document.scrollingElement.scrollLeft
                        })
                        break;

                }
            }
        }, false);

        let current_route_url = null;

        setInterval(function() {
            if(_this.runs_in_piny) {
                const href = window.location.pathname + window.location.search + window.location.hash;
                if (current_route_url !== href) {
                    _this.sendMessage('route_change', href)
                    current_route_url = href;
                }
            }
        }, 1000)

        const KEY = '_piny_scroll_y';

        window.addEventListener('beforeunload', function() {
            if(_this.observer_enabled) {
                sessionStorage.setItem(KEY, String(document.scrollingElement.scrollTop))
            } else {
                sessionStorage.removeItem(KEY)
            }
        });

        window.addEventListener('DOMContentLoaded', () => {
            const y = sessionStorage.getItem(KEY);
            if (y) {
                console.log('[Piny Phone] Scrolling to ' + y);

                setTimeout(function() {
                    if(window.getComputedStyle(document.scrollingElement).scrollBehavior === 'smooth') {
                        document.scrollingElement.style.scrollBehavior = 'auto';
                    }
                    document.scrollingElement.scrollTop = +y;
                }, 500)
            }
        });
    }

    isEnabled() {
        return this.observer_enabled;
    }

    enableObserver() {
        const _this = this;
        const config = {attributes: true, childList: true, subtree: true};
        const callback = (mutationList, observer) => {
            if (_this.snapTimer) {
                clearTimeout(_this.snapTimer)
            }
            _this.snapTimer = setTimeout(function () {
                _this.snap(true)
            }, 500)
        };
        if(!this.observer) {
            this.observer = new MutationObserver(callback);
        }
        this.observer.observe(document.documentElement, config);
        this.observer_enabled = true;
        this.log('Observer is enabled.')
    }

    disableObserver() {
        if(this.observer) {
            this.observer.disconnect()
        }
        this.observer_enabled = false;
        this.log('Observer is disabled.')
    }

    sendMessage(msg, data) {
        window.parent.postMessage({
            from: 'pinegrowPhone',
            message: msg,
            data: data
        }, '*')
    }

    log(msg, a) {
        this.debug && console.log('pinegrowPhone: ' + msg, a)
    }

    getReactKey(el) {
        if(this.react_key) return this.react_key;
        for (let attr in el) {
            if (attr.startsWith('__reactFiber')) {
                this.react_key = attr;
                return attr;
            }
        }
    }

    snap(observer) {
        const _this = this;

        if(this.snapTimer) {
            clearTimeout(this.snapTimer)
            this.snapTimer = null;
        }
        const st = Date.now();

        this.id_to_el = {}

        const scroll_top = document.scrollingElement.scrollTop;
        const scroll_left = document.scrollingElement.scrollLeft;

        const root = {
            route: window.location.pathname + window.location.search + window.location.hash,
            children: [],
            rect: {
                x: 0,
                y: 0,
                ox: 0,
                oy: 0
            },
            sl: scroll_left,
            st: scroll_top,
            css: {},
            source_observer: observer
        }

        function getReactContainer(el) {
            if(el.nodeType === 9 || el.nodeType === 1) {
                for (let attr in el) {
                    if (attr.startsWith('__reactContainer')) {
                        return {
                            el: el,
                            f: el[attr],
                            attr: attr
                        };
                    }
                }
            }
        }

        function walk(el, current) {
            let c = null;
            if(el.nodeName === 'HEAD') return;

            if(c = getReactContainer(el)) {
                let root_fiber = c.f;
                if(root_fiber?.stateNode?.current) {
                    root_fiber = root_fiber.stateNode.current;
                }
                _this.getReactTree(root_fiber, current, scroll_left, scroll_top);
            } else {
                if(el.nodeType === 1) {
                    const d = _this.doElement(el, current, scroll_left, scroll_top, [], null, true)
                    if(d === 'skip') return;

                    if(d) {
                        current.children.push(d);
                        d.parent = current;
                        current = d;
                    }
                }
                if(el.children) {
                    for(let i = 0; i < el.children.length; i++) {
                        walk(el.children[i], current);
                    }
                }
            }
        }

        const data = root;

        walk(document, data);

        data.scrollHeight = document.scrollingElement.scrollHeight;
        data.scrollWidth = document.scrollingElement.scrollWidth;

        //remove parent props
        function rp(n) {
            if(n.parent) {
                delete n.parent;
            }
            n.children.forEach(rp);
        }

        rp(data)

        this.sendMessage('snap', data)

        this.log(`snap took ${Date.now() - st}ms`, data);

        if(this.debug && false) {
            let s = '';

            function dolevel(d, prefix) {
                s += `\n${prefix} ${d.name || d.tag} ${d.source ? `${d.source.file.split('/').pop()}, ${d.source.line}, ${d.source.character}` : '-'}`
                if(d.debug) {
                    s += `${d.css?.position || ''} (${d.debug.rect.x}, ${d.debug.rect.y}, ${d.debug.rect.width}, ${d.debug.rect.height})`
                }

                d.children.forEach(function (ch) {
                    dolevel(ch, prefix + '--');
                })
            }

            dolevel(data, '')
            this.log(s)
        }

    }

    getElementById(el_id) {
        return this.id_to_el[el_id] || null;
    }

    getElementId(el) {
        return el.__pinegrow_id || null;
    }

    getReactTree(app_root_f, root, scroll_left, scroll_top) {
        const _this = this;

        function firstChildWithNode(f) {
            let i = 0;
            while(f) {
                if(f.stateNode?.getBoundingClientRect) {
                    return f;
                }
                f = f.child;
                i++;
                if(i === 100) break;
            }
            return null;
        }

        function walk(f, current) {
            let add_child_to = current;
            const fiber_with_state = firstChildWithNode(f)
            let d = null;

            if(!f.elementType && !f.ref && !f.type && !f.stateNode && !f._debugInfo) {
                //skip this one
            } else if(fiber_with_state) {
                d = _this.doElement(fiber_with_state.stateNode, current, scroll_left, scroll_top, [], f, f === fiber_with_state);
                if(d && d !== 'skip') {
                    add_child_to.children.push(d)
                    add_child_to = d;
                }
            }
            if(f.child && f.type !== 'svg' && d !== 'skip') {
                walk(f.child, add_child_to)
            }
            if(f.sibling) {
                walk(f.sibling, current);
            }
        }

        walk(app_root_f, root)

    }

    getComponentNameFromFiber(fiber) {
        if(!fiber) return null;
        if(fiber._debugInfo) {
            return fiber._debugInfo?.name;
        }
        if(typeof fiber.type === 'function') {
            return fiber.type.name;
        }

        if(typeof fiber.type === 'object') {
            if(fiber.type?.render) {
                return fiber.type.displayName || fiber.type.render.name || 'Anonymous';
            }
        }
        return null;
    }

    getDebugInfo(fiber, ignore_fibers) {
        if(!fiber) return null;
        //if(ignore_fibers && ignore_fibers.indexOf(fiber) >= 0) return null;

        if(fiber._debugInfo) {
            ignore_fibers.push(fiber)
            return fiber._debugInfo;
        }

        const name = this.getComponentNameFromFiber(fiber)
        if(name) {
            return [{
                name: name
            }]
        }

        return;

        while(fiber._debugOwner) {
            fiber = fiber._debugOwner;
            const di = this.getDebugInfo(fiber, ignore_fibers);
            if(di) return di;
        }
    }

    doElement(element, current, scroll_left, scroll_top, parent_fibers, fiber, use_elid) {
        const rect = element.getBoundingClientRect();
        let data = null;
        let subdata = null;

        const tag = element.nodeName.toLowerCase();
        if(tag === 'script') return;

        const elid = element.__pinegrow_id || ('el' + (++this.id_count));
        element.__pinegrow_id = elid;
        this.id_to_el[elid] = element;

        const computedStyle = window.getComputedStyle(element);
        const isSticky = use_elid && computedStyle.position === 'sticky';
        const isFixedOrSticky = (use_elid && computedStyle.position === 'fixed') || isSticky;

        if(use_elid) {
            let isHidden = computedStyle.display === 'none' || computedStyle.visibility === 'hidden';

            if ((rect.width === 0 || rect.height === 0) && (computedStyle.overflow === 'scroll' || computedStyle.overflow === 'hidden')) {
                isHidden = true;
            }

            if (isHidden) return 'skip';
        }

        const css = {};
        if(use_elid && isFixedOrSticky) {
            css.position = computedStyle.position;
        }
        if(computedStyle.zIndex !== 'auto') {
            css['z-index'] = computedStyle.zIndex;
        }

        const props = {};
        let source = null;
        let owner_name = null;
        let dis = null;

        if(fiber) {
            let _debugSource = null;
            if (typeof fiber.memoizedProps === 'object') {
                for (let prop in fiber.memoizedProps) {
                    if (prop !== 'className' && prop !== 'children') {
                        let val = fiber.memoizedProps[prop];
                        if (typeof val !== 'string' && typeof val !== 'number') {
                            val = '...';
                        }
                        props[prop] = val;
                    }
                }
            }
            if (fiber.key) {
                props.key = fiber.key.toString();
            }
            _debugSource = fiber._debugSource;
            if(!_debugSource && fiber._debugOwner?._debugSource) {
                _debugSource = fiber._debugOwner._debugSource;
            }
            if(_debugSource) {
                source = {
                    line: _debugSource.lineNumber - 1,
                    character: _debugSource.columnNumber - 1,
                    file: _debugSource.fileName
                };

                if(!this.options.fiber_use_loc) {
                    delete source.line;
                    delete source.character;
                }
            }
            owner_name = fiber._debugOwner ? this.getComponentNameFromFiber(fiber._debugOwner) : null;
            dis = this.getDebugInfo(fiber, parent_fibers);
        }

        if(!source) {
            const file = element.getAttribute('data-pg-source-file');
            if(file) {
                const pos = element.getAttribute('data-pg-source-loc');
                if(pos) {
                    const a = pos.split(':');
                    source = {
                        line: parseInt(a[0]) - 1,
                        character: parseInt(a[1]) - 1,
                        file: file
                    };
                }

                if(!dis) {
                    let p = current;
                    let start_comp = true;
                    while(p) {
                        if (p.source?.file === file) {
                            start_comp = false;
                            break;
                        }
                        p = p.parent;
                    }
                    if(start_comp) {
                        const file_name = file.split(/[\/\\]/).pop();
                        const a = file_name.split('.');
                        a.pop();
                        const name = a.join('.');
                        if (name) {
                            dis = [{name: name}]
                        }
                    }
                }
            }
        }

        let debug = null;
        if(this.debug) {
            debug = {
                rect: rect
            };
        }

        // Compute final x,y. If 'fixed' or 'sticky', don't subtract parent's offsets.
        const offsetX = isFixedOrSticky
            ? rect.x + (isSticky ? 0 : scroll_left)
            : rect.x + scroll_left - current.rect.ox;

        const offsetY = isFixedOrSticky
            ? rect.y + (isSticky ? 0 : scroll_top)
            : rect.y + scroll_top - current.rect.oy;

        // We gather all debug info "frames" from the fiber, if any
        if(dis?.length) {
            let first = true;
            dis.forEach((di) => {
                const el_data = {
                    name: di.name,
                    pgid: (first && use_elid) ? elid : null,
                    rect: {
                        x: first ? offsetX : 0,
                        y: first ? offsetY : 0,
                        w: rect.width,
                        h: rect.height,
                        ox: rect.x + scroll_left,
                        oy: rect.y + scroll_top
                    },
                    class: element.getAttribute('class'),
                    source: source,
                    children: [],
                    owner: owner_name,
                    st: first ? element.scrollTop : 0,
                    sl: first ? element.scrollLeft : 0,
                    props,
                    css,
                    debug
                };
                first = false;
                if(!data) {
                    data = el_data;
                } else {
                    subdata = el_data;
                    current.children.push(subdata);
                }
                // push future "frames" into the new object
                current = el_data;
            });
        } else {
            // Fallback for normal DOM element
            data = {
                tag: tag,
                pgid: use_elid ? elid : null,
                rect: {
                    x: offsetX,
                    y: offsetY,
                    w: rect.width,
                    h: rect.height,
                    ox: rect.x + scroll_left,
                    oy: rect.y + scroll_top
                },
                class: element.getAttribute('class'),
                source: source,
                children: [],
                owner: owner_name,
                sl: element.scrollLeft,
                st: element.scrollTop,
                props,
                css,
                debug
            };
        }

        return data;
    }

    getDebugSnapshot() {
        const _this = this;
        function walk(el, current) {
            if(el.nodeType !== 9 && el.nodeType !== 1) return;

            const d = {
                nodeType: el.nodeType,
            }
            if(el.nodeType === 1) {
                const rect = el.getBoundingClientRect()
                d.tag = el.nodeName;
                d.rect = {
                    x: rect.x,
                    y: rect.y,
                    w: rect.width,
                    h: rect.height
                }
                const computedStyle = window.getComputedStyle(el);
                d.sticky = computedStyle.position === 'sticky';
                d.fixed = computedStyle.position === 'fixed';
            }

            for (let attr in el) {
                if (attr.startsWith('__reactContainer')) {
                    let root_fiber = el[attr];
                    if(root_fiber?.stateNode?.current) {
                        root_fiber = root_fiber.stateNode.current;
                    }
                    const tree_data = {
                        children: [],
                        rect: {
                            x: 0,
                            y: 0,
                            ox: 0,
                            oy: 0
                        },
                        sl: 0,
                        st: 0,
                    }
                    _this.getReactTree(root_fiber, tree_data, 0, 0)
                    d.reactContainer = attr;
                    d.reactFiberTree = tree_data;
                }
                if (attr.startsWith('__reactFiber')) {
                    const f = el[attr];
                    d.reactFiber = {
                        attr: attr,
                        stateNode: f.stateNode ? f.stateNode?.nodeName : null,
                    };
                }
            }
            current.children.push(d);

            if(el.children) {
                d.children = [];
                for(let i = 0; i < el.children.length; i++) {
                    walk(el.children[i], d);
                }
            }
        }

        const data = {
            version: this.version,
            children: []
        }

        try {
            walk(document, data);
            console.log('[piny phone] debug snapshot', data);
        } catch(err) {
            console.error(`[piny phone]`, err)
        }
        this.sendMessage('debug', data)

        return data;
    }

}

window.pinyPhone = new PinyPhone();

