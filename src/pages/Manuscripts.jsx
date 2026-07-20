import { useState, useRef, useMemo } from "react";
import { useForm } from "react-hook-form";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import tw from "tailwind-styled-components";
import { useAuth } from "@/contexts/AuthContext";
import ManuscriptContextBar from "@/features/Manuscripts/ManuscriptContextBar";
import ManuscriptDetailsDrawer from "@/features/Manuscripts/ManuscriptDetailsDrawer";
import ManuscriptCard from "@/features/Manuscripts/ManuscriptCard";
import ManuscriptEditor from "@/features/Manuscripts/ManuscriptEditor";
import ManuscriptWritingAssistPanel from "@/features/Manuscripts/ManuscriptWritingAssistPanel";
import ManuscriptFactCheckButton from "@/features/Manuscripts/ManuscriptFactCheckButton";
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
const TitleHeading = tw.h2`text-xl font-bold text-title truncate`;
const StyledForm = tw.form`flex flex-col gap-6 bg-white border border-grey-info-outline rounded-xl p-6 mb-4`;
const FieldWrapper = tw.div`flex flex-col gap-1`;
const Label = tw.label`text-sm font-semibold text-title`;
const ErrorText = tw.p`text-red-500 text-xs mt-0.5`;
const Divider = tw.hr`border-grey-info-outline`;
const ButtonRow = tw.div`flex gap-3 mt-1`;
const PrimaryBtn = tw.button`bg-title text-white rounded-lg px-5 py-2 text-sm font-semibold cursor-pointer border-0 disabled:opacity-50`;
const SecondaryBtn = tw.button`border border-grey-info-outline rounded-lg px-5 py-2 text-sm text-title cursor-pointer bg-transparent`;
const AddBtn = tw.button`bg-title text-white rounded-lg px-5 py-2 text-sm font-semibold cursor-pointer border-0`;
const LoginPrompt = tw.div`mt-3 flex items-center justify-between gap-4 rounded-xl border border-orange-300 bg-orange-background-100 px-4 py-3`;
const LoginPromptText = tw.p`text-sm text-title`;
const ManuscriptList = tw.div`flex flex-col gap-3 mt-6`;
const EmptyState = tw.p`text-sm text-title opacity-40 mt-6`;

const EDUCATION_LEVELS = [
  { value: "preschool", label: "Preschool" },
  { value: "kindergarten", label: "Kindergarten" },
  { value: "high_school", label: "High School" },
  { value: "undergrad", label: "Undergrad" },
  { value: "grad", label: "Grad" },
];

