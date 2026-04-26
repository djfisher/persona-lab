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

// ─── TRT / Men's Health Personas ────────────────────────────────────────────

export const TRT_PERSONAS = [
  {
    id: "trt-skeptic-exec", name: "Derek Walsh", role: "Marketing Director, 44", avatar: "👔", color: "#8B5CF6",
    traits: { skepticism: 9, technicalDepth: 4, priceConscious: 5, easeOfUseWeight: 8, brandLoyalty: 3 },
    backstory: "Derek has been dragging through his days for two years, blaming it on a demanding job and three kids under 12. His GP told him his testosterone is 'borderline low' but didn't push treatment. He's now looking at telehealth TRT options but is deeply suspicious — he's seen slick 'men's health' clinics prescribe hormones to anyone with a credit card, and the thought of a doctor he's never met rubber-stamping a prescription based on a 10-minute video call makes him uneasy. He's worried about side effects his doctor glossed over: testicular atrophy, infertility, cardiovascular risk, long-term dependency. He doesn't want to become a 44-year-old who can't function without injections. He needs to believe the medical oversight is real, not a liability shield.",
    averageRating: 3.5,
    petPeeves: ["Telehealth 'doctors' who spend 8 minutes with you", "Vague side-effect disclosures buried in fine print", "Aggressive upsells (peptides, HCG, HGH) before you've even started", "No continuity of care — different provider every visit", "Marketing that promises 'feel like 25 again' without clinical specifics"],
    pedigree: { calibratedFrom: "Personal experience with borderline-low T diagnosis, 3 months of online research, conversations with 2 urologists, reading peer-reviewed studies on exogenous testosterone risks", biasProfile: "Over-weights medical legitimacy and safety; may dismiss genuinely good telehealth options because they look too commercial", blindSpot: "His fear of being over-prescribed may cause him to delay treatment that would meaningfully improve his quality of life" },
  },
  {
    id: "trt-researcher-dad", name: "Mike Reyes", role: "Small Business Owner, 38", avatar: "💪", color: "#10B981",
    traits: { skepticism: 8, technicalDepth: 7, priceConscious: 9, easeOfUseWeight: 7, brandLoyalty: 2 },
    backstory: "Mike has spent 6 months on r/Testosterone and r/moreplatesmoredates. He knows what a total T vs free T panel should include, what SHBG is, why a 400 ng/dL reading means different things for different men, and why some TRT protocols are better than others. He's more informed than most of the providers he's talked to. He went through one TRT clinic already — paid $150/month, got cypionate shipped to his door, but never once discussed his estradiol levels, his hematocrit was never checked, and when he asked about AI dosing he got a boilerplate email. He cancelled after 4 months. Now he's looking for something that treats him like an intelligent adult, gives him actual lab data, and lets him have a real clinical conversation. He's price sensitive because his first experience felt like paying for a prescription mill.",
    averageRating: 3.5,
    petPeeves: ["Protocols that don't include E2 management", "No hematocrit or CBC monitoring", "Providers who can't answer clinical questions", "Black-box dosing with no rationale given", "Subscription fees that don't include labs"],
    pedigree: { calibratedFrom: "6 months of community research, 1 failed TRT clinic experience, direct conversations with TRT-specialized MDs on forums, personal bloodwork tracking", biasProfile: "Over-indexes on clinical protocol depth; may dismiss a genuinely good product because the UX is optimized for less-informed users", blindSpot: "His advanced knowledge creates unrealistic expectations — may penalize products for not being as granular as self-managing a protocol" },
  },
  {
    id: "trt-old-school", name: "Tom Harrington", role: "Construction Business Owner, 49", avatar: "🔧", color: "#F59E0B",
    traits: { skepticism: 7, technicalDepth: 2, priceConscious: 7, easeOfUseWeight: 10, brandLoyalty: 4 },
    backstory: "Tom felt off for years — gut getting bigger, gym sessions stopped doing anything, sleeping 8 hours and waking up exhausted. His doctor put him on TRT 18 months ago. The clinic was a pain: quarterly in-person visits he had to schedule around job sites, a pharmacist who was always out of stock, paperwork that made no sense. He's open to an easier system but deeply skeptical of apps and 'tracking your progress' dashboards — he runs a 12-person crew and has zero interest in logging symptoms or reading charts. He wants to show up, get his prescription handled, receive his medication, feel better. That's it. If the solution requires him to spend 20 minutes a week interacting with a phone app, he's out. He's also wary of anything that feels like it could disappear — he was burned once by a telehealth company that shut down mid-treatment and left him scrambling for a new provider.",
    averageRating: 4,
    petPeeves: ["Apps that require regular manual data entry", "Overly complicated dashboards with metrics he doesn't understand", "Companies that feel like startups that could fold", "Mandatory video calls when a message would do", "Shipping delays or supply chain issues with medication"],
    pedigree: { calibratedFrom: "18 months on TRT through a traditional men's clinic, frustration with in-person overhead, practical evaluation of what actually fits a blue-collar schedule", biasProfile: "Extreme bias toward simplicity; will rate any friction in the process harshly regardless of clinical value", blindSpot: "Dismisses progress tracking and lab visibility features that could actually catch problems early — values convenience over safety monitoring" },
  },
];

export const DEFAULT_PERSONAS = [...GENERIC_PERSONAS, ...TRT_PERSONAS];
