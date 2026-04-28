export const EXAMPLE_DATA = {
  productName: "Toast-OS Smart Toaster",
  productDesc: "A $250 connected toaster with a 5-inch touchscreen. It connects to Wi-Fi, downloads weather updates, and allows users to swipe through different bread profiles. It sends a push notification to your phone when the toast is done.",
  competitors: ["Breville", "Standard $20 Toaster"],
  results: {
    "skeptical-dev": {
      ratings: { overall: 2, value: 1, usability: 4, reliability: 3, wouldRecommend: 1 },
      headline: "A solution desperately searching for a problem.",
      review: "I cannot overstate how ridiculous it is to put a Wi-Fi chip in a toaster. It takes 15 seconds of booting up before I can even select the 'toast' function. What happens when the company goes out of business and the auth servers go down? Do I just eat raw bread? It's a massive security vulnerability for my home network just to get a push notification that I could have figured out by smelling the bread.",
      dealbreakers: ["Requires Wi-Fi to function properly", "Boot time takes longer than standard toasting", "Absurd price point for a single-function appliance"],
      competitorMention: "I will stick to my $20 Hamilton Beach that uses physical coils and thermodynamics instead of a software stack.",
      buyProbability: 5,
      buyParams: { val: 1, usa: 4, pri: 8, ske: 10 },
      wishlist: ["A physical lever that works without electricity", "Local-only mode with no cloud dependency"],
      unsolvedPainPoints: ["Bread gets stuck and requires a knife to extract", "Crumb trays are universally terrible to clean"]
    },
    "budget-buyer": {
      ratings: { overall: 3, value: 1, usability: 6, reliability: 5, wouldRecommend: 2 },
      headline: "Who on earth has $250 for this?",
      review: "The screen is pretty, I'll admit that. But I can buy groceries for a month for the price of this toaster. The weather app feature is silly—I have a phone in my pocket. If this was $50, maybe it would be a fun novelty gift, but at this price, it's strictly for rich people who want to show off their kitchen.",
      dealbreakers: ["The price is completely unjustifiable", "Push notifications for toast is overkill"],
      competitorMention: "Breville makes premium toasters that actually toast bread better for half the price without the gimmicks.",
      buyProbability: 10,
      buyParams: { val: 2, usa: 6, pri: 10, ske: 7 },
      wishlist: ["A base model without the screen for $40", "Better warranty given the electronics involved"],
      unsolvedPainPoints: ["Toasters break after 2 years and go to landfills"]
    }
  },
  synthesis: {
    executiveSummary: "The product is perceived as an over-engineered luxury novelty rather than a functional upgrade. Users are actively hostile toward the digitization of a reliable, low-tech appliance.",
    forces: {
      push: "Current toasters are boring and sometimes burn bread.",
      pull: "The aesthetic appeal of a modern, screen-enabled kitchen appliance.",
      anxiety: "Fear of software updates bricking the toaster, security vulnerabilities, and absurd price.",
      habit: "Pushing a mechanical lever down is deeply ingrained muscle memory."
    },
    frictionPoints: [
      { conflict: "Rich features vs. Immediate Action", personas: ["Skeptical Dev", "Budget Buyer"], tradeoff: "Remove boot sequences; toasting must start the millisecond the bread is inserted." }
    ],
    switchingCost: { score: 8, reason: "Financial cost is extremely high, and mental cost of learning a 'toast OS' is frustrating." },
    jobs: [
      { id: "j1", statement: "When I wake up groggy, I want to make breakfast without thinking, so I can eat and get to work.", dimension: "functional", sharedAcross: ["All"], currentlyAddressed: "not_at_all", evidence: "Complaints about boot times and screens.", priority: "critical" }
    ],
    productOptions: [
      { title: "Pivot to B2B Commercial", description: "Sell this to hotels where central management of toaster arrays makes sense.", effort: "medium", impact: "high", riskIfIgnored: "Total consumer market failure" },
      { title: "Dumb Mode Default", description: "Add a physical lever that bypasses the OS entirely.", effort: "low", impact: "high", riskIfIgnored: "Alienates 90% of buyers" }
    ]
  },
  steelMan: {
    verdict: "This business fails because it violates the core user expectation of a utility appliance: immediate, mindless reliability.",
    failureScenarios: [
      { title: "The 'Smart' Backlash", probability: "high", description: "Consumers are increasingly fatigued by 'smart' appliances. The product becomes a viral joke on social media as an example of tech excess.", evidence: "Skeptical Dev's entire review." },
      { title: "Hardware-Software Desync", probability: "medium", description: "The heat from the toasting elements degrades the touchscreen LCD over 14 months, leading to massive warranty claims.", evidence: "General skepticism about reliability." }
    ],
    fatalAssumption: "Assuming that because screens make phones better, they make *everything* better.",
    survivalCondition: "The toaster must toast bread significantly better (perfectly even browning via ML sensors) than a $20 competitor to justify the electronics."
  },
  rewrite: {
    tagline: "The world's first precision-browning toaster. No burnt edges, ever.",
    elevatorPitch: "We stripped away the gimmicks. Using thermal sensors and a simple digital interface, the Toast-OS guarantees perfectly even browning on any bread type. It's not a smart toaster; it's a perfect toaster.",
    targetCustomer: "Kitchen enthusiasts and tech-forward homeowners who value perfect execution over novelty features.",
    keyImprovements: [
      { title: "Remove the Weather App", rationale: "It's a distraction that cheapens the brand.", addressesPersonas: ["Budget Buyer"] },
      { title: "Instant-On", rationale: "Toasting must begin without a boot sequence.", addressesPersonas: ["Skeptical Dev"] }
    ],
    featuresToAdd: [
      { feature: "Thermal perfection sensors", source: "Market Gap", priority: "critical" }
    ],
    featuresToCut: [
      { feature: "Wi-Fi push notifications", reason: "Unnecessary complexity and security risk." }
    ],
    positioningStatement: "Unlike Breville, which relies on timers, we use real-time thermal imaging to guarantee your toast is exactly the shade you asked for."
  }
};
