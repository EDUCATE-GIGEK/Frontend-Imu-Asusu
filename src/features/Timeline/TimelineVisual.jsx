import { useState, useRef } from "react";
import tw from "tailwind-styled-components";

const INFLUENCE_STYLES = {
  "Trade":                "bg-amber-100 text-amber-800",
  "Colonial / Religious": "bg-red-100 text-red-800",
  "Political":            "bg-blue-100 text-blue-800",
  "Military / Political": "bg-slate-200 text-slate-800",
  "Religious":            "bg-purple-100 text-purple-800",
  "Natural":              "bg-green-100 text-green-800",
};

// ── Header ────────────────────────────────────────────────────────────────────
const BackBtn = tw.button`
  text-sm text-title opacity-50 hover:opacity-100 transition-opacity
  bg-transparent border-none cursor-pointer mb-8 flex items-center gap-1
`;
const AspectBadge = tw.span`text-xs font-semibold bg-orange-background-100 text-title rounded px-3 py-1`;
const VisualTitle = tw.h2`font-heading text-2xl font-bold text-title mt-3 mb-1`;
const VisualMeta = tw.p`text-xs text-title opacity-40 mb-3`;
const VisualDescription = tw.p`text-sm text-title opacity-60 leading-relaxed`;

// ── Track ─────────────────────────────────────────────────────────────────────
const Track = tw.div`relative`;
const CenterLine = tw.div`absolute left-1/2 top-0 bottom-0 w-px bg-grey-info-outline -translate-x-1/2 z-0`;
const EntryRow = tw.div`grid grid-cols-[1fr_4rem_1fr] items-center mb-4`;
const EntryCard = tw.div`
  bg-white rounded-md p-4 z-10 shadow-sm cursor-pointer
  hover:shadow-md hover:scale-[1.01] transition-all duration-150
`;
const EntryYear = tw.p`font-heading text-2xl font-bold text-title opacity-30 mb-0.5`;
const EntryTitle = tw.h4`text-sm font-semibold text-title leading-snug mb-1`;
const EntryEra = tw.span`text-xs text-title opacity-40`;
const Empty = tw.div``;
const DotCol = tw.div`flex items-center justify-center z-10`;
const Dot = tw.div`w-2.5 h-2.5 rounded-full border-2 border-title bg-white`;

// ── Bottom sheet ──────────────────────────────────────────────────────────────
const Overlay = tw.div`fixed inset-0 z-40 bg-black/10`;
const Handle = tw.div`w-10 h-1 rounded-full bg-grey-info-outline mx-auto mt-3 mb-1 cursor-grab active:cursor-grabbing touch-none`;
const SheetHeader = tw.div`flex items-start justify-between px-6 pt-3 pb-4`;
const SheetTitleBlock = tw.div`flex flex-col gap-0.5`;
const SheetYear = tw.span`font-heading text-3xl font-bold text-title opacity-20 leading-none`;
const SheetTitle = tw.h3`font-heading text-lg font-bold text-title leading-snug`;
const DropBtn = tw.button`
  flex items-center gap-1 text-xs font-semibold text-title opacity-40
  hover:opacity-100 transition-opacity bg-transparent border-none cursor-pointer mt-1 shrink-0
`;
const SheetBody = tw.div`px-6 py-4 overflow-y-auto flex-1`;
const SheetFooter = tw.div`px-6 py-4 flex justify-center`;
const TakeNotesBtn = tw.button`
  bg-title text-white text-sm font-semibold px-5 py-2 rounded-md
  hover:opacity-90 transition-opacity cursor-pointer border-0
`;
const SheetMeta = tw.p`text-xs text-title opacity-40 uppercase tracking-wide mb-3`;
const SheetDescription = tw.p`text-sm text-title leading-relaxed mb-5`;
const InfluenceLabel = tw.p`text-xs text-title opacity-40 uppercase tracking-wide mb-2`;
const TagRow = tw.div`flex flex-wrap gap-1.5`;
const GroupTag = tw.span`text-xs font-medium rounded px-2.5 py-1`;
const TypeTag = tw.span`text-xs font-semibold rounded px-2.5 py-1 border border-grey-info-outline text-title`;

const INITIAL_HEIGHT = 67;

