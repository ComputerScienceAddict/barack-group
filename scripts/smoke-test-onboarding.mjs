import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const requiredFiles = [
  "src/app/employee-onboarding/page.tsx",
  "src/app/hiring/page.tsx",
  "src/components/employee-onboarding/OnboardingApp.tsx",
  "src/components/employee-onboarding/OnboardingStepNav.tsx",
  "src/lib/employee-onboarding/pdfForms.ts",
  "public/documents/janiking-employment-application-english.pdf",
  "public/documents/janiking-employment-application-spanish.pdf",
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
  ["wh151 form step", onboardingApp.includes("formWh151")],
  ["wh151 packet summary", onboardingApp.includes("packetItemWh151")],
  ["dynamic packet build", onboardingApp.includes("getOnboardingFormConfigs")],
  ["step nav wh151", stepNav.includes("stepNameWh151")],
  ["hiring redirect", hiringPage.includes('redirect("/employee-onboarding")')],
  ["locale employment configs", pdfForms.includes("getEmploymentFormConfig")],
  ["locale employment switch", onboardingApp.includes("handleLocaleChange")],
  ["submit and download", onboardingApp.includes("submitAndDownload")],
  ["local storage draft", onboardingApp.includes("localStorage")],
];

const failed = checks.filter(([, passed]) => !passed).map(([name]) => name);
if (failed.length) {
  console.error(`Failed checks: ${failed.join(", ")}`);
  process.exit(1);
}

console.log("Onboarding smoke test passed. Employee onboarding flow is wired.");
