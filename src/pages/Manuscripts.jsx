import { useState } from "react";
import { useForm } from "react-hook-form";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import tw from "tailwind-styled-components";
import { useAuth } from "@/contexts/AuthContext";
import { getAllStates } from "@/services/apiStates";
import { getAllLocalGovernments } from "@/services/apiLocalGovernments";
import { getAllEthnicGroups } from "@/services/apiEthnicGroups";
import { getAllTribes } from "@/services/apiTribes";
import {
  getManuscripts,
  createManuscript,
  updateManuscript,
} from "@/services/apiManuscripts";

// ── Styled components ────────────────────────────────────────────────────────
const PageWrapper = tw.div`p-8 max-w-2xl`;
const PageTitle = tw.h1`text-3xl font-bold text-title mb-6`;

const Card = tw.div`bg-white border border-grey-info-outline rounded-xl p-5 mb-3`;
const CardTitle = tw.h3`font-semibold text-title text-base mb-1`;
const CardDescription = tw.p`text-title opacity-60 text-sm mb-3`;
const CardMeta = tw.p`text-title opacity-40 text-xs`;
const CardActions = tw.div`flex gap-2 mt-3`;

const EmptyText = tw.p`text-title opacity-40 italic mb-4`;

const StyledForm = tw.form`flex flex-col gap-6 bg-white border border-grey-info-outline rounded-xl p-6 mb-4`;
const FieldWrapper = tw.div`flex flex-col gap-1`;
const SectionLabel = tw.p`text-sm font-semibold text-title mb-2`;
const Label = tw.label`text-sm font-semibold text-title`;
const Input = tw.input`border border-grey-info-outline rounded-lg px-3 py-2 text-sm text-title focus:outline-none focus:border-orange-400`;
const StyledTextarea = tw.textarea`border border-grey-info-outline rounded-lg px-3 py-2 text-sm text-title focus:outline-none focus:border-orange-400 resize-none h-28`;
const ErrorText = tw.p`text-red-500 text-xs mt-0.5`;
const Divider = tw.hr`border-grey-info-outline`;

const CheckboxGrid = tw.div`grid grid-cols-2 gap-2`;
const CheckboxItem = tw.label`flex items-center gap-2 text-sm rounded-lg px-3 py-2 border cursor-pointer transition-all border-grey-info-outline text-title hover:border-orange-400`;
const EmptySection = tw.p`text-title opacity-40 text-sm italic`;

const LoginPrompt = tw.div`bg-orange-background-100 border border-orange-300 rounded-lg px-4 py-3 flex items-center justify-between gap-4`;
const LoginPromptText = tw.p`text-sm text-title`;

const ButtonRow = tw.div`flex gap-3 mt-1`;
const PrimaryBtn = tw.button`bg-title text-white rounded-lg px-5 py-2 text-sm font-semibold cursor-pointer border-0 disabled:opacity-50`;
const SecondaryBtn = tw.button`border border-grey-info-outline rounded-lg px-5 py-2 text-sm text-title cursor-pointer bg-transparent`;
const EditBtn = tw.button`border border-grey-info-outline rounded-lg px-3 py-1.5 text-xs text-title cursor-pointer bg-transparent hover:border-orange-400 transition-colors`;
const AddBtn = tw.button`bg-title text-white rounded-lg px-5 py-2 text-sm font-semibold cursor-pointer border-0`;

