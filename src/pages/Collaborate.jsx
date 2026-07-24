import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import tw from "tailwind-styled-components";
import { useAuth } from "@/contexts/AuthContext";
import usePreferences from "@/hooks/usePreferences";
import Spinner from "@/ui/Spinner";
import CollaborateCard from "@/features/Collaborate/CollaborateCard";
import CollaborateReader from "@/features/Collaborate/CollaborateReader";
import CollaborateToolbar from "@/features/Collaborate/CollaborateToolbar";
import { rankForYou } from "@/features/Collaborate/relevance";
import { browseManuscripts } from "@/features/Collaborate/browse";
import {
  getPublicManuscripts,
  getMyUpvotedIds,
  addUpvote,
  removeUpvote,
  forkManuscript,
  incrementManuscriptView,
} from "@/services/apiCollaborate";

// ── Styled components ────────────────────────────────────────────────────────
const PageTitle = tw.h1`text-3xl font-bold text-title mb-2`;
const Intro = tw.p`text-sm text-title opacity-60 leading-relaxed mb-8 max-w-3xl`;
const SectionTitle = tw.h2`text-xl font-bold text-title`;
const SectionNote = tw.p`text-xs text-title opacity-50 mt-0.5 mb-3`;
const Section = tw.section`mb-10`;
const CardGrid = tw.div`grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3`;
const EmptyState = tw.p`text-sm text-title opacity-40`;
const Notice = tw.div`
  mb-6 flex items-center justify-between gap-4 rounded-xl border border-orange-300
  bg-orange-background-100 px-4 py-3
`;
const NoticeText = tw.p`text-sm text-title`;
const NoticeLink = tw(Link)`text-sm font-semibold text-title no-underline hover:underline`;
const PrimaryBtn = tw.button`bg-title text-white rounded-lg px-5 py-2 text-sm font-semibold cursor-pointer border-0`;
const DismissBtn = tw.button`text-title opacity-40 hover:opacity-100 bg-transparent border-0 cursor-pointer text-lg leading-none`;

const EMPTY_FILTERS = { query: "", level: "", sort: "recent" };

