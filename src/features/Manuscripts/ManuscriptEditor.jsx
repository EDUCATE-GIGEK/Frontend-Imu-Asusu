import { useState, useEffect, useRef, useCallback, forwardRef, useImperativeHandle } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Placeholder from "@tiptap/extension-placeholder";
import CharacterCount from "@tiptap/extension-character-count";
import tw from "tailwind-styled-components";
import styles from "./ManuscriptEditor.module.css";
import { ManuscriptSuggestionHighlight } from "./manuscriptSuggestionHighlight";
import ManuscriptSuggestionPopover from "./ManuscriptSuggestionPopover";

const SYMBOLS = [
  "©", "®", "™", "°", "§", "¶", "±", "×", "÷", "≈", "≠", "≤", "≥",
  "→", "←", "↔", "•", "…", "‰", "√", "∞", "½", "¼", "¾", "α", "β", "π",
];

const Toolbar = tw.div`flex flex-wrap items-center gap-1 shrink-0 border-b border-grey-info-outline bg-orange-background-100/40 px-3 py-1.5`;
const ToolBtn = tw.button`
  min-w-8 h-8 px-2 rounded-md text-sm text-title cursor-pointer border-0 bg-transparent
  hover:bg-orange-background-100 transition-colors
  data-[active=true]:bg-orange-accent data-[active=true]:text-white
`;
const ToolDivider = tw.span`w-px h-5 bg-grey-info-outline mx-1`;
const SymbolPopover = tw.div`absolute z-10 mt-1 grid grid-cols-7 gap-1 bg-white border border-grey-info-outline rounded-lg p-2 shadow-lg`;
const SymbolBtn = tw.button`w-7 h-7 rounded text-sm text-title cursor-pointer border-0 bg-transparent hover:bg-orange-background-100`;

// Code-editor surface: a line-number gutter beside the writing area. The
// surface scrolls as one, so the gutter tracks the text while it scrolls.
const EditorSurface = tw.div`flex flex-1 min-h-0 overflow-y-auto bg-white`;
const Gutter = tw.div`
  relative shrink-0 w-11 select-none border-r border-grey-info-outline
  bg-orange-background-100/30 py-4 text-right text-xs font-mono text-title/35
`;
const LineNo = tw.span`absolute right-2 leading-none`;
const EditorArea = tw.div`flex-1 min-w-0 px-5 py-4`;
const CharCount = tw.p`text-xs text-title opacity-40 mt-1 text-right shrink-0`;

const ManuscriptEditor = forwardRef(function ManuscriptEditor({
  content,
  onChange,
  placeholder = "Write your manuscript here…",
  suggestions = [],
  onSuggestionsLocated,
  onResolve,
  toolbarActions = null,
}, ref) {
  const [showSymbols, setShowSymbols] = useState(false);
  const [active, setActive] = useState(null); // { item, top, left } for the open popover
  const [lineMarks, setLineMarks] = useState([{ n: 1, top: 0 }]);
  const anchorRef = useRef(null);
  const gutterRef = useRef(null);
  const areaRef = useRef(null);

  // Place a line number at the top of each top-level block, measured relative to
  // the gutter so paddings on either column never throw the alignment off. It's
  // one number per block (paragraph/heading/list), the Overleaf-style read-out.
  const recomputeLines = useCallback(() => {
    const gutter = gutterRef.current;
    const tiptap = areaRef.current?.querySelector(".tiptap");
    if (!gutter || !tiptap) return;
    const base = gutter.getBoundingClientRect().top;
    const blocks = Array.from(tiptap.children);
    const marks = blocks.map((el, i) => ({
      n: i + 1,
      top: Math.round(el.getBoundingClientRect().top - base),
    }));
    setLineMarks(marks.length ? marks : [{ n: 1, top: 12 }]);
  }, []);

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
      ManuscriptSuggestionHighlight.configure({ onLocated: (located) => locatedRef.current?.(located) }),
    ],
    content: content || "",
    onUpdate: ({ editor }) => {
      onChange?.(editor.getHTML());
      requestAnimationFrame(recomputeLines);
    },
  });

  // Keep the gutter aligned as the document reflows: on mount, on content
  // height changes (wrapping, images), and on window resizes.
  useEffect(() => {
    if (!editor) return;
    const tiptap = areaRef.current?.querySelector(".tiptap");
    if (!tiptap) return;
    recomputeLines();
    const ro = new ResizeObserver(() => recomputeLines());
    ro.observe(tiptap);
    window.addEventListener("resize", recomputeLines);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", recomputeLines);
    };
  }, [editor, recomputeLines]);

  // Push the current suggestion set into the editor whenever it changes; the
  // extension resolves excerpts to positions and reports back via onLocated.
  useEffect(() => {
    if (!editor) return;
    editor.commands.setSuggestions(suggestions);
    setActive(null);
  }, [editor, suggestions]);

  // Imperative insert for AI-generated passages. The `content` prop only seeds
  // the editor at mount, so generated text has to enter through an editor
  // command — appended at the end of the document — which fires onUpdate and
  // flows back out through onChange like any other edit.
  useImperativeHandle(
    ref,
    () => ({
      insertContent(html) {
        if (!editor || !html) return;
        editor.chain().focus("end").insertContent(html).run();
      },
    }),
    [editor],
  );

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
    <div className="flex flex-col h-full min-h-0">
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

        {/* AI actions live at the toolbar's right edge, supplied by the page. */}
        {toolbarActions && (
          <div className="ml-auto flex items-center gap-1.5" onMouseDown={(e) => e.stopPropagation()}>
            {toolbarActions}
          </div>
        )}
      </Toolbar>

      <div ref={anchorRef} className="relative flex-1 min-h-0 flex flex-col" onMouseDown={handleEditorMouseDown}>
        <EditorSurface className={styles.editor} onClick={() => editor.chain().focus().run()}>
          <Gutter ref={gutterRef} aria-hidden="true">
            {lineMarks.map((m) => (
              <LineNo key={m.n} style={{ top: `${m.top}px` }}>{m.n}</LineNo>
            ))}
          </Gutter>
          <EditorArea ref={areaRef}>
            <EditorContent editor={editor} />
          </EditorArea>
        </EditorSurface>
        {active && (
          <ManuscriptSuggestionPopover
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
});

export default ManuscriptEditor;
