import tw from "tailwind-styled-components";

// ── Styled components ────────────────────────────────────────────────────────
const FieldWrapper = tw.div`flex flex-col gap-1`;
const Label = tw.label`text-sm font-semibold text-title`;
const Hint = tw.p`text-xs text-title opacity-50`;
const Input = tw.input`border border-grey-info-outline rounded-lg px-3 py-2 text-sm text-title focus:outline-none focus:border-orange-400`;
const Textarea = tw.textarea`border border-grey-info-outline rounded-lg px-3 py-2 text-sm text-title focus:outline-none focus:border-orange-400 resize-y min-h-20`;
const FileZone = tw.div`border border-dashed border-grey-info-outline rounded-lg px-4 py-5 flex flex-col items-center gap-2 cursor-pointer hover:border-orange-400 transition-colors`;
const FileZoneText = tw.p`text-sm text-title opacity-50`;
const FileChip = tw.div`flex items-center gap-2 bg-orange-background-100 border border-orange-accent rounded-md px-3 py-1.5 text-sm text-title`;
const RemoveFileBtn = tw.button`text-title opacity-40 hover:opacity-100 bg-transparent border-0 cursor-pointer leading-none`;
const ErrorText = tw.p`text-red-500 text-xs mt-0.5`;

// Title + context file, grouped so a new manuscript can be named and given a
// source file up front and the same fields stay editable in the editor. Only
// one instance mounts at a time (setup XOR editor), so a single shared file
// input ref from the parent is safe.
export default function ManuscriptDetailsFields({
  register,
  errors,
  fileInputRef,
  pendingFile,
  onFileChange,
  onRemoveFile,
  currentFileName,
}) {
  return (
    <>
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
        <Label htmlFor="summary">
          Summary <span className="font-normal opacity-40">(optional)</span>
        </Label>
        <Hint>A short description shown on this manuscript&rsquo;s card in the library.</Hint>
        <Textarea
          id="summary"
          rows={3}
          placeholder="e.g. Oral accounts of Ikwerre migration, gathered from elders."
          {...register("summary")}
        />
      </FieldWrapper>

      <FieldWrapper>
        <Label>
          Context file <span className="font-normal opacity-40">(PDF, DOCX, or TXT · max 20 MB)</span>
        </Label>
        <input
          ref={fileInputRef}
          id="file"
          type="file"
          accept=".pdf,.doc,.docx,.txt"
          className="hidden"
          onChange={onFileChange}
        />
        {pendingFile ? (
          <FileChip>
            <span className="truncate max-w-xs">{pendingFile.name}</span>
            <RemoveFileBtn type="button" onClick={onRemoveFile} aria-label="Remove file">×</RemoveFileBtn>
          </FileChip>
        ) : (
          <FileZone onClick={() => fileInputRef.current?.click()}>
            <FileZoneText>Click to choose a file</FileZoneText>
            {currentFileName && <FileZoneText>Current: {currentFileName}</FileZoneText>}
          </FileZone>
        )}
      </FieldWrapper>
    </>
  );
}
