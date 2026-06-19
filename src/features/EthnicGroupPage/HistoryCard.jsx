import { useState } from "react";

const CATEGORY_LABELS = {
  origin: "Origin",
  language: "Language",
  government: "Governance",
  architecture: "Architecture",
  religion: "Religion",
  art: "Arts & Culture",
};

function HistoryCard({ h }) {
  const [expanded, setExpanded] = useState(false);
  const label = CATEGORY_LABELS[h.category] ?? h.category;

  return (
    <div className="border border-grey-info-outline rounded-xl overflow-hidden mb-3">
      <button
        onClick={() => setExpanded((v) => !v)}
        className="w-full text-left px-5 py-4 flex items-start justify-between gap-4 hover:bg-orange-background-100 transition-colors"
      >
        <div className="flex-1">
          <span className="inline-block text-[10px] font-semibold uppercase tracking-widest text-title opacity-40 mb-1">
            {label}
          </span>
          <h3 className="text-base font-semibold text-title leading-snug">
            {h.subject_name}
          </h3>
          <p className="text-sm text-title opacity-60 mt-1 leading-relaxed">
            {h.subject_description}
          </p>
        </div>
        <span className="text-title opacity-40 mt-1 text-lg leading-none shrink-0">
          {expanded ? "−" : "+"}
        </span>
      </button>

      {expanded && (h.entry?.origins || h.entry?.eras) && (
        <div className="px-5 pb-5 border-t border-grey-info-outline bg-orange-background-100">
          {h.entry.origins && (
            <div className="mt-4">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-title opacity-40 mb-2">
                Background
              </p>
              <p className="text-sm text-title opacity-80 leading-relaxed">
                {h.entry.origins}
              </p>
            </div>
          )}
          {h.entry.eras && (
            <div className="mt-4">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-title opacity-40 mb-2">
                Timeline
              </p>
              <p className="text-sm text-title opacity-80 leading-relaxed whitespace-pre-line">
                {h.entry.eras}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default HistoryCard;
