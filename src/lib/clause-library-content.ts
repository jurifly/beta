
import type { Clause } from './types';

export const allClauses: Clause[] = [
  // Company Formation / Governance Clauses
  {
    id: 'gov_1',
    title: 'Registered Office Clause',
    category: 'Company Formation',
    content: 'The registered office of the company will be situated in the State of [State], India.',
    description: 'Specifies the legal address of the company.',
    useCase: 'Required during incorporation and for ROC filings.',
    relevantSection: 'Section 12, Companies Act, 2013',
    editableFields: ['[Company Name]', '[Address]', '[Date]'],
  },
  {
    id: 'gov_2',
    title: 'Main Object Clause',
    category: 'Governance',
    content: 'The main objects to be pursued by the company on its incorporation are: [Main Business Activity].',
    description: 'Declares the primary business activities.',
    useCase: 'Included in MOA to define scope of operations.',
    relevantSection: 'Section 4(1)(c), Companies Act, 2013',
    editableFields: ['[Business Activity]', '[Sector]', '[Company Name]'],
  },
  {
    id: 'gov_3',
    title: 'Name Clause (Change of Name)',
    category: 'Compliance',
    content: 'The name of the company is [New Name], which was changed from [Old Name] with effect from [Effective Date].',
    description: 'Allows for changing the legal name of the entity.',
    useCase: 'Used in case of rebranding or merger.',
    relevantSection: 'Section 13(2), Companies Act, 2013',
    editableFields: ['[Old Name]', '[New Name]', '[Effective Date]'],
  },
  {
    id: 'gov_4',
    title: 'Liability Clause (Limited by Shares)',
    category: 'Legal Structure',
    content: 'The liability of the members is limited to the amount, if any, unpaid on the shares respectively held by them.',
    description: 'Limits the liability of shareholders.',
    useCase: 'Essential for private/public companies limited by shares.',
    relevantSection: 'Section 4(1)(d), Companies Act, 2013',
    editableFields: ['[Company Type]'],
  },
  {
    id: 'gov_5',
    title: 'Share Capital Clause',
    category: 'Governance',
    content: 'The authorized share capital of the company is [Amount] Rupees, divided into [Number of Shares] equity shares of [Nominal Value] Rupees each.',
    description: 'Details authorized and paid-up share capital.',
    useCase: 'Required in MOA and ROC filings.',
    relevantSection: 'Section 43 & 44, Companies Act, 2013',
    editableFields: ['[Amount]', '[Share Type]', '[Nominal Value]'],
  },
  {
    id: 'gov_6',
    title: 'Alteration of MOA/AOA Clause',
    category: 'Legal',
    content: 'Pursuant to a special resolution passed by the members, [Article Number] of the Articles of Association is hereby altered to include the following: [Change Description].',
    description: 'Framework for modifying constitutional documents.',
    useCase: 'Mergers, expansions, or strategic shifts.',
    relevantSection: 'Sections 13 & 14, Companies Act, 2013',
    editableFields: ['[Article Number]', '[Change Description]'],
  },
  {
    id: 'gov_7',
    title: 'Board Meeting Notice Clause',
    category: 'Governance',
    content: 'A meeting of the Board of Directors shall be held by giving not less than [Notice Period] days notice in writing to every director at his address registered with the company via [Mode of Delivery].',
    description: 'Specifies procedure and notice period for board meetings.',
    useCase: 'Board communication protocols.',
    relevantSection: 'Section 173, Companies Act, 2013',
    editableFields: ['[Notice Period]', '[Mode of Delivery]'],
  },
  {
    id: 'gov_8',
    title: 'Quorum Requirement Clause',
    category: 'Meetings',
    content: 'The quorum for a meeting of the Board of Directors shall be [Number/Percentage of Members] of its total strength or two directors, whichever is higher.',
    description: 'Sets the minimum number of members required for a meeting.',
    useCase: 'Prevents decisions without representation.',
    relevantSection: 'Section 174, Companies Act, 2013',
    editableFields: ['[Number/Percentage of Members]'],
  },
  {
    id: 'gov_9',
    title: 'Voting Rights Clause',
    category: 'Corporate Governance',
    content: 'Subject to any rights or restrictions for the time being attached to any class or classes of shares, on a show of hands every member present in person shall have one vote, and upon a poll each member shall have [Vote Weightage] for each share of [Class of Shares] of which he is the holder.',
    description: 'Details voting power per shareholder/class.',
    useCase: 'During AGMs, resolutions.',
    relevantSection: 'Section 47, Companies Act, 2013',
    editableFields: ['[Class of Shares]', '[Vote Weightage]'],
  },
  {
    id: 'gov_10',
    title: 'Indemnity Clause for Directors',
    category: 'Risk & Legal',
    content: 'The company shall indemnify director [Director Name] for any liabilities incurred by him in defending any proceedings, up to a maximum of [Indemnity Cap], whether civil or criminal, in which judgment is given in his favor or in which he is acquitted or in connection with any application under section 463 in which relief is granted to him by the Court.',
    description: 'Protects directors from liabilities for acts done in good faith.',
    useCase: 'In director agreements.',
    relevantSection: 'Section 197(13), Companies Act, 2013',
    editableFields: ['[Director Name]', '[Indemnity Cap]'],
  },

  // Employment & HR Clauses
  {
    id: 'hr_1',
    title: 'Non-Compete Clause',
    category: 'Employment & HR',
    content: 'For a period of [Time Period] after the termination of employment, the Employee shall not, directly or indirectly, engage in, or have any ownership interest in, any business that competes with the Company within the [Industry] sector in [Geography].',
    description: 'Restricts employee from working with competitors.',
    useCase: 'Included in employment contracts.',
    relevantSection: 'Enforced under Contract Act, 1872 – Section 27 (subject to reasonable limits)',
    editableFields: ['[Time Period]', '[Geography]', '[Industry]'],
  },
  {
    id: 'hr_2',
    title: 'Non-Solicitation Clause',
    category: 'Employment & HR',
    content: 'During the term of employment and for [Duration] thereafter, the Employee shall not solicit or attempt to solicit any business from any of the Company’s clients specified in [Client List], nor entice away any employee of the Company.',
    description: 'Prevents employees from soliciting clients or team post-exit.',
    useCase: 'Exit agreements.',
    relevantSection: 'Contract Act, 1872 – Common law principle',
    editableFields: ['[Duration]', '[Scope]', '[Client List]'],
  },
  {
    id: 'hr_3',
    title: 'Termination Clause',
    category: 'Employment & HR',
    content: 'This agreement may be terminated by either party by giving [Notice Period] in writing. The Company reserves the right to terminate this agreement without notice in case of [Termination Grounds]. A severance payment of [Severance] may be applicable.',
    description: 'Governs termination notice, conditions, and grounds.',
    useCase: 'Employment agreement.',
    relevantSection: 'Labour Laws + Shops & Establishaments Act',
    editableFields: ['[Notice Period]', '[Severance]', '[Termination Grounds]'],
  },
  {
    id: 'hr_4',
    title: 'Confidentiality Clause',
    category: 'Employment & HR',
    content: 'The Employee shall not, during or after the term of [Term], disclose any confidential information, including but not limited to [Scope], to any third party without the prior written consent of the Company. Breach of this clause may result in [Penalties].',
    description: 'Protects business information.',
    useCase: 'Employment, NDA, vendor contracts.',
    relevantSection: 'Contract Act, 1872',
    editableFields: ['[Scope]', '[Term]', '[Penalties]'],
  },
  {
    id: 'hr_5',
    title: 'Probation Clause',
    category: 'Employment & HR',
    content: 'The Employee will be on probation for a period of [Probation Period]. Confirmation of employment is subject to [Conditions].',
    description: 'Defines period of performance evaluation.',
    useCase: 'Employee onboarding.',
    relevantSection: 'Labour Law framework',
    editableFields: ['[Probation Period]', '[Conditions]'],
  },
  {
    id: 'hr_6',
    title: 'ESOP Vesting Clause',
    category: 'Employment & HR',
    content: 'The stock options granted shall vest over a period of [Vesting Years] years, with a one-year cliff. Following the cliff, the remaining options shall vest on a monthly/quarterly basis. Vesting may be subject to [Accelerators].',
    description: 'Specifies vesting schedule of ESOPs.',
    useCase: 'ESOP policy docs.',
    relevantSection: 'Rule 12, Companies (Share Capital and Debentures) Rules, 2014',
    editableFields: ['[Vesting Years]', '[Cliff]', '[Accelerators]'],
  },
  {
    id: 'hr_7',
    title: 'Severance Clause',
    category: 'Employment & HR',
    content: 'Upon termination under [Triggers], the employee shall be entitled to a severance payment amounting to [Amount].',
    description: 'Defines compensation on exit.',
    useCase: 'Executive contracts.',
    relevantSection: 'Labour Law',
    editableFields: ['[Amount]', '[Triggers]'],
  },
  {
    id: 'hr_8',
    title: 'Leave & Holiday Policy Clause',
    category: 'Employment & HR',
    content: 'The employee is entitled to [Days] of [Types of Leave] annually, in accordance with the Shops and Establishments Act of [State].',
    description: 'Specifies leave entitlements and national holidays. Note: Leave and holiday rules often vary by state in India, and businesses should ensure compliance with the respective State Shops and Establishments Act.',
    useCase: 'Employee Handbook.',
    relevantSection: 'Shops and Establishments Act',
    editableFields: ['[Days]', '[Types of Leave]', '[State]'],
  },
  {
    id: 'hr_9',
    title: 'Gratuity & Bonus Clause',
    category: 'Employment & HR',
    content: 'Gratuity and bonus shall be payable based on [Eligibility] as per the [Formula] and subject to a cap of [Cap], in accordance with the Payment of Gratuity Act, 1972 and Bonus Act.',
    description: 'Covers mandatory gratuity and bonuses.',
    useCase: 'Full & Final Settlements.',
    relevantSection: 'Payment of Gratuity Act, 1972; Bonus Act',
    editableFields: ['[Eligibility]', '[Formula]', '[Cap]'],
  },
  {
    id: 'hr_10',
    title: 'Disciplinary Action Clause',
    category: 'Employment & HR',
    content: 'In case of [Grounds], the company may take disciplinary action of type [Action Type], following the [Escalation] procedure.',
    description: 'Defines disciplinary actions for employee misconduct.',
    useCase: 'Policy Handbook.',
    relevantSection: 'Internal HR Policy / Industrial Disputes Act',
    editableFields: ['[Action Type]', '[Grounds]', '[Escalation]'],
  },

  // Financial & Audit Clauses
  {
    id: 'fin_1',
    title: 'Statutory Auditor Appointment Clause',
    category: 'Financial & Audit',
    content: 'RESOLVED THAT pursuant to the provisions of Section 139 of the Companies Act, 2013, [Auditor Name], Chartered Accountants, be and are hereby appointed as Statutory Auditors of the Company to hold office for a term of [Term] from [Appointment Date].',
    description: 'Outlines the appointment of statutory auditors by the board or shareholders.',
    useCase: 'Annual general meetings, ROC filings.',
    relevantSection: 'Section 139, Companies Act, 2013',
    editableFields: ['[Auditor Name]', '[Term]', '[Appointment Date]'],
  },
  {
    id: 'fin_2',
    title: 'Books of Accounts Maintenance Clause',
    category: 'Financial & Audit',
    content: 'The books of account & other relevant books & papers of the company shall be kept at the Registered office of the company at [Office Location], maintained in [Accounting Software], and reported with a frequency of [Reporting Frequency].',
    description: 'Mandates accurate maintenance of books of accounts.',
    useCase: 'Financial records, audits.',
    relevantSection: 'Section 128, Companies Act, 2013',
    editableFields: ['[Office Location]', '[Accounting Software]', '[Reporting Frequency]'],
  },
  {
    id: 'fin_3',
    title: 'Internal Financial Control Clause',
    category: 'Financial & Audit',
    content: 'The company shall establish and maintain internal financial controls over [Control Areas], with [Reporting Authority] responsible for reporting on their effectiveness with a frequency of [Frequency].',
    description: 'Ensures proper financial controls and checks.',
    useCase: 'Internal audit reports, risk management.',
    relevantSection: 'Section 134(5)(e), Companies Act, 2013',
    editableFields: ['[Control Areas]', '[Reporting Authority]', '[Frequency]'],
  },
  {
    id: 'fin_4',
    title: 'Audit Committee Powers Clause',
    category: 'Financial & Audit',
    content: 'The [Committee Name] shall have the power to [Scope] and shall follow the [Reporting Mechanism] for all its findings.',
    description: 'Grants specific powers to the audit committee.',
    useCase: 'Board committee charters.',
    relevantSection: 'Section 177, Companies Act, 2013',
    editableFields: ['[Committee Name]', '[Scope]', '[Reporting Mechanism]'],
  },
  {
    id: 'fin_5',
    title: 'Cash Handling Clause',
    category: 'Financial & Audit',
    content: 'All cash transactions exceeding [Cash Limit] must be approved by [Custodian]. The company shall implement [Security Measures] for handling cash.',
    description: 'Governs procedures for safe cash transactions.',
    useCase: 'Retail, logistics, or multi-location businesses.',
    relevantSection: 'Company internal policy aligned with Income Tax Act provisions',
    editableFields: ['[Cash Limit]', '[Custodian]', '[Security Measures]'],
  },
  {
    id: 'fin_6',
    title: 'Revenue Recognition Clause',
    category: 'Financial & Audit',
    content: 'Revenue from [Customer Type] shall be recognized upon [Recognition Trigger], as per the [Accounting Policy].',
    description: 'Defines how and when revenue is recognized.',
    useCase: 'Financial statements, audits.',
    relevantSection: 'Accounting Standards (Ind-AS 115)',
    editableFields: ['[Recognition Trigger]', '[Accounting Policy]', '[Customer Type]'],
  },
  {
    id: 'fin_7',
    title: 'Depreciation Policy Clause',
    category: 'Financial & Audit',
    content: 'Depreciation on [Asset Type] shall be calculated using the [Method] method at a rate of [Rate]%.',
    description: 'Details method and rates of depreciation.',
    useCase: 'Annual reports, tax filings.',
    relevantSection: 'Schedule II of Companies Act, 2013',
    editableFields: ['[Asset Type]', '[Method]', '[Rate]'],
  },
  {
    id: 'fin_8',
    title: 'Dividend Declaration Clause',
    category: 'Financial & Audit',
    content: 'A dividend at the rate of [Dividend Rate]% is hereby declared for shareholders of [Eligibility] as of the record date of [Record Date].',
    description: 'Lays down rules for declaring dividends.',
    useCase: 'AGM resolutions, investor communication.',
    relevantSection: 'Section 123, Companies Act, 2013',
    editableFields: ['[Dividend Rate]', '[Eligibility]', '[Record Date]'],
  },
  {
    id: 'fin_9',
    title: 'Tax Deducted at Source (TDS) Clause',
    category: 'Financial & Audit',
    content: 'TDS at a rate of [Rate]% shall be deducted on payments exceeding [Threshold] under [Section Number] of the Income Tax Act.',
    description: 'Ensures deduction and deposit of TDS on applicable transactions.',
    useCase: 'Vendor payments, salaries, rent, etc.',
    relevantSection: 'Section 194 series, Income Tax Act, 1961',
    editableFields: ['[Threshold]', '[Rate]', '[Section Number]'],
  },
  {
    id: 'fin_10',
    title: 'GST Invoicing Compliance Clause',
    category: 'Financial & Audit',
    content: 'All invoices to [Recipient Details] must adhere to the [Invoice Format] and be issued at the [Time of Supply] as per GST regulations.',
    description: 'Governs format and timing of GST invoices.',
    useCase: 'B2B & B2C billing, input credit eligibility.',
    relevantSection: 'Section 31, CGST Act, 2017',
    editableFields: ['[Invoice Format]', '[Time of Supply]', '[Recipient Details]'],
  },

  // Agreements & Contracts Clauses
  {
    id: 'agr_1',
    title: 'Force Majeure Clause',
    category: 'Agreements & Contracts',
    content: 'Neither party shall be liable for any failure or delay in performance due to [Events Covered], provided that the party claiming force majeure provides a notice within [Notice Period] days. The performance of the agreement shall be suspended for a period of [Relief Duration].',
    description: 'Protects parties from liability for unforeseen events (like war, pandemic, natural disasters).',
    useCase: 'Vendor, SaaS, supply chain, or service contracts.',
    relevantSection: 'Contract Act, 1872 – Common law interpretation',
    editableFields: ['[Events Covered]', '[Notice Period]', '[Relief Duration]'],
  },
  {
    id: 'agr_2',
    title: 'Jurisdiction Clause',
    category: 'Agreements & Contracts',
    content: 'Any dispute, controversy or claims arising out of or relating to this Agreement shall be subject to the [Jurisdiction Type] jurisdiction of the courts of [City], [State].',
    description: 'Specifies the court or city where disputes will be resolved.',
    useCase: 'All standard contracts.',
    relevantSection: 'Civil Procedure Code, 1908',
    editableFields: ['[City]', '[State]', '[Jurisdiction Type]'],
  },
  {
    id: 'agr_3',
    title: 'Governing Law Clause',
    category: 'Agreements & Contracts',
    content: 'This Agreement shall be governed by and construed in accordance with the laws of [Governing Law]. The parties agree to submit to the jurisdiction of the courts located in [Jurisdiction], and agree that any [Override Terms] shall not apply.',
    description: 'States which country/state’s laws will apply.',
    useCase: 'Cross-border or multi-state agreements.',
    relevantSection: 'Contract Act, 1872',
    editableFields: ['[Governing Law]', '[Jurisdiction]', '[Override Terms]'],
  },
  {
    id: 'agr_4',
    title: 'Arbitration Clause',
    category: 'Agreements & Contracts',
    content: 'Any dispute shall be referred to and finally resolved by arbitration administered by a [Arbitrator Type] in [Language]. The seat of the arbitration shall be [Seat of Arbitration].',
    description: 'Refers disputes to an arbitrator instead of courts.',
    useCase: 'Vendor, founder, investor agreements.',
    relevantSection: 'Arbitration & Conciliation Act, 1996',
    editableFields: ['[Arbitrator Type]', '[Seat of Arbitration]', '[Language]'],
  },
  {
    id: 'agr_5',
    title: 'Amendment Clause',
    category: 'Agreements & Contracts',
    content: 'No amendment or modification of this Agreement shall be valid unless in writing and signed by [Authorized Parties]. The [Change Procedure] must be followed, with a notice period of [Notice Period].',
    description: 'Specifies how changes to the agreement can be made.',
    useCase: 'Master Service Agreements, MoUs.',
    relevantSection: 'Contract Act, 1872',
    editableFields: ['[Authorized Parties]', '[Change Procedure]', '[Notice Period]'],
  },
  {
    id: 'agr_6',
    title: 'Entire Agreement Clause',
    category: 'Agreements & Contracts',
    content: 'This [Contract Name] dated [Date], along with its [Attachments], constitutes the entire agreement between the parties and supersedes all prior agreements.',
    description: 'States that the written contract is the final, binding version.',
    useCase: 'Any formal agreement.',
    relevantSection: 'Contract Act, 1872',
    editableFields: ['[Contract Name]', '[Date]', '[Attachments]'],
  },
  {
    id: 'agr_7',
    title: 'Assignment Clause',
    category: 'Agreements & Contracts',
    content: 'Neither party may assign [Assignable Rights] of this Agreement without the prior written consent of the other party, subject to [Restrictions]. The [Approval Process] must be followed for any such assignment.',
    description: 'Determines whether contract rights can be assigned to third parties.',
    useCase: 'Licensing, franchise, or service agreements.',
    relevantSection: 'Contract Act, 1872',
    editableFields: ['[Assignable Rights]', '[Restrictions]', '[Approval Process]'],
  },
  {
    id: 'agr_8',
    title: 'Waiver Clause',
    category: 'Agreements & Contracts',
    content: 'The failure of [Applicable Party] to enforce any provision of this Agreement shall not be construed as a waiver of [Waivable Terms], subject to [Conditions].',
    description: 'Indicates that failure to enforce a clause does not waive future rights.',
    useCase: 'Any business or employment contract.',
    relevantSection: 'Contract Act, 1872',
    editableFields: ['[Waivable Terms]', '[Conditions]', '[Applicable Party]'],
  },
  {
    id: 'agr_9',
    title: 'Notices Clause',
    category: 'Agreements & Contracts',
    content: 'All notices and other communications hereunder shall be in writing and shall be deemed to have been duly given if delivered by [Delivery Method] to [Recipient Name] at [Address].',
    description: 'Lays out how formal communications must be sent.',
    useCase: 'Service contracts, partnership agreements.',
    relevantSection: 'Contract Act, 1872',
    editableFields: ['[Delivery Method]', '[Address]', '[Recipient Name]'],
  },
  {
    id: 'agr_10',
    title: 'Representation & Warranties Clause',
    category: 'Agreements & Contracts',
    content: 'Each of the [Parties] represents and warrants that [Assertions]. The liability for any breach of these warranties is capped at [Liability Cap].',
    description: 'Details the facts each party confirms to be true.',
    useCase: 'M&A, founder-investor, and vendor contracts.',
    relevantSection: 'Contract Act, 1872',
    editableFields: ['[Parties]', '[Assertions]', '[Liability Cap]'],
  },

  // Startup & Fundraising Clauses
  {
    id: 'fund_1',
    title: 'Pre-Emptive Rights Clause',
    category: 'Startup & Fundraising',
    content: 'If the Company proposes to issue any new Equity Securities, [Investor Name] shall have a right of first refusal to purchase its pro-rata share of such New Securities, up to [% Allocation], with a notice period of [Notice Period].',
    description: 'Gives existing investors the right to buy new shares before outsiders.',
    useCase: 'Shareholders\' Agreement (SHA).',
    relevantSection: 'Companies Act, 2013 – Section 62',
    editableFields: ['[Investor Name]', '[% Allocation]', '[Notice Period]'],
  },
  {
    id: 'fund_2',
    title: 'Tag-Along Rights Clause',
    category: 'Startup & Fundraising',
    content: 'If shareholders holding more than [Threshold]% of shares propose to sell, other shareholders can join the sale under the same [Exit Terms] within the specified [Timeline].',
    description: 'Allows minority investors to sell their stake if majority does.',
    useCase: 'SHA, VC term sheets.',
    relevantSection: 'Contractual right; not under Companies Act',
    editableFields: ['[Threshold]', '[Timeline]', '[Exit Terms]'],
  },
  {
    id: 'fund_3',
    title: 'Drag-Along Rights Clause',
    category: 'Startup & Fundraising',
    content: 'If shareholders holding more than [Trigger Conditions]% of the shares agree to sell their shares to a [Buyer Type] at a minimum price of [Minimum Price], all other shareholders are required to sell their shares on the same terms.',
    description: 'Allows majority shareholders to force minority to sell during exit.',
    useCase: 'Venture rounds, acquisition terms.',
    relevantSection: 'SHA-based; recognized in corporate practice',
    editableFields: ['[Trigger Conditions]', '[Minimum Price]', '[Buyer Type]'],
  },
  {
    id: 'fund_4',
    title: 'Liquidation Preference Clause',
    category: 'Startup & Fundraising',
    content: 'In any liquidation event, the holders of Series A Preferred Shares shall be entitled to receive [Preference Multiple] times the Original Issue Price, of type [Type], with a cap of [Cap], before any distribution to common shareholders.',
    description: 'Defines payout order in case of liquidation or sale.',
    useCase: 'VC investments.',
    relevantSection: 'SHA clause; governed under company agreements',
    editableFields: ['[Preference Multiple]', '[Type]', '[Cap]'],
  },
  {
    id: 'fund_5',
    title: 'Anti-Dilution Clause',
    category: 'Startup & Fundraising',
    content: 'In the event of a down-round with a trigger price of [Trigger Price], the conversion price of preferred shares shall be adjusted according to the [Protection Formula].',
    description: 'Adjusts shareholding in case of future down-rounds.',
    useCase: 'Series A/B fundraising.',
    relevantSection: 'SHA clause – Contractual',
    editableFields: ['[Protection Formula]', '[Trigger Price]'],
  },
  {
    id: 'fund_6',
    title: 'Right of First Refusal (ROFR) Clause',
    category: 'Startup & Fundraising',
    content: 'The [Parties Covered] shall have a right of first refusal for a period of [Timeframe] to purchase shares offered for sale by any shareholder, with the exception of [Exclusions].',
    description: 'Existing investors get first right to buy shares before others.',
    useCase: 'SHA, Employee Stock Agreements.',
    relevantSection: 'Contractual in nature',
    editableFields: ['[Parties Covered]', '[Timeframe]', '[Exclusions]'],
  },
  {
    id: 'fund_7',
    title: 'Exit Clause',
    category: 'Startup & Fundraising',
    content: 'An exit may be triggered by [Exit Triggers] within a [Timeframe], through an [Exit Method] such as an IPO or strategic sale.',
    description: 'Lays down conditions for investor exit or buyback.',
    useCase: 'Term sheet, SHA.',
    relevantSection: 'Contractual',
    editableFields: ['[Exit Triggers]', '[Timeframe]', '[Exit Method]'],
  },
  {
    id: 'fund_8',
    title: 'Board Observer Clause',
    category: 'Startup & Fundraising',
    content: '[Observer Name] is granted the right to attend Board meetings as a non-voting observer, with an access level of [Access Level] and a scope limited to [Scope].',
    description: 'Grants investor right to appoint non-voting observer on board.',
    useCase: 'Term sheets, post-funding governance.',
    relevantSection: 'Not specifically under Companies Act',
    editableFields: ['[Observer Name]', '[Scope]', '[Access Level]'],
  },
  {
    id: 'fund_9',
    title: 'Founder Lock-in Clause',
    category: 'Startup & Fundraising',
    content: 'The Founders agree not to sell, transfer, or otherwise dispose of any of their shares in the Company for a period of [Lock-in Duration], subject to [Share Transfer Conditions].',
    description: 'Restricts founders from exiting or transferring shares early.',
    useCase: 'Term sheet, SHA.',
    relevantSection: 'Contractual',
    editableFields: ['[Lock-in Duration]', '[Share Transfer Conditions]'],
  },
  {
    id: 'fund_10',
    title: 'Investor Consent Rights Clause',
    category: 'Startup & Fundraising',
    content: 'The Company shall not, without the prior written consent of investors holding at least [Voting Threshold]% of the preferred stock, take any action on [Matters Requiring Consent].',
    description: 'Requires investor approval for key business decisions.',
    useCase: 'SHA, VC-funded startups.',
    relevantSection: 'Contractual',
    editableFields: ['[Matters Requiring Consent]', '[Voting Threshold]'],
  },

  // Miscellaneous (Bonus Set)
  {
    id: 'misc_1',
    title: 'Data Protection & GDPR Clause',
    category: 'Miscellaneous',
    content: 'All personal data of type [Data Type] from [Jurisdiction] will be processed in accordance with the [Consent Mechanism].',
    description: 'Ensures personal data is handled lawfully and securely.',
    useCase: 'SaaS, e-commerce, user agreements.',
    relevantSection: 'India DPDP Act 2023; GDPR (EU)',
    editableFields: ['[Jurisdiction]', '[Data Type]', '[Consent Mechanism]'],
  },
  {
    id: 'misc_2',
    title: 'Digital Signature Clause',
    category: 'Miscellaneous',
    content: 'The parties agree that this agreement may be executed by [Type] digital signatures by the [Signatory] and that such signatures shall be deemed as valid as original signatures as of [Timestamp].',
    description: 'Permits signing contracts using digital signature.',
    useCase: 'Contracts, filings, and onboarding forms.',
    relevantSection: 'IT Act, 2000 – Section 5',
    editableFields: ['[Signatory]', '[Type]', '[Timestamp]'],
  },
  {
    id: 'misc_3',
    title: 'E-Governance Clause',
    category: 'Miscellaneous',
    content: 'The company will use [Platform Name] for [Scope] and will adhere to the [Security Protocol] for all e-governance communications.',
    description: 'Declares use of digital platforms for compliance & communication.',
    useCase: 'Startups and fintech.',
    relevantSection: 'MCA e-Governance norms',
    editableFields: ['[Platform Name]', '[Scope]', '[Security Protocol]'],
  },
  {
    id: 'misc_4',
    title: 'Director Resignation Clause',
    category: 'Miscellaneous',
    content: 'The resignation of [Director Name] shall be effective from [Effective Date]. The reason for resignation is noted as [Resignation Reason].',
    description: 'Details process for resignation of a director.',
    useCase: 'Board meeting minutes, resignation letters.',
    relevantSection: 'Section 168, Companies Act, 2013',
    editableFields: ['[Director Name]', '[Effective Date]', '[Resignation Reason]'],
  },
  {
    id: 'misc_5',
    title: 'Winding Up Clause',
    category: 'Miscellaneous',
    content: 'The company shall be wound up by [Mode], with [Liquidator] appointed as the liquidator, subject to [Shareholder Approval].',
    description: 'Lays down procedure for company closure or liquidation.',
    useCase: 'Exit strategy or voluntary closure.',
    relevantSection: 'Sections 271–302, Companies Act, 2013',
    editableFields: ['[Mode]', '[Liquidator]', '[Shareholder Approval]'],
  },
];
