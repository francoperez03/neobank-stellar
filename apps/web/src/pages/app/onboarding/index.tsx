import { useReducer } from "react";
import { Navigate } from "react-router-dom";
import { AnimatePresence, motion } from "motion/react";
import { KYC_SCHEMA, SUPPORTED_COUNTRIES, type KycFieldGroup } from "@neobank-stellar/shared";
import { useUser } from "@/hooks/use-user";
import { FullScreenLoader } from "@/components/ui/full-screen-loader";

import { WelcomeStep } from "./steps/WelcomeStep";
import { CountryStep } from "./steps/CountryStep";
import { FieldGroupStep } from "./steps/FieldGroupStep";
import { SelfieStep } from "./steps/SelfieStep";
import { ReviewStep } from "./steps/ReviewStep";
import { ProcessingStep } from "./steps/ProcessingStep";
import { ApprovedStep } from "./steps/ApprovedStep";

type OnboardingStep =
  | { type: "welcome" }
  | { type: "country" }
  | { type: "field-group"; group: KycFieldGroup }
  | { type: "selfie" }
  | { type: "review" }
  | { type: "processing" }
  | { type: "approved" }
  | { type: "error"; message: string };

interface State {
  stepIndex: number;
  steps: OnboardingStep[];
  countryCode: string;
  kycData: Record<string, unknown>;
}

type Action =
  | { type: "NEXT" }
  | { type: "BACK" }
  | { type: "SET_COUNTRY"; countryCode: string; countryName: string; nextSteps: OnboardingStep[] }
  | { type: "MERGE_KYC"; data: Record<string, unknown> }
  | { type: "APPROVED" }
  | { type: "ERROR"; message: string };

function buildStepsForCountry(countryCode: string): OnboardingStep[] {
  const schema = KYC_SCHEMA[countryCode];
  if (!schema) return [];

  const orderedGroups: KycFieldGroup[] = ["personal", "address", "identification", "documents", "additional"];
  const presentGroups = orderedGroups.filter((g) => schema.fields.some((f) => f.group === g));

  const nonSelfieDocFields = schema.fields.filter(
    (f) => f.group === "documents" && f.name !== "selfie",
  );

  const steps: OnboardingStep[] = [];

  for (const group of presentGroups) {
    if (group === "documents") {
      if (nonSelfieDocFields.length > 0) steps.push({ type: "field-group", group });
    } else {
      steps.push({ type: "field-group", group });
    }
  }

  if (schema.fields.some((f) => f.name === "selfie")) steps.push({ type: "selfie" });

  steps.push({ type: "review" });
  steps.push({ type: "processing" });

  return steps;
}

const INITIAL_STEPS: OnboardingStep[] = [{ type: "welcome" }, { type: "country" }, { type: "approved" }];

const STEP_VARIANTS = {
  initial: { opacity: 0, x: 24 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -24 },
};

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "NEXT":
      return { ...state, stepIndex: Math.min(state.stepIndex + 1, state.steps.length - 1) };
    case "BACK":
      return { ...state, stepIndex: Math.max(state.stepIndex - 1, 0) };
    case "SET_COUNTRY": {
      const newSteps: OnboardingStep[] = [
        { type: "welcome" },
        { type: "country" },
        ...action.nextSteps,
        { type: "approved" },
      ];
      return {
        ...state,
        countryCode: action.countryCode,
        steps: newSteps,
        stepIndex: 2,
        kycData: { ...state.kycData, country: action.countryName, countryCode: action.countryCode },
      };
    }
    case "MERGE_KYC":
      return { ...state, kycData: { ...state.kycData, ...action.data }, stepIndex: state.stepIndex + 1 };
    case "APPROVED":
      return { ...state, stepIndex: state.steps.length - 1 };
    case "ERROR":
      return { ...state, steps: [...state.steps.slice(0, -1), { type: "error", message: action.message }], stepIndex: state.steps.length - 1 };
    default:
      return state;
  }
}

export function OnboardingPage() {
  const { isKycApproved, isAuthLoading } = useUser();

  const [state, dispatch] = useReducer(reducer, {
    stepIndex: 0,
    steps: INITIAL_STEPS,
    countryCode: "",
    kycData: {},
  });

  if (isAuthLoading) return <FullScreenLoader />;
  if (isKycApproved) return <Navigate to="/app" replace />;

  const totalSteps = state.steps.length;
  const progress = Math.round((state.stepIndex / (totalSteps - 1)) * 100);
  const currentStep = state.steps[state.stepIndex];

  const fieldGroupSchema = currentStep?.type === "field-group" ? KYC_SCHEMA[state.countryCode] : null;
  const groupFields = fieldGroupSchema?.fields.filter(
    (f) =>
      currentStep?.type === "field-group" &&
      f.group === currentStep.group &&
      !(currentStep.group === "documents" && f.name === "selfie"),
  ) ?? [];

  if (!currentStep) return null;

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={state.stepIndex}
        variants={STEP_VARIANTS}
        initial="initial"
        animate="animate"
        exit="exit"
        transition={{ duration: 0.2 }}
        className="w-full"
      >
        {currentStep.type === "welcome" && (
          <WelcomeStep onNext={() => dispatch({ type: "NEXT" })} />
        )}

        {currentStep.type === "country" && (
          <CountryStep
            initialValue={state.countryCode}
            progress={progress}
            onBack={() => dispatch({ type: "BACK" })}
            onNext={(code) => {
              const nextSteps = buildStepsForCountry(code);
              const countryName = SUPPORTED_COUNTRIES.find((c) => c.code === code)?.name ?? code;
              dispatch({ type: "SET_COUNTRY", countryCode: code, countryName, nextSteps });
            }}
          />
        )}

        {currentStep.type === "field-group" && (
          <FieldGroupStep
            group={currentStep.group}
            fields={groupFields}
            kycData={state.kycData}
            progress={progress}
            onBack={() => dispatch({ type: "BACK" })}
            onNext={(data) => dispatch({ type: "MERGE_KYC", data })}
          />
        )}

        {currentStep.type === "selfie" && (
          <SelfieStep
            progress={progress}
            onBack={() => dispatch({ type: "BACK" })}
            onNext={(data) => dispatch({ type: "MERGE_KYC", data })}
          />
        )}

        {currentStep.type === "review" && (
          <ReviewStep
            countryCode={state.countryCode}
            kycData={state.kycData}
            progress={progress}
            onBack={() => dispatch({ type: "BACK" })}
            onNext={() => dispatch({ type: "NEXT" })}
          />
        )}

        {currentStep.type === "processing" && (
          <ProcessingStep
            countryCode={state.countryCode}
            kycData={state.kycData}
            onApproved={() => dispatch({ type: "APPROVED" })}
            onError={(msg) => dispatch({ type: "ERROR", message: msg })}
          />
        )}

        {currentStep.type === "approved" && <ApprovedStep />}

        {currentStep.type === "error" && (
          <div className="flex min-h-screen flex-col items-center justify-center gap-6 px-6 text-center">
            <div className="text-destructive text-4xl">✗</div>
            <div className="space-y-2">
              <h2 className="text-xl font-semibold">Verification failed</h2>
              <p className="text-muted-foreground text-sm">{currentStep.message}</p>
            </div>
            <button
              onClick={() => dispatch({ type: "BACK" })}
              className="text-primary text-sm underline underline-offset-4"
            >
              Go back and fix
            </button>
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
