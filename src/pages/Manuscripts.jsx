import { useState, useRef, useMemo, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useOutletContext } from "react-router-dom";
import tw from "tailwind-styled-components";
import { useAuth } from "@/contexts/AuthContext";
import ManuscriptTabs from "@/features/Manuscripts/ManuscriptTabs";
import ManuscriptDetailsDrawer from "@/features/Manuscripts/ManuscriptDetailsDrawer";
import ManuscriptCard from "@/features/Manuscripts/ManuscriptCard";
import ManuscriptEditor from "@/features/Manuscripts/ManuscriptEditor";
import ManuscriptWritingAssistPanel from "@/features/Manuscripts/ManuscriptWritingAssistPanel";
import ManuscriptGenerateDrawer from "@/features/Manuscripts/ManuscriptGenerateDrawer";
import Spinner from "@/ui/Spinner";
import { getAllPlaces } from "@/services/apiPlaces";
import { getAllPeoples } from "@/services/apiPeoples";
import { getManuscriptsByUser, createManuscript, updateManuscript, deleteManuscript } from "@/services/apiManuscripts";
import { uploadManuscriptFile } from "@/services/storage/uploadManuscriptFile";
import { useManuscriptWritingAssist } from "@/hooks/useManuscriptWritingAssist";
import { useManuscriptFactCheck } from "@/hooks/useManuscriptFactCheck";
import { useManuscriptGenerate } from "@/hooks/useManuscriptGenerate";

// ── Styled components ────────────────────────────────────────────────────────
const PageWrapper = tw.div``;
const PageTitle = tw.h1`text-3xl font-bold text-title mb-6`;
const PrimaryBtn = tw.button`bg-title text-white rounded-lg px-5 py-2 text-sm font-semibold cursor-pointer border-0 disabled:opacity-50`;

// ── Toolbar AI controls (Generate / Check facts / Writing assist) ────────────
const GenerateBtn = tw.button`
  inline-flex items-center gap-1 text-xs font-semibold text-white bg-orange-accent
  rounded-lg px-2.5 py-1 cursor-pointer border-0 hover:opacity-90 transition-opacity
`;
const ToolbarAIBtn = tw.button`
  inline-flex items-center gap-1 text-xs font-semibold rounded-lg px-2.5 py-1 cursor-pointer
  border border-grey-info-outline text-title bg-white hover:border-orange-300 transition-colors
  data-[open=true]:border-orange-300 data-[open=true]:bg-orange-background-100/60
`;
const AIPopover = tw.div`
  absolute right-0 top-full mt-1.5 z-30 w-80 max-h-[26rem] overflow-y-auto text-left
  bg-white border border-grey-info-outline rounded-xl shadow-lg p-3
`;
const PopoverHead = tw.div`flex items-center justify-between mb-2`;
const PopoverTitle = tw.p`text-xs font-semibold text-title uppercase tracking-wide opacity-60`;
const PopoverClose = tw.button`text-title/40 hover:text-title cursor-pointer border-0 bg-transparent text-base leading-none`;
const Hint = tw.p`text-sm text-title opacity-60 leading-relaxed`;
const AddBtn = tw.button`bg-title text-white rounded-lg px-5 py-2 text-sm font-semibold cursor-pointer border-0`;
const LoginPrompt = tw.div`mt-3 flex items-center justify-between gap-4 rounded-xl border border-orange-300 bg-orange-background-100 px-4 py-3`;
const LoginPromptText = tw.p`text-sm text-title`;
const ManuscriptList = tw.div`grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 mt-6`;
const EmptyState = tw.p`text-sm text-title opacity-40 mt-6`;

const EDUCATION_LEVELS = [
  { value: "preschool", label: "Preschool" },
  { value: "kindergarten", label: "Kindergarten" },
  { value: "high_school", label: "High School" },
  { value: "undergrad", label: "Undergrad" },
  { value: "grad", label: "Grad" },
];

const EMPTY_DRAFT = { title: "", description: "", summary: "", places: [], peoples: [], educationLevel: "" };

const stripHtml = (html) => (html ?? "").replace(/<[^>]*>/g, "").trim();

