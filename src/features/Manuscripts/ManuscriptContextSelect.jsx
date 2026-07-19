import { useState, useRef, useEffect } from "react";

function ManuscriptContextSelect({ label, items, itemLabel, selected, onChange }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const ref = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filtered = items.filter((item) =>
    String(item[itemLabel]).toLowerCase().includes(search.toLowerCase())
  );

  function toggle(id) {
    const sid = String(id);
    if (selected.includes(sid)) {
      onChange(selected.filter((s) => s !== sid));
    } else {
      onChange([...selected, sid]);
    }
  }

  const selectedItems = items.filter((item) => selected.includes(String(item.id)));
  const hasSelections = selectedItems.length > 0;

  return (
    <div ref={ref} className="relative inline-block">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium transition-all ${
          hasSelections
            ? "border-orange-300 bg-orange-background-100 text-title"
            : "border-grey-info-outline bg-white text-title opacity-70 hover:opacity-100 hover:border-orange-300"
        }`}
      >
        {label}
        {hasSelections && (
          <span className="flex h-4 w-4 items-center justify-center rounded-full bg-title text-[10px] text-white font-bold">
            {selectedItems.length}
          </span>
        )}
        <svg
          className={`w-3 h-3 transition-transform ${open ? "rotate-180" : ""}`}
          viewBox="0 0 12 12"
          fill="none"
        >
          <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {open && (
        <div className="absolute left-0 top-full z-20 mt-1.5 w-60 rounded-xl border border-grey-info-outline bg-white shadow-lg">
          <div className="p-2 border-b border-grey-info-outline">
            <input
              autoFocus
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={`Search ${label.toLowerCase()}…`}
              className="w-full rounded-lg border border-grey-info-outline px-3 py-1.5 text-sm text-title placeholder:opacity-40 focus:border-orange-300 focus:outline-none"
            />
          </div>
          <ul className="max-h-52 overflow-y-auto p-1.5">
            {filtered.length === 0 ? (
              <li className="px-3 py-2 text-sm text-title opacity-40 italic">No results</li>
            ) : (
              filtered.map((item) => {
                const isChecked = selected.includes(String(item.id));
                return (
                  <li key={item.id}>
                    <label className="flex cursor-pointer items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-title hover:bg-orange-background-100 transition-colors">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggle(item.id)}
                        className="accent-title h-3.5 w-3.5"
                      />
                      {item[itemLabel]}
                    </label>
                  </li>
                );
              })
            )}
          </ul>
        </div>
      )}

      {hasSelections && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {selectedItems.map((item) => (
            <span
              key={item.id}
              className="flex items-center gap-1 rounded-full border border-orange-300 bg-orange-background-100 px-2.5 py-0.5 text-xs text-title"
            >
              {item[itemLabel]}
              <button
                type="button"
                onClick={() => toggle(item.id)}
                className="ml-0.5 opacity-50 hover:opacity-100 transition-opacity leading-none"
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

export default ManuscriptContextSelect;
