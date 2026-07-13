import { useState, useEffect, useRef } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Placeholder from "@tiptap/extension-placeholder";
import CharacterCount from "@tiptap/extension-character-count";
import tw from "tailwind-styled-components";
import styles from "./RichTextEditor.module.css";
import { SuggestionHighlight } from "./suggestionHighlight";
import SuggestionPopover from "./SuggestionPopover";

const SYMBOLS = [
  "©", "®", "™", "°", "§", "¶", "±", "×", "÷", "≈", "≠", "≤", "≥",
  "→", "←", "↔", "•", "…", "‰", "√", "∞", "½", "¼", "¾", "α", "β", "π",
];

const Toolbar = tw.div`flex flex-wrap items-center gap-1 border border-grey-info-outline rounded-t-lg bg-orange-background-100/40 px-2 py-1.5`;
const ToolBtn = tw.button`
  min-w-8 h-8 px-2 rounded-md text-sm text-title cursor-pointer border-0 bg-transparent
  hover:bg-orange-background-100 transition-colors
  data-[active=true]:bg-orange-accent data-[active=true]:text-white
`;
const ToolDivider = tw.span`w-px h-5 bg-grey-info-outline mx-1`;
const SymbolPopover = tw.div`absolute z-10 mt-1 grid grid-cols-7 gap-1 bg-white border border-grey-info-outline rounded-lg p-2 shadow-lg`;
const SymbolBtn = tw.button`w-7 h-7 rounded text-sm text-title cursor-pointer border-0 bg-transparent hover:bg-orange-background-100`;
const EditorWrapper = tw.div`border border-t-0 border-grey-info-outline rounded-b-lg px-3 py-2 min-h-28`;
const CharCount = tw.p`text-xs text-title opacity-40 mt-1 text-right`;

export default function RichTextEditor({
  content,
  onChange,
  placeholder = "Write your manuscript here…",
  suggestions = [],
  onSuggestionsLocated,
  onResolve,
}) {
  const [showSymbols, setShowSymbols] = useState(false);
  const [active, setActive] = useState(null); // { item, top, left } for the open popover
  const anchorRef = useRef(null);

  // Route the extension's located callback through a ref so the latest handler
  // is used without re-creating the editor when the prop identity changes.
  const locatedRef = useRef(onSuggestionsLocated);
  locatedRef.current = onSuggestionsLocated;

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Placeholder.configure({ placeholder }),
      CharacterCount,
      SuggestionHighlight.configure({ onLocated: (located) => locatedRef.current?.(located) }),
    ],
    content: content || "",
    onUpdate: ({ editor }) => onChange?.(editor.getHTML()),
  });

  // Push the current suggestion set into the editor whenever it changes; the
  // extension resolves excerpts to positions and reports back via onLocated.
  useEffect(() => {
    if (!editor) return;
    editor.commands.setSuggestions(suggestions);
    setActive(null);
  }, [editor, suggestions]);

  if (!editor) return null;

  function insertSymbol(symbol) {
    editor.chain().focus().insertContent(symbol).run();
    setShowSymbols(false);
  }

  function handleEditorMouseDown(e) {
    const el = e.target.closest?.("[data-suggestion-id]");
    if (!el) {
      setActive(null);
      return;
    }
    const id = el.getAttribute("data-suggestion-id");
    const item = suggestions.find((s) => String(s.id) === id);
    if (!item || !anchorRef.current) return;
    const anchor = anchorRef.current.getBoundingClientRect();
    const rect = el.getBoundingClientRect();
    setActive({
      item,
      top: rect.bottom - anchor.top + 4,
      left: Math.min(rect.left - anchor.left, anchor.width - 288),
    });
  }

  function applyActive() {
    editor.commands.applySuggestion(active.item.id);
    onResolve?.(active.item.id, "applied");
    setActive(null);
  }

  function dismissActive() {
    editor.commands.dismissSuggestion(active.item.id);
    onResolve?.(active.item.id, "dismissed");
    setActive(null);
  }

  return (
    <div>
      <Toolbar>
        <ToolBtn type="button" data-active={editor.isActive("bold")} onClick={() => editor.chain().focus().toggleBold().run()} title="Bold">
          <strong>B</strong>
        </ToolBtn>
        <ToolBtn type="button" data-active={editor.isActive("italic")} onClick={() => editor.chain().focus().toggleItalic().run()} title="Italic">
          <em>I</em>
        </ToolBtn>
        <ToolBtn type="button" data-active={editor.isActive("underline")} onClick={() => editor.chain().focus().toggleUnderline().run()} title="Underline">
          <span className="underline">U</span>
        </ToolBtn>
        <ToolBtn type="button" data-active={editor.isActive("strike")} onClick={() => editor.chain().focus().toggleStrike().run()} title="Strikethrough">
          <span className="line-through">S</span>
        </ToolBtn>

        <ToolDivider />

        <ToolBtn type="button" data-active={editor.isActive("heading", { level: 1 })} onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} title="Heading 1">H1</ToolBtn>
        <ToolBtn type="button" data-active={editor.isActive("heading", { level: 2 })} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} title="Heading 2">H2</ToolBtn>
        <ToolBtn type="button" data-active={editor.isActive("heading", { level: 3 })} onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} title="Heading 3">H3</ToolBtn>

        <ToolDivider />

        <ToolBtn type="button" data-active={editor.isActive("bulletList")} onClick={() => editor.chain().focus().toggleBulletList().run()} title="Bullet list">•</ToolBtn>
        <ToolBtn type="button" data-active={editor.isActive("orderedList")} onClick={() => editor.chain().focus().toggleOrderedList().run()} title="Numbered list">1.</ToolBtn>
        <ToolBtn type="button" data-active={editor.isActive("blockquote")} onClick={() => editor.chain().focus().toggleBlockquote().run()} title="Quote">"</ToolBtn>

        <ToolDivider />

        <div className="relative">
          <ToolBtn type="button" onClick={() => setShowSymbols((v) => !v)} title="Insert symbol">Ω</ToolBtn>
          {showSymbols && (
            <SymbolPopover>
              {SYMBOLS.map((symbol) => (
                <SymbolBtn key={symbol} type="button" onClick={() => insertSymbol(symbol)}>
                  {symbol}
                </SymbolBtn>
              ))}
            </SymbolPopover>
          )}
        </div>
      </Toolbar>

      <div ref={anchorRef} className="relative" onMouseDown={handleEditorMouseDown}>
        <EditorWrapper className={styles.editor} onClick={() => editor.chain().focus().run()}>
          <EditorContent editor={editor} />
        </EditorWrapper>
        {active && (
          <SuggestionPopover
            item={active.item}
            top={active.top}
            left={active.left}
            onApply={applyActive}
            onDismiss={dismissActive}
          />
        )}
      </div>

      <CharCount>{editor.storage.characterCount.characters()} characters</CharCount>
    </div>
  );
}
