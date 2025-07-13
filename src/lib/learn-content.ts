
export interface Term {
  slug: string;
  title: string;
  summary: string; 
}

export type Category = 
  | 'Startup Basics & Founder\'s Lingo'
  | 'Legal & Compliance (India + Global Friendly)'
  | 'Startup Financial & Tax Terms'
  | 'Funding, Equity & Cap Table Terms'
  | 'Startup Metrics & KPIs';

const terms: { title: string; category: Category, summary: string }[] = [
  // Startup Basics
  { title: "MVP (Minimum Viable Product)", category: "Startup Basics & Founder's Lingo", summary: "The simplest, most basic version of your product you can release to see if people actually want it, before spending too much time and money building everything." },
  { title: "Product-Market Fit", category: "Startup Basics & Founder's Lingo", summary: "That magic moment when you've built something that a specific group of people absolutely love and can't live without. It feels like the market is pulling the product out of you." },
  { title: "Pivot", category: "Startup Basics & Founder's Lingo", summary: "A major change in your business strategy when you realize your original idea isn't working. It's not starting over, but changing direction." },
  { title: "Bootstrapping", category: "Startup Basics & Founder's Lingo", summary: "Building and growing your company using only personal finances or revenue from the business itself, without taking any external investment." },
  { title: "Pitch Deck", category: "Startup Basics & Founder's Lingo", summary: "A brief presentation (usually 10-20 slides) that provides a quick overview of your business plan, product, and vision to potential investors." },
  { title: "Traction", category: "Startup Basics & Founder's Lingo", summary: "Proof that people are buying or using your product. It's the evidence that your startup is growing, like having more users, revenue, or engagement." },
  { title: "Runway", category: "Startup Basics & Founder's Lingo", summary: "The number of months your company can survive before it runs out of money, assuming your income and expenses stay the same. It's your financial timeline." },
  { title: "Burn Rate", category: "Startup Basics & Founder's Lingo", summary: "The speed at which your company is spending money, usually measured per month. If your expenses are higher than your income, that's your burn." },
  { title: "CAC (Customer Acquisition Cost)", category: "Startup Basics & Founder's Lingo", summary: "The total cost of sales and marketing to get one new paying customer. You want this number to be as low as possible." },
  { title: "LTV (Lifetime Value)", category: "Startup Basics & Founder's Lingo", summary: "The total amount of money you expect to make from a single customer over their entire time using your product. You want this to be much higher than your CAC." },
  { title: "TAM / SAM / SOM", category: "Startup Basics & Founder's Lingo", summary: "A way to measure your market size. TAM is the total possible market, SAM is the part you can reach, and SOM is the realistic piece you can capture." },
  { title: "Churn Rate", category: "Startup Basics & Founder's Lingo", summary: "The percentage of customers who stop using your service or cancel their subscription over a certain period. A high churn rate is a big red flag." },
  { title: "GTM (Go-to-Market)", category: "Startup Basics & Founder's Lingo", summary: "Your action plan for how you will reach customers and achieve a competitive advantage. It covers marketing, sales, and distribution." },
  { title: "PMF (Product-Market Fit)", category: "Startup Basics & Founder's Lingo", summary: "Another name for Product-Market Fit. It's the goal of every startup to find this sweet spot where the product and its customers are a perfect match." },
  { title: "Lean Startup", category: "Startup Basics & Founder's Lingo", summary: "A method for building a business by testing your ideas quickly and cheaply. The cycle is: Build a little, Measure the results, Learn from it, and repeat." },
  { title: "Term Sheet", category: "Startup Basics & Founder's Lingo", summary: "A non-binding agreement that outlines the basic terms and conditions of an investment. It's like the 'handshake deal' before the long legal documents are written." },
  { title: "Cliff & Vesting", category: "Startup Basics & Founder's Lingo", summary: "How founders and employees earn their shares over time. Vesting is the earning period, and a 'cliff' is the first milestone (usually one year) you must hit to get any shares at all." },
  { title: "Lead Investor", category: "Startup Basics & Founder's Lingo", summary: "The main investor in a funding round who usually invests the most money, helps negotiate the terms, and often takes a seat on the board of directors." },
  { title: "Dilution", category: "Startup Basics & Founder's Lingo", summary: "When your percentage of ownership in the company decreases because new shares are issued to investors. You own a smaller piece of a (hopefully) much bigger pie." },
  { title: "Angel Investor", category: "Startup Basics & Founder's Lingo", summary: "A wealthy individual who provides capital for a business startup, usually in exchange for ownership equity. They are often the first 'smart money' a startup raises." },
  { title: "Incubator vs Accelerator", category: "Startup Basics & Founder's Lingo", summary: "Both help startups grow, but an incubator is for very early ideas (like a greenhouse for seeds), while an accelerator is for existing startups to grow faster (like a rocket booster)." },
  // Legal & Compliance
  { title: "CIN (Corporate Identification Number)", category: "Legal & Compliance (India + Global Friendly)", summary: "A unique 21-digit number given to every company registered in India. It's like your company's official ID card." },
  { title: "DIN (Director Identification Number)", category: "Legal & Compliance (India + Global Friendly)", summary: "An 8-digit unique ID number that any person must have before they can become a director of a company in India." },
  { title: "GSTIN", category: "Legal & Compliance (India + Global Friendly)", summary: "A 15-digit unique ID for businesses registered under the Goods and Services Tax (GST) system in India. It's needed for all tax-related activities." },
  { title: "NDA (Non-Disclosure Agreement)", category: "Legal & Compliance (India + Global Friendly)", summary: "A legal contract to keep sensitive information confidential. You sign this before sharing your business ideas or data with potential partners, employees, or investors." },
  { title: "Intellectual Property (IP)", category: "Legal & Compliance (India + Global Friendly)", summary: "Creations of the mind, such as inventions, literary and artistic works, designs, and symbols. It's crucial to protect your IP through patents, trademarks, or copyrights." },
  { title: "Bylaws / Operating Agreement", category: "Legal & Compliance (India + Global Friendly)", summary: "The internal rulebook for how your company will be run. It covers things like voting rights, adding new partners, and how profits are distributed." },
  { title: "PAN", category: "Legal & Compliance (India + Global Friendly)", summary: "Permanent Account Number. A 10-character code that acts as the primary tax ID for individuals and companies in India." },
  { title: "ROC Filings", category: "Legal & Compliance (India + Global Friendly)", summary: "Refers to all the mandatory forms and documents that companies must submit to the Registrar of Companies (ROC) every year to stay compliant." },
  { title: "LLP vs Pvt Ltd vs OPC", category: "Legal & Compliance (India + Global Friendly)", summary: "Different types of legal structures for a company. Pvt Ltd is best for raising funds, LLP has simpler compliance, and OPC is for a single founder." },
  { title: "DIR-3 KYC", category: "Legal & Compliance (India + Global Friendly)", summary: "An annual form that every director must file to verify their details (like phone number and email) with the government to keep their DIN active." },
  { title: "MCA Portal", category: "Legal & Compliance (India + Global Friendly)", summary: "The official website of the Ministry of Corporate Affairs in India. It's the main government portal for all company-related filings and information." },
  { title: "Shareholder Agreement", category: "Legal & Compliance (India + Global Friendly)", summary: "A detailed legal contract between all shareholders of a company. It governs their rights, responsibilities, and the rules of how the company is run." },
  { title: "MOA / AOA", category: "Legal & Compliance (India + Global Friendly)", summary: "Memorandum of Association (MOA) and Articles of Association (AOA). These are the two most important documents for a company. MOA defines what the company can do, and AOA defines how it will be run." },
  { title: "ESOP (Employee Stock Ownership Plan)", category: "Legal & Compliance (India + Global Friendly)", summary: "A plan that gives employees the opportunity to own shares in the company. It's a powerful tool to attract and retain talented people." },
  { title: "Board Resolution", category: "Legal & Compliance (India + Global Friendly)", summary: "A formal document that records the major decisions made by the company's Board of Directors during a meeting." },
  { title: "Form 8, 11 (LLP filings)", category: "Legal & Compliance (India + Global Friendly)", summary: "Annual compliance forms for LLPs. Form 11 is the Annual Return, and Form 8 is the Statement of Accounts & Solvency." },
  { title: "Form AOC-4, MGT-7 (Pvt Ltd filings)", category: "Legal & Compliance (India + Global Friendly)", summary: "Annual compliance forms for Private Limited Companies. AOC-4 is for financial statements, and MGT-7 is the Annual Return." },
  { title: "Company Incorporation Process", category: "Legal & Compliance (India + Global Friendly)", summary: "The official process of legally forming a new company. It involves choosing a name, preparing documents like MOA/AOA, and getting a certificate from the government." },
  { title: "Annual Compliance Calendar", category: "Legal & Compliance (India + Global Friendly)", summary: "A schedule of all the important legal and tax deadlines a company must meet throughout the year to avoid penalties." },
  { title: "Compliance Certificate", category: "Legal & Compliance (India + Global Friendly)", summary: "A certificate issued by a professional (like a Company Secretary) confirming that a company has complied with all relevant laws and regulations." },
  { title: "TAN Number", category: "Legal & Compliance (India + Global Friendly)", summary: "Tax Deduction and Collection Account Number. A 10-digit code required for any business that is responsible for deducting or collecting tax (like TDS)." },
  { title: "Registered Office Proof", category: "Legal & Compliance (India + Global Friendly)", summary: "Documents like a rent agreement or utility bill that prove the official address of your company's main office." },
  { title: "Founders Agreement", category: "Legal & Compliance (India + Global Friendly)", summary: "A legal contract between the co-founders of a startup. It outlines their roles, responsibilities, ownership stakes, and what happens if someone leaves." },
  // Financial & Tax
  { title: "Income Tax Slabs (Personal & Corporate)", category: "Startup Financial & Tax Terms", summary: "The different income ranges that determine how much tax you pay. As your income increases, you move into higher tax brackets (slabs) and pay a higher percentage." },
  { title: "Capital Expenditures (CapEx)", category: "Startup Financial & Tax Terms", summary: "Major purchases that will be used in the business for a long time, like machinery, equipment, or property. They are recorded as assets, not immediate expenses." },
  { title: "Operating Expenses (OpEx)", category: "Startup Financial & Tax Terms", summary: "The day-to-day costs of running a business, like salaries, rent, marketing, and utilities. These are deducted from revenue to determine profit." },
  { title: "Profit Margin", category: "Startup Financial & Tax Terms", summary: "A percentage that shows how profitable a company is. It's calculated by dividing profit by revenue. A higher margin is better." },
  { title: "Section 80C / 80D / 10(14)", category: "Startup Financial & Tax Terms", summary: "Sections of the Indian Income Tax Act that allow you to reduce your taxable income by making certain investments (like PPF, ELSS under 80C) or payments (like health insurance under 80D)." },
  { title: "Advance Tax", category: "Startup Financial & Tax Terms", summary: "Paying your income tax in installments throughout the year instead of all at once at the end. It's required if your total tax liability is above a certain limit." },
  { title: "TDS (Tax Deducted at Source)", category: "Startup Financial & Tax Terms", summary: "When a company makes a payment (like salary or professional fees), it must cut a certain percentage as tax (TDS) and pay it to the government on behalf of the person receiving the money." },
  { title: "GST Return (GSTR-1, 3B, etc.)", category: "Startup Financial & Tax Terms", summary: "Monthly or quarterly forms that GST-registered businesses must file to report their sales (GSTR-1) and pay their taxes (GSTR-3B)." },
  { title: "Form 16A", category: "Startup Financial & Tax Terms", summary: "A certificate that shows the TDS deducted on your income (other than salary). It's proof that tax has been deposited with the government on your behalf." },
  { title: "Profit & Loss Statement", category: "Startup Financial & Tax Terms", summary: "A financial report that shows a company's revenues, expenses, and profit (or loss) over a specific period. It tells you if the company made money." },
  { title: "Balance Sheet", category: "Startup Financial & Tax Terms", summary: "A snapshot of a company's financial health at a single point in time. It lists what the company owns (Assets) and what it owes (Liabilities)." },
  { title: "Cash Flow", category: "Startup Financial & Tax Terms", summary: "The movement of money in and out of your company. Positive cash flow means more money is coming in than going out, which is very healthy." },
  { title: "Accounting Period", category: "Startup Financial & Tax Terms", summary: "The specific time frame for which financial statements are prepared, usually a month, a quarter, or a year (e.g., the Financial Year)." },
  { title: "Financial Year vs Assessment Year", category: "Startup Financial & Tax Terms", summary: "Financial Year (FY) is the year you earn the income (e.g., April 1, 2023 - March 31, 2024). Assessment Year (AY) is the year right after, when that income is evaluated and taxed." },
  { title: "Angel Tax", category: "Startup Financial & Tax Terms", summary: "A tax that can be applied to a startup if it raises money from an angel investor at a valuation that the tax authorities think is too high." },
  { title: "Tax Audit", category: "Startup Financial & Tax Terms", summary: "An inspection of a business's tax returns by the tax department to ensure they have paid the correct amount of tax. It's mandatory if your revenue crosses a certain threshold." },
  { title: "Depreciation", category: "Startup Financial & Tax Terms", summary: "The process of reducing the value of an asset (like a laptop or machinery) over time due to wear and tear. This reduction can be claimed as a business expense." },
  { title: "Startup India Tax Exemption", category: "Startup Financial & Tax Terms", summary: "A government scheme where eligible startups can be exempt from paying income tax for three consecutive years out of their first ten years." },
  { title: "DPIIT Recognition", category: "Startup Financial & Tax Terms", summary: "An official recognition certificate from the Department for Promotion of Industry and Internal Trade (DPIIT), which makes a startup eligible for benefits like tax exemptions." },
  // Funding & Equity
  { title: "Pre-money vs Post-money Valuation", category: "Funding, Equity & Cap Table Terms", summary: "Pre-money is the value of your company before investors put money in. Post-money is the pre-money value plus the new investment amount." },
  { title: "SAFE Note", category: "Funding, Equity & Cap Table Terms", summary: "Simple Agreement for Future Equity. A simple contract that allows an investor to give you money now in exchange for shares in your company at a later date, typically during your next funding round." },
  { title: "Convertible Note", category: "Funding, Equity & Cap Table Terms", summary: "A type of short-term loan that converts into equity (shares) at a later date, usually during a future funding round. It's a way for startups to raise money without setting a valuation right away." },
  { title: "Valuation Cap", category: "Funding, Equity & Cap Table Terms", summary: "The maximum company valuation at which a SAFE note or convertible note will convert into equity. It protects early investors from being too diluted in a high-valuation funding round." },
  { title: "Discount Rate", category: "Funding, Equity & Cap Table Terms", summary: "A feature of convertible notes or SAFEs that gives early investors a discount on the share price compared to what later investors pay. A typical discount is 15-20%." },
  { title: "Pre-emptive Rights", category: "Funding, Equity & Cap Table Terms", summary: "Also known as Pro-rata rights. The right for an investor to maintain their percentage of ownership by investing in future funding rounds." },
  { title: "Seed Round / Series A / B / C", category: "Funding, Equity & Cap Table Terms", summary: "The different stages of raising money for a startup. Seed is the very first round, followed by Series A, B, C, and so on as the company grows." },
  { title: "ESOP Pool", category: "Funding, Equity & Cap Table Terms", summary: "A block of company shares (usually 10-15%) set aside to be given to employees as a way to attract and retain talent." },
  { title: "Cap Table", category: "Funding, Equity & Cap Table Terms", summary: "A spreadsheet or table that shows who owns what percentage of your company, including founders, investors, and employees with stock options." },
  { title: "Option Pool Shuffle", category: "Funding, Equity & Cap Table Terms", summary: "A tricky negotiation point during fundraising. It decides whether the ESOP pool is created from the founders' shares (pre-money) or from the combined shares after investment (post-money)." },
  { title: "Equity Dilution", category: "Funding, Equity & Cap Table Terms", summary: "When your percentage of ownership in the company decreases because new shares are issued to investors. You own a smaller piece of a (hopefully) much bigger pie." },
  { title: "Due Diligence", category: "Funding, Equity & Cap Table Terms", summary: "The process of investigation and research that investors do on a startup before they invest money, checking its legal, financial, and business health." },
  { title: "Drag-Along / Tag-Along", category: "Funding, Equity & Cap Table Terms", summary: "Clauses in a shareholder agreement. Drag-Along forces minority shareholders to join in a sale of the company. Tag-Along allows minority shareholders to join a majority shareholder's sale." },
  { title: "Liquidation Preference", category: "Funding, Equity & Cap Table Terms", summary: "A term that gives investors their money back first if the company is sold. A '1x preference' means they get back the amount they invested before anyone else gets paid." },
  { title: "Pro Rata Rights", category: "Funding, Equity & Cap Table Terms", summary: "The right for an investor to maintain their percentage of ownership by investing in future funding rounds." },
  { title: "Exit Clause", category: "Funding, Equity & Cap Table Terms", summary: "A section in an agreement that defines how an investor or founder can sell their shares and leave the company." },
  { title: "Board Rights", category: "Funding, Equity & Cap Table Terms", summary: "The right for an investor to have a seat on the company's Board of Directors, giving them a say in major company decisions." },
  // Metrics & KPIs
  { title: "ARPU (Average Revenue Per User)", category: "Startup Metrics & KPIs", summary: "The average amount of money you make from each user over a certain period. It helps you understand the value of your user base." },
  { title: "MRR / ARR (Monthly / Annual Recurring Revenue)", category: "Startup Metrics & KPIs", summary: "The predictable revenue your startup makes every month (MRR) or year (ARR) from subscriptions. It's the most important metric for SaaS businesses." },
  { title: "Customer Lifetime Value (CLV/LTV)", category: "Startup Metrics & KPIs", summary: "The total amount of money a business expects to earn from a single customer over their entire relationship. You want this to be much higher than your Customer Acquisition Cost (CAC)." },
  { title: "MRR Growth Rate", category: "Startup Metrics & KPIs", summary: "The month-over-month percentage increase in your Monthly Recurring Revenue. It's a key indicator of your startup's growth speed." },
  { title: "Net Revenue Retention (NRR)", category: "Startup Metrics & KPIs", summary: "A percentage that shows how much your revenue has grown or shrunk from your existing customers, including upgrades, downgrades, and churn. Over 100% is excellent." },
  { title: "GMV (Gross Merchandise Value)", category: "Startup Metrics & KPIs", summary: "The total value of all goods and services sold through a marketplace platform. It's a key metric for companies like Amazon or Zomato." },
  { title: "ACV (Annual Contract Value)", category: "Startup Metrics & KPIs", summary: "The average annual value of a customer's contract. It's often used in B2B businesses with long-term contracts." },
  { title: "NPS (Net Promoter Score)", category: "Startup Metrics & KPIs", summary: "A score from -100 to 100 that measures customer loyalty and how likely they are to recommend your product to others." },
  { title: "DAU / WAU / MAU (User activity metrics)", category: "Startup Metrics & KPIs", summary: "Daily, Weekly, or Monthly Active Users. These metrics show how many unique users are engaging with your product in a given timeframe." },
  { title: "Retention Rate", category: "Startup Metrics & KPIs", summary: "The percentage of customers who continue to use your product over time. High retention is a sign of a 'sticky' product that people value." },
  { title: "Activation Rate", category: "Startup Metrics & KPIs", summary: "The percentage of new users who complete a key first action in your product (e.g., creating their first invoice). It shows that users are finding value early." },
  { title: "Conversion Rate", category: "Startup Metrics & KPIs", summary: "The percentage of users who take a desired action, like signing up for a trial, upgrading to a paid plan, or making a purchase." },
  { title: "Payback Period", category: "Startup Metrics & KPIs", summary: "The number of months it takes to earn back the money you spent to acquire a new customer (your CAC). A shorter payback period is better." },
  { title: "Sales Velocity", category: "Startup Metrics & KPIs", summary: "A formula that measures how quickly you're making money. It considers the number of deals, average deal size, and win rate." },
  { title: "Gross Margin", category: "Startup Metrics & KPIs", summary: "The percentage of revenue left after subtracting the direct costs of providing your product or service. A high gross margin is attractive to investors." },
];

export const learningTerms: Term[] = terms.map(term => ({
  slug: term.title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
  title: term.title,
  summary: term.summary,
}));

// Helper to group terms by category
export const categorizedTerms = terms.reduce((acc, term) => {
  const termWithCategory = terms.find(t => t.title === term.title)!;
  const category = termWithCategory.category;
  if (!acc[category]) {
    acc[category] = [];
  }
  acc[category].push({
    slug: term.title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    title: term.title,
    summary: term.summary,
  });
  return acc;
}, {} as Record<Category, Term[]>);
