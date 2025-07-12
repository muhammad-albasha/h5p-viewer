import React, { useRef, useCallback } from "react";
import './RichTextEditor.css';

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
  className = "",
}) => {
  const editorRef = useRef<HTMLDivElement>(null);

  const handleInput = useCallback(() => {
    if (editorRef.current) {
      const content = editorRef.current.innerHTML;
      onChange(content);
    }
  }, [onChange]);

  const execCommand = useCallback(
    (command: string, value?: string) => {
      document.execCommand(command, false, value);
      handleInput();
    },
    [handleInput]
  );

  const insertHTML = useCallback(
    (html: string) => {
      if (editorRef.current) {
        editorRef.current.focus();
        document.execCommand("insertHTML", false, html);
        handleInput();
      }
    },
    [handleInput]
  );

  const formatBlock = useCallback(
    (tagName: string) => {
      execCommand("formatBlock", `<${tagName}>`);
    },
    [execCommand]
  );

  const createLink = useCallback(() => {
    const url = prompt("URL eingeben:");
    if (url) {
      execCommand("createLink", url);
    }
  }, [execCommand]);

  const insertImage = useCallback(() => {
    const url = prompt("Bild-URL eingeben:");
    if (url) {
      insertHTML(
        `<img src="${url}" alt="Bild" style="max-width: 100%; height: auto;" />`
      );
    }
  }, [insertHTML]);
  const toolbarButtons = [
    {
      title: "Fett",
      icon: "B",
      command: () => execCommand("bold"),
      style: { fontWeight: "bold" },
    },
    {
      title: "Kursiv",
      icon: "I",
      command: () => execCommand("italic"),
      style: { fontStyle: "italic" },
    },
    {
      title: "Unterstrichen",
      icon: "U",
      command: () => execCommand("underline"),
      style: { textDecoration: "underline" },
    },
    {
      title: "Durchgestrichen",
      icon: "S",
      command: () => execCommand("strikeThrough"),
      style: { textDecoration: "line-through" },
    },
    { divider: true },
    {
      title: "Überschrift 1",
      icon: "H1",
      command: () => formatBlock("h1"),
    },
    {
      title: "Überschrift 2",
      icon: "H2",
      command: () => formatBlock("h2"),
    },
    {
      title: "Überschrift 3",
      icon: "H3",
      command: () => formatBlock("h3"),
    },
    {
      title: "Absatz",
      icon: "P",
      command: () => formatBlock("p"),
    },
    { divider: true },
    {
      title: "Nummerierte Liste",
      icon: "1.",
      command: () => execCommand("insertOrderedList"),
    },
    {
      title: "Aufzählung",
      icon: "•",
      command: () => execCommand("insertUnorderedList"),
    },
    { divider: true },
    {
      title: "Linksbündig",
      icon: "⇤",
      command: () => execCommand("justifyLeft"),
    },
    {
      title: "Zentriert",
      icon: "⇔",
      command: () => execCommand("justifyCenter"),
    },
    {
      title: "Rechtsbündig",
      icon: "⇥",
      command: () => execCommand("justifyRight"),
    },
    {
      title: "Blocksatz",
      icon: "⇿",
      command: () => execCommand("justifyFull"),
    },
    { divider: true },
    {
      title: "Link einfügen",
      icon: "🔗",
      command: createLink,
    },
    {
      title: "Bild einfügen",
      icon: "🖼️",
      command: insertImage,
    },
    { divider: true },
    {
      title: "Einzug vergrößern",
      icon: "→",
      command: () => execCommand("indent"),
    },
    {
      title: "Einzug verkleinern",
      icon: "←",
      command: () => execCommand("outdent"),
    },
    { divider: true },
    {
      title: "Formatierung entfernen",
      icon: "✗",
      command: () => execCommand("removeFormat"),
    },
  ];
  return (
    <div
      className={`border border-gray-300 rounded-lg overflow-hidden bg-white ${className}`}
    >
      {/* Toolbar */}
      <div className="border-b border-gray-200 bg-gray-50 p-2 flex flex-wrap gap-1">
        {toolbarButtons.map((button, index) => {
          if (button.divider) {
            return <div key={index} className="w-px h-6 bg-gray-300 mx-1" />;
          }

          return (
            <button
              key={index}
              type="button"
              title={button.title}
              onClick={button.command}
              className={`px-2 py-1 text-sm border border-gray-300 rounded hover:bg-gray-100 hover:border-gray-400 transition-colors duration-200 min-w-[28px] flex items-center justify-center ${
                button.style?.fontWeight === 'bold' ? 'font-bold' : ''
              } ${
                button.style?.fontStyle === 'italic' ? 'italic' : ''
              } ${
                button.style?.textDecoration === 'underline' ? 'underline' : ''
              } ${
                button.style?.textDecoration === 'line-through' ? 'line-through' : ''
              }`}
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
        className="rich-text-editor p-4 min-h-[400px] max-h-[600px] overflow-y-auto outline-none"
        dangerouslySetInnerHTML={{ __html: value }}
        data-placeholder={placeholder}
      />
    </div>
  );

}
export default RichTextEditor;
