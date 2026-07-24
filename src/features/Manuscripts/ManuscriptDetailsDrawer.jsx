import { useEffect } from "react";
import tw from "tailwind-styled-components";
import ManuscriptContextSelect from "@/features/Manuscripts/ManuscriptContextSelect";
import ManuscriptDetailsFields from "@/features/Manuscripts/ManuscriptDetailsFields";

// ── Styled components ────────────────────────────────────────────────────────
const Backdrop = tw.div`fixed inset-0 z-40 bg-black/30`;
const Panel = tw.aside`
  fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col
  border-l border-grey-info-outline bg-white shadow-xl
`;
const PanelHeader = tw.div`flex items-center justify-between gap-3 border-b border-grey-info-outline px-5 py-4`;
const PanelTitle = tw.p`text-sm font-semibold text-title`;
const CloseBtn = tw.button`text-title opacity-40 hover:opacity-100 bg-transparent border-0 cursor-pointer text-xl leading-none`;
const PanelBody = tw.div`flex flex-1 flex-col gap-5 overflow-y-auto px-5 py-5`;
const FieldWrapper = tw.div`flex flex-col gap-1.5`;
const Label = tw.label`text-sm font-semibold text-title`;
const SectionLabel = tw.p`text-sm font-semibold text-title`;
const Hint = tw.p`text-xs text-title opacity-50`;
const Select = tw.select`border border-grey-info-outline rounded-lg px-3 py-2 text-sm text-title focus:outline-none focus:border-orange-400 bg-white`;
const VisibilityRow = tw.div`grid grid-cols-2 gap-2 mt-1`;
const VisibilityBtn = tw.button`
  rounded-lg border border-grey-info-outline bg-white px-3 py-2 text-sm text-title
  cursor-pointer text-left transition-colors hover:border-orange-300
  data-[on=true]:border-orange-400 data-[on=true]:bg-orange-background-100
`;
const VisibilityName = tw.span`block font-semibold`;
const VisibilityNote = tw.span`block text-xs opacity-55 mt-0.5`;
const PanelFooter = tw.div`border-t border-grey-info-outline px-5 py-4`;
const DoneBtn = tw.button`w-full bg-title text-white rounded-lg px-5 py-2 text-sm font-semibold cursor-pointer border-0`;

// All of a manuscript's metadata — title, source file, the contexts the AI is
// grounded in, and student level — edited in one right-side drawer so none of
// it sits exposed above the editor and the text stays visible while it's set.
export default function ManuscriptDetailsDrawer({
  open,
  onClose,
  register,
  errors,
  fileInputRef,
  pendingFile,
  onFileChange,
  onRemoveFile,
  currentFileName,
  places,
  peoples,
  selectedPlaces,
  selectedPeoples,
  onPlacesChange,
  onPeoplesChange,
  educationLevels,
  educationLevel,
  onEducationLevelChange,
  isPublic,
  onIsPublicChange,
}) {
  // Close on Escape so the drawer never traps the user away from the editor.
  useEffect(() => {
    if (!open) return;
    function handleKey(e) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <>
      <Backdrop onClick={onClose} />
      <Panel role="dialog" aria-label="Edit manuscript details">
        <PanelHeader>
          <PanelTitle>Manuscript details</PanelTitle>
          <CloseBtn type="button" onClick={onClose} aria-label="Close">×</CloseBtn>
        </PanelHeader>

        <PanelBody>
          <ManuscriptDetailsFields
            register={register}
            errors={errors}
            fileInputRef={fileInputRef}
            pendingFile={pendingFile}
            onFileChange={onFileChange}
            onRemoveFile={onRemoveFile}
            currentFileName={currentFileName}
          />

          <FieldWrapper>
            <SectionLabel>Contexts</SectionLabel>
            <Hint>
              AI fact-checks and generation are grounded in the entries for the places and peoples
              you pick here.
            </Hint>
            <div className="mt-1 flex flex-col gap-3">
              <ManuscriptContextSelect label="Places" items={places} itemLabel="name" selected={selectedPlaces} onChange={onPlacesChange} />
              <ManuscriptContextSelect label="Peoples" items={peoples} itemLabel="name" selected={selectedPeoples} onChange={onPeoplesChange} />
            </div>
          </FieldWrapper>

          <FieldWrapper>
            <Label htmlFor="drawer-educationLevel">
              Student level <span className="font-normal opacity-40">(optional)</span>
            </Label>
            <Hint>Shapes the tone and reading level the AI writes for.</Hint>
            <Select
              id="drawer-educationLevel"
              value={educationLevel}
              onChange={(e) => onEducationLevelChange(e.target.value)}
            >
              <option value="">Not specified</option>
              {educationLevels.map((level) => (
                <option key={level.value} value={level.value}>{level.label}</option>
              ))}
            </Select>
          </FieldWrapper>

          <FieldWrapper>
            <SectionLabel>Visibility</SectionLabel>
            <Hint>
              Public manuscripts appear on Collaborate, where any educator can read, upvote and
              fork them. Yours stays yours — a fork is their own copy.
            </Hint>
            <VisibilityRow role="radiogroup" aria-label="Visibility">
              <VisibilityBtn
                type="button"
                role="radio"
                aria-checked={!isPublic}
                data-on={!isPublic}
                onClick={() => onIsPublicChange(false)}
              >
                <VisibilityName>Private</VisibilityName>
                <VisibilityNote>Only you can see it.</VisibilityNote>
              </VisibilityBtn>
              <VisibilityBtn
                type="button"
                role="radio"
                aria-checked={!!isPublic}
                data-on={!!isPublic}
                onClick={() => onIsPublicChange(true)}
              >
                <VisibilityName>Public</VisibilityName>
                <VisibilityNote>Shared on Collaborate.</VisibilityNote>
              </VisibilityBtn>
            </VisibilityRow>
          </FieldWrapper>
        </PanelBody>

        <PanelFooter>
          <DoneBtn type="button" onClick={onClose}>Done</DoneBtn>
        </PanelFooter>
      </Panel>
    </>
  );
}
