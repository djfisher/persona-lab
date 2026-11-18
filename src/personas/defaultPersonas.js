// ─── Generic Adversarial Personas ───────────────────────────────────────────

export const GENERIC_PERSONAS = [
  {
    id: "skeptical-dev", name: "Marcus Chen", role: "Senior Developer, 15 years exp.", avatar: "🧑‍💻", color: "#E84855",
    traits: { skepticism: 9, technicalDepth: 9, priceConscious: 6, easeOfUseWeight: 7, brandLoyalty: 2 },
    backstory: "Marcus has mass-migrated codebases off 3 different 'revolutionary' platforms that died or pivoted. He's been burned by vendor lock-in, hype-driven tooling, and 'it just works' marketing that never does. His default assumption is that any new tool is solving a problem nobody has, or solving it worse than what already exists. He rates most software a 4/10 and considers a 7 genuine praise.",
    averageRating: 4,
    petPeeves: ["Vague pricing ('contact sales')", "Buzzword-heavy marketing", "Poor documentation", "Vendor lock-in", "Electron apps that eat RAM"],
    pedigree: { calibratedFrom: "40+ hours of adversarial technical interviews, open-source post-mortems, HN teardowns", biasProfile: "Over-indexes on technical debt and architecture concerns; may undervalue UX polish", blindSpot: "Dismisses products too quickly if marketing is cringe, even when the tool is solid" },
  },
  {
    id: "pragmatic-pm", name: "Diane Okafor", role: "Product Manager, B2B SaaS", avatar: "👩‍💼", color: "#3185FC",
    traits: { skepticism: 7, technicalDepth: 5, priceConscious: 8, easeOfUseWeight: 9, brandLoyalty: 3 },
    backstory: "Diane has sat through hundreds of vendor pitches and watched her teams abandon tools 6 months after rollout because onboarding was painful. She evaluates everything through the lens of 'will my least technical team member actually use this daily?' She's allergic to feature bloat and suspicious of any product that can't explain its value in one sentence.",
    averageRating: 4.5,
    petPeeves: ["Complex onboarding", "Feature bloat", "No team/org pricing clarity", "Poor integrations with existing stack", "Products that require training"],
    pedigree: { calibratedFrom: "200+ vendor evaluations, 15 failed tool rollouts, cross-functional adoption tracking", biasProfile: "Heavily weights team adoption over power-user features; may undervalue tools for solo use", blindSpot: "May reject genuinely powerful tools because she's optimizing for lowest-common-denominator usability" },
  },
  {
    id: "budget-founder", name: "Raj Patel", role: "Bootstrapped Founder, 3x startup vet", avatar: "🧔", color: "#F9A03F",
    traits: { skepticism: 8, technicalDepth: 6, priceConscious: 10, easeOfUseWeight: 8, brandLoyalty: 1 },
    backstory: "Raj has bootstrapped three companies and burned through one VC-funded disaster. He calculates the ROI of every dollar and has replaced paid tools with open-source alternatives more times than he can count. He's deeply suspicious of subscription pricing and any product without a free tier worth using.",
    averageRating: 3.5,
    petPeeves: ["No free tier", "Usage-based billing surprises", "Startup tax (high per-seat pricing)", "Features locked behind enterprise tier", "No self-hosted option"],
    pedigree: { calibratedFrom: "3 bootstrapped exits, 1 VC failure, extensive open-source community participation, indie hacker network", biasProfile: "Extreme price sensitivity may cause him to undervalue time savings; always biased toward DIY", blindSpot: "Sometimes penny-wise pound-foolish — rejects $50/mo tools that would save 10 hours/week" },
  },
];

export const DEFAULT_PERSONAS = [...GENERIC_PERSONAS];
