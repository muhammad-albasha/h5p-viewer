import React, { useRef, useCallback } from 'react';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value,
  onChange,
  placeholder = "Geben Sie hier Ihren Text ein...",
  className = ""
}) => {
  const editorRef = useRef<HTMLDivElement>(null);

  const handleInput = useCallback(() => {
    if (editorRef.current) {
      const content = editorRef.current.innerHTML;
      onChange(content);
    }
  }, [onChange]);

  const execCommand = useCallback((command: string, value?: string) => {
    document.execCommand(command, false, value);
    handleInput();
  }, [handleInput]);

  const insertHTML = useCallback((html: string) => {
    if (editorRef.current) {
      editorRef.current.focus();
      document.execCommand('insertHTML', false, html);
      handleInput();
    }
  }, [handleInput]);

  const formatBlock = useCallback((tagName: string) => {
    execCommand('formatBlock', `<${tagName}>`);
  }, [execCommand]);

  const createLink = useCallback(() => {
    const url = prompt('URL eingeben:');
    if (url) {
      execCommand('createLink', url);
    }
  }, [execCommand]);

  const insertImage = useCallback(() => {
    const url = prompt('Bild-URL eingeben:');
    if (url) {
      insertHTML(`<img src="${url}" alt="Bild" style="max-width: 100%; height: auto;" />`);
    }
  }, [insertHTML]);
  const toolbarButtons = [
    {
      title: 'Fett',
      icon: 'B',
      command: () => execCommand('bold'),
      style: { fontWeight: 'bold' }
    },
    {
      title: 'Kursiv',
      icon: 'I',
      command: () => execCommand('italic'),
      style: { fontStyle: 'italic' }
    },
    {
      title: 'Unterstrichen',
      icon: 'U',
      command: () => execCommand('underline'),
      style: { textDecoration: 'underline' }
    },
    {
      title: 'Durchgestrichen',
      icon: 'S',
      command: () => execCommand('strikeThrough'),
      style: { textDecoration: 'line-through' }
    },
    { divider: true },
    {
      title: 'Überschrift 1',
      icon: 'H1',
      command: () => formatBlock('h1')
    },
    {
      title: 'Überschrift 2',
      icon: 'H2',
      command: () => formatBlock('h2')
    },
    {
      title: 'Überschrift 3',
      icon: 'H3',
      command: () => formatBlock('h3')
    },
    {
      title: 'Absatz',
      icon: 'P',
      command: () => formatBlock('p')
    },
    { divider: true },
    {
      title: 'Nummerierte Liste',
      icon: '1.',
      command: () => execCommand('insertOrderedList')
    },
    {
      title: 'Aufzählung',
      icon: '•',
      command: () => execCommand('insertUnorderedList')
    },
    { divider: true },
    {
      title: 'Linksbündig',
      icon: '⇤',
      command: () => execCommand('justifyLeft')
    },
    {
      title: 'Zentriert',
      icon: '⇔',
      command: () => execCommand('justifyCenter')
    },
    {
      title: 'Rechtsbündig',
      icon: '⇥',
      command: () => execCommand('justifyRight')
    },
    {
      title: 'Blocksatz',
      icon: '⇿',
      command: () => execCommand('justifyFull')
    },
    { divider: true },
    {
      title: 'Link einfügen',
      icon: '🔗',
      command: createLink
    },
    {
      title: 'Bild einfügen',
      icon: '🖼️',
      command: insertImage
    },
    { divider: true },
    {
      title: 'Einzug vergrößern',
      icon: '→',
      command: () => execCommand('indent')
    },
    {
      title: 'Einzug verkleinern',
      icon: '←',
      command: () => execCommand('outdent')
    },
    { divider: true },
    {
      title: 'Formatierung entfernen',
      icon: '✗',
      command: () => execCommand('removeFormat')
    }
  ];

  return (
    <div className={`border border-gray-300 rounded-lg overflow-hidden bg-white ${className}`}>
      {/* Toolbar */}
      <div className="border-b border-gray-200 bg-gray-50 p-2 flex flex-wrap gap-1">
        {toolbarButtons.map((button, index) => {
          if (button.divider) {
            return (
              <div
                key={index}
                className="w-px h-6 bg-gray-300 mx-1"
              />
            );
          }

          return (
            <button
              key={index}
              type="button"
              title={button.title}
              onClick={button.command}
              className="px-2 py-1 text-sm border border-gray-300 rounded hover:bg-gray-100 hover:border-gray-400 transition-colors duration-200 min-w-[28px] flex items-center justify-center"
              style={button.style || {}}
            >
              {button.icon}
            </button>
          );
        })}
      </div>

      {/* Editor */}
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        onInput={handleInput}
        onPaste={handleInput}
        className="p-4 min-h-[400px] max-h-[600px] overflow-y-auto outline-none"
        style={{ 
          wordWrap: 'break-word',
          overflowWrap: 'break-word'
        }}
        dangerouslySetInnerHTML={{ __html: value }}
        data-placeholder={placeholder}
      />

      {/* Custom styles for the editor */}
      <style jsx>{`
        [contenteditable]:empty:before {
          content: attr(data-placeholder);
          color: #9ca3af;
          pointer-events: none;
        }
        
        [contenteditable] h1 {
          font-size: 1.875rem;
          font-weight: bold;
          margin: 1rem 0;
        }
        
        [contenteditable] h2 {
          font-size: 1.5rem;
          font-weight: bold;
          margin: 0.875rem 0;
        }
        
        [contenteditable] h3 {
          font-size: 1.25rem;
          font-weight: bold;
          margin: 0.75rem 0;
        }
        
        [contenteditable] p {
          margin: 0.5rem 0;
        }
        
        [contenteditable] ul, [contenteditable] ol {
          margin: 0.5rem 0;
          padding-left: 1.5rem;
        }
        
        [contenteditable] li {
          margin: 0.25rem 0;
        }
        
        [contenteditable] a {
          color: #3b82f6;
          text-decoration: underline;
        }
        
        [contenteditable] img {
          max-width: 100%;
          height: auto;
          margin: 0.5rem 0;
        }
        
        [contenteditable] blockquote {
          border-left: 4px solid #e5e7eb;
          padding-left: 1rem;
          margin: 1rem 0;
          font-style: italic;
          color: #6b7280;
        }
      `}</style>
    </div>
  );
};

export default RichTextEditor;
