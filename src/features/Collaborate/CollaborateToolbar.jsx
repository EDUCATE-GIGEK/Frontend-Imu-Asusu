import tw from "tailwind-styled-components";
import { EDUCATION_LEVELS } from "@/features/Manuscripts/educationLevels";
import { SORT_OPTIONS } from "./browse";

// Search + the four filters the browse list supports. One row, outlined, so it
// reads as a control strip above the grid rather than a panel of its own.
const Bar = tw.div`flex flex-wrap items-center gap-2 mb-4`;
const Search = tw.input`
  flex-1 min-w-52 border border-grey-info-outline rounded-lg px-3 py-2 text-sm text-title
  focus:outline-none focus:border-orange-400
`;
const Select = tw.select`
  border border-grey-info-outline rounded-lg px-3 py-2 text-sm text-title bg-white
  focus:outline-none focus:border-orange-400
`;
const ClearBtn = tw.button`
  text-xs font-medium text-title opacity-50 hover:opacity-100 bg-transparent border-0
  cursor-pointer px-1
`;

export default function CollaborateToolbar({ query, level, sort, onQueryChange, onLevelChange, onSortChange, onClear }) {
  const filtered = !!query || !!level || sort !== "recent";

  return (
    <Bar>
      <Search
        type="search"
        value={query}
        placeholder="Search public manuscripts by title, summary, or author"
        aria-label="Search public manuscripts"
        onChange={(e) => onQueryChange(e.target.value)}
      />

      <Select value={level} aria-label="Filter by student level" onChange={(e) => onLevelChange(e.target.value)}>
        <option value="">Any student level</option>
        {EDUCATION_LEVELS.map((l) => (
          <option key={l.value} value={l.value}>{l.label}</option>
        ))}
      </Select>

      <Select value={sort} aria-label="Sort manuscripts" onChange={(e) => onSortChange(e.target.value)}>
        {SORT_OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </Select>

      {filtered && <ClearBtn type="button" onClick={onClear}>Clear</ClearBtn>}
    </Bar>
  );
}