export default function Manuscripts() {
  const { session, profile, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [isCreating, setIsCreating] = useState(false);
  const [editingManuscript, setEditingManuscript] = useState(null);
  // All manuscript metadata (title, file, contexts, level) is edited in this
  // drawer; it opens automatically for a new manuscript so those get set first.
  const [detailsDrawerOpen, setDetailsDrawerOpen] = useState(false);
  const [generateDrawerOpen, setGenerateDrawerOpen] = useState(false);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [pendingFile, setPendingFile] = useState(null);
  const [uploadError, setUploadError] = useState(null);
  const fileInputRef = useRef(null);

  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm({
    defaultValues: { places: [], peoples: [], description: "", educationLevel: "" },
  });

  const title = watch("title") ?? "";
  const selectedPlaces = watch("places") ?? [];
  const selectedPeoples = watch("peoples") ?? [];
  const description = watch("description") ?? "";
  const educationLevel = watch("educationLevel");
  const audience = educationLevel || null;
  const educationLabel = EDUCATION_LEVELS.find((l) => l.value === educationLevel)?.label ?? null;
  const hasContent = description.replace(/<[^>]*>/g, "").trim().length > 0;

  // ── AI writing assist + fact-check + generate ──────────────────────────────
  const assist = useManuscriptWritingAssist({ manuscriptId: editingManuscript?.id });
  const factCheck = useManuscriptFactCheck({ manuscriptId: editingManuscript?.id });
  const generate = useManuscriptGenerate({ manuscriptId: editingManuscript?.id });
  // Generated passages enter the document through the editor's imperative insert.
  const editorRef = useRef(null);

  // The fact-checker grounds claims in the entries behind the selected places
  // and peoples, so with nothing selected there is nothing to check against.
  const selectedContexts = useMemo(
    () => ({ places: selectedPlaces, peoples: selectedPeoples }),
    [selectedPlaces, selectedPeoples],
  );
  const hasContexts = Object.values(selectedContexts).some((ids) => ids.length > 0);

  // One decoration set for the editor. Both lists are memoised by their hooks,
  // so this identity only changes when the suggestions themselves do — a fresh
  // array every render would retrigger the editor's locate pass on a loop.
  const editorSuggestions = useMemo(
    () => [...assist.editorSuggestions, ...factCheck.editorSuggestions],
    [assist.editorSuggestions, factCheck.editorSuggestions],
  );

  // Ids are namespaced per hook (tone-/grammar-/fact-), so each hook ignores
  // located entries that aren't its own and we can broadcast the whole list.
  function handleLocated(located) {
    assist.setLocated(located);
    factCheck.setLocated(located);
  }

  function handleResolve(id, action) {
    if (String(id).startsWith("fact-")) factCheck.resolve(id, action);
    else assist.resolve(id, action);
  }

  // Insert the generated passage at the end of the draft, then drop the preview
  // so it can't be inserted twice. The editor's onChange keeps the form in sync.
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
  }

  // ── Context option lists (the new places / peoples trees) ─────────────────
  const { data: places = [] } = useQuery({ queryKey: ["places", "all"], queryFn: getAllPlaces });
  const { data: peoples = [] } = useQuery({ queryKey: ["peoples", "all"], queryFn: getAllPeoples });

  // ── Manuscripts list ─────────────────────────────────────────────────────
  const { data: manuscripts = [], isLoading: loadingManuscripts } = useQuery({
    queryKey: ["manuscripts", profile?.id],
    queryFn: () => getManuscriptsByUser(profile.id),
    enabled: !!profile?.id,
  });

  // ── Mutations ────────────────────────────────────────────────────────────
  const createMutation = useMutation({
    mutationFn: async (formData) => {
      let filePath = null;
      let fileName = null;
      if (pendingFile) {
        const uploaded = await uploadManuscriptFile(profile.id, pendingFile);
        filePath = uploaded.path;
        fileName = uploaded.name;
      }
      return createManuscript({
        userId: profile?.id,
        title: formData.title,
        manuscriptDescription: formData.description,
        contexts: {
          places: formData.places ?? [],
          peoples: formData.peoples ?? [],
        },
        educationLevel: formData.educationLevel,
        filePath,
        fileName,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["manuscripts"] });
      reset();
      setPendingFile(null);
      setIsCreating(false);
      setDetailsDrawerOpen(false);
      setGenerateDrawerOpen(false);
      resetAI();
    },
    onError: (err) => setUploadError(err.message),
  });

  const updateMutation = useMutation({
    mutationFn: async (formData) => {
      let filePath = undefined;
      let fileName = undefined;
      if (pendingFile) {
        const uploaded = await uploadManuscriptFile(profile.id, pendingFile);
        filePath = uploaded.path;
        fileName = uploaded.name;
      }
      return updateManuscript(editingManuscript.id, {
        title: formData.title,
        manuscriptDescription: formData.description,
        contexts: {
          places: formData.places ?? [],
          peoples: formData.peoples ?? [],
        },
        educationLevel: formData.educationLevel,
        filePath,
        fileName,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["manuscripts"] });
      reset();
      setPendingFile(null);
      setEditingManuscript(null);
      setDetailsDrawerOpen(false);
      setGenerateDrawerOpen(false);
      resetAI();
    },
    onError: (err) => setUploadError(err.message),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => deleteManuscript(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["manuscripts"] }),
  });

  function handleEditClick(manuscript) {
    setEditingManuscript(manuscript);
    setIsCreating(false);
    setValue("title", manuscript.title ?? "");
    setValue("description", manuscript.manuscript_description ?? "");
    setValue("educationLevel", manuscript.education_level ?? "");
    const ctx = manuscript.contexts ?? {};
    setValue("places", ctx.places ?? []);
    setValue("peoples", ctx.peoples ?? []);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function handleCancel() {
    reset();
    setPendingFile(null);
    setUploadError(null);
    setIsCreating(false);
    setDetailsDrawerOpen(false);
    setGenerateDrawerOpen(false);
    setEditingManuscript(null);
    resetAI();
  }

  function handleFileChange(e) {
    const file = e.target.files?.[0];
    if (file) { setPendingFile(file); setUploadError(null); }
  }

  function removeFile() {
    setPendingFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function onSubmit(data) {
    setUploadError(null);
    if (editingManuscript) {
      updateMutation.mutate(data);
    } else {
      createMutation.mutate(data);
    }
  }

  const isSaving = createMutation.isPending || updateMutation.isPending;
  const isFormOpen = isCreating || !!editingManuscript;

  // One config drives both the drawer's selects and the summary bar's read-out.
  const contextGroups = [
    { label: "Places", items: places, itemLabel: "name", selected: selectedPlaces },
    { label: "Peoples", items: peoples, itemLabel: "name", selected: selectedPeoples },
  ];

  if (authLoading) return <PageWrapper><p>Loading…</p></PageWrapper>;

  return (
    <PageWrapper>
      <PageTitle>Manuscripts</PageTitle>
      <p className="text-sm text-title opacity-60 leading-relaxed mb-6">
        Manuscripts are your personal records of Ikwerre cultural knowledge — stories, observations,
        oral accounts, and research you want to preserve. Tag each manuscript with the places and
        peoples it relates to so it can be connected to the broader archive.
      </p>

      {/* ── Editor: the manuscript's title, details bar, and body ─────────── */}
      {isFormOpen && (
        <StyledForm onSubmit={handleSubmit(onSubmit)}>
          <div className="flex items-baseline justify-between gap-3">
            <TitleHeading>{title.trim() || "Untitled manuscript"}</TitleHeading>
            <span className="text-xs text-title opacity-40 shrink-0">
              {editingManuscript ? "Editing" : "New"}
            </span>
          </div>
          {errors.title && <ErrorText>{errors.title.message}</ErrorText>}

          <ManuscriptContextBar
            groups={contextGroups}
            educationLabel={educationLabel}
            attachedFileName={pendingFile?.name ?? editingManuscript?.file_name ?? null}
            onEdit={() => setDetailsDrawerOpen(true)}
          />

          <Divider />

          <FieldWrapper>
            <Label>Description</Label>
            <ManuscriptEditor
              key={editingManuscript?.id ?? "new"}
              ref={editorRef}
              content={description}
              onChange={(html) => setValue("description", html)}
              suggestions={editorSuggestions}
              onSuggestionsLocated={handleLocated}
              onResolve={handleResolve}
            />
            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={() => setGenerateDrawerOpen(true)}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-white bg-orange-accent rounded-lg px-3 py-1.5 cursor-pointer border-0 hover:opacity-90 transition-opacity"
              >
                ✨ Generate with AI
              </button>
              <ManuscriptFactCheckButton
                hasContent={hasContent}
                hasContexts={hasContexts}
                isPending={factCheck.isPending}
                error={factCheck.error}
                items={factCheck.items}
                hasRun={factCheck.hasRun}
                sourceCount={factCheck.sourceCount}
                onRun={() => factCheck.run(description, selectedContexts)}
              />
            </div>
          </FieldWrapper>

          <ManuscriptWritingAssistPanel
            hasContent={hasContent}
            isPending={assist.isPending}
            error={assist.error}
            items={assist.items}
            hasRun={assist.hasRun}
            onRun={() => assist.run(description, audience)}
          />

          {uploadError && <ErrorText>{uploadError}</ErrorText>}

          {(createMutation.isError || updateMutation.isError) && (
            <ErrorText>{createMutation.error?.message ?? updateMutation.error?.message}</ErrorText>
          )}

          <ButtonRow>
            <PrimaryBtn type="submit" disabled={isSaving}>{isSaving ? "Saving…" : "Save"}</PrimaryBtn>
            <SecondaryBtn type="button" onClick={handleCancel}>Cancel</SecondaryBtn>
          </ButtonRow>
        </StyledForm>
      )}

      <ManuscriptDetailsDrawer
        open={detailsDrawerOpen}
        onClose={() => setDetailsDrawerOpen(false)}
        register={register}
        errors={errors}
        fileInputRef={fileInputRef}
        pendingFile={pendingFile}
        onFileChange={handleFileChange}
        onRemoveFile={removeFile}
        currentFileName={editingManuscript?.file_name}
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
          generate.run(prompt, {
            contexts: selectedContexts,
            audience,
            existingContent: description,
          })
        }
        onInsert={handleInsertGenerated}
        onDiscard={generate.clear}
      />

      {!isFormOpen && (
        <>
          <div>
            <AddBtn
              onClick={() => {
                if (!session) { setShowLoginPrompt(true); return; }
                setShowLoginPrompt(false);
                setIsCreating(true);
                setDetailsDrawerOpen(true);
              }}
            >
              + Add Manuscript
            </AddBtn>
            {showLoginPrompt && (
              <LoginPrompt>
                <LoginPromptText>You need to be logged in to add a manuscript.</LoginPromptText>
                <PrimaryBtn type="button" onClick={() => navigate("/login")}>Log in</PrimaryBtn>
              </LoginPrompt>
            )}
          </div>

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
                    onEdit={handleEditClick}
                    onDelete={(id) => deleteMutation.mutate(id)}
                    isDeleting={deleteMutation.isPending && deleteMutation.variables === m.id}
                  />
                ))
              )}
            </ManuscriptList>
          )}
        </>
      )}
    </PageWrapper>
  );
}
