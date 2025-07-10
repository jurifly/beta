
export interface Term {
  slug: string;
  title: string;
  summary: string; // Placeholder for now
}

export type Category = 
  | 'Startup Basics & Founder\'s Lingo'
  | 'Legal & Compliance (India + Global Friendly)'
  | 'Startup Financial & Tax Terms'
  | 'Funding, Equity & Cap Table Terms'
  | 'Startup Metrics & KPIs';

const terms: { title: string; category: Category }[] = [
  // Startup Basics
  { title: "MVP (Minimum Viable Product)", category: "Startup Basics & Founder's Lingo" },
  { title: "Product-Market Fit", category: "Startup Basics & Founder's Lingo" },
  { title: "Pivot", category: "Startup Basics & Founder's Lingo" },
  { title: "Traction", category: "Startup Basics & Founder's Lingo" },
  { title: "Runway", category: "Startup Basics & Founder's Lingo" },
  { title: "Burn Rate", category: "Startup Basics & Founder's Lingo" },
  { title: "CAC (Customer Acquisition Cost)", category: "Startup Basics & Founder's Lingo" },
  { title: "LTV (Lifetime Value)", category: "Startup Basics & Founder's Lingo" },
  { title: "TAM / SAM / SOM", category: "Startup Basics & Founder's Lingo" },
  { title: "Churn Rate", category: "Startup Basics & Founder's Lingo" },
  { title: "GTM (Go-to-Market)", category: "Startup Basics & Founder's Lingo" },
  { title: "PMF (Product-Market Fit)", category: "Startup Basics & Founder's Lingo" },
  { title: "Lean Startup", category: "Startup Basics & Founder's Lingo" },
  { title: "Term Sheet", category: "Startup Basics & Founder's Lingo" },
  { title: "Cliff & Vesting", category: "Startup Basics & Founder's Lingo" },
  { title: "Lead Investor", category: "Startup Basics & Founder's Lingo" },
  { title: "Dilution", category: "Startup Basics & Founder's Lingo" },
  { title: "Angel Investor", category: "Startup Basics & Founder's Lingo" },
  { title: "Incubator vs Accelerator", category: "Startup Basics & Founder's Lingo" },
  // Legal & Compliance
  { title: "CIN (Corporate Identification Number)", category: "Legal & Compliance (India + Global Friendly)" },
  { title: "DIN (Director Identification Number)", category: "Legal & Compliance (India + Global Friendly)" },
  { title: "GSTIN", category: "Legal & Compliance (India + Global Friendly)" },
  { title: "PAN", category: "Legal & Compliance (India + Global Friendly)" },
  { title: "ROC Filings", category: "Legal & Compliance (India + Global Friendly)" },
  { title: "LLP vs Pvt Ltd vs OPC", category: "Legal & Compliance (India + Global Friendly)" },
  { title: "DIR-3 KYC", category: "Legal & Compliance (India + Global Friendly)" },
  { title: "MCA Portal", category: "Legal & Compliance (India + Global Friendly)" },
  { title: "Shareholder Agreement", category: "Legal & Compliance (India + Global Friendly)" },
  { title: "MOA / AOA", category: "Legal & Compliance (India + Global Friendly)" },
  { title: "ESOP (Employee Stock Ownership Plan)", category: "Legal & Compliance (India + Global Friendly)" },
  { title: "Board Resolution", category: "Legal & Compliance (India + Global Friendly)" },
  { title: "Form 8, 11 (LLP filings)", category: "Legal & Compliance (India + Global Friendly)" },
  { title: "Form AOC-4, MGT-7 (Pvt Ltd filings)", category: "Legal & Compliance (India + Global Friendly)" },
  { title: "Company Incorporation Process", category: "Legal & Compliance (India + Global Friendly)" },
  { title: "Annual Compliance Calendar", category: "Legal & Compliance (India + Global Friendly)" },
  { title: "Compliance Certificate", category: "Legal & Compliance (India + Global Friendly)" },
  { title: "TAN Number", category: "Legal & Compliance (India + Global Friendly)" },
  { title: "Registered Office Proof", category: "Legal & Compliance (India + Global Friendly)" },
  { title: "Founders Agreement", category: "Legal & Compliance (India + Global Friendly)" },
  // Financial & Tax
  { title: "Income Tax Slabs (Personal & Corporate)", category: "Startup Financial & Tax Terms" },
  { title: "Section 80C / 80D / 10(14)", category: "Startup Financial & Tax Terms" },
  { title: "Advance Tax", category: "Startup Financial & Tax Terms" },
  { title: "TDS (Tax Deducted at Source)", category: "Startup Financial & Tax Terms" },
  { title: "GST Return (GSTR-1, 3B, etc.)", category: "Startup Financial & Tax Terms" },
  { title: "Form 16A", category: "Startup Financial & Tax Terms" },
  { title: "Profit & Loss Statement", category: "Startup Financial & Tax Terms" },
  { title: "Balance Sheet", category: "Startup Financial & Tax Terms" },
  { title: "Cash Flow", category: "Startup Financial & Tax Terms" },
  { title: "Accounting Period", category: "Startup Financial & Tax Terms" },
  { title: "Financial Year vs Assessment Year", category: "Startup Financial & Tax Terms" },
  { title: "Angel Tax", category: "Startup Financial & Tax Terms" },
  { title: "Tax Audit", category: "Startup Financial & Tax Terms" },
  { title: "Depreciation", category: "Startup Financial & Tax Terms" },
  { title: "Startup India Tax Exemption", category: "Startup Financial & Tax Terms" },
  { title: "DPIIT Recognition", category: "Startup Financial & Tax Terms" },
  // Funding & Equity
  { title: "Pre-money vs Post-money Valuation", category: "Funding, Equity & Cap Table Terms" },
  { title: "SAFE Note", category: "Funding, Equity & Cap Table Terms" },
  { title: "Convertible Note", category: "Funding, Equity & Cap Table Terms" },
  { title: "Seed Round / Series A / B / C", category: "Funding, Equity & Cap Table Terms" },
  { title: "ESOP Pool", category: "Funding, Equity & Cap Table Terms" },
  { title: "Cap Table", category: "Funding, Equity & Cap Table Terms" },
  { title: "Option Pool Shuffle", category: "Funding, Equity & Cap Table Terms" },
  { title: "Equity Dilution", category: "Funding, Equity & Cap Table Terms" },
  { title: "Due Diligence", category: "Funding, Equity & Cap Table Terms" },
  { title: "Drag-Along / Tag-Along", category: "Funding, Equity & Cap Table Terms" },
  { title: "Liquidation Preference", category: "Funding, Equity & Cap Table Terms" },
  { title: "Pro Rata Rights", category: "Funding, Equity & Cap Table Terms" },
  { title: "Exit Clause", category: "Funding, Equity & Cap Table Terms" },
  { title: "Board Rights", category: "Funding, Equity & Cap Table Terms" },
  // Metrics & KPIs
  { title: "ARPU (Average Revenue Per User)", category: "Startup Metrics & KPIs" },
  { title: "MRR / ARR (Monthly / Annual Recurring Revenue)", category: "Startup Metrics & KPIs" },
  { title: "GMV (Gross Merchandise Value)", category: "Startup Metrics & KPIs" },
  { title: "ACV (Annual Contract Value)", category: "Startup Metrics & KPIs" },
  { title: "NPS (Net Promoter Score)", category: "Startup Metrics & KPIs" },
  { title: "DAU / WAU / MAU (User activity metrics)", category: "Startup Metrics & KPIs" },
  { title: "Retention Rate", category: "Startup Metrics & KPIs" },
  { title: "Activation Rate", category: "Startup Metrics & KPIs" },
  { title: "Conversion Rate", category: "Startup Metrics & KPIs" },
  { title: "Payback Period", category: "Startup Metrics & KPIs" },
  { title: "Sales Velocity", category: "Startup Metrics & KPIs" },
  { title: "Gross Margin", category: "Startup Metrics & KPIs" },
];

export const learningTerms: Term[] = terms.map(term => ({
  ...term,
  slug: term.title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
  summary: `An explanation of ${term.title} will be available here soon.`, // Placeholder
}));

// Helper to group terms by category
export const categorizedTerms = learningTerms.reduce((acc, term) => {
  const termWithCategory = terms.find(t => t.title === term.title)!;
  const category = termWithCategory.category;
  if (!acc[category]) {
    acc[category] = [];
  }
  acc[category].push(term);
  return acc;
}, {} as Record<Category, Term[]>);
