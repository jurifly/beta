
export interface LearningTopic {
  slug: string;
  title: string;
  category: 'Company Registration' | 'Tax & Compliance' | 'Funding Basics' | 'Startup Metrics';
  summary: string; // ELI5
  content: string; // Markdown
  furtherReading?: string[]; // slugs of related topics
}

export const learningTopics: LearningTopic[] = [
  // --- Company Registration ---
  {
    slug: 'private-limited-company',
    title: 'Private Limited Company (Pvt Ltd)',
    category: 'Company Registration',
    summary: "Imagine a business that's a separate person. It has its own bank account and can own things. The owners' personal money is safe if the business has problems. It's great for growing big.",
    content: `
A **Private Limited Company** is the most popular corporate entity for startups in India aiming for scale and funding. It's a legal entity separate from its owners (shareholders).

### Key Features
- **Limited Liability**: The personal assets of shareholders are protected. Their liability is limited to the amount of their investment in the company.
- **Separate Legal Entity**: The company is a legal person in the eyes of the law. It can own property, sue, and be sued in its own name.
- **Perpetual Succession**: The company continues to exist even if its owners change or die.
- **Fundraising**: It is the preferred structure for Venture Capital (VC) and Angel investors as it allows for easy issue of equity shares.

### Requirements
- **Directors**: Minimum of 2, maximum of 15.
- **Shareholders**: Minimum of 2, maximum of 200.
- **Capital**: No minimum paid-up capital requirement.
- **Name**: Must end with "Private Limited".
    `,
    furtherReading: ['llp', 'opc'],
  },
  {
    slug: 'llp',
    title: 'Limited Liability Partnership (LLP)',
    category: 'Company Registration',
    summary: "It's like a team project where everyone is a partner. If one person makes a mistake, the others' personal money is still safe. It's easier to run than a big company.",
    content: `
An **LLP** is a hybrid structure that combines the flexibility of a partnership with the limited liability benefits of a company.

### Key Features
- **Limited Liability**: Partners are not personally liable for the debts of the business or the negligence of other partners.
- **Lower Compliance**: Compared to a Private Limited Company, LLPs have fewer compliance requirements and regulations to follow.
- **Flexibility**: The LLP agreement governs the relationship between partners, offering significant flexibility in operations.
- **No Limit on Partners**: An LLP can have any number of partners.

### When to Choose an LLP?
It's often chosen by professional service firms (like CAs, lawyers, architects) or businesses where external equity funding is not a primary goal.
    `,
    furtherReading: ['private-limited-company', 'sole-proprietorship'],
  },
   {
    slug: 'opc',
    title: 'One Person Company (OPC)',
    category: 'Company Registration',
    summary: "This is for a solo superhero running a business. It's like a one-person team, but the business is still a separate legal 'person', so the owner's personal money is safe.",
    content: `
An **OPC** is a type of private company that can be formed with just one member (shareholder) and one director. It was introduced to support solo entrepreneurs who want the benefits of a corporate structure.

### Key Features
- **Single Owner**: Perfect for individual founders.
- **Limited Liability**: Provides the owner with limited liability protection.
- **Separate Legal Entity**: The company has its own legal identity.
- **Nominee Requirement**: An OPC must appoint a nominee who will become the member in case of the original member's death or incapacity.

### Limitations
- An OPC must convert to a Private Limited Company if its paid-up share capital exceeds ₹50 lakhs or its average annual turnover for three consecutive years exceeds ₹2 crores.
- It cannot raise equity funding as easily as a Pvt Ltd company.
    `,
    furtherReading: ['private-limited-company', 'sole-proprietorship'],
  },
  // --- Tax & Compliance ---
  {
    slug: 'gst-basics',
    title: 'GST Basics',
    category: 'Tax & Compliance',
    summary: "Imagine a single 'shopping tax' on almost everything you buy or sell, instead of many different taxes. Businesses collect this tax and give it to the government.",
    content: `
**Goods and Services Tax (GST)** is an indirect tax that has replaced many other indirect taxes in India like excise duty, VAT, and service tax.

### Key Concepts
- **Destination-Based Tax**: GST is levied at the point of consumption.
- **Dual GST Model**: Both the Central government (CGST) and State government (SGST) levy tax on intra-state supplies. For inter-state supplies, the Central government levies an Integrated GST (IGST).
- **Input Tax Credit (ITC)**: This is the backbone of GST. A business can reduce the tax they have paid on inputs from the tax they have to collect on their output. This prevents the 'tax on tax' effect.
- **GSTIN**: A unique 15-digit identification number given to every registered taxpayer.

### When is Registration Mandatory?
- If your aggregate annual turnover exceeds ₹40 lakhs for goods or ₹20 lakhs for services (thresholds may vary for special category states).
- For certain businesses like e-commerce operators, inter-state suppliers, etc., registration is mandatory irrespective of turnover.
    `,
    furtherReading: ['tds-explained'],
  },
  {
    slug: 'tds-explained',
    title: 'TDS Explained',
    category: 'Tax & Compliance',
    summary: "Instead of paying all your income tax at the end of the year, the person paying you (like your boss) cuts a small piece of the tax from your payment and gives it to the government right away.",
    content: `
**Tax Deducted at Source (TDS)** is a mechanism to collect income tax at the source of income itself. The deductor (the person making the payment) is responsible for deducting tax before making the payment to the deductee (the person receiving the payment) and depositing it with the government.

### Common TDS Scenarios
- **Salaries**: Employers deduct TDS from employees' salaries.
- **Interest**: Banks deduct TDS on interest earned on fixed deposits.
- **Rent**: If rent payments exceed a certain threshold, the tenant must deduct TDS.
- **Professional Fees**: Payments made to professionals like consultants, lawyers, or freelancers are subject to TDS.

### Why is it important?
- It ensures a steady flow of revenue for the government.
- It helps in tracking financial transactions.
- For the taxpayer, the amount deducted as TDS can be claimed as a credit against their final tax liability when filing their income tax return.
    `,
    furtherReading: ['gst-basics', 'director-kyc'],
  },
  {
    slug: 'director-kyc',
    title: "Director's KYC (DIR-3 KYC)",
    category: 'Tax & Compliance',
    summary: "Once a year, every company director has to tell the government, 'Yes, I'm still me, and here are my correct details.' It's like renewing your library card to prove you're still an active member.",
    content: `
**DIR-3 KYC** is a mandatory annual compliance requirement for every individual who holds a Director Identification Number (DIN).

### Purpose
The primary purpose is to ensure that the information of directors in the records of the Ministry of Corporate Affairs (MCA) is accurate and up-to-date.

### Who needs to file?
- Every individual who has been allotted a DIN as of the end of the financial year.
- This applies even if the DIN is marked as 'Disqualified'.

### Due Date
- The due date for filing the DIR-3 KYC form is **30th September** of every year.

### Consequences of Non-Filing
- **Penalty**: Failure to file the e-form by the due date results in a flat penalty of **₹5,000**.
- **Deactivation of DIN**: The MCA will mark the DIN as 'Deactivated due to non-filing of DIR-3 KYC'. The director cannot be appointed or continue in any company until the DIN is reactivated after paying the fees.
    `,
    furtherReading: ['private-limited-company'],
  },
  // --- Funding Basics ---
  {
    slug: 'angel-investing',
    title: 'Angel Investing',
    category: 'Funding Basics',
    summary: "Imagine a rich, experienced person who gives a new, small business money to help it grow. In return, they get a small piece of the business. They often give helpful advice too.",
    content: `
An **Angel Investor** is typically a high-net-worth individual who provides financial backing for small startups or entrepreneurs, usually in exchange for ownership equity in the company.

### Key Characteristics
- **Early Stage**: Angel investors usually invest in the very early stages of a company (pre-seed or seed round), often when the business is just an idea or has a basic prototype.
- **Own Money**: Unlike Venture Capitalists who invest other people's money, angels invest their own personal funds.
- **Mentorship**: Many angel investors are successful entrepreneurs themselves and provide valuable mentorship and access to their network, which can be as important as the capital.
- **High Risk, High Reward**: Angel investing is very risky as most startups fail. However, a single successful investment can provide returns of 10x or more.
    `,
    furtherReading: ['venture-capital', 'term-sheet-basics'],
  },
  {
    slug: 'venture-capital',
    title: 'Venture Capital (VC)',
    category: 'Funding Basics',
    summary: "Think of a big company that manages a giant pot of money from many people. They give large chunks of this money to promising young companies that are already growing, in exchange for a piece of that company.",
    content: `
**Venture Capital (VC)** is a form of private equity financing that is provided by venture capital firms or funds to startups, early-stage, and emerging companies that have been deemed to have high growth potential.

### Key Differences from Angel Investing
- **Source of Funds**: VCs invest pooled money from institutional investors (like pension funds, endowments) and high-net-worth individuals in a managed fund.
- **Stage of Investment**: VCs typically invest in slightly later stages than angels (e.g., Series A, B, C), once the company has demonstrated product-market fit and is ready to scale rapidly.
- **Investment Size**: VC investments are generally much larger, often starting from millions of dollars.
- **Involvement**: VCs take a more active role in their portfolio companies, often taking a board seat and providing strategic guidance to ensure growth and a successful exit.
    `,
    furtherReading: ['angel-investing', 'term-sheet-basics'],
  },
  {
    slug: 'term-sheet-basics',
    title: 'Term Sheet Basics',
    category: 'Funding Basics',
    summary: "Before getting a big investment, the startup and the investor write down the main rules of their deal on a short document. It's like agreeing on the rules of a game before you start playing.",
    content: `
A **Term Sheet** is a non-binding agreement that outlines the basic terms and conditions under which an investment will be made. It serves as a template and foundation for the more detailed, legally binding documents that will follow.

### Key Components
- **Valuation**: The agreed-upon worth of the company before the investment (**pre-money valuation**). The **post-money valuation** is the pre-money valuation plus the investment amount.
- **Investment Amount**: The amount of capital the investor will provide.
- **Equity Stake**: The percentage of the company the investor will own in exchange for their investment.
- **Liquidation Preference**: Determines who gets paid first and how much they get paid if the company is sold or liquidated. (e.g., a 1x preference means investors get their money back before other shareholders).
- **Board Seats**: The right of the investor to appoint one or more members to the company's board of directors.
- **Pro-rata Rights**: The right for an investor to maintain their percentage ownership by participating in future funding rounds.
    `,
    furtherReading: ['angel-investing', 'venture-capital'],
  },
  // --- Startup Metrics ---
  {
    slug: 'burn-rate',
    title: 'Burn Rate',
    category: 'Startup Metrics',
    summary: "It's the speed at which your company is spending its money. If you spend more than you earn each month, you are 'burning' through your cash.",
    content: `
**Burn Rate** is the rate at which a company is losing money. It's usually expressed on a monthly basis.

### How to Calculate
There are two types of burn rate:
1.  **Net Burn**: This is the real measure of how much cash your company is losing each month.
    > *Formula*: Net Burn = Monthly Revenue - Monthly Expenses
    (If the result is negative, that's your net burn. If positive, that's your net profit).

2.  **Gross Burn**: This is your total monthly expenses, ignoring revenue. It shows how much it costs to run the company for a month.
    > *Formula*: Gross Burn = Total Monthly Expenses

### Why it Matters
- **Runway**: Burn rate is critical for calculating your company's **runway** (Runway = Total Cash / Net Burn Rate). Runway tells you how many months you can survive before you run out of money.
- **Financial Health**: It's a key indicator of your company's financial discipline and efficiency. A high burn rate can be a red flag for investors.
    `,
    furtherReading: ['cac', 'arr-mrr'],
  },
  {
    slug: 'cac',
    title: 'Customer Acquisition Cost (CAC)',
    category: 'Startup Metrics',
    summary: "This is the total price you pay to get one new customer. It includes all your advertising and marketing costs divided by the number of new customers you got.",
    content: `
**Customer Acquisition Cost (CAC)** is the total cost of sales and marketing efforts required to acquire a new customer.

### How to Calculate
A simple way to calculate CAC is:
> *Formula*: CAC = (Total Sales & Marketing Costs for a Period) / (Number of New Customers Acquired in that Period)

For example, if you spent ₹1,00,000 on sales and marketing in a month and acquired 100 new customers, your CAC is ₹1,000.

### Why it Matters
- **Profitability**: Your business model is only viable if a customer pays you more over their lifetime (LTV) than it costs you to acquire them (CAC).
- **Marketing Efficiency**: Tracking CAC helps you understand which marketing channels are most effective and allows you to optimize your spending. A decreasing CAC over time is a sign of a scalable business.
    `,
    furtherReading: ['ltv', 'burn-rate'],
  },
  {
    slug: 'ltv',
    title: 'Lifetime Value (LTV)',
    category: 'Startup Metrics',
    summary: "This is the total amount of money you expect to make from a single customer during their entire time with your business. A good business makes much more from a customer than it costs to get them.",
    content: `
**Lifetime Value (LTV or CLV - Customer Lifetime Value)** is a metric that represents the total revenue a business can reasonably expect from a single customer account throughout their relationship.

### How to Calculate
A simple LTV calculation for a subscription business is:
> *Formula*: LTV = (Average Revenue Per User, ARPU) / (Customer Churn Rate)

For example, if your average customer pays you ₹2,000 per month and your monthly churn rate is 5% (0.05), your LTV is ₹2000 / 0.05 = ₹40,000.

### Why it Matters
- **LTV:CAC Ratio**: This is one of the most important metrics for a startup. It compares the lifetime value of a customer to the cost of acquiring them. A healthy ratio is typically considered to be 3:1 or higher (the customer is worth at least 3 times what it cost to get them).
- **Strategic Decisions**: LTV helps you make decisions about how much you can afford to spend on marketing, sales, and customer service.
    `,
    furtherReading: ['cac', 'churn-rate'],
  },
  {
    slug: 'arr-mrr',
    title: 'ARR & MRR',
    category: 'Startup Metrics',
    summary: "MRR is the predictable money your business makes every month from subscriptions. ARR is just that number multiplied by 12 to see the yearly amount. It shows how stable your business is.",
    content: `
**MRR (Monthly Recurring Revenue)** and **ARR (Annual Recurring Revenue)** are key metrics for subscription-based businesses (like SaaS companies). They measure the predictable and recurring revenue generated by your active subscriptions.

### MRR (Monthly Recurring Revenue)
MRR is the total of all recurring revenue your business generates in a single month. It only includes predictable revenue, not one-time fees or variable charges.
> *Formula*: MRR = Sum of all monthly subscription fees from active customers.

### ARR (Annual Recurring Revenue)
ARR is simply your MRR multiplied by 12. It represents the recurring revenue on an annualized basis.
> *Formula*: ARR = MRR * 12

### Why They Matter
- **Predictability**: They provide a clear picture of your company's financial stability and growth trajectory.
- **Valuation**: For SaaS companies, ARR is a primary driver of company valuation. Investors look at ARR growth as a key indicator of success.
- **Performance Tracking**: Tracking changes in MRR (new MRR, expansion MRR, churn MRR) helps you understand the health of your customer base.
    `,
    furtherReading: ['churn-rate', 'ltv'],
  },
    {
    slug: 'churn-rate',
    title: 'Churn Rate',
    category: 'Startup Metrics',
    summary: "This is the percentage of customers who stop using your service in a given period (like a month). A low churn rate is good because it means people are happy and sticking around.",
    content: `
**Churn Rate** (also known as attrition rate) measures the percentage of customers who cancel or do not renew their subscriptions during a given time period.

### How to Calculate
> *Formula*: Churn Rate = (Number of Customers Who Churned in a Period) / (Total Number of Customers at the Start of the Period) * 100

For example, if you started the month with 500 customers and 25 of them cancelled, your monthly churn rate is (25 / 500) * 100 = 5%.

### Why it Matters
- **Growth Killer**: High churn can kill a business, even if it's acquiring new customers. It's like trying to fill a leaky bucket.
- **Customer Satisfaction**: Churn is a direct indicator of customer satisfaction and product-market fit. If customers are leaving, it means the product isn't providing enough value.
- **Financial Impact**: Reducing churn has a massive positive impact on LTV and overall revenue, as retaining customers is almost always cheaper than acquiring new ones.
    `,
    furtherReading: ['ltv', 'arr-mrr'],
  },
];

// Helper to group topics by category
export const categorizedTopics = learningTopics.reduce((acc, topic) => {
  const category = topic.category;
  if (!acc[category]) {
    acc[category] = [];
  }
  acc[category].push(topic);
  return acc;
}, {} as Record<LearningTopic['category'], LearningTopic[]>);
