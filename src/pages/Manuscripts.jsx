import { useState } from "react";
import { useForm } from "react-hook-form";
import tw from "tailwind-styled-components";
import { statesData } from "@/data/statesData";
import { localGovernmentData } from "@/data/localGovernmentData";
import { ethnicGroupData } from "@/data/ethnicGroupData";
import { tribesData } from "@/data/tribesData";

// ── Selectable sets (expand as more data is added) ───────────────────────────
const SELECTABLE_STATES = new Set(["lagos"]);
const SELECTABLE_LGS = new Set(["ikeja"]);
const SELECTABLE_ETHNIC_GROUPS = new Set(["ikwerre-ikeja"]);
const SELECTABLE_TRIBES = new Set([]);

// ── Data slices ──────────────────────────────────────────────────────────────
const nigerianStates = statesData.filter((s) => s.country_id === "nigeria");
const lagosLGs = localGovernmentData.filter((lg) => lg.state_id === "lagos");
const lagosEthnicGroups = ethnicGroupData.filter((eg) => eg.state_id === "lagos");
const ikwerreTribes = tribesData.filter((t) => t.ethnic_group_id === "ikwerre-ikeja");

// ── Styled components ────────────────────────────────────────────────────────
const PageWrapper = tw.div`p-8 max-w-2xl`;
const PageTitle = tw.h1`text-3xl font-bold text-title mb-6`;

const Card = tw.div`bg-white border border-grey-info-outline rounded-xl p-5 mb-3`;
const CardTitle = tw.h3`font-semibold text-title text-base mb-1`;
const CardDescription = tw.p`text-title opacity-60 text-sm`;
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
const CheckboxItem = tw.label`
  flex items-center gap-2 text-sm rounded-lg px-3 py-2 border cursor-pointer transition-all
  ${(p) => p.$disabled
    ? "opacity-40 cursor-not-allowed border-grey-info-outline text-title"
    : "border-grey-info-outline text-title hover:border-orange-400"}
`;
const EmptySection = tw.p`text-title opacity-40 text-sm italic`;

const ButtonRow = tw.div`flex gap-3 mt-1`;
const PrimaryBtn = tw.button`bg-title text-white rounded-lg px-5 py-2 text-sm font-semibold cursor-pointer border-0`;
const SecondaryBtn = tw.button`border border-grey-info-outline rounded-lg px-5 py-2 text-sm text-title cursor-pointer bg-transparent`;
const AddBtn = tw.button`bg-title text-white rounded-lg px-5 py-2 text-sm font-semibold cursor-pointer border-0`;

export default function Manuscripts() {
  const [manuscripts, setManuscripts] = useState([]);
  const [isCreatingNewManuscript, setIsCreatingNewManuscript] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  function onSubmit(data) {
    setManuscripts((prev) => [...prev, { id: Date.now(), ...data }]);
    reset();
    setIsCreatingNewManuscript(false);
  }

  function handleCancel() {
    reset();
    setIsCreatingNewManuscript(false);
  }

  return (
    <PageWrapper>
      <PageTitle>Manuscripts</PageTitle>

      {manuscripts.length === 0 && !isCreatingNewManuscript && (
        <EmptyText>No manuscripts yet.</EmptyText>
      )}

      {manuscripts.map((manuscript) => (
        <Card key={manuscript.id}>
          <CardTitle>{manuscript.title}</CardTitle>
          <CardDescription>{manuscript.description}</CardDescription>
        </Card>
      ))}

      {isCreatingNewManuscript ? (
        <StyledForm onSubmit={handleSubmit(onSubmit)}>

          {/* Title */}
          <FieldWrapper>
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              {...register("title", { required: "Title is required" })}
              placeholder="Manuscript title"
            />
            {errors.title && <ErrorText>{errors.title.message}</ErrorText>}
          </FieldWrapper>

          {/* States */}
          <FieldWrapper>
            <SectionLabel>States</SectionLabel>
            <CheckboxGrid>
              {nigerianStates.map((s) => {
                const disabled = !SELECTABLE_STATES.has(s.state_id);
                return (
                  <CheckboxItem key={s.state_id} $disabled={disabled}>
                    <input
                      type="checkbox"
                      value={s.state_id}
                      {...register("states")}
                      disabled={disabled}
                    />
                    {s.name}
                  </CheckboxItem>
                );
              })}
            </CheckboxGrid>
          </FieldWrapper>

          <Divider />

          {/* Local Governments */}
          <FieldWrapper>
            <SectionLabel>Local Governments</SectionLabel>
            <CheckboxGrid>
              {lagosLGs.map((lg) => {
                const disabled = !SELECTABLE_LGS.has(lg.lg_id);
                return (
                  <CheckboxItem key={lg.lg_id} $disabled={disabled}>
                    <input
                      type="checkbox"
                      value={lg.lg_id}
                      {...register("localGovernments")}
                      disabled={disabled}
                    />
                    {lg.name}
                  </CheckboxItem>
                );
              })}
            </CheckboxGrid>
          </FieldWrapper>

          <Divider />

          {/* Ethnic Groups */}
          <FieldWrapper>
            <SectionLabel>Ethnic Groups</SectionLabel>
            <CheckboxGrid>
              {lagosEthnicGroups.map((eg) => {
                const disabled = !SELECTABLE_ETHNIC_GROUPS.has(eg.ethnic_group_id);
                return (
                  <CheckboxItem key={eg.ethnic_group_id} $disabled={disabled}>
                    <input
                      type="checkbox"
                      value={eg.ethnic_group_id}
                      {...register("ethnicGroups")}
                      disabled={disabled}
                    />
                    {eg.name}
                  </CheckboxItem>
                );
              })}
            </CheckboxGrid>
          </FieldWrapper>

          <Divider />

          {/* Tribes */}
          <FieldWrapper>
            <SectionLabel>Tribes</SectionLabel>
            {ikwerreTribes.length === 0 ? (
              <EmptySection>No tribe data available yet.</EmptySection>
            ) : (
              <CheckboxGrid>
                {ikwerreTribes.map((t) => {
                  const disabled = !SELECTABLE_TRIBES.has(t.tribe_id);
                  return (
                    <CheckboxItem key={t.tribe_id} $disabled={disabled}>
                      <input
                        type="checkbox"
                        value={t.tribe_id}
                        {...register("tribes")}
                        disabled={disabled}
                      />
                      {t.name}
                    </CheckboxItem>
                  );
                })}
              </CheckboxGrid>
            )}
          </FieldWrapper>

          <Divider />

          {/* Description */}
          <FieldWrapper>
            <Label htmlFor="description">Description</Label>
            <StyledTextarea
              id="description"
              {...register("description")}
              placeholder="Brief description..."
            />
          </FieldWrapper>

          <ButtonRow>
            <PrimaryBtn type="submit">Save</PrimaryBtn>
            <SecondaryBtn type="button" onClick={handleCancel}>Cancel</SecondaryBtn>
          </ButtonRow>

        </StyledForm>
      ) : (
        <AddBtn onClick={() => setIsCreatingNewManuscript(true)}>
          + Add Manuscript
        </AddBtn>
      )}
    </PageWrapper>
  );
}
