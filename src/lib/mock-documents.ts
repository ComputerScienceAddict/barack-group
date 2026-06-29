export type ChecklistItem = {
  id: string;
  label: string;
  helper: string;
};

export const onboardingChecklist: ChecklistItem[] = [
  {
    id: "profile",
    label: "New hire profile",
    helper: "Legal name, contact details, start date, and department.",
  },
  {
    id: "tax",
    label: "Tax withholding",
    helper: "Mock federal and state withholding fields for testing only.",
  },
  {
    id: "bank",
    label: "Direct deposit",
    helper: "Mock routing and account information collection.",
  },
  {
    id: "policy",
    label: "Policy acknowledgement",
    helper: "Employee handbook, safety, confidentiality, and workplace policies.",
  },
  {
    id: "signature",
    label: "Electronic signature",
    helper: "Draw or type a signature and submit the test packet.",
  },
];

export const mockDocumentSections = [
  {
    title: "1. New Hire Packet Purpose",
    body: "This mock packet lets Barak Group test a digital onboarding flow. It is not a real employment contract, tax form, or legal document.",
  },
  {
    title: "2. Required Paperwork",
    body: "The employee confirms that the profile, tax withholding, direct deposit, emergency contact, and policy acknowledgement sections have been reviewed.",
  },
  {
    title: "3. Company Policy Acknowledgement",
    body: "The employee acknowledges receipt of the employee handbook, acceptable use policy, confidentiality expectations, workplace safety rules, and payroll instructions.",
  },
  {
    title: "4. Electronic Signature Consent",
    body: "By signing below, the employee agrees that this electronic test signature may be used to validate the onboarding workflow.",
  },
];
