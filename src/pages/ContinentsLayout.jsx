import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { LiveContext } from "../contexts/LiveContext";
import { continentsData } from "../data/continentsData";
import tw from "tailwind-styled-components";

const PageWrapper = tw.div`min-h-screen bg-gray-50 p-8 font-sans`;
const PageTitle = tw.h1`text-gray-900 mb-1 text-2xl font-bold`;
const Subtitle = tw.p`text-gray-500 mb-8`;
const Grid = tw.div`grid grid-cols-[repeat(auto-fill,minmax(150px,1fr))] gap-4 max-w-3xl`;
const ContinentBtn = tw.button`
  border-2 rounded-xl py-6 px-4 cursor-pointer text-center transition-all duration-150
  ${(p) => p.$selected ? "bg-yellow-300 border-yellow-300 shadow-md" : "bg-white border-gray-200 shadow-sm"}
`;
const ContinentName = tw.div`text-sm text-gray-600 mt-1`;
const NextBtn = tw.button`mt-8 bg-yellow-300 border-0 rounded-lg py-3 px-8 text-base font-bold text-gray-900 cursor-pointer shadow-md`;
const NextBtnSpan = tw.span`font-normal`;

export default function ContinentsLayout() {
  const { selectedContinents, toggleContinent } = useContext(LiveContext);
  const navigate = useNavigate();

  return (
    <PageWrapper>
      <PageTitle>Where are you interested in?</PageTitle>
      <Subtitle>Select one or more continents to explore.</Subtitle>

      <Grid>
        {continentsData.map((continent) => {
          const isSelected = selectedContinents.includes(continent.id);
          return (
            <ContinentBtn
              key={continent.id}
              onClick={() => toggleContinent(continent.id)}
              $selected={isSelected}
            >
              <ContinentName>{continent.name}</ContinentName>
            </ContinentBtn>
          );
        })}
      </Grid>

      {selectedContinents.length > 0 && (
        <NextBtn onClick={() => navigate("/countries")}>
          Next →{" "}
          <NextBtnSpan>
            {selectedContinents.length} continent
            {selectedContinents.length > 1 ? "s" : ""} selected
          </NextBtnSpan>
        </NextBtn>
      )}
    </PageWrapper>
  );
}
