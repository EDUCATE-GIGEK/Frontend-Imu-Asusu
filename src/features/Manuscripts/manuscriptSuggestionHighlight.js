import { Extension } from "@tiptap/core";
import { Plugin, PluginKey } from "@tiptap/pm/state";
import { Decoration, DecorationSet } from "@tiptap/pm/view";

export const suggestionPluginKey = new PluginKey("manuscriptSuggestionHighlight");

// Find the first [from, to] range whose text equals `query`, searched within
// each text block so the returned document positions stay accurate. Excerpts
// come in already whitespace-collapsed (the edge function strips HTML and
// collapses runs of whitespace), which matches how TipTap stores inline text.
function findRange(doc, query) {
  const q = (query ?? "").trim();
  if (!q) return null;
  let range = null;
  doc.descendants((node, pos) => {
    if (range) return false;
    if (!node.isTextblock) return true;
    const idx = node.textContent.indexOf(q);
    if (idx !== -1) {
      // A textblock's inline content starts one position after the block node.
      const from = pos + 1 + idx;
      range = { from, to: from + q.length };
    }
    return false; // never descend into a textblock we've already scanned
  });
  return range;
}

// Resolve each suggestion against the current doc, producing the inline
// decorations plus a `located` list (each item flagged matched/unmatched with
// its resolved positions) for the caller to reflect in its own UI.
function build(doc, items) {
  const decorations = [];
  const located = items.map((item) => {
    const range = findRange(doc, item.excerpt);
    if (!range) return { ...item, matched: false };
    decorations.push(
      Decoration.inline(
        range.from,
        range.to,
        { class: `suggestion suggestion--${item.category}`, "data-suggestion-id": item.id },
        { id: item.id },
      ),
    );
    return { ...item, matched: true, from: range.from, to: range.to };
  });
  return { decoSet: DecorationSet.create(doc, decorations), items: located };
}

/**
 * Highlights AI writing-assist suggestions inline and lets the caller apply or
 * dismiss them. The `onLocated` option fires (asynchronously) after every
 * (re)build with the located list so React state can track match status.
 */
export const ManuscriptSuggestionHighlight = Extension.create({
  name: "manuscriptSuggestionHighlight",

  addOptions() {
    return { onLocated: () => {} };
  },

  addProseMirrorPlugins() {
    const options = this.options;
    return [
      new Plugin({
        key: suggestionPluginKey,
        state: {
          init() {
            return { decoSet: DecorationSet.empty, items: [] };
          },
          apply(tr, value, _oldState, newState) {
            let { decoSet, items } = value;

            // Keep existing highlights glued to their text as the doc changes.
            if (tr.docChanged) {
              decoSet = decoSet.map(tr.mapping, tr.doc);
              items = items.map((it) =>
                it.matched
                  ? { ...it, from: tr.mapping.map(it.from), to: tr.mapping.map(it.to) }
                  : it,
              );
            }

            const meta = tr.getMeta(suggestionPluginKey);
            if (meta?.type === "set") {
              const built = build(newState.doc, meta.items);
              Promise.resolve().then(() => options.onLocated(built.items));
              return built;
            }
            if (meta?.type === "clear") {
              return { decoSet: DecorationSet.empty, items: [] };
            }
            if (meta?.type === "remove") {
              const gone = decoSet.find(undefined, undefined, (spec) => spec.id === meta.id);
              return {
                decoSet: decoSet.remove(gone),
                items: items.filter((it) => it.id !== meta.id),
              };
            }

            return { decoSet, items };
          },
        },
        props: {
          decorations(state) {
            return suggestionPluginKey.getState(state).decoSet;
          },
        },
      }),
    ];
  },

  addCommands() {
    return {
      setSuggestions:
        (items) =>
        ({ tr, dispatch }) => {
          if (dispatch) dispatch(tr.setMeta(suggestionPluginKey, { type: "set", items }));
          return true;
        },
      clearSuggestions:
        () =>
        ({ tr, dispatch }) => {
          if (dispatch) dispatch(tr.setMeta(suggestionPluginKey, { type: "clear" }));
          return true;
        },
      dismissSuggestion:
        (id) =>
        ({ tr, dispatch }) => {
          if (dispatch) dispatch(tr.setMeta(suggestionPluginKey, { type: "remove", id }));
          return true;
        },
      applySuggestion:
        (id) =>
        ({ state, tr, dispatch }) => {
          const item = suggestionPluginKey
            .getState(state)
            .items.find((it) => it.id === id && it.matched);
          if (!item) return false;
          if (dispatch) {
            const replacement = item.replacement ?? "";
            if (replacement) tr.insertText(replacement, item.from, item.to);
            else tr.delete(item.from, item.to);
            tr.setMeta(suggestionPluginKey, { type: "remove", id });
            dispatch(tr);
          }
          return true;
        },
    };
  },
});
