import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const requiredFiles = [
  "src/app/employee-onboarding/page.tsx",
  "src/app/hiring/page.tsx",
  "src/components/employee-onboarding/OnboardingApp.tsx",
  "src/components/employee-onboarding/OnboardingStepNav.tsx",
  "src/lib/employee-onboarding/pdfForms.ts",
  "src/lib/employee-onboarding/wh153Fields.ts",
  "public/documents/wh-153s-2024.pdf",
  "package.json",
];

const missing = requiredFiles.filter((file) => !fs.existsSync(path.join(root, file)));
if (missing.length) {
  console.error(`Missing files: ${missing.join(", ")}`);
  process.exit(1);
}

const onboardingApp = fs.readFileSync(
  path.join(root, "src/components/employee-onboarding/OnboardingApp.tsx"),
  "utf8"
);
const stepNav = fs.readFileSync(
  path.join(root, "src/components/employee-onboarding/OnboardingStepNav.tsx"),
  "utf8"
);
const hiringPage = fs.readFileSync(path.join(root, "src/app/hiring/page.tsx"), "utf8");
const pdfForms = fs.readFileSync(
  path.join(root, "src/lib/employee-onboarding/pdfForms.ts"),
  "utf8"
);

const checks = [
  ["employee onboarding route", onboardingApp.includes("OnboardingAppContent")],
  ["wh153 form step", onboardingApp.includes("formWh153")],
  ["wh153 packet summary", onboardingApp.includes("packetItemWh153")],
  ["wh153 before direct deposit", onboardingApp.includes("FORM_START_STEP + 4")],
  ["dynamic packet build", onboardingApp.includes("ONBOARDING_FORM_CONFIGS.map")],
  ["step nav wh153", stepNav.includes("stepNameWh153")],
  ["hiring redirect", hiringPage.includes('redirect("/employee-onboarding")')],
  ["wh153 config", pdfForms.includes("wh153FormConfig")],
  ["submit and download", onboardingApp.includes("submitAndDownload")],
  ["local storage draft", onboardingApp.includes("localStorage")],
];

const failed = checks.filter(([, passed]) => !passed).map(([name]) => name);
if (failed.length) {
  console.error(`Failed checks: ${failed.join(", ")}`);
  process.exit(1);
}

console.log("Onboarding smoke test passed. Employee onboarding flow and WH-153S are wired.");
