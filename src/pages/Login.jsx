import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import tw from "tailwind-styled-components";
import { signInWithOAuth } from "@/services/auth/signInWithOAuth";
import { signInWithPassword } from "@/services/auth/signInWithPassword";

const COUNTRIES = [
  "Nigeria", "Ghana", "Kenya", "South Africa", "United Kingdom",
  "United States", "Canada", "Australia", "Germany", "France",
  "Italy", "Netherlands", "Other",
];

const PageWrapper = tw.div`min-h-screen bg-orange-background-100 flex flex-col`;
const BackBtn = tw.button`absolute top-6 left-8 text-sm text-title opacity-50 hover:opacity-100 transition-opacity`;
const CenterPane = tw.div`flex flex-1 items-center justify-center px-4`;
const Card = tw.div`w-full max-w-sm`;
const BrandWrapper = tw.div`mb-10 text-center`;
const BrandName = tw.h1`font-heading text-4xl font-bold text-title tracking-tight`;
const Tagline = tw.p`mt-2 text-sm text-title opacity-50`;
const StyledForm = tw.form`space-y-3`;
const FieldWrapper = tw.div``;
const StyledSelect = tw.select`
  w-full rounded-xl border-2 border-grey-info-outline bg-white
  px-4 py-3 text-sm text-title appearance-none
  focus:border-orange-300 focus:outline-none transition-colors
`;
const StyledInput = tw.input`
  w-full rounded-xl border-2 border-grey-info-outline bg-white
  px-4 py-3 text-sm text-title
  placeholder:text-title placeholder:opacity-40
  focus:border-orange-300 focus:outline-none transition-colors
`;
const ErrorText = tw.p`mt-1 text-xs text-red-500`;
const SignInBtn = tw.button`
  w-full rounded-xl bg-title px-4 py-3
  text-sm font-semibold text-white
  hover:opacity-90 transition-opacity disabled:opacity-50
`;
const Divider = tw.div`flex items-center gap-3 my-1`;
const DividerLine = tw.hr`flex-1 border-grey-info-outline`;
const DividerText = tw.span`text-xs text-title opacity-40`;
const GoogleBtn = tw.button`
  w-full flex items-center justify-center gap-3 rounded-xl
  border-2 border-grey-info-outline bg-white
  px-4 py-3 text-sm font-semibold text-title
  hover:border-orange-300 hover:bg-orange-background-100 transition-all
`;
const ServerError = tw.p`text-xs text-red-500 text-center`;

export default function Login() {
  const navigate = useNavigate();
  const [serverError, setServerError] = useState("");
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm();

  async function onEmailSubmit({ email, password, country, name }) {
    setServerError("");
    try {
      sessionStorage.setItem("login_profile", JSON.stringify({ country, name }));
      await signInWithPassword({ email, password });
      navigate("/app/country", { replace: true });
    } catch (err) {
      setServerError(err.message);
    }
  }

  async function handleGoogle() {
    setServerError("");
    try {
      await signInWithOAuth({ provider: "google" });
    } catch (err) {
      setServerError(err.message);
    }
  }

  return (
    <PageWrapper>
      <BackBtn onClick={() => navigate(-1)}>← Back</BackBtn>

      <CenterPane>
        <Card>
          <BrandWrapper>
            <BrandName>EDUCATÉ</BrandName>
            <Tagline>Preserving Ikwerre heritage, one story at a time.</Tagline>
          </BrandWrapper>

          <StyledForm onSubmit={handleSubmit(onEmailSubmit)}>
            <FieldWrapper>
              <StyledSelect {...register("country", { required: "Please select a country" })} defaultValue="">
                <option value="" disabled>Country</option>
                {COUNTRIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </StyledSelect>
              {errors.country && <ErrorText>{errors.country.message}</ErrorText>}
            </FieldWrapper>

            <FieldWrapper>
              <StyledInput
                {...register("name", { required: "Please enter your name" })}
                type="text"
                placeholder="Name"
              />
              {errors.name && <ErrorText>{errors.name.message}</ErrorText>}
            </FieldWrapper>

            <FieldWrapper>
              <StyledInput
                {...register("email", { required: "Email is required" })}
                type="email"
                placeholder="Email"
                autoComplete="email"
              />
              {errors.email && <ErrorText>{errors.email.message}</ErrorText>}
            </FieldWrapper>

            <FieldWrapper>
              <StyledInput
                {...register("password", { required: "Password is required" })}
                type="password"
                placeholder="Password"
                autoComplete="current-password"
              />
              {errors.password && <ErrorText>{errors.password.message}</ErrorText>}
            </FieldWrapper>

            {serverError && <ServerError>{serverError}</ServerError>}

            <SignInBtn type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Signing in…" : "Sign in"}
            </SignInBtn>
          </StyledForm>

          <Divider>
            <DividerLine />
            <DividerText>or</DividerText>
            <DividerLine />
          </Divider>

          <GoogleBtn type="button" onClick={handleGoogle}>
            <GoogleIcon />
            Sign in with Google
          </GoogleBtn>
        </Card>
      </CenterPane>
    </PageWrapper>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 01-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4" />
      <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853" />
      <path d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05" />
      <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 6.29C4.672 4.163 6.656 3.58 9 3.58z" fill="#EA4335" />
    </svg>
  );
}
