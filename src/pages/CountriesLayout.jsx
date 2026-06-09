import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { LiveContext } from "../contexts/LiveContext";
import { continentsData } from "../data/continentsData";
import { countriesData } from "../data/countriesData";
import tw from "tailwind-styled-components";

const PageWrapper = tw.div`min-h-screen bg-gray-50 p-8 font-sans`;
const Header = tw.div`flex items-center gap-4 mb-1`;
const PageTitle = tw.h1`m-0 text-gray-900 text-2xl font-bold`;
const Subtitle = tw.p`text-gray-500 mb-8`;
const BackBtn = tw.button`bg-transparent border-2 border-gray-200 rounded-lg px-4 py-1.5 cursor-pointer text-sm text-gray-600 font-sans`;
const ContinentList = tw.div`flex flex-col gap-6`;
const ContinentCard = tw.div`bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm`;
const ContinentHeader = tw.div`px-5 py-3 flex items-center gap-3`;
const ContinentLabel = tw.span`text-base font-semibold text-gray-900`;
const CountryGrid = tw.div`p-5 grid grid-cols-[repeat(auto-fill,minmax(130px,1fr))] gap-2.5`;
const NoCountries = tw.p`p-5 text-gray-500 m-0`;
const CountryBtn = tw.button`
  rounded-lg py-2 px-1.5 cursor-pointer text-xs text-center text-gray-900 transition-all duration-100
  ${(p) => p.$selected ? "bg-yellow-300 border-2 border-yellow-300 font-bold shadow-md" : "bg-gray-50 border-2 border-gray-200 font-normal"}
`;
const NextBtn = tw.button`mt-8 bg-yellow-300 border-0 rounded-lg py-3 px-8 text-base font-bold text-gray-900 cursor-pointer shadow-md`;
const NextBtnSpan = tw.span`font-normal`;

const EmptyWrapper = tw.div`min-h-screen bg-gray-50 flex flex-col items-center justify-center font-sans gap-4`;
const EmptyText = tw.p`text-gray-500`;

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
