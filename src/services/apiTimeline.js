import supabase from "./supabase";
import {
  getEntriesInPeopleSubtree,
  getEntriesInPlaceSubtree,
} from "./apiEntries";

// A timeline is DERIVED, not stored. There is no `timelines` table: a timeline is
// just "the entries belonging to this people group (or place), plus the
// entry_relationships that run between them". Belonging comes from
// entries.people_id / place_id; connecting comes from entry_relationships.
//
// This is the difference between Explore and Timeline. Same rows, different axis:
// Explore facets them thematically by entry_type, Timeline arranges them by time
// and draws the relationship graph over them.

// Edges whose BOTH endpoints are inside the given entry set. `.in()` twice ANDs,
// which is what we want — an edge pointing at an entry outside this timeline (or
// at one RLS is hiding) would otherwise dangle with nothing to attach to.
async function relationshipsAmong(entryIds) {
  if (entryIds.length === 0) return [];
  const { data, error } = await supabase
    .from("entry_relationships")
    .select("id, from_entry_id, to_entry_id, relation_type, note")
    .in("from_entry_id", entryIds)
    .in("to_entry_id", entryIds);
  if (error) throw new Error(error.message);
  return data ?? [];
}

// Entries sort by period_start, but a lot of history has no calendar date at all
// — the Ikwerre sample is almost entirely date-free oral tradition, where
// date_precision is 'era' or 'relative'. Undated entries sort to the end rather
// than being treated as year 0, which would drop them at the far left of any
// chronological layout.
function byChronology(a, b) {
  const av = a.period_start;
  const bv = b.period_start;
  if (av == null && bv == null) return a.title.localeCompare(b.title);
  if (av == null) return 1;
  if (bv == null) return -1;
  return av - bv;
}

function shape(entries, relationships) {
  const sorted = [...entries].sort(byChronology);
  const dated = sorted.filter((e) => e.period_start != null);
  return {
    entries: sorted,
    relationships,
    // The layout needs to know up front whether it can use a real time axis.
    // A group whose entries are all undated must fall back to relational or
    // era-based ordering instead.
    span: dated.length
      ? { from: dated[0].period_start, to: dated.at(-1).period_start }
      : null,
    datedCount: dated.length,
    undatedCount: sorted.length - dated.length,
  };
}

export async function getTimelineForPeople(peopleId) {
  const entries = await getEntriesInPeopleSubtree(peopleId);
  const relationships = await relationshipsAmong(entries.map((e) => e.id));
  return shape(entries, relationships);
}

export async function getTimelineForPlace(placeId) {
  const entries = await getEntriesInPlaceSubtree(placeId);
  const relationships = await relationshipsAmong(entries.map((e) => e.id));
  return shape(entries, relationships);
}