// The persisted fields, normalised so drafts can be compared for dirtiness.
function snapshotOf(values) {
  return {
    title: values.title ?? "",
    description: values.description ?? "",
    summary: values.summary ?? "",
    places: values.places ?? [],
    peoples: values.peoples ?? [],
    educationLevel: values.educationLevel || "",
  };
}
const sameSnapshot = (a, b) => JSON.stringify(a) === JSON.stringify(b);
const draftHasContent = (d) => !!(d.title?.trim() || stripHtml(d.description));

// Build a fresh tab's draft from a saved manuscript row.
function draftFromManuscript(m) {
  return {
    title: m.title ?? "",
    description: m.manuscript_description ?? "",
    summary: m.summary ?? "",
    educationLevel: m.education_level ?? "",
    places: m.contexts?.places ?? [],
    peoples: m.contexts?.peoples ?? [],
  };
}

export default function Manuscripts() {
  const { session, profile, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { setBleed } = useOutletContext();

  // Each open manuscript is a tab: { tabId, manuscriptId|null, fileName,
  // pendingFile, draft, savedSnapshot }. The active tab's draft lives in the
  // react-hook-form buffer; others keep their last values in `draft`.
  // `savedSnapshot` is what's persisted, so autosave knows when a tab is dirty.
  const [openTabs, setOpenTabs] = useState([]);
  const [activeTabId, setActiveTabId] = useState(null); // null = the library
  const [detailsDrawerOpen, setDetailsDrawerOpen] = useState(false);
  const [generateDrawerOpen, setGenerateDrawerOpen] = useState(false);
  const [aiPopover, setAiPopover] = useState(null); // 'facts' | 'assist' | null
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [saveStatusMap, setSaveStatusMap] = useState({}); // tabId -> 'saving'|'saved'|'error'
  const fileInputRef = useRef(null);
  const savingTabs = useRef(new Set()); // tabIds with a save in flight (dedupe)
  const savedTimers = useRef({}); // tabId -> timeout clearing its "Saved ✓" flag

  const { register, reset, setValue, getValues, watch, formState: { errors } } = useForm({
    defaultValues: EMPTY_DRAFT,
  });

  const activeTab = openTabs.find((t) => t.tabId === activeTabId) ?? null;
  const activeManuscriptId = activeTab?.manuscriptId ?? undefined;
  const pendingFile = activeTab?.pendingFile ?? null;

  // Latest values readable from async autosave callbacks without stale closures.
  const openTabsRef = useRef(openTabs);
  openTabsRef.current = openTabs;
  const activeTabIdRef = useRef(activeTabId);
  activeTabIdRef.current = activeTabId;

  const title = watch("title") ?? "";
  const selectedPlaces = watch("places") ?? [];
  const selectedPeoples = watch("peoples") ?? [];
  const description = watch("description") ?? "";
  const summary = watch("summary") ?? "";
  const educationLevel = watch("educationLevel");
  const audience = educationLevel || null;
  const educationLabel = EDUCATION_LEVELS.find((l) => l.value === educationLevel)?.label ?? null;
  const hasContent = stripHtml(description).length > 0;

  // ── AI writing assist + fact-check + generate ──────────────────────────────
  const assist = useManuscriptWritingAssist({ manuscriptId: activeManuscriptId });
  const factCheck = useManuscriptFactCheck({ manuscriptId: activeManuscriptId });
  const generate = useManuscriptGenerate({ manuscriptId: activeManuscriptId });
  const editorRef = useRef(null);

  const selectedContexts = useMemo(
    () => ({ places: selectedPlaces, peoples: selectedPeoples }),
    [selectedPlaces, selectedPeoples],
  );
  const hasContexts = Object.values(selectedContexts).some((ids) => ids.length > 0);

  const editorSuggestions = useMemo(
    () => [...assist.editorSuggestions, ...factCheck.editorSuggestions],
    [assist.editorSuggestions, factCheck.editorSuggestions],
  );

  function handleLocated(located) {
    assist.setLocated(located);
    factCheck.setLocated(located);
  }

  function handleResolve(id, action) {
    if (String(id).startsWith("fact-")) factCheck.resolve(id, action);
    else assist.resolve(id, action);
  }

  function handleInsertGenerated() {
    if (!generate.result) return;
    editorRef.current?.insertContent(generate.result.generatedText);
    generate.clear();
    setGenerateDrawerOpen(false);
  }

  function resetAI() {
    assist.reset();
    factCheck.reset();
    generate.clear();
    setAiPopover(null);
  }

  function runAssist() {
    setAiPopover((p) => (p === "assist" ? null : "assist"));
    if (hasContent && !assist.isPending) assist.run(description, audience);
  }

  function runFactCheck() {
    setAiPopover((p) => (p === "facts" ? null : "facts"));
    if (hasContent && hasContexts && !factCheck.isPending) factCheck.run(description, selectedContexts);
  }

  const flaggedFacts = factCheck.items.length;
  const factStatus = !hasContent
    ? "Write something in the manuscript first."
    : !hasContexts
      ? "Select a context under Edit details to fact-check against our records."
      : factCheck.isPending
        ? "Checking your claims against the records…"
        : factCheck.error
          ? factCheck.error.message
          : factCheck.hasRun && factCheck.sourceCount === 0
            ? "We hold no records for the selected context, so nothing could be checked — a gap in the repository, not a clean bill of health."
            : factCheck.hasRun && flaggedFacts === 0
              ? "No checkable claims found in this draft."
              : flaggedFacts > 0
                ? `${flaggedFacts} claim${flaggedFacts === 1 ? "" : "s"} underlined in your text — click any to review.`
                : "Run a fact-check against the selected context.";

  // ── Autosave ───────────────────────────────────────────────────────────────
  // Persist a tab given an explicit snapshot. Deduped per tab so a burst of edits
  // (or a new tab's first save) can't create the same manuscript twice.
  async function saveTab(tabId, snapshot) {
    if (savingTabs.current.has(tabId) || !profile?.id) return;
    const tab = openTabsRef.current.find((t) => t.tabId === tabId);
    if (!tab) return;
    const meaningful = snapshot.title.trim() || stripHtml(snapshot.description) || tab.pendingFile;
    if (!meaningful) return;
    if (sameSnapshot(snapshot, tab.savedSnapshot) && !tab.pendingFile) return;

    savingTabs.current.add(tabId);
    if (savedTimers.current[tabId]) {
      clearTimeout(savedTimers.current[tabId]);
      delete savedTimers.current[tabId];
    }
    setSaveStatusMap((m) => ({ ...m, [tabId]: "saving" }));
    try {
      let filePath;
      let fileName;
      if (tab.pendingFile) {
        const uploaded = await uploadManuscriptFile(profile.id, tab.pendingFile);
        filePath = uploaded.path;
        fileName = uploaded.name;
      }
      const payload = {
        title: snapshot.title,
        manuscriptDescription: snapshot.description,
        summary: snapshot.summary,
        contexts: { places: snapshot.places, peoples: snapshot.peoples },
        educationLevel: snapshot.educationLevel,
        filePath,
        fileName,
      };
      const saved = tab.manuscriptId
        ? await updateManuscript(tab.manuscriptId, payload)
        : await createManuscript({ userId: profile.id, ...payload });

      setOpenTabs((prev) =>
        prev.map((t) =>
          t.tabId === tabId
            ? {
                ...t,
                manuscriptId: saved.id,
                fileName: saved.file_name ?? t.fileName,
                pendingFile: null,
                savedSnapshot: snapshot,
                draft: { ...t.draft, ...snapshot },
              }
            : t,
        ),
      );
      setSaveStatusMap((m) => ({ ...m, [tabId]: "saved" }));
      queryClient.invalidateQueries({ queryKey: ["manuscripts"] });
      // Let "Saved ✓" linger briefly, then fade the notice away.
      savedTimers.current[tabId] = setTimeout(() => {
        delete savedTimers.current[tabId];
        setSaveStatusMap((m) => {
          if (m[tabId] !== "saved") return m;
          const next = { ...m };
          delete next[tabId];
          return next;
        });
      }, 1800);
    } catch {
      setSaveStatusMap((m) => ({ ...m, [tabId]: "error" }));
    } finally {
      savingTabs.current.delete(tabId);
    }
  }

  // Debounced autosave of the active tab. Fires ~1s after the last edit; a fresh
  // savedSnapshot (after a save) re-runs this and catches any edits made mid-save.
  useEffect(() => {
    if (activeTabId == null || !activeTab) return undefined;
    const snapshot = snapshotOf({ title, description, summary, places: selectedPlaces, peoples: selectedPeoples, educationLevel });
    const dirty = !sameSnapshot(snapshot, activeTab.savedSnapshot) || !!activeTab.pendingFile;
    if (!dirty) return undefined;
    const tabId = activeTabId;
    const timer = setTimeout(() => saveTab(tabId, snapshot), 1000);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [title, description, summary, selectedPlaces, selectedPeoples, educationLevel, activeTabId, activeTab?.savedSnapshot, activeTab?.pendingFile]);

  // Flush the active tab immediately (on tab switch / leaving the editor), so a
  // quick switch before the debounce fires never drops edits.
  function flushActive() {
    if (activeTabId == null) return;
    saveTab(activeTabId, snapshotOf(getValues()));
  }

  // Save any pending edits when the page unmounts (navigating away).
  useEffect(() => {
    const timers = savedTimers.current;
    return () => {
      const id = activeTabIdRef.current;
      if (id != null) saveTab(id, snapshotOf(getValues()));
      Object.values(timers).forEach(clearTimeout);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const saveStatus = activeTabId != null ? saveStatusMap[activeTabId] : undefined;

  // ── Tab management ─────────────────────────────────────────────────────────
  function persistActiveDraft(tabs) {
    if (activeTabId == null) return tabs;
    const values = getValues();
    return tabs.map((t) => (t.tabId === activeTabId ? { ...t, draft: values } : t));
  }

  function openManuscript(m) {
    const existing = openTabs.find((t) => t.manuscriptId === m.id);
    if (existing) {
      switchTab(existing.tabId);
      return;
    }
    const draft = draftFromManuscript(m);
    const tab = {
      tabId: `m-${m.id}`,
      manuscriptId: m.id,
      fileName: m.file_name ?? null,
      pendingFile: null,
      draft,
      savedSnapshot: snapshotOf(draft),
    };
    flushActive();
    setOpenTabs((prev) => [...persistActiveDraft(prev), tab]);
    reset(draft);
    setActiveTabId(tab.tabId);
    resetAI();
  }

  function addManuscript() {
    if (!session) {
      setShowLoginPrompt(true);
      return;
    }
    setShowLoginPrompt(false);
    const tabId = `new-${Date.now()}`;
    const tab = {
      tabId,
      manuscriptId: null,
      fileName: null,
      pendingFile: null,
      draft: EMPTY_DRAFT,
      savedSnapshot: snapshotOf(EMPTY_DRAFT),
    };
    flushActive();
    setOpenTabs((prev) => [...persistActiveDraft(prev), tab]);
    reset(EMPTY_DRAFT);
    setActiveTabId(tabId);
    resetAI();
    setDetailsDrawerOpen(true);
  }

  function switchTab(tabId) {
    if (tabId === activeTabId) return;
    flushActive();
    const target = openTabs.find((t) => t.tabId === tabId);
    setOpenTabs((prev) => persistActiveDraft(prev));
    reset(target?.draft ?? EMPTY_DRAFT);
    setActiveTabId(tabId);
    resetAI();
  }

  // Inline title edit from the tab strip.
  function renameTab(tabId, name) {
    if (tabId === activeTabId) {
      setValue("title", name, { shouldDirty: true });
    } else {
      setOpenTabs((prev) =>
        prev.map((t) => (t.tabId === tabId ? { ...t, draft: { ...t.draft, title: name } } : t)),
      );
    }
  }

  // Return to the library. Save pending edits, then drop empty unsaved drafts so
  // the tab set stays tidy while remembering everything with real content.
  function browseList() {
    flushActive();
    const values = getValues();
    setOpenTabs((prev) =>
      prev
        .map((t) => (t.tabId === activeTabId ? { ...t, draft: values } : t))
        .filter((t) => t.manuscriptId != null || draftHasContent(t.draft)),
    );
    setActiveTabId(null);
    resetAI();
  }

  function closeTab(tabId) {
    if (tabId === activeTabId) flushActive();
    const idx = openTabs.findIndex((t) => t.tabId === tabId);
    const next = openTabs.filter((t) => t.tabId !== tabId);
    setOpenTabs(tabId === activeTabId ? next : persistActiveDraft(next));
    if (tabId !== activeTabId) return;

    const fallback = next[idx] ?? next[idx - 1] ?? null;
    if (fallback) {
      reset(fallback.draft);
      setActiveTabId(fallback.tabId);
    } else {
      reset(EMPTY_DRAFT);
      setActiveTabId(null);
    }
    resetAI();
  }

  // ── Context option lists ───────────────────────────────────────────────────
  const { data: places = [] } = useQuery({ queryKey: ["places", "all"], queryFn: getAllPlaces });
  const { data: peoples = [] } = useQuery({ queryKey: ["peoples", "all"], queryFn: getAllPeoples });

  // ── Manuscripts list ───────────────────────────────────────────────────────
  const { data: manuscripts = [], isLoading: loadingManuscripts } = useQuery({
    queryKey: ["manuscripts", profile?.id],
    queryFn: () => getManuscriptsByUser(profile.id),
    enabled: !!profile?.id,
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => deleteManuscript(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["manuscripts"] }),
  });

  function handleDelete(manuscriptId) {
    deleteMutation.mutate(manuscriptId);
    const tab = openTabs.find((t) => t.manuscriptId === manuscriptId);
    if (tab) closeTab(tab.tabId);
  }

  function handleFileChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setOpenTabs((prev) => prev.map((t) => (t.tabId === activeTabId ? { ...t, pendingFile: file } : t)));
  }

  function removeFile() {
    setOpenTabs((prev) => prev.map((t) => (t.tabId === activeTabId ? { ...t, pendingFile: null } : t)));
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  const showEditor = activeTabId != null;

  // The manuscript editor takes over the whole content cell (no top bar, no
  // padding). Release it whenever we leave the editor or unmount the page.
  useEffect(() => {
    setBleed(showEditor);
    return () => setBleed(false);
  }, [showEditor, setBleed]);

  // Surface the live title in the strip as it's typed.
  const displayTabs = openTabs.map((t) =>
    t.tabId === activeTabId ? { ...t, draft: { ...t.draft, title } } : t,
  );

  // A compact read-out of the selected context, shown on the tab strip's details
  // control so the grounding stays visible without a bar above the editor.
  const contextSummary = useMemo(() => {
    const placeNames = places.filter((p) => selectedPlaces.includes(String(p.id))).map((p) => p.name);
    const peopleNames = peoples.filter((p) => selectedPeoples.includes(String(p.id))).map((p) => p.name);
    const names = [...placeNames, ...peopleNames];
    const parts = [];
    if (names.length) parts.push(names.slice(0, 2).join(", ") + (names.length > 2 ? ` +${names.length - 2}` : ""));
    if (educationLabel) parts.push(educationLabel);
    return parts.join(" · ");
  }, [places, peoples, selectedPlaces, selectedPeoples, educationLabel]);

  const toolbarActions = (
    <>
      <GenerateBtn type="button" onClick={() => setGenerateDrawerOpen(true)}>
        ✨ Generate
      </GenerateBtn>

      <div className="relative">
        <ToolbarAIBtn type="button" data-open={aiPopover === "facts"} onClick={runFactCheck}>
          {factCheck.isPending ? "Checking…" : "Check facts"}
        </ToolbarAIBtn>
        {aiPopover === "facts" && (
          <AIPopover>
            <PopoverHead>
              <PopoverTitle>Fact check</PopoverTitle>
              <PopoverClose type="button" onClick={() => setAiPopover(null)}>×</PopoverClose>
            </PopoverHead>
            <Hint className={factCheck.error ? "text-red-500! opacity-100!" : ""}>{factStatus}</Hint>
          </AIPopover>
        )}
      </div>

      <div className="relative">
        <ToolbarAIBtn type="button" data-open={aiPopover === "assist"} onClick={runAssist}>
          {assist.isPending ? "Reviewing…" : "Writing assist"}
        </ToolbarAIBtn>
        {aiPopover === "assist" && (
          <AIPopover>
            <PopoverHead>
              <PopoverTitle>Writing assist</PopoverTitle>
              <PopoverClose type="button" onClick={() => setAiPopover(null)}>×</PopoverClose>
            </PopoverHead>
            {!hasContent ? (
              <Hint>Write something in the manuscript first.</Hint>
            ) : (
              <ManuscriptWritingAssistPanel
                bare
                hideRunButton
                hasContent={hasContent}
                isPending={assist.isPending}
                error={assist.error}
                items={assist.items}
                hasRun={assist.hasRun}
                onRun={() => assist.run(description, audience)}
              />
            )}
          </AIPopover>
        )}
      </div>
    </>
  );

  if (authLoading) return <PageWrapper><p>Loading…</p></PageWrapper>;

  // ── Editor: full-bleed, the active manuscript owns the whole content cell ──
  if (showEditor) {
    return (
      <PageWrapper key="editor" className="h-full flex flex-col min-h-0 view-fade">
        <ManuscriptTabs
          tabs={displayTabs}
          activeTabId={activeTabId}
          onSelect={switchTab}
          onClose={closeTab}
          onNew={addManuscript}
          onBrowse={browseList}
          onRename={renameTab}
          onEditDetails={() => setDetailsDrawerOpen(true)}
          context={contextSummary}
          saveStatus={saveStatus}
          bleed
        />

        <div className="flex-1 min-h-0 flex flex-col bg-white">
          <ManuscriptEditor
            key={activeTabId}
            ref={editorRef}
            content={description}
            onChange={(html) => setValue("description", html)}
            suggestions={editorSuggestions}
            onSuggestionsLocated={handleLocated}
            onResolve={handleResolve}
            toolbarActions={toolbarActions}
          />
        </div>

        <ManuscriptDetailsDrawer
          open={detailsDrawerOpen}
          onClose={() => setDetailsDrawerOpen(false)}
          register={register}
          errors={errors}
          fileInputRef={fileInputRef}
          pendingFile={pendingFile}
          onFileChange={handleFileChange}
          onRemoveFile={removeFile}
          currentFileName={activeTab?.fileName}
          places={places}
          peoples={peoples}
          selectedPlaces={selectedPlaces}
          selectedPeoples={selectedPeoples}
          onPlacesChange={(val) => setValue("places", val)}
          onPeoplesChange={(val) => setValue("peoples", val)}
          educationLevels={EDUCATION_LEVELS}
          educationLevel={educationLevel ?? ""}
          onEducationLevelChange={(val) => setValue("educationLevel", val)}
        />

        <ManuscriptGenerateDrawer
          open={generateDrawerOpen}
          onClose={() => setGenerateDrawerOpen(false)}
          isPending={generate.isPending}
          error={generate.error}
          result={generate.result}
          onRun={(prompt) =>
            generate.run(prompt, { contexts: selectedContexts, audience, existingContent: description })
          }
          onInsert={handleInsertGenerated}
          onDiscard={generate.clear}
        />
      </PageWrapper>
    );
  }

  // ── Library: a clean list of every manuscript ──────────────────────────────
  return (
    <PageWrapper key="library" className="view-fade">
      <PageTitle>Manuscripts</PageTitle>
      <p className="text-sm text-title opacity-60 leading-relaxed mb-6">
        Manuscripts are your personal records of Ikwerre cultural knowledge — stories, observations,
        oral accounts, and research you want to preserve. Tag each manuscript with the places and
        peoples it relates to so it can be connected to the broader archive.
      </p>

      <AddBtn type="button" onClick={addManuscript}>+ New manuscript</AddBtn>
      {showLoginPrompt && (
        <LoginPrompt>
          <LoginPromptText>You need to be logged in to add a manuscript.</LoginPromptText>
          <PrimaryBtn type="button" onClick={() => navigate("/login")}>Log in</PrimaryBtn>
        </LoginPrompt>
      )}

      {session && (
        <ManuscriptList>
          {loadingManuscripts ? (
            <Spinner />
          ) : manuscripts.length === 0 ? (
            <EmptyState>No manuscripts yet. Add your first one above.</EmptyState>
          ) : (
            manuscripts.map((m) => (
              <ManuscriptCard
                key={m.id}
                manuscript={m}
                onEdit={openManuscript}
                onDelete={handleDelete}
                isDeleting={deleteMutation.isPending && deleteMutation.variables === m.id}
              />
            ))
          )}
        </ManuscriptList>
      )}
    </PageWrapper>
  );
}
