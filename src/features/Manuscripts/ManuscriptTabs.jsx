import { useState, useRef, useEffect } from "react";
import tw from "tailwind-styled-components";
import { GoFile, GoX, GoPlus, GoGear, GoArrowLeft } from "react-icons/go";

// A code-editor-style tab strip. Each open manuscript is a "file" tab; the
// leading back arrow returns to the library (without closing tabs) and the
// trailing "+" opens a fresh draft. Click the active tab's name (or double-click
// any tab) to rename it inline. The right side shows the selected context, the
// autosave status, and the details control.
const Strip = tw.div`
  flex items-stretch gap-0.5 border border-grey-info-outline rounded-t-xl
  bg-orange-background-100/40 px-1.5 pt-1.5 overflow-x-auto
`;

const BackBtn = tw.button`
  flex items-center justify-center w-8 h-8 shrink-0 self-center rounded-lg
  cursor-pointer border-0 bg-transparent text-title/55 hover:text-title
  hover:bg-black/5 transition-colors
`;

const Tab = tw.div`
  group flex items-center gap-2 shrink-0 max-w-52 pl-3 pr-1.5 py-1.5 rounded-t-lg
  text-sm cursor-pointer select-none border border-b-0 transition-colors
  data-[active=true]:bg-white data-[active=true]:border-grey-info-outline data-[active=true]:text-title
  border-transparent text-title/60 hover:text-title hover:bg-black/5
`;

const TabName = tw.span`truncate`;

const NameInput = tw.input`
  min-w-0 w-32 bg-white border border-orange-accent rounded px-1 py-0
  text-sm text-title outline-none
`;

const Trailing = tw.span`relative flex items-center justify-center w-5 h-5 shrink-0`;
const UnsavedDot = tw.span`
  absolute w-1.5 h-1.5 rounded-full bg-title/50 group-hover:opacity-0 transition-opacity
`;
const CloseBtn = tw.button`
  absolute inset-0 flex items-center justify-center rounded cursor-pointer border-0
  bg-transparent text-title/50 opacity-0 group-hover:opacity-100
  hover:bg-black/10 transition-all
`;

const NewBtn = tw.button`
  flex items-center justify-center w-8 shrink-0 rounded-lg cursor-pointer border-0
  bg-transparent text-title/50 hover:text-title hover:bg-black/5 transition-colors
`;

const RightGroup = tw.div`flex items-center gap-2.5 shrink-0 ml-auto self-center pl-3 pr-1`;
const ContextReadout = tw.span`text-xs text-title/55 truncate max-w-[14rem] hidden sm:inline`;
const SaveStatus = tw.span`
  text-xs text-title/50 shrink-0
  data-[state=saved]:text-green-700 data-[state=error]:text-red-500
`;
const DetailsBtn = tw.button`
  flex items-center gap-1 shrink-0 px-2.5 py-1 rounded-lg text-xs font-medium
  cursor-pointer border border-grey-info-outline bg-white text-title
  hover:border-orange-300 transition-colors
`;

const SAVE_LABEL = { saving: "Saving…", saved: "Saved ✓", error: "Save failed" };

function tabLabel(tab) {
  const name = (tab.draft?.title ?? "").trim();
  return name || "Untitled";
}

export default function ManuscriptTabs({
  tabs, activeTabId, onSelect, onClose, onNew, onBrowse, onRename, bleed, saveStatus, onEditDetails, context,
}) {
  const [editingId, setEditingId] = useState(null);
  const [draftName, setDraftName] = useState("");
  const inputRef = useRef(null);

  useEffect(() => {
    if (editingId && inputRef.current) inputRef.current.select();
  }, [editingId]);

  function startEditing(tab) {
    setDraftName((tab.draft?.title ?? "").trim());
    setEditingId(tab.tabId);
  }

  function commitEditing() {
    if (editingId) onRename?.(editingId, draftName.trim());
    setEditingId(null);
  }

  function handleTabClick(tab) {
    // Selecting an inactive tab just switches; clicking the already-active tab
    // opens its name for editing (double-click works on any tab too).
    if (tab.tabId !== activeTabId) {
      onSelect(tab.tabId);
    } else {
      startEditing(tab);
    }
  }

  return (
    <Strip role="tablist" className={bleed ? "rounded-none border-x-0 border-t-0" : ""}>
      <BackBtn type="button" onClick={onBrowse} title="Back to library" aria-label="Back to library">
        <GoArrowLeft size={17} />
      </BackBtn>

      {tabs.map((tab) => {
        const isActive = tab.tabId === activeTabId;
        const isEditing = tab.tabId === editingId;
        return (
          <Tab
            key={tab.tabId}
            role="tab"
            aria-selected={isActive}
            data-active={isActive}
            onClick={() => !isEditing && handleTabClick(tab)}
            onDoubleClick={() => startEditing(tab)}
            title={isEditing ? undefined : `${tabLabel(tab)} — click to rename`}
          >
            <GoFile size={13} className="shrink-0 opacity-60" />
            {isEditing ? (
              <NameInput
                ref={inputRef}
                value={draftName}
                placeholder="Untitled"
                onChange={(e) => setDraftName(e.target.value)}
                onClick={(e) => e.stopPropagation()}
                onBlur={commitEditing}
                onKeyDown={(e) => {
                  if (e.key === "Enter") commitEditing();
                  if (e.key === "Escape") setEditingId(null);
                }}
              />
            ) : (
              <>
                <TabName>{tabLabel(tab)}</TabName>
                <Trailing>
                  {tab.manuscriptId == null && <UnsavedDot />}
                  <CloseBtn
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onClose(tab.tabId, e);
                    }}
                    title="Close tab"
                  >
                    <GoX size={13} />
                  </CloseBtn>
                </Trailing>
              </>
            )}
          </Tab>
        );
      })}

      <NewBtn type="button" onClick={onNew} title="New manuscript">
        <GoPlus size={16} />
      </NewBtn>

      <RightGroup>
        {context && <ContextReadout title={context}>{context}</ContextReadout>}
        {saveStatus && <SaveStatus data-state={saveStatus}>{SAVE_LABEL[saveStatus]}</SaveStatus>}
        {onEditDetails && (
          <DetailsBtn type="button" onClick={onEditDetails} title="Manuscript details">
            <GoGear size={13} />
            Edit details
          </DetailsBtn>
        )}
      </RightGroup>
    </Strip>
  );
}