export default function Collaborate() {
  const { session, profile } = useAuth();
  const { prefs } = usePreferences();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [reading, setReading] = useState(null); // the manuscript open in the reader
  const [forkedNotice, setForkedNotice] = useState(null); // title of the last fork
  const [actionError, setActionError] = useState(null);

  const { data: manuscripts = [], isLoading } = useQuery({
    queryKey: ["public-manuscripts"],
    queryFn: getPublicManuscripts,
  });

  const { data: upvotedIds = [] } = useQuery({
    queryKey: ["my-upvotes", profile?.id],
    queryFn: () => getMyUpvotedIds(profile.id),
    enabled: !!profile?.id,
  });
  const upvoted = useMemo(() => new Set(upvotedIds), [upvotedIds]);

  // "For you" ranks by the reader's saved regions; browse-all is what they ask
  // for by hand. Own manuscripts are excluded from the first, kept in the second.
  const forYou = useMemo(
    () => rankForYou(manuscripts, prefs.regions, profile?.id),
    [manuscripts, prefs.regions, profile?.id],
  );
  const browsed = useMemo(() => browseManuscripts(manuscripts, filters), [manuscripts, filters]);

  function refresh() {
    queryClient.invalidateQueries({ queryKey: ["public-manuscripts"] });
  }

  const upvoteMutation = useMutation({
    mutationFn: ({ manuscript, on }) =>
      on
        ? addUpvote({ manuscriptId: manuscript.id, userId: profile.id })
        : removeUpvote({ manuscriptId: manuscript.id, userId: profile.id }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-upvotes", profile?.id] });
      refresh();
    },
    onError: (e) => setActionError(e.message),
  });

  const forkMutation = useMutation({
    mutationFn: (manuscript) => forkManuscript(manuscript.id),
    onSuccess: (fork) => {
      setForkedNotice(fork?.title || "Untitled");
      setActionError(null);
      queryClient.invalidateQueries({ queryKey: ["manuscripts"] });
      refresh();
    },
    onError: (e) => setActionError(e.message),
  });

  function handleUpvote(manuscript) {
    if (!profile?.id) return;
    setActionError(null);
    upvoteMutation.mutate({ manuscript, on: !upvoted.has(manuscript.id) });
  }

  // Opening counts as a view. The count is best-effort: the reader opens either
  // way, and the fresh number arrives with the next list refetch.
  function handleOpen(manuscript) {
    setReading(manuscript);
    if (session) incrementManuscriptView(manuscript.id).then(refresh);
  }

  const canAct = !!session && !!profile?.id;
  const forkingId = forkMutation.isPending ? forkMutation.variables?.id : null;
  const upvotingId = upvoteMutation.isPending ? upvoteMutation.variables?.manuscript?.id : null;

  function cardProps(m) {
    return {
      manuscript: m,
      isUpvoted: upvoted.has(m.id),
      onUpvote: handleUpvote,
      onFork: forkMutation.mutate,
      onOpen: handleOpen,
      isForking: forkingId === m.id,
      isUpvoting: upvotingId === m.id,
      canAct,
    };
  }

  return (
    <div className="view-fade">
      <PageTitle>Collaborate</PageTitle>
      <Intro>
        Every manuscript an educator has chosen to share publicly. Fork one to start your own
        version of it, and upvote the ones that helped you teach. To share your own work, open it
        in Manuscripts and switch its visibility to public.
      </Intro>

      {!session && (
        <Notice>
          <NoticeText>Log in to upvote and fork manuscripts into your own library.</NoticeText>
          <PrimaryBtn type="button" onClick={() => navigate("/login")}>Log in</PrimaryBtn>
        </Notice>
      )}

      {forkedNotice && (
        <Notice>
          <NoticeText>
            Forked “{forkedNotice}” into your library as a private manuscript.{" "}
            <NoticeLink to="/app/my-manuscripts">Open Manuscripts →</NoticeLink>
          </NoticeText>
          <DismissBtn type="button" aria-label="Dismiss" onClick={() => setForkedNotice(null)}>×</DismissBtn>
        </Notice>
      )}

      {actionError && (
        <Notice>
          <NoticeText className="text-red-600">{actionError}</NoticeText>
          <DismissBtn type="button" aria-label="Dismiss" onClick={() => setActionError(null)}>×</DismissBtn>
        </Notice>
      )}

      {isLoading ? (
        <Spinner />
      ) : (
        <>
          {forYou.length > 0 && (
            <Section>
              <SectionTitle>For you</SectionTitle>
              <SectionNote>
                {prefs.regions.length
                  ? "Ranked by how closely each manuscript covers your saved regions, then by what other educators have forked, upvoted and read."
                  : "Ranked by what other educators have forked, upvoted and read. Save regions during onboarding to make this personal."}
              </SectionNote>
              <CardGrid>
                {forYou.map((m) => <CollaborateCard key={m.id} {...cardProps(m)} />)}
              </CardGrid>
            </Section>
          )}

          <Section>
            <SectionTitle>All public manuscripts</SectionTitle>
            <SectionNote>{manuscripts.length} shared so far.</SectionNote>
            <CollaborateToolbar
              query={filters.query}
              level={filters.level}
              sort={filters.sort}
              onQueryChange={(query) => setFilters((f) => ({ ...f, query }))}
              onLevelChange={(level) => setFilters((f) => ({ ...f, level }))}
              onSortChange={(sort) => setFilters((f) => ({ ...f, sort }))}
              onClear={() => setFilters(EMPTY_FILTERS)}
            />
            {browsed.length === 0 ? (
              <EmptyState>
                {manuscripts.length === 0
                  ? "No manuscripts have been shared publicly yet. Be the first — make one of yours public from Manuscripts."
                  : "No manuscripts match those filters."}
              </EmptyState>
            ) : (
              <CardGrid>
                {browsed.map((m) => <CollaborateCard key={m.id} {...cardProps(m)} />)}
              </CardGrid>
            )}
          </Section>
        </>
      )}

      <CollaborateReader
        manuscript={reading}
        onClose={() => setReading(null)}
        onFork={forkMutation.mutate}
        isForking={forkMutation.isPending}
        canFork={canAct}
      />
    </div>
  );
}
