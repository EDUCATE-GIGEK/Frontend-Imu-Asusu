// Curated "suggested" regions surfaced pre-expanded at the top of the region
// picker. For now the platform focuses on the Ikwerre people group, so the only
// template is the Ikwerre lineage.
//
// Entries are referenced by seeded id and rendered with their REAL names fetched
// from the DB (see RegionPicker) — the labels here are only fallbacks for the
// chip/search text. If a seeded id is missing (e.g. after a reseed) it simply
// drops out of the suggested list; nothing breaks.
//
// NOTE: reseeding the database changes these ids — this file is the single place
// to update, replacing the old hardcoded DEFAULT_EXPLORE_PLACE_ID in Dashboard.

export const IKWERRE_TEMPLATE = {
  id: "ikwerre",
  label: "Ikwerre",
  // Ordered parent → child so the pre-expanded lineage reads top-down.
  places: [
    { id: "c4f43508-5f39-47ff-80e1-25d67e3a01ac", fallbackName: "Africa" },
    { id: "a735a0fb-a76c-436f-b38e-d8feb9373aa9", fallbackName: "Nigeria" },
    { id: "1c5d40b1-a449-407f-8bfd-3741867d6c3a", fallbackName: "Rivers State" },
    { id: "033606c8-e15c-46e9-a78d-5c708b3fadcc", fallbackName: "Ikwerre LGA" },
    { id: "493507d9-56f1-43b9-9742-80cc544f1f16", fallbackName: "Port Harcourt" },
  ],
  peoples: [
    { id: "8a03a5ae-495b-43a0-833e-a3955b037332", fallbackName: "Ikwerre" },
  ],
};

// The active suggested groups. Add more people-group templates here as they come
// online; the picker renders each pinned above the full browsable tree.
export const SUGGESTED_TEMPLATES = [IKWERRE_TEMPLATE];
