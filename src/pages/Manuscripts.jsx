import { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import tw from "tailwind-styled-components";
import { useAuth } from "@/contexts/AuthContext";
import ContextMultiSelect from "@/features/Manuscripts/ContextMultiSelect";
import ManuscriptCard from "@/features/Manuscripts/ManuscriptCard";
import RichTextEditor from "@/features/Manuscripts/RichTextEditor";
import WritingAssistPanel from "@/features/Manuscripts/WritingAssistPanel";
import Spinner from "@/ui/Spinner";
import { getAllStates } from "@/services/apiStates";
import { getAllLocalGovernments } from "@/services/apiLocalGovernments";
import { getAllEthnicGroups } from "@/services/apiEthnicGroups";
import { getAllTribes } from "@/services/apiTribes";
import { getManuscriptsByUser, createManuscript, updateManuscript, deleteManuscript } from "@/services/apiManuscripts";
import { uploadManuscriptFile } from "@/services/storage/uploadManuscriptFile";
import { useWritingAssist } from "@/hooks/useWritingAssist";

// ── Styled components ────────────────────────────────────────────────────────
const PageWrapper = tw.div``;
const PageTitle = tw.h1`text-3xl font-bold text-title mb-6`;
const StyledForm = tw.form`flex flex-col gap-6 bg-white border border-grey-info-outline rounded-xl p-6 mb-4`;
const FieldWrapper = tw.div`flex flex-col gap-1`;
const SectionLabel = tw.p`text-sm font-semibold text-title mb-2`;
const Label = tw.label`text-sm font-semibold text-title`;
const Input = tw.input`border border-grey-info-outline rounded-lg px-3 py-2 text-sm text-title focus:outline-none focus:border-orange-400`;
const Select = tw.select`border border-grey-info-outline rounded-lg px-3 py-2 text-sm text-title focus:outline-none focus:border-orange-400 bg-white`;
const FileZone = tw.div`border border-dashed border-grey-info-outline rounded-lg px-4 py-5 flex flex-col items-center gap-2 cursor-pointer hover:border-orange-400 transition-colors`;
const FileZoneText = tw.p`text-sm text-title opacity-50`;
const FileChip = tw.div`flex items-center gap-2 bg-orange-background-100 border border-orange-accent rounded-md px-3 py-1.5 text-sm text-title`;
const RemoveFileBtn = tw.button`text-title opacity-40 hover:opacity-100 bg-transparent border-0 cursor-pointer leading-none`;
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
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [pendingFile, setPendingFile] = useState(null);
  const [uploadError, setUploadError] = useState(null);
  const fileInputRef = useRef(null);

  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm({
    defaultValues: { states: [], localGovernments: [], ethnicGroups: [], tribes: [], description: "", educationLevel: "" },
  });

  const selectedStates = watch("states") ?? [];
  const selectedLGs = watch("localGovernments") ?? [];
  const selectedEGs = watch("ethnicGroups") ?? [];
  const selectedTribes = watch("tribes") ?? [];
  const description = watch("description") ?? "";
  const educationLevel = watch("educationLevel");
  const audience = educationLevel || null;
  const hasContent = description.replace(/<[^>]*>/g, "").trim().length > 0;

  // ── AI writing assist ──────────────────────────────────────────────────────
  const assist = useWritingAssist({ manuscriptId: editingManuscript?.id });

  // ── Context option lists ─────────────────────────────────────────────────
  const { data: states = [] } = useQuery({ queryKey: ["states"], queryFn: getAllStates });
  const { data: localGovernments = [] } = useQuery({ queryKey: ["localGovernments"], queryFn: getAllLocalGovernments });
  const { data: ethnicGroups = [] } = useQuery({ queryKey: ["ethnicGroups"], queryFn: getAllEthnicGroups });
  const { data: tribes = [] } = useQuery({ queryKey: ["tribes"], queryFn: getAllTribes });

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
          states: formData.states ?? [],
          localGovernments: formData.localGovernments ?? [],
          ethnicGroups: formData.ethnicGroups ?? [],
          tribes: formData.tribes ?? [],
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
      assist.reset();
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
          states: formData.states ?? [],
          localGovernments: formData.localGovernments ?? [],
          ethnicGroups: formData.ethnicGroups ?? [],
          tribes: formData.tribes ?? [],
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
      assist.reset();
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
    setValue("states", ctx.states ?? []);
    setValue("localGovernments", ctx.localGovernments ?? []);
    setValue("ethnicGroups", ctx.ethnicGroups ?? []);
    setValue("tribes", ctx.tribes ?? []);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function handleCancel() {
    reset();
    setPendingFile(null);
    setUploadError(null);
    setIsCreating(false);
    setEditingManuscript(null);
    assist.reset();
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

  if (authLoading) return <PageWrapper><p>Loading…</p></PageWrapper>;

  return (
    <PageWrapper>
      <PageTitle>Manuscripts</PageTitle>
      <p className="text-sm text-title opacity-60 leading-relaxed mb-6">
        Manuscripts are your personal records of Ikwerre cultural knowledge — stories, observations,
        oral accounts, and research you want to preserve. Tag each manuscript with the states,
        local governments, ethnic groups, or tribes it relates to so it can be connected to the
        broader archive.
      </p>

      {isFormOpen && (
        <StyledForm onSubmit={handleSubmit(onSubmit)}>
          <p className="text-sm font-semibold text-title opacity-60">
            {editingManuscript ? "Edit manuscript" : "New manuscript"}
          </p>

          <FieldWrapper>
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              placeholder="Manuscript title"
              {...register("title", { required: "Title is required" })}
            />
            {errors.title && <ErrorText>{errors.title.message}</ErrorText>}
          </FieldWrapper>

          <FieldWrapper>
            <Label htmlFor="educationLevel">Student level <span className="font-normal opacity-40">(optional)</span></Label>
            <Select id="educationLevel" {...register("educationLevel")}>
              <option value="">Not specified</option>
              {EDUCATION_LEVELS.map((level) => (
                <option key={level.value} value={level.value}>{level.label}</option>
              ))}
            </Select>
          </FieldWrapper>

          <Divider />

          <FieldWrapper>
            <SectionLabel>Contexts</SectionLabel>
            <div className="flex flex-wrap gap-2">
              <ContextMultiSelect label="States" items={states} itemLabel="state_name" selected={selectedStates} onChange={(val) => setValue("states", val)} />
              <ContextMultiSelect label="Local Governments" items={localGovernments} itemLabel="name" selected={selectedLGs} onChange={(val) => setValue("localGovernments", val)} />
              <ContextMultiSelect label="Ethnic Groups" items={ethnicGroups} itemLabel="name" selected={selectedEGs} onChange={(val) => setValue("ethnicGroups", val)} />
              <ContextMultiSelect label="Tribes" items={tribes} itemLabel="name" selected={selectedTribes} onChange={(val) => setValue("tribes", val)} />
            </div>
          </FieldWrapper>

          <Divider />

          <FieldWrapper>
            <Label>Context file <span className="font-normal opacity-40">(PDF, DOCX, or TXT · max 20 MB)</span></Label>
            <input
              ref={fileInputRef}
              id="file"
              type="file"
              accept=".pdf,.doc,.docx,.txt"
              className="hidden"
              onChange={handleFileChange}
            />
            {pendingFile ? (
              <FileChip>
                <span className="truncate max-w-xs">{pendingFile.name}</span>
                <RemoveFileBtn type="button" onClick={removeFile} aria-label="Remove file">×</RemoveFileBtn>
              </FileChip>
            ) : (
              <FileZone onClick={() => fileInputRef.current?.click()}>
                <FileZoneText>Click to choose a file</FileZoneText>
                {editingManuscript?.file_name && (
                  <FileZoneText>Current: {editingManuscript.file_name}</FileZoneText>
                )}
              </FileZone>
            )}
          </FieldWrapper>

          <Divider />

          <FieldWrapper>
            <Label>Description</Label>
            <RichTextEditor
              key={editingManuscript?.id ?? "new"}
              content={description}
              onChange={(html) => setValue("description", html)}
              suggestions={assist.editorSuggestions}
              onSuggestionsLocated={assist.setLocated}
              onResolve={assist.resolve}
            />
          </FieldWrapper>

          <WritingAssistPanel
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

      {!isFormOpen && (
        <>
          <div>
            <AddBtn
              onClick={() => {
                if (!session) { setShowLoginPrompt(true); return; }
                setShowLoginPrompt(false);
                setIsCreating(true);
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
