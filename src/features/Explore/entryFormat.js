// Pure formatting helpers for history entries. Kept out of the .jsx so the
// components stay logic-light. All inputs are raw `entries` rows (see the
// Backend history model: period_start/_end, is_approximate, era,
// verification_status, entry_type).

// A single year → "1750" or "480 BCE" (negative years are BCE).
function year(y) {
  return y < 0 ? `${-y} BCE` : `${y}`;
}

const ERA_LABEL = {
  "pre-colonial": "Pre-colonial",
  colonial: "Colonial",
  "post-independence": "Post-independence",
  contemporary: "Contemporary",
};

// The teachable date string. Prefers explicit years; falls back to the era
// label; returns null when the entry is undatable (common for oral tradition).
export function formatPeriod(entry) {
  const { period_start, period_end, is_approximate, era } = entry;
  const approx = is_approximate ? "c. " : "";

  if (period_start != null && period_end != null && period_end !== period_start) {
    return `${approx}${year(period_start)}–${year(period_end)}`;
  }
  if (period_start != null) return `${approx}${year(period_start)}`;
  if (period_end != null) return `${approx}${year(period_end)}`;
  return era ? ERA_LABEL[era] ?? era : null;
}

export function eraLabel(era) {
  if (!era) return null;
  return ERA_LABEL[era] ?? era;
}

// Provenance rollup → a label + outline styling (outlines over fills, no bold
// orange). Colours are semantic only: green = corroborated, amber = contested.
export function verificationBadge(status) {
  switch (status) {
    case "verified":
      return { label: "Verified", className: "border-emerald-600/40 text-emerald-700" };
    case "disputed":
      return { label: "Disputed", className: "border-amber-600/50 text-amber-700" };
    default:
      return { label: "Unverified", className: "border-grey-info-outline text-title opacity-50" };
  }
}

export function entryTypeLabel(type) {
  return type.replace(/_/g, " ");
}

// Distinct entry_types present, in first-seen order — drives the facet chips.
export function facetsFor(entries) {
  const seen = [];
  for (const e of entries) if (!seen.includes(e.entry_type)) seen.push(e.entry_type);
  return seen;
}
