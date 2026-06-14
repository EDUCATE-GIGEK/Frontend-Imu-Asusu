// Each state references its parent country via country_id.
// Mirrors the `states` table in Postgres.sql.
export const statesData = [
  // ── NIGERIA ─────────────────────────────────────────────────────────────────
  {
    name: "Lagos",
    state_id: "lagos",
    country_id: "nigeria",
    general_info: {
      stateDescription:
        "Nigeria's commercial capital and most populous state, home to the nation's largest city and economic hub.",
      localGovernmentsCount: 20,
      ethnicGroupsCount: 50,
      endangeredGroupsCount: 1,
      endangeredLanguagesCount: 2,
    },
  },
];
