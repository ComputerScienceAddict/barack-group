import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const requiredFiles = [
  "src/app/hiring/page.tsx",
  "src/components/onboarding/onboarding-app.tsx",
  "src/components/onboarding/signature-pad.tsx",
  "src/components/onboarding/onboarding.css",
  "src/lib/mock-documents.ts",
  "package.json",
];

const missing = requiredFiles.filter((file) => !fs.existsSync(path.join(root, file)));
if (missing.length) {
  console.error(`Missing files: ${missing.join(", ")}`);
  process.exit(1);
}

const onboarding = fs.readFileSync(
  path.join(root, "src/components/onboarding/onboarding-app.tsx"),
  "utf8"
);
const signature = fs.readFileSync(
  path.join(root, "src/components/onboarding/signature-pad.tsx"),
  "utf8"
);

const checks = [
  ["submit button", onboarding.includes("Submit onboarding packet")],
  ["export test JSON", onboarding.includes("Export test JSON")],
  ["mock document", onboarding.includes("New Hire Paperwork Acknowledgement")],
  ["signature pad", signature.includes("Draw electronic signature")],
  ["local storage save", onboarding.includes("localStorage")],
  ["hiring route", fs.readFileSync(path.join(root, "src/app/hiring/page.tsx"), "utf8").includes("OnboardingApp")],
];

const failed = checks.filter(([, passed]) => !passed).map(([name]) => name);
if (failed.length) {
  console.error(`Failed checks: ${failed.join(", ")}`);
  process.exit(1);
}

console.log("Onboarding smoke test passed. Required files and features are present.");
