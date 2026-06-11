import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { LiveContext } from "../contexts/LiveContext";
import { continentsData } from "../data/continentsData";
import { countriesData } from "../data/countriesData";
import tw from "tailwind-styled-components";

const PageWrapper = tw.div`min-h-screen bg-orange-background-100 p-8 font-sans`;
const Header = tw.div`flex items-center gap-4 mb-1`;
const PageTitle = tw.h1`m-0 text-title text-2xl font-bold`;
const Subtitle = tw.p`text-title opacity-60 mb-8`;
const BackBtn = tw.button`bg-transparent border-2 border-grey-info-outline rounded-lg px-4 py-1.5 cursor-pointer text-sm text-title hover:border-orange-400 transition-colors`;
const ContinentList = tw.div`flex flex-col gap-6`;
const ContinentCard = tw.div`bg-white rounded-2xl border border-grey-info-outline overflow-hidden shadow-sm`;
const ContinentHeader = tw.div`px-5 py-3 flex items-center gap-3`;
const ContinentLabel = tw.span`text-base font-semibold text-title`;
const CountryGrid = tw.div`p-5 grid grid-cols-[repeat(auto-fill,minmax(130px,1fr))] gap-2.5`;
const NoCountries = tw.p`p-5 text-title opacity-60 m-0`;
const CountryBtn = tw.button`
  rounded-lg py-2 px-1.5 cursor-pointer text-xs text-center text-title transition-all duration-100
  ${(p) => p.$selected
    ? "bg-orange-200 border-2 border-orange-400 font-bold shadow-sm"
    : "bg-orange-background-100 border-2 border-grey-info-outline font-normal hover:border-orange-300"}
`;
const NextBtn = tw.button`mt-8 bg-title border-0 rounded-lg py-3 px-8 text-base font-bold text-white cursor-pointer shadow-md`;
const NextBtnSpan = tw.span`font-normal opacity-80`;

const EmptyWrapper = tw.div`min-h-screen bg-orange-background-100 flex flex-col items-center justify-center font-sans gap-4`;
const EmptyText = tw.p`text-title opacity-60`;

export default function CountriesLayout() {
  const { selectedContinents, selectedCountries, toggleCountry } =
    useContext(LiveContext);
  const navigate = useNavigate();

  const selectedCount = Object.values(selectedCountries).flat().length;

  if (selectedContinents.length === 0) {
    return (
      <EmptyWrapper>
        <EmptyText>No continents selected.</EmptyText>
        <BackBtn onClick={() => navigate("/")}>← Go back</BackBtn>
      </EmptyWrapper>
    );
  }

  return (
    <PageWrapper>
      <Header>
        <BackBtn onClick={() => navigate("/")}>← Back</BackBtn>
        <PageTitle>Select countries</PageTitle>
      </Header>
      <Subtitle>
        Choose the countries you want to explore within each continent.
      </Subtitle>

      <ContinentList>
        {selectedContinents.map((continentId) => {
          const continent = continentsData.find((c) => c.id === continentId);
          if (!continent) return null;

          return (
            <ContinentCard key={continentId}>
              <ContinentHeader style={{ background: continent.color }}>
                <ContinentLabel>{continent.name}</ContinentLabel>
              </ContinentHeader>

              {(() => {
                const availableCountries = countriesData.filter(
                  (c) => c.continent_id === continentId,
                );
                return availableCountries.length === 0 ? (
                  <NoCountries>No countries to select.</NoCountries>
                ) : (
                  <CountryGrid>
                    {availableCountries.map((country) => {
                      const isSelected = (
                        selectedCountries[continentId] || []
                      ).includes(country.name);
                      return (
                        <CountryBtn
                          key={country.country_id}
                          onClick={() =>
                            toggleCountry(continentId, country.name)
                          }
                          $selected={isSelected}
                        >
                          {country.name}
                        </CountryBtn>
                      );
                    })}
                  </CountryGrid>
                );
              })()}
            </ContinentCard>
          );
        })}
      </ContinentList>

      <NextBtn onClick={() => navigate("/app")}>
        Next →{" "}
        {selectedCount > 0 && (
          <NextBtnSpan>
            {selectedCount} countr{selectedCount > 1 ? "ies" : "y"} selected
          </NextBtnSpan>
        )}
      </NextBtn>
    </PageWrapper>
  );
}
