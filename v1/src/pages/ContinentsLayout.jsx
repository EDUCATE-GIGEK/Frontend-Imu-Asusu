import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { LiveContext } from "../contexts/LiveContext";
import { continentsData } from "../data/continentsData";
import tw from "tailwind-styled-components";

const PageWrapper = tw.div`min-h-screen bg-orange-background-100 p-8 font-sans`;
const PageTitle = tw.h1`text-title mb-1 text-3xl font-bold`;
const Subtitle = tw.p`text-title opacity-60 mb-8`;
const Grid = tw.div`grid grid-cols-[repeat(auto-fill,minmax(150px,1fr))] gap-4 max-w-3xl`;
const ContinentBtn = tw.button`
  border-2 rounded-xl py-6 px-4 text-center transition-all duration-150
  ${(p) => p.$disabled ? "opacity-40 cursor-not-allowed bg-white border-grey-info-outline" : "cursor-pointer"}
  ${(p) => !p.$disabled && p.$selected ? "bg-orange-200 border-orange-400 shadow-md" : ""}
  ${(p) => !p.$disabled && !p.$selected ? "bg-white border-grey-info-outline shadow-sm hover:border-orange-300" : ""}
`;
const ContinentName = tw.div`text-sm text-title mt-1`;
const NextBtn = tw.button`mt-8 bg-title border-0 rounded-lg py-3 px-8 text-base font-bold text-white cursor-pointer shadow-md`;
const NextBtnSpan = tw.span`font-normal opacity-80`;

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
          const isDisabled = continent.id !== "africa";
          return (
            <ContinentBtn
              key={continent.id}
              onClick={() => !isDisabled && toggleContinent(continent.id)}
              $selected={isSelected}
              $disabled={isDisabled}
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
