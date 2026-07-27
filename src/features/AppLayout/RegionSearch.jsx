import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { GoSearch, GoGlobe, GoPeople, GoX } from "react-icons/go";
import tw from "tailwind-styled-components";
import { getAllPlaces } from "@/services/apiPlaces";
import { getAllPeoples } from "@/services/apiPeoples";

// Sidebar search across every place and people — the always-available way to jump
// to a region from any page (Home covers the user's own saved regions). Uses the
// same all-places / all-peoples queries as the region picker, filtered by name.
const Wrap = tw.div`w-full`;
const Box = tw.div`
  flex items-center gap-2 rounded-lg border border-grey-info-outline bg-white/70 px-2.5 py-2
  focus-within:border-orange-accent transition-colors
`;
const Input = tw.input`
  flex-1 min-w-0 bg-transparent border-none outline-none text-sm text-title placeholder:opacity-40
`;
const ClearBtn = tw.button`shrink-0 text-title opacity-40 hover:opacity-100 bg-transparent border-none cursor-pointer`;
const Results = tw.div`mt-1 flex flex-col gap-0.5 max-h-72 overflow-y-auto`;
const Result = tw.button`
  w-full text-left rounded-lg px-2.5 py-1.5 flex items-center gap-2 text-sm text-title opacity-70
  hover:opacity-100 hover:bg-black/5 transition-all bg-transparent border-none cursor-pointer
`;
const ResultName = tw.span`truncate`;
const ResultKind = tw.span`ml-auto text-[10px] uppercase tracking-wide opacity-40 shrink-0`;
const NoMatch = tw.p`px-2.5 py-2 text-xs text-title opacity-40`;

const MAX_RESULTS = 8;

export default function RegionSearch({ onNavigate }) {
  const navigate = useNavigate();
  const [q, setQ] = useState("");

  const { data: places = [] } = useQuery({ queryKey: ["all-places"], queryFn: getAllPlaces });
  const { data: peoples = [] } = useQuery({ queryKey: ["all-peoples"], queryFn: getAllPeoples });

  const query = q.trim().toLowerCase();
  const matches = useMemo(() => {
    if (!query) return [];
    const hit = (x) => x.name.toLowerCase().includes(query);
    return [
      ...places.filter(hit).map((x) => ({ kind: "place", id: x.id, name: x.name })),
      ...peoples.filter(hit).map((x) => ({ kind: "people", id: x.id, name: x.name })),
    ].slice(0, MAX_RESULTS);
  }, [query, places, peoples]);

  function go(m) {
    navigate(m.kind === "people" ? `/app/people/${m.id}` : `/app/place/${m.id}`);
    setQ("");
    onNavigate?.();
  }

  return (
    <Wrap>
      <Box>
        <GoSearch size={14} className="opacity-40 shrink-0" />
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search places & peoples…"
        />
        {q && (
          <ClearBtn type="button" onClick={() => setQ("")} title="Clear">
            <GoX size={13} />
          </ClearBtn>
        )}
      </Box>

      {query && (
        <Results>
          {matches.length === 0 ? (
            <NoMatch>No matches.</NoMatch>
          ) : (
            matches.map((m) => (
              <Result key={`${m.kind}:${m.id}`} type="button" onClick={() => go(m)}>
                {m.kind === "people" ? (
                  <GoPeople size={13} className="opacity-50 shrink-0" />
                ) : (
                  <GoGlobe size={13} className="opacity-50 shrink-0" />
                )}
                <ResultName>{m.name}</ResultName>
                <ResultKind>{m.kind === "people" ? "People" : "Place"}</ResultKind>
              </Result>
            ))
          )}
        </Results>
      )}
    </Wrap>
  );
}
