export const EXAMPLE_DATA = {
  productName: "ErgoLumina Desk Lamp",
  productDesc: "A $129 desk lamp designed specifically for knowledge workers. It uses a built-in ambient light sensor to automatically adjust brightness and color temperature throughout the day to match your circadian rhythm and reduce screen glare.",
  competitors: ["BenQ ScreenBar", "Standard LED Lamp"],
  results: {
    "skeptical-dev": {
      ratings: { overall: 8, value: 7, usability: 6, reliability: 9, wouldRecommend: 8 },
      headline: "Genuinely saves my eyes, but the software is annoying.",
      review: "I fully expected this to be a gimmick, but the ambient light sensing actually works flawlessly. It drastically reduced my eye fatigue during late-night coding sessions, and the color temperature transitions are buttery smooth. However, the requirement to create a cloud account just to adjust the default brightness curve is incredibly frustrating for a desk lamp. Hardware shouldn't require an email address.",
      dealbreakers: ["Mandatory cloud account for basic configuration", "Uses a proprietary power brick instead of USB-C"],
      competitorMention: "It's better than the BenQ ScreenBar because of the auto-adjusting, but BenQ doesn't force me to make an account.",
      buyProbability: 85,
      buyParams: { val: 8, usa: 6, pri: 6, ske: 8 },
      wishlist: ["A local-only web interface or Bluetooth config", "Standard USB-C power delivery"],
      unsolvedPainPoints: ["I still have to reach over to physically turn it off if I leave my desk"]
    },
    "budget-buyer": {
      ratings: { overall: 7, value: 5, usability: 8, reliability: 8, wouldRecommend: 6 },
      headline: "A premium luxury, but hard to justify the price out of pocket.",
      review: "The build quality is fantastic—heavy aluminum base, sleek design. The auto-dimming is really nice and definitely makes my workspace feel more premium. However, at $129, you are paying a massive premium. You can get 80% of the way there with a $20 IKEA lamp and a $15 smart bulb. It's a fantastic product if your company is paying for your WFH setup, but a tough sell for a student.",
      dealbreakers: ["The price is too high for a personal purchase", "The heavy base takes up valuable desk space"],
      competitorMention: "I could buy 5 standard LED lamps for this price, though they wouldn't have the auto-adjust feature.",
      buyProbability: 40,
      buyParams: { val: 7, usa: 8, pri: 9, ske: 6 },
      wishlist: ["A cheaper 'Lite' version without the aluminum body", "A clamp-on monitor mount to save desk space"],
      unsolvedPainPoints: ["Desk space is limited and this base is huge"]
    }
  },
  synthesis: {
    executiveSummary: "ErgoLumina is a highly effective product that successfully solves eye strain and feels premium. However, its adoption is hindered by unnecessary software gating (cloud accounts) and a base design that consumes desk space.",
    forces: {
      push: "Severe eye strain and headaches from long hours looking at bright monitors in dark rooms.",
      pull: "Automatic, thought-free lighting adjustments that genuinely improve comfort and focus.",
      anxiety: "Having to rely on a cloud server to use a desk lamp, and the high upfront financial cost.",
      habit: "People are used to simply flipping a switch on a cheap desk lamp."
    },
    frictionPoints: [
      { conflict: "Advanced Features vs. Privacy/Simplicity", personas: ["Skeptical Dev"], tradeoff: "Provide a 'local-only' Bluetooth mode out of the box." },
      { conflict: "Premium Build vs. Desk Space", personas: ["Budget Buyer"], tradeoff: "Offer a clamp-style mount option instead of just the heavy base." }
    ],
    switchingCost: { score: 4, reason: "Easy to physically replace an old lamp, but the financial cost is a barrier." },
    jobs: [
      { id: "j1", statement: "When I am working late into the night, I want my lighting to automatically adjust, so I can avoid eye fatigue and sleep better afterwards.", dimension: "functional", sharedAcross: ["Skeptical Dev", "Budget Buyer"], currentlyAddressed: "partially", evidence: "Both personas praised the core auto-dimming functionality.", priority: "critical" }
    ],
    productOptions: [
      { title: "Remove Cloud Requirement", description: "Allow local configuration without an account.", effort: "low", impact: "high", riskIfIgnored: "Alienates the core power-user demographic" },
      { title: "Monitor Mount Accessory", description: "Create a clamp that attaches to the back of a desk or monitor to save space.", effort: "medium", impact: "high", riskIfIgnored: "Loses market share to BenQ ScreenBar" }
    ]
  },
  steelMan: {
    verdict: "The product is fundamentally sound and solves a real problem, but could stall if the friction of onboarding (accounts/power cables) outweighs the core utility.",
    failureScenarios: [
      { title: "Commoditization", probability: "medium", description: "Cheaper overseas brands replicate the light-sensing algorithm and release a $40 alternative.", evidence: "Budget buyer noting it's easy to approximate with cheap smart bulbs." },
      { title: "Power User Rejection", probability: "medium", description: "Tech influencers review the product negatively specifically because of the cloud-gated settings and proprietary power cable.", evidence: "Skeptical Dev's major dealbreakers." }
    ],
    fatalAssumption: "Assuming users are willing to make an account and use a proprietary app for a desk appliance.",
    survivalCondition: "Must transition to standard USB-C power and remove the account requirement to secure the 'power user' market."
  },
  rewrite: {
    tagline: "The desk lamp that protects your eyes, automatically.",
    elevatorPitch: "ErgoLumina uses built-in ambient sensors to match your natural circadian rhythm, reducing eye strain and screen glare without you having to lift a finger. Now featuring a local-only setup mode and a desk-saving clamp mount, it's the ultimate lighting upgrade for your workspace.",
    targetCustomer: "Remote workers, software developers, and professionals who spend 8+ hours a day in front of a screen.",
    keyImprovements: [
      { title: "Local-Only Configuration", rationale: "Power users despise mandatory accounts for hardware.", addressesPersonas: ["Skeptical Dev"] },
      { title: "Clamp Mount Option", rationale: "Users want to save desk space.", addressesPersonas: ["Budget Buyer"] },
      { title: "USB-C Power", rationale: "Proprietary cables are annoying and reduce desk flexibility.", addressesPersonas: ["Skeptical Dev"] }
    ],
    featuresToAdd: [
      { feature: "Motion sensor auto-off", source: "Skeptical Dev Unsolved Pain Point", priority: "medium" }
    ],
    featuresToCut: [
      { feature: "Mandatory Cloud Sync", reason: "Unnecessary complexity and privacy concern." }
    ],
    positioningStatement: "Unlike standard LED lamps or the BenQ ScreenBar, ErgoLumina dynamically reacts to your environment to guarantee perfect lighting all day, with zero app bloat or cloud reliance.",
    pricingGuidance: "Maintain the $129 price point for the premium base model, but introduce a 'WFH Bundle' that targets employers to subsidize the cost, addressing the Budget Buyer's financial friction."
  }
};