export default function TimelineVisual({ timeline, onBack }) {
  const [selected, setSelected] = useState(null);
  const [sheetHeight, setSheetHeight] = useState(INITIAL_HEIGHT);
  const currentHeightRef = useRef(INITIAL_HEIGHT);
  const moveHandler = useRef(null);
  const upHandler = useRef(null);

  function openSheet(entry) {
    setSelected(entry);
    setSheetHeight(INITIAL_HEIGHT);
    currentHeightRef.current = INITIAL_HEIGHT;
  }

  function closeSheet() {
    setSelected(null);
    setSheetHeight(INITIAL_HEIGHT);
    currentHeightRef.current = INITIAL_HEIGHT;
  }

  function onHandlePointerDown(e) {
    e.preventDefault();
    const startY = e.clientY;
    const startHeight = currentHeightRef.current;

    moveHandler.current = (e) => {
      const delta = startY - e.clientY;
      const newH = Math.min(95, Math.max(20, startHeight + (delta / window.innerHeight) * 100));
      currentHeightRef.current = newH;
      setSheetHeight(newH);
    };

    upHandler.current = () => {
      const h = currentHeightRef.current;
      if (h > 80) {
        setSheetHeight(95);
        currentHeightRef.current = 95;
      } else if (h > 40) {
        setSheetHeight(INITIAL_HEIGHT);
        currentHeightRef.current = INITIAL_HEIGHT;
      } else {
        closeSheet();
      }
      window.removeEventListener("pointermove", moveHandler.current);
      window.removeEventListener("pointerup", upHandler.current);
    };

    window.addEventListener("pointermove", moveHandler.current);
    window.addEventListener("pointerup", upHandler.current);
  }

  return (
    <div>
      <BackBtn type="button" onClick={onBack}>← All timelines</BackBtn>

      <div className="mb-12">
        <AspectBadge>{timeline.aspect}</AspectBadge>
        <VisualTitle>{timeline.title}</VisualTitle>
        <VisualMeta>
          {timeline.people_group} · {timeline.location} · {timeline.date_range.start}–{timeline.date_range.end}
        </VisualMeta>
        <VisualDescription>{timeline.description}</VisualDescription>
      </div>

      <Track>
        <CenterLine />
        {timeline.entries.map((entry, i) => {
          const isLeft = i % 2 === 0;
          return (
            <EntryRow key={entry.id}>
              {isLeft ? (
                <EntryCard onClick={() => openSheet(entry)}>
                  <EntryYear>{entry.year}</EntryYear>
                  <EntryTitle>{entry.title}</EntryTitle>
                  <EntryEra>{entry.era}</EntryEra>
                </EntryCard>
              ) : <Empty />}

              <DotCol><Dot /></DotCol>

              {!isLeft ? (
                <EntryCard onClick={() => openSheet(entry)}>
                  <EntryYear>{entry.year}</EntryYear>
                  <EntryTitle>{entry.title}</EntryTitle>
                  <EntryEra>{entry.era}</EntryEra>
                </EntryCard>
              ) : <Empty />}
            </EntryRow>
          );
        })}
      </Track>

      {selected && (
        <>
          <Overlay onClick={closeSheet} />
          <div
            className="fixed bottom-0 left-0 right-0 bg-white z-50 flex flex-col shadow-2xl rounded-tl-2xl rounded-tr-2xl transition-[height] duration-150"
            style={{ height: `${sheetHeight}vh` }}
          >
            <Handle onPointerDown={onHandlePointerDown} />

            <SheetHeader>
              <SheetTitleBlock>
                <SheetYear>{selected.year}</SheetYear>
                <SheetTitle>{selected.title}</SheetTitle>
              </SheetTitleBlock>
              <DropBtn type="button" onClick={closeSheet}>Drop ↓</DropBtn>
            </SheetHeader>

            <SheetBody>
              <SheetMeta>{selected.era}</SheetMeta>
              <SheetDescription>{selected.description}</SheetDescription>

              {selected.influencing_groups?.length > 0 && (
                <div>
                  <InfluenceLabel>External influence</InfluenceLabel>
                  <TagRow>
                    {selected.influencing_groups.map((g) => (
                      <GroupTag
                        key={g}
                        className={INFLUENCE_STYLES[selected.influence_type] ?? "bg-grey-info-outline text-title"}
                      >
                        {g}
                      </GroupTag>
                    ))}
                    <TypeTag>{selected.influence_type}</TypeTag>
                  </TagRow>
                </div>
              )}
            </SheetBody>

            <SheetFooter>
              <TakeNotesBtn type="button">Take notes</TakeNotesBtn>
            </SheetFooter>
          </div>
        </>
      )}
    </div>
  );
}
