export type ChecklistItem = {
  id: string;
  label: string;
  helper: string;
};

export const onboardingChecklist: ChecklistItem[] = [
  {
    id: "profile",
    label: "New hire profile",
    helper: "Legal name, contact details, start date, and department."
  },
  {
    id: "i9",
    label: "Form I-9",
    helper: "Complete Section 1 of the employment eligibility verification form."
  },
  {
    id: "wh151",
    label: "WH-151PS withholding",
    helper: "Michigan employee's Michigan withholding exemption certificate."
  },
  {
    id: "bank",
    label: "Direct deposit",
    helper: "Mock routing and account information collection."
  },
  {
    id: "policy",
    label: "Policy acknowledgement",
    helper: "Employee handbook, device use, confidentiality, and safety."
  },
  {
    id: "signature",
    label: "Electronic signature",
    helper: "Draw or type a signature and submit the onboarding packet."
  }
];

export const mockDocumentSections = [
  {
    title: "1. New Hire Packet Purpose",
    body:
      "This onboarding packet collects profile details, required tax and eligibility forms, direct deposit preferences, and policy acknowledgements."
  },
  {
    title: "2. Required Paperwork",
    body:
      "The employee confirms that the I-9, WH-151PS, profile, direct deposit, emergency contact, and policy acknowledgement sections have been reviewed."
  },
  {
    title: "3. Company Policy Acknowledgement",
    body:
      "The employee acknowledges receipt of the employee handbook, acceptable use policy, confidentiality expectations, workplace safety rules, and payroll instructions."
  },
  {
    title: "4. Electronic Signature Consent",
    body:
      "By signing below, the employee agrees that this electronic signature may be used to validate the onboarding workflow."
  }
];
