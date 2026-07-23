import { Link } from "react-router-dom";
import tw from "tailwind-styled-components";

// Minimal shell — links to the place detail page. Card internals are the next
// task (deliberately left simple for now).
const Card = tw(Link)`
  flex flex-col gap-1 rounded-xl border border-grey-info-outline bg-white px-4 py-3 no-underline
  hover:border-orange-accent hover:bg-orange-background-100 transition-colors
`;
const Name = tw.span`text-sm font-medium text-title`;
const Kind = tw.span`text-[11px] uppercase tracking-wide text-title opacity-40`;

export default function PlaceCard({ place }) {
  return (
    <Card to={`/app/place/${place.id}`}>
      <Name>{place.name}</Name>
      {place.designation?.label && <Kind>{place.designation.label}</Kind>}
    </Card>
  );
}
