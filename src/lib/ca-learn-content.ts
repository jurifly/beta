
export interface Term {
  slug: string;
  title: string;
  summary: string; 
}

export type Category = 
  | 'MCA / ROC Compliance & Filings'
  | 'Income Tax & TDS Compliance'
  | 'GST Compliance'
  | 'Company Secretarial Records & Legal Docs'
  | 'Audit & Legal Frameworks'
  | 'Tax & Compliance Laws – Key Sections'
  | 'FEMA & Cross-Border';

const terms: { title: string; category: Category, summary: string }[] = [
  // MCA / ROC Compliance & Filings
  { title: "AOC-4", category: "MCA / ROC Compliance & Filings", summary: "Annual financial statements (Balance Sheet, P&L) filed with the ROC. Due within 30 days of the AGM. Crucial for reporting the company's financial health." },
  { title: "MGT-7 / MGT-7A", category: "MCA / ROC Compliance & Filings", summary: "The company's Annual Return, detailing shareholder structure, directorships, and share capital. MGT-7A is a simplified version for OPCs and Small Companies. Due within 60 days of the AGM." },
  { title: "ADT-1", category: "MCA / ROC Compliance & Filings", summary: "Form for notifying the ROC about the appointment of a statutory auditor. Must be filed within 15 days of the conclusion of the AGM where the auditor was appointed." },
  { title: "INC-20A", category: "MCA / ROC Compliance & Filings", summary: "A mandatory one-time declaration that the company has received its initial subscription capital from shareholders and can now legally commence business operations. Filed within 180 days of incorporation." },
  { title: "SPICE+ Form", category: "MCA / ROC Compliance & Filings", summary: "Simplified Proforma for Incorporating Company Electronically Plus. An integrated web form for company incorporation, offering multiple services (DIN, PAN, TAN, GSTIN) in one application." },
  { title: "RUN (Reserve Unique Name)", category: "MCA / ROC Compliance & Filings", summary: "A web service used to check for and reserve a proposed name for a new company or for a change of name for an existing company before starting the incorporation process." },
  { title: "MGT-14", category: "MCA / ROC Compliance & Filings", summary: "A form filed with the ROC for passing certain special resolutions, such as altering the MOA/AOA, approving related party transactions, or appointing certain directors." },
  { title: "PAS-3", category: "MCA / ROC Compliance & Filings", summary: "Return of Allotment, filed with the ROC whenever new shares are issued. This form must be filed within 15 days of the share allotment date to keep shareholding records updated." },
  { title: "DIR-12", category: "MCA / ROC Compliance & Filings", summary: "Form for intimating any change in the Board of Directors, such as appointments, resignations, or changes in designation. Must be filed within 30 days of the event." },
  { title: "DIR-3 KYC", category: "MCA / ROC Compliance & Filings", summary: "An annual KYC (Know Your Customer) process for every individual holding a Director Identification Number (DIN). Required to be filed by 30th September each year to keep the DIN active." },
  { title: "SH-7", category: "MCA / ROC Compliance & Filings", summary: "Form filed with the ROC to notify any changes in the company's authorized share capital. This must be done within 30 days of the shareholder resolution." },
  { title: "SH-8 / SH-9 / SH-11", category: "MCA / ROC Compliance & Filings", summary: "A set of forms related to the buyback of shares by a company. They cover the letter of offer (SH-8), declaration of solvency (SH-9), and return of buyback (SH-11)." },
  { title: "DPT-3", category: "MCA / ROC Compliance & Filings", summary: "An annual return of deposits that every company must file to declare details of any money or loans received. Filed by 30th June each year." },
  { title: "MSME Form 1", category: "MCA / ROC Compliance & Filings", summary: "A half-yearly return for reporting outstanding payments due to Micro and Small Enterprises for more than 45 days. Filed by end of April and October." },
  { title: "Form 11 (LLP)", category: "MCA / ROC Compliance & Filings", summary: "The Annual Return for a Limited Liability Partnership (LLP), containing details of partners and their contributions. Due by 30th May each year." },
  { title: "Form 8 (LLP)", category: "MCA / ROC Compliance & Filings", summary: "The Statement of Account & Solvency for an LLP, effectively its annual financial statements. Due by 30th October each year." },
  { title: "CHG-1 / CHG-4 / CHG-6", category: "MCA / ROC Compliance & Filings", summary: "Forms related to charges (like loans against assets). CHG-1 is for creating or modifying a charge, CHG-4 for its satisfaction (repayment), and CHG-6 for registering a charge for debentures." },
  { title: "MBP-1 / DIR-8", category: "MCA / ROC Compliance & Filings", summary: "Declarations by directors. MBP-1 discloses a director's interest in other entities. DIR-8 is a declaration that the director is not disqualified. These are presented at board meetings." },
  { title: "Strike Off (STK-2)", category: "MCA / ROC Compliance & Filings", summary: "The process of removing a company's name from the Register of Companies. Form STK-2 is filed for voluntary strike-off by a defunct company." },
  { title: "XBRL Filings", category: "MCA / ROC Compliance & Filings", summary: "eXtensible Business Reporting Language. A standardized format for filing financial statements, mandatory for certain classes of companies based on turnover, paid-up capital, or listing status." },
  
  // Income Tax & TDS Compliance
  { title: "ITR-5 / ITR-6", category: "Income Tax & TDS Compliance", summary: "Income Tax Return forms. ITR-5 is for LLPs and partnership firms. ITR-6 is for companies. Due by 31st October for companies requiring an audit." },
  { title: "26AS", category: "Income Tax & TDS Compliance", summary: "An annual consolidated tax statement that shows details of tax deducted at source (TDS), tax collected at source (TCS), and advance tax paid. It can be accessed from the income tax portal." },
  { title: "Form 16 / 16A", category: "Income Tax & TDS Compliance", summary: "TDS Certificates. Form 16 is issued by an employer to an employee for tax deducted on salary. Form 16A is for tax deducted on other types of income (e.g., professional fees, rent)." },
  { title: "Section 194Q", category: "Income Tax & TDS Compliance", summary: "TDS on purchase of goods. Applicable to buyers with turnover > ₹10 crore, requiring them to deduct TDS on purchases exceeding ₹50 lakh from a single supplier." },
  { title: "Section 206C(1H)", category: "Income Tax & TDS Compliance", summary: "TCS on sale of goods. Requires sellers with turnover > ₹10 crore to collect Tax at Source (TCS) on sales receipts exceeding ₹50 lakh from a single buyer." },
  { title: "Form 15CA/CB", category: "Income Tax & TDS Compliance", summary: "Forms required for making payments to non-residents. 15CA is a declaration by the remitter, and 15CB is a certificate from a CA verifying tax compliance of the remittance." },
  { title: "24Q / 26Q / 27Q / 27EQ", category: "Income Tax & TDS Compliance", summary: "Quarterly TDS/TCS return forms. 24Q is for salary TDS, 26Q for non-salary TDS, 27Q for payments to non-residents, and 27EQ for Tax Collected at Source (TCS)." },
  { title: "TDS under Section 194C / 194J / 194H / 194A", category: "Income Tax & TDS Compliance", summary: "Refers to the requirement to deduct tax on specific payments: 194C (Contractors), 194J (Professional/Technical Fees), 194H (Commission/Brokerage), 194A (Interest)." },
  { title: "Advance Tax", category: "Income Tax & TDS Compliance", summary: "The requirement to pay income tax in installments throughout the year, rather than as a lump sum at the end. Due dates are June 15, Sep 15, Dec 15, and Mar 15." },
  { title: "Section 44AB", category: "Income Tax & TDS Compliance", summary: "This section of the Income Tax Act mandates a tax audit for businesses whose turnover exceeds ₹1 crore or professionals whose gross receipts exceed ₹50 lakh in a financial year." },
  { title: "Form 3CD", category: "Income Tax & TDS Compliance", summary: "The detailed statement of particulars required to be furnished along with the tax audit report under Section 44AB. It has numerous clauses covering all aspects of the business." },
  { title: "Form 10IE / 10IF", category: "Income Tax & TDS Compliance", summary: "Forms used to opt-in or opt-out of the New Tax Regime. Form 10-IE is for individuals and HUFs with business income, while 10-IF is for companies and firms." },
  { title: "MAT / AMT", category: "Income Tax & TDS Compliance", summary: "Minimum Alternate Tax (MAT) for companies and Alternate Minimum Tax (AMT) for LLPs. A way to ensure companies with large profits and zero tax liability (due to exemptions) pay a minimum amount of tax." },
  { title: "Tax on ESOP", category: "Income Tax & TDS Compliance", summary: "ESOPs are taxed as a 'perquisite' at the time of exercise (allotment). The taxable amount is the difference between the Fair Market Value (FMV) of the share and the exercise price paid by the employee." },
  { title: "SFT (Statement of Financial Transaction)", category: "Income Tax & TDS Compliance", summary: "A report that specified entities like banks and registrars must file, detailing high-value transactions undertaken by individuals. Used by the IT department to track financial activities." },
  { title: "Transfer Pricing", category: "Income Tax & TDS Compliance", summary: "Rules that ensure transactions between related international entities are priced at 'arm's length' (as if they were unrelated parties), to prevent tax evasion through cross-border transactions." },

  // GST Compliance
  { title: "GSTR-1", category: "GST Compliance", summary: "A monthly or quarterly return filed to report the details of all outward supplies (sales) of goods and services. Due by the 11th of the following month for monthly filers." },
  { title: "GSTR-3B", category: "GST Compliance", summary: "A monthly summary return for calculating and paying the net GST liability after claiming Input Tax Credit (ITC). Due by the 20th of the following month." },
  { title: "GSTR-2B", category: "GST Compliance", summary: "An auto-drafted, static Input Tax Credit (ITC) statement. It shows the ITC available to a business based on the GSTR-1 returns filed by its suppliers." },
  { title: "GSTR-9 / 9C", category: "GST Compliance", summary: "Annual returns. GSTR-9 is the consolidated annual return for all monthly/quarterly returns. GSTR-9C is a reconciliation statement between the audited financial statements and GSTR-9, certified by a CA/CMA." },
  { title: "Input Service Distributor (ISD)", category: "GST Compliance", summary: "An office of a business which receives tax invoices for services used by its branches. It distributes the Input Tax Credit (ITC) to the branches on a proportional basis." },
  { title: "Block Credits (Section 17(5))", category: "GST Compliance", summary: "A specific list of goods and services on which Input Tax Credit (ITC) cannot be claimed, such as motor vehicles (with exceptions), food and beverages, and club memberships." },
  { title: "GSTR-7 / GSTR-8", category: "GST Compliance", summary: "Monthly returns for specific taxpayers. GSTR-7 is for entities required to deduct TDS under GST. GSTR-8 is for e-commerce operators required to collect TCS." },
  { title: "CMP-08", category: "GST Compliance", summary: "A quarterly statement-cum-challan for taxpayers who have opted for the Composition Scheme to declare their tax liability. Due by the 18th of the month following the quarter." },
  { title: "ITC-04", category: "GST Compliance", summary: "A return to be filed by a manufacturer for goods sent to or received from a job worker. It needs to be filed quarterly or half-yearly depending on turnover." },
  { title: "GST LUT Filing", category: "GST Compliance", summary: "A Letter of Undertaking (LUT) filed by exporters, allowing them to export goods or services without paying IGST. It must be renewed annually." },
  { title: "HSN Summary", category: "GST Compliance", summary: "A mandatory summary of Harmonized System of Nomenclature (HSN) codes for goods and services supplied, which must be reported in GSTR-1. The level of detail depends on turnover." },
  { title: "E-Invoicing", category: "GST Compliance", summary: "The system of electronically authenticating B2B invoices with the GST Network (GSTN). It's mandatory for businesses with an annual turnover exceeding ₹5 crore." },
  { title: "RCM", category: "GST Compliance", summary: "Reverse Charge Mechanism. A system where the recipient of goods/services is liable to pay GST, instead of the supplier. This applies to specific notified services." },
  { title: "GST Audit (GSTR-9C)", category: "GST Compliance", summary: "An audit that reconciles a taxpayer's annual returns with their audited financial statements. Mandatory for taxpayers with an aggregate turnover exceeding ₹5 crore." },
  { title: "Place of Supply", category: "GST Compliance", summary: "The rules that determine whether a transaction is intra-state (liable to CGST+SGST) or inter-state (liable to IGST). Critical for correct tax calculation." },

  // Company Secretarial Records & Legal Docs
  { title: "Board Resolutions", category: "Company Secretarial Records & Legal Docs", summary: "The official record of decisions made by the Board of Directors. Essential for actions like opening bank accounts, authorizing loans, allotting shares, and approving financial statements." },
  { title: "Founders' Agreement", category: "Company Secretarial Records & Legal Docs", summary: "A crucial internal document between co-founders that outlines ownership, roles, responsibilities, decision-making processes, and exit clauses. Not mandatory but highly recommended." },
  { title: "Shareholders Agreement", category: "Company Secretarial Records & Legal Docs", summary: "A legally binding contract between the company and its shareholders. It defines shareholder rights, protections (like tag-along/drag-along), and governs the relationship between them." },
  { title: "MOA / AOA", category: "Company Secretarial Records & Legal Docs", summary: "The two foundational constitutional documents of a company. The Memorandum of Association (MOA) defines its objectives, while the Articles of Association (AOA) contain the internal rules for its management." },
  { title: "Statutory Registers", category: "Company Secretarial Records & Legal Docs", summary: "A set of mandatory registers a company must maintain, including Register of Members (MGT-1), Directors (MBP-4), Charges (CHG-7), and Loans/Investments (MBP-2)." },
  { title: "Secretarial Standards (SS-1, SS-2)", category: "Company Secretarial Records & Legal Docs", summary: "Guidelines issued by ICSI for conducting Board meetings (SS-1) and General meetings (SS-2). Adherence is mandatory and ensures good governance." },
  { title: "Minutes: Board, AGM, EGM", category: "Company Secretarial Records & Legal Docs", summary: "The official written record of the proceedings of meetings (Board Meetings, Annual General Meetings, Extraordinary General Meetings). They are legal proof of the decisions taken." },
  { title: "Director Declarations (MBP-1, DIR-8)", category: "Company Secretarial Records & Legal Docs", summary: "Annual declarations required from directors. MBP-1 discloses their interest in other companies/firms. DIR-8 confirms they are not disqualified from being a director." },
  { title: "Share Certificates", category: "Company Secretarial Records & Legal Docs", summary: "A formal document issued by a company that serves as legal proof of ownership of the number of shares indicated. Must be issued within two months of allotment." },
  { title: "ESOP Agreement / Grant Letter", category: "Company Secretarial Records & Legal Docs", summary: "The legal documents governing the Employee Stock Option Plan. The Agreement sets the scheme rules, while the Grant Letter is issued to individual employees detailing their specific grant." },
  { title: "Transfer Forms (SH-4)", category: "Company Secretarial Records & Legal Docs", summary: "A standard form prescribed under the Companies Act for the transfer of physical shares from one person to another. It acts as a deed of transfer." },
  { title: "Certificate of Incorporation", category: "Company Secretarial Records & Legal Docs", summary: "The legal document issued by the Registrar of Companies that brings the company into existence. It's the company's birth certificate." },
  { title: "Compliance Certificate (Form MGT-8)", category: "Company Secretarial Records & Legal Docs", summary: "A certificate issued by a practicing Company Secretary, confirming that the company has complied with all provisions of the Companies Act. Required for certain large companies." },

  // Audit & Legal Frameworks
  { title: "CARO 2020", category: "Audit & Legal Frameworks", summary: "Companies (Auditor's Report) Order, 2020. A set of specific matters on which the statutory auditor must report, providing greater transparency on the company's affairs. Applicable to most companies." },
  { title: "SA 700 / SA 705 / SA 706", category: "Audit & Legal Frameworks", summary: "Standards on Auditing that dictate the format and content of an auditor's report. SA 700 (Unmodified Opinion), SA 705 (Modified Opinion), and SA 706 (Emphasis of Matter/Other Matter paragraphs)." },
  { title: "Internal Financial Controls (IFC)", category: "Audit & Legal Frameworks", summary: "Policies and procedures adopted by a company to ensure the reliability of financial reporting, efficiency of operations, and compliance with laws. Auditors are required to report on the adequacy of IFC." },
  { title: "Section 138 of Companies Act", category: "Audit & Legal Frameworks", summary: "Mandates the appointment of an internal auditor for certain classes of companies, such as listed companies, and public/private companies exceeding specific turnover or borrowing thresholds." },
  { title: "CSR Section 135", category: "Audit & Legal Frameworks", summary: "Mandates Corporate Social Responsibility for companies with a net worth of ₹500 Cr+, turnover of ₹1000 Cr+, or net profit of ₹5 Cr+. They must spend 2% of average net profits." },
  { title: "Rule 11 of Audit Rules", category: "Audit & Legal Frameworks", summary: "Specifies other matters to be included in the auditor’s report, such as reporting on management's view on the impact of pending litigations on its financial position." },
  { title: "Audit Trail Notification", category: "Audit & Legal Frameworks", summary: "A mandatory MCA rule effective from April 2023, requiring companies to use accounting software that records an audit trail (edit log) for every transaction." },
  { title: "Related Party Transactions", category: "Audit & Legal Frameworks", summary: "Transactions between a company and its related parties (e.g., directors, their relatives). These require specific approvals (Board/Shareholder) and detailed disclosures in financial statements." },
  { title: "Secretarial Audit (Sec 204)", category: "Audit & Legal Frameworks", summary: "An audit to check compliance with various corporate and other applicable laws. Mandatory for every listed company and certain other large public companies." },
  { title: "Cost Audit", category: "Audit & Legal Frameworks", summary: "An audit of the cost records of certain companies, primarily in the manufacturing and production sectors, as specified by the Central Government." },
  { title: "Due Diligence (Financial/Legal)", category: "Audit & Legal Frameworks", summary: "A comprehensive investigation into a company's affairs, typically conducted before a merger, acquisition, or investment, to verify information and assess risks." },
  { title: "Generally Accepted Accounting Principles (GAAP)", category: "Audit & Legal Frameworks", summary: "A common set of accounting principles, standards, and procedures that companies and their accountants must follow when they compile their financial statements." },
  
  // Tax & Compliance Laws – Key Sections
  { title: "Companies Act, 2013", category: "Tax & Compliance Laws – Key Sections", summary: "Key Sections: 2 (Definitions), 62 (Further Issue of Share Capital), 92 (Annual Return), 123 (Declaration of Dividend), 129 (Financial Statement), 139 (Appointment of Auditors), 149 (Company to have Board of Directors), 173 (Meetings of Board), 184 (Disclosure of interest by director)." },
  { title: "Income Tax Act", category: "Tax & Compliance Laws – Key Sections", summary: "Key Sections: 44AB (Tax Audit), 80C (Deductions), 10(38) (LTCG Exemption - now amended), 194C (TDS on Contractors), 194J (TDS on Professional Fees), 56(2)(viib) (Angel Tax)." },
  { title: "DPDP Act, 2023", category: "Tax & Compliance Laws – Key Sections", summary: "The Digital Personal Data Protection Act, 2023. India's data privacy law governing the processing of digital personal data, outlining principles of consent, purpose limitation, and data minimization." },
  { title: "GST Act", category: "Tax & Compliance Laws – Key Sections", summary: "Key Sections: 9 (Levy and Collection), 16 (Eligibility for ITC), 17 (Apportionment of credit), 22 (Persons liable for registration), 24 (Compulsory registration), 31 (Tax invoice), 34 (Credit/Debit notes), 54 (Refunds)." },
  { title: "LLP Act, 2008", category: "Tax & Compliance Laws – Key Sections", summary: "Key Sections: 11 (Incorporation document), 25 (Registration of changes in partners), 34 (Maintenance of books of account, other records and audit, etc.)." },
  { title: "FEMA Regulations", category: "Tax & Compliance Laws – Key Sections", summary: "Key regulations related to Foreign Exchange Management Act: ODI (Overseas Direct Investment), FDI (Foreign Direct Investment), and ECB (External Commercial Borrowings) returns and compliance." },
  { title: "Negotiable Instruments Act, 1881", category: "Tax & Compliance Laws – Key Sections", summary: "The law governing instruments like cheques, promissory notes, and bills of exchange. Section 138 deals with the dishonour of cheques, a common issue for businesses." },
  { title: "Insolvency and Bankruptcy Code, 2016", category: "Tax & Compliance Laws – Key Sections", summary: "The framework that governs the insolvency and bankruptcy process for companies and individuals, providing a time-bound resolution process." },

  // FEMA & Cross-Border
  { title: "FDI (Foreign Direct Investment)", category: "FEMA & Cross-Border", summary: "Investment made by a foreign entity into an Indian company. Governed by specific sectoral caps and entry routes (Automatic vs. Approval)." },
  { title: "ODI (Overseas Direct Investment)", category: "FEMA & Cross-Border", summary: "Investment made by an Indian entity into a foreign entity. Subject to reporting and net worth criteria under FEMA." },
  { title: "ECB (External Commercial Borrowings)", category: "FEMA & Cross-Border", summary: "Loans raised by eligible Indian entities from non-resident lenders. Must comply with RBI regulations on amount, maturity, and end-use." },
  { title: "FLA Return", category: "FEMA & Cross-Border", summary: "Foreign Liability and Asset return. A mandatory annual filing with the RBI for all Indian entities that have received FDI or made overseas investments. Due by 15th July." },
  { title: "Form FC-GPR", category: "FEMA & Cross-Border", summary: "A form that an Indian company must file with the RBI within 30 days of issuing shares to a person resident outside India." },
  { title: "Form FC-TRS", category: "FEMA & Cross-Border", summary: "A form filed for the transfer of shares of an Indian company between a resident and a non-resident. Must be filed within 60 days of the transfer." },
  { title: "DTAA (Double Taxation Avoidance Agreement)", category: "FEMA & Cross-Border", summary: "A tax treaty between two or more countries to help taxpayers avoid paying double taxes on the same income." },
];

export const caLearningTerms: Term[] = terms.map(term => ({
  slug: term.title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
  title: term.title,
  summary: term.summary,
}));

export const caCategorizedTerms = terms.reduce((acc, term) => {
  const category = term.category;
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

    
