import { useState } from "react";
import { useNavigate } from "react-router-dom";
import tw from "tailwind-styled-components";
import { getPreferences, savePreferences } from "@/services/preferences";
import RegionPicker from "@/features/Onboarding/RegionPicker";
import InfoOption from "@/ui/InfoOption";

// Intent options — one per user type. Order drives the hub's workspace tiles.
const INTENT_OPTIONS = [
  { value: "teach", label: "Teach", blurb: "Build teaching manuscripts and lessons" },
  { value: "research", label: "Research", blurb: "Explore histories, sources and connections" },
  { value: "explore", label: "Explore", blurb: "Learn about a region out of curiosity" },
];

// ── Styled components ───────────────────────────────────────────────────────
const Screen = tw.div`min-h-screen bg-orange-background-100/40 flex flex-col items-center px-6 py-12`;
const Card = tw.div`w-full max-w-2xl bg-white rounded-2xl border border-grey-info-outline shadow-sm p-8 sm:p-10`;
const Brand = tw.p`text-title font-bold tracking-tight text-sm opacity-60 mb-6`;
const StepMeta = tw.p`text-xs uppercase tracking-widest text-title opacity-40 mb-2`;
const Title = tw.h1`font-heading text-3xl sm:text-4xl font-bold text-title mb-2`;
const Lead = tw.p`font-heading italic text-title opacity-70 mb-6 leading-relaxed`;

const IntentList = tw.div`flex flex-col gap-3`;
const IntentBlurb = tw.span`block text-xs not-italic opacity-50 font-body mt-0.5`;

const Footer = tw.div`flex items-center justify-between mt-8`;
const CountNote = tw.span`text-sm text-title opacity-50`;
const BackBtn = tw.button`
  text-sm font-medium text-title opacity-60 hover:opacity-100 transition-opacity
  bg-transparent border-none cursor-pointer
`;
const PrimaryBtn = tw.button`
  rounded-xl px-6 py-2.5 text-sm font-semibold bg-orange-accent text-title
  hover:brightness-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed
  border-none cursor-pointer
`;

export default function Onboarding() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);

  // Seed from any saved prefs so re-entering (from "Add regions") adds to prior
  // picks rather than resetting them.
  const existing = getPreferences();
  const [regions, setRegions] = useState(existing.regions);
  const [intent, setIntent] = useState(existing.intent);

  function finish(chosenIntent) {
    savePreferences({ regions, intent: chosenIntent ?? intent });
    navigate("/app");
  }

  return (
    <Screen>
      <Card>
        <Brand>ỊMỤ-ASỤSỤ</Brand>

        {step === 1 && (
          <>
            <StepMeta>Step 1 of 2</StepMeta>
            <Title>Which regions matter to you?</Title>
            <Lead>
              Pick the places and peoples you want to teach, research or explore. Choose as many as
              you like, at any level — a country, a state, a local area, a people group.
            </Lead>

            <RegionPicker value={regions} onChange={setRegions} />

            <Footer>
              <CountNote>
                {regions.length === 0
                  ? "Select at least one to continue"
                  : `${regions.length} selected`}
              </CountNote>
              <PrimaryBtn type="button" disabled={regions.length === 0} onClick={() => setStep(2)}>
                Continue →
              </PrimaryBtn>
            </Footer>
          </>
        )}

        {step === 2 && (
          <>
            <StepMeta>Step 2 of 2</StepMeta>
            <Title>How will you use Ịmụ-Asụsụ?</Title>
            <Lead>This helps us arrange your home hub around what you came to do.</Lead>

            <IntentList>
              {INTENT_OPTIONS.map((opt) => (
                <div
                  key={opt.value}
                  className={
                    intent === opt.value
                      ? "rounded-xl ring-2 ring-orange-accent"
                      : "rounded-xl"
                  }
                >
                  <InfoOption
                    label={
                      <>
                        <span className={intent === opt.value ? "font-bold" : ""}>{opt.label}</span>
                        <IntentBlurb>{opt.blurb}</IntentBlurb>
                      </>
                    }
                    onClick={() => setIntent(opt.value)}
                  />
                </div>
              ))}
            </IntentList>

            <Footer>
              <BackBtn type="button" onClick={() => setStep(1)}>
                ← Back
              </BackBtn>
              <PrimaryBtn type="button" disabled={!intent} onClick={() => finish()}>
                Enter Ịmụ-Asụsụ →
              </PrimaryBtn>
            </Footer>
          </>
        )}
      </Card>
    </Screen>
  );
}