export default function Manuscripts() {
  const { session, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [isCreating, setIsCreating] = useState(false);
  const [editingManuscript, setEditingManuscript] = useState(null);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm();

  // ── Context option lists ─────────────────────────────────────────────────
  const { data: states = [] } = useQuery({ queryKey: ["states"], queryFn: getAllStates });
  const { data: localGovernments = [] } = useQuery({ queryKey: ["localGovernments"], queryFn: getAllLocalGovernments });
  const { data: ethnicGroups = [] } = useQuery({ queryKey: ["ethnicGroups"], queryFn: getAllEthnicGroups });
  const { data: tribes = [] } = useQuery({ queryKey: ["tribes"], queryFn: getAllTribes });

  // ── Manuscripts ──────────────────────────────────────────────────────────
  const { data: manuscripts = [], isLoading: loadingManuscripts } = useQuery({
    queryKey: ["manuscripts"],
    queryFn: getManuscripts,
  });

  const createMutation = useMutation({
    mutationFn: (formData) =>
      createManuscript({
        userId: 1, // TODO: replace with auth user's DB id after auth is configured
        title: formData.title,
        manuscriptDescription: formData.description,
        contexts: {
          states: formData.states ?? [],
          localGovernments: formData.localGovernments ?? [],
          ethnicGroups: formData.ethnicGroups ?? [],
          tribes: formData.tribes ?? [],
        },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["manuscripts"] });
      reset();
      setIsCreating(false);
    },
  });

  const updateMutation = useMutation({
    mutationFn: (formData) =>
      updateManuscript(editingManuscript.id, {
        title: formData.title,
        manuscriptDescription: formData.description,
        contexts: {
          states: formData.states ?? [],
          localGovernments: formData.localGovernments ?? [],
          ethnicGroups: formData.ethnicGroups ?? [],
          tribes: formData.tribes ?? [],
        },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["manuscripts"] });
      reset();
      setEditingManuscript(null);
    },
  });

  function handleEditClick(manuscript) {
    setEditingManuscript(manuscript);
    setIsCreating(false);
    setShowLoginPrompt(false);
    setValue("title", manuscript.title ?? "");
    setValue("description", manuscript.manuscript_description ?? "");
    const ctx = manuscript.contexts ?? {};
    setValue("states", ctx.states ?? []);
    setValue("localGovernments", ctx.localGovernments ?? []);
    setValue("ethnicGroups", ctx.ethnicGroups ?? []);
    setValue("tribes", ctx.tribes ?? []);
  }

  function handleCancel() {
    reset();
    setIsCreating(false);
    setEditingManuscript(null);
    setShowLoginPrompt(false);
  }

  function onSubmit(data) {
    if (!session) {
      setShowLoginPrompt(true);
      return;
    }
    setShowLoginPrompt(false);
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

      {loadingManuscripts ? (
        <p className="text-sm opacity-40 mb-4">Loading manuscripts…</p>
      ) : manuscripts.length === 0 && !isFormOpen ? (
        <EmptyText>No manuscripts yet.</EmptyText>
      ) : (
        manuscripts.map((m) => (
          <Card key={m.id}>
            <CardTitle>{m.title ?? "Untitled"}</CardTitle>
            <CardDescription>{m.manuscript_description}</CardDescription>
            <CardMeta>{new Date(m.created_at).toLocaleDateString()}</CardMeta>
            <CardActions>
              <EditBtn
                type="button"
                onClick={() => handleEditClick(m)}
                disabled={isFormOpen && editingManuscript?.id !== m.id}
              >
                Edit
              </EditBtn>
            </CardActions>
          </Card>
        ))
      )}

      {isFormOpen && (
        <StyledForm onSubmit={handleSubmit(onSubmit)}>
          <p className="text-sm font-semibold text-title opacity-60">
            {editingManuscript ? "Edit manuscript" : "New manuscript"}
          </p>

          {/* Title */}
          <FieldWrapper>
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              placeholder="Manuscript title"
              {...register("title", { required: "Title is required" })}
            />
            {errors.title && <ErrorText>{errors.title.message}</ErrorText>}
          </FieldWrapper>

          <Divider />

          {/* States */}
          <FieldWrapper>
            <SectionLabel>States</SectionLabel>
            {states.length === 0 ? (
              <EmptySection>No states available.</EmptySection>
            ) : (
              <CheckboxGrid>
                {states.map((s) => (
                  <CheckboxItem key={s.id}>
                    <input type="checkbox" value={s.id} {...register("states")} />
                    {s.state_name}
                  </CheckboxItem>
                ))}
              </CheckboxGrid>
            )}
          </FieldWrapper>

          <Divider />

          {/* Local Governments */}
          <FieldWrapper>
            <SectionLabel>Local Governments</SectionLabel>
            {localGovernments.length === 0 ? (
              <EmptySection>No local governments available.</EmptySection>
            ) : (
              <CheckboxGrid>
                {localGovernments.map((lg) => (
                  <CheckboxItem key={lg.id}>
                    <input type="checkbox" value={lg.id} {...register("localGovernments")} />
                    {lg.name}
                  </CheckboxItem>
                ))}
              </CheckboxGrid>
            )}
          </FieldWrapper>

          <Divider />

          {/* Ethnic Groups */}
          <FieldWrapper>
            <SectionLabel>Ethnic Groups</SectionLabel>
            {ethnicGroups.length === 0 ? (
              <EmptySection>No ethnic groups available.</EmptySection>
            ) : (
              <CheckboxGrid>
                {ethnicGroups.map((eg) => (
                  <CheckboxItem key={eg.id}>
                    <input type="checkbox" value={eg.id} {...register("ethnicGroups")} />
                    {eg.name}
                  </CheckboxItem>
                ))}
              </CheckboxGrid>
            )}
          </FieldWrapper>

          <Divider />

          {/* Tribes */}
          <FieldWrapper>
            <SectionLabel>Tribes</SectionLabel>
            {tribes.length === 0 ? (
              <EmptySection>No tribe data available yet.</EmptySection>
            ) : (
              <CheckboxGrid>
                {tribes.map((t) => (
                  <CheckboxItem key={t.id}>
                    <input type="checkbox" value={t.id} {...register("tribes")} />
                    {t.name}
                  </CheckboxItem>
                ))}
              </CheckboxGrid>
            )}
          </FieldWrapper>

          <Divider />

          {/* Description */}
          <FieldWrapper>
            <Label htmlFor="description">Description</Label>
            <StyledTextarea
              id="description"
              placeholder="Write your manuscript notes here…"
              {...register("description")}
            />
          </FieldWrapper>

          {showLoginPrompt && (
            <LoginPrompt>
              <LoginPromptText>You need to be logged in to save a manuscript.</LoginPromptText>
              <PrimaryBtn type="button" onClick={() => navigate("/login")}>
                Log in
              </PrimaryBtn>
            </LoginPrompt>
          )}

          {(createMutation.isError || updateMutation.isError) && (
            <ErrorText>
              {createMutation.error?.message ?? updateMutation.error?.message}
            </ErrorText>
          )}

          <ButtonRow>
            <PrimaryBtn type="submit" disabled={isSaving}>
              {isSaving ? "Saving…" : "Save"}
            </PrimaryBtn>
            <SecondaryBtn type="button" onClick={handleCancel}>Cancel</SecondaryBtn>
          </ButtonRow>
        </StyledForm>
      )}

      {!isFormOpen && (
        <AddBtn onClick={() => { setIsCreating(true); setEditingManuscript(null); }}>
          + Add Manuscript
        </AddBtn>
      )}
    </PageWrapper>
  );
}
