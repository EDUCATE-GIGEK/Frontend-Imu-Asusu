import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import tw from "tailwind-styled-components";
import usePreferences from "@/hooks/usePreferences";
import RegionPicker from "@/features/Onboarding/RegionPicker";

// Intent options — one per user type. Order drives the hub's workspace tiles.
const INTENT_OPTIONS = [
  {
    value: "teach",
    label: "Teach",
    blurb: "Build teaching manuscripts and lessons",
  },
  {
    value: "research",
    label: "Research",
    blurb: "Explore histories, sources and connections",
  },
  {
    value: "explore",
    label: "Explore",
    blurb: "Learn about a region out of curiosity",
  },
];

// ── Styled components ───────────────────────────────────────────────────────
const Screen = tw.div`min-h-screen bg-orange-background-100/40 flex flex-col items-center px-6 py-12`;
const Card = tw.div`w-full max-w-2xl bg-white rounded-2xl border border-grey-info-outline shadow-sm p-8 sm:p-10`;
const Brand = tw.p`text-title font-bold tracking-tight text-sm opacity-60 mb-6`;
const StepMeta = tw.p`text-xs uppercase tracking-widest text-title opacity-40 mb-2`;
const Title = tw.h1`font-heading text-3xl sm:text-4xl font-bold text-title mb-2`;
const Lead = tw.p`font-heading italic text-title opacity-70 mb-6 leading-relaxed`;

const IntentGrid = tw.div`grid grid-cols-1 sm:grid-cols-3 gap-3`;
const IntentCard = tw.button`
  text-left bg-white border rounded-xl p-4 flex flex-col gap-1.5 cursor-pointer transition-colors
  ${(p) =>
    p.$on
      ? "border-orange-accent ring-1 ring-orange-accent bg-orange-background-100/50"
      : "border-grey-info-outline hover:border-orange-accent"}
`;
const IntentCardTitle = tw.p`font-heading font-semibold text-title`;
const IntentCardDesc = tw.p`text-xs text-title opacity-60 leading-relaxed`;

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

// ── Welcome hero — centred, editorial placement (pills → two-tone serif headline
// → subtitle → CTAs) in the app's warm theme. A soft warm glow fills the space in
// place of a hero image.
const Hero = tw.div`
  relative min-h-screen bg-orange-background-100/40 overflow-hidden
  flex flex-col items-center justify-center text-center px-6 py-16
`;
const Glow = tw.div`
  pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2
  w-[520px] h-[520px] max-w-[90vw] rounded-full bg-orange-accent/25 blur-[120px]
`;
const Wordmark = tw.p`relative text-title font-bold tracking-tight text-sm opacity-60 mb-8`;
const HeroTitle = tw.h1`relative font-heading font-bold tracking-tight leading-[1.05] text-5xl sm:text-6xl mb-5`;
const TitleMuted = tw.span`block text-title opacity-40`;
const TitleStrong = tw.span`block text-title`;
const HeroSub = tw.p`relative font-body text-title opacity-60 max-w-xl mb-9 leading-relaxed`;
const CtaRow = tw.div`relative flex flex-col sm:flex-row items-center gap-3`;
const HeroPrimary = tw.button`
  rounded-xl px-7 py-3 text-sm font-semibold bg-orange-accent text-title cursor-pointer border-none
  hover:brightness-95 transition-all shadow-[0_12px_44px_-10px_rgba(253,186,116,0.85)]
`;
const HeroSecondary = tw.button`
  rounded-xl px-7 py-3 text-sm font-semibold bg-white border border-grey-info-outline text-title
  cursor-pointer flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed
`;

// A signed-in user's saved regions live on their account, so the flow can't be
// seeded until those have loaded. Gating here (rather than inside) means the
// picker's initial state is set once, from the real values — someone who
// onboarded on another device sees their picks, not an empty form.
export default function Onboarding() {
  const { prefs, save, isSyncing } = usePreferences();
  if (isSyncing) return null;
  return <OnboardingFlow existing={prefs} onSave={save} />;
}

function OnboardingFlow({ existing, onSave }) {
  const navigate = useNavigate();

  // Seed from any saved prefs so re-entering (from "Add regions") adds to prior
  // picks rather than resetting them.
  const [regions, setRegions] = useState(existing.regions);
  const [intent, setIntent] = useState(existing.intent);

  // Returning users (who already have regions) skip the mission intro and land
  // straight on the picker; first-time visitors start at the welcome page. Coming
  // from a "pick/add regions" link (?step=regions) also lands straight on the picker.
  const [searchParams] = useSearchParams();
  const startedAtRegions =
    existing.regions.length > 0 || searchParams.get("step") === "regions";
  const [step, setStep] = useState(startedAtRegions ? "regions" : "welcome");

  function finish() {
    onSave({ regions, intent });
    navigate("/app");
  }

  if (step === "welcome") {
    return (
      <Hero>
        <Glow />
        <Wordmark>ỊMỤ-ASỤSỤ</Wordmark>

        <HeroTitle>
          <TitleMuted>Histories,</TitleMuted>
          <TitleStrong>told from within.</TitleStrong>
        </HeroTitle>

        <HeroSub>
          For educators, researchers and curious learners in the global south —
          building and preserving their own histories
        </HeroSub>

        <CtaRow>
          <HeroPrimary type="button" onClick={() => setStep("regions")}>
            Continue →
          </HeroPrimary>
          <HeroSecondary type="button" disabled title="Coming soon">
            Contribute
          </HeroSecondary>
          <HeroSecondary type="button" disabled title="Coming soon">
            About us
          </HeroSecondary>
        </CtaRow>
      </Hero>
    );
  }

  return (
    <Screen>
      <Card>
        <Brand>ỊMỤ-ASỤSỤ</Brand>

        {step === "regions" && (
          <>
            <StepMeta>Step 1 of 2</StepMeta>
            <Title>Which regions matter to you?</Title>
            <Lead>
              Pick the places and peoples you want to teach, research or
              explore.
            </Lead>

            <RegionPicker value={regions} onChange={setRegions} />

            <Footer>
              {startedAtRegions ? (
                <CountNote>
                  {regions.length === 0
                    ? "Select at least one to continue"
                    : `${regions.length} selected`}
                </CountNote>
              ) : (
                <BackBtn type="button" onClick={() => setStep("welcome")}>
                  ← Back
                </BackBtn>
              )}
              <PrimaryBtn
                type="button"
                disabled={regions.length === 0}
                onClick={() => setStep("intent")}
              >
                Continue →
              </PrimaryBtn>
            </Footer>
          </>
        )}

        {step === "intent" && (
          <>
            <StepMeta>Step 2 of 2</StepMeta>
            <Title>How will you use Ịmụ-Asụsụ?</Title>
            <Lead>
              This helps us arrange your home hub around what you came to do.
            </Lead>

            <IntentGrid>
              {INTENT_OPTIONS.map((opt) => (
                <IntentCard
                  key={opt.value}
                  type="button"
                  $on={intent === opt.value}
                  onClick={() => setIntent(opt.value)}
                >
                  <IntentCardTitle>{opt.label}</IntentCardTitle>
                  <IntentCardDesc>{opt.blurb}</IntentCardDesc>
                </IntentCard>
              ))}
            </IntentGrid>

            <Footer>
              <BackBtn type="button" onClick={() => setStep("regions")}>
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
