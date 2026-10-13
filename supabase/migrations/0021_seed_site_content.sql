-- ============================================================
-- 0021: Seed the content tables from 0020 with the values that were
-- hardcoded in the app until now, so nothing disappears from the site.
-- Generated from the old source files; safe to re-run (rows are only
-- added when missing, existing database values are never overwritten).
-- Review flagged rows (testimonial, trust badges, phone number) and
-- correct or deactivate them in Admin if they are not accurate.
-- ============================================================

-- Country editorial + visa columns
UPDATE public.countries SET
    hero_subtitle = COALESCE(hero_subtitle, 'Zero Tuition at Top Public Universities • 18-Month Jobseeker Visa • Europe''s #1 Economy'),
    overview_heading = COALESCE(overview_heading, 'Why Indian Students Choose Germany for Technical & Business Excellence'),
    overview_body = COALESCE(overview_body, 'Germany has emerged as one of the most favored international education destinations for Indian students, hosting over 45,000 Indian scholars in public technical universities and business schools.

The country''s public education mandate provides virtually tuition-free education (charging only a nominal administrative semester fee of €250 to €350) across renowned TU9 universities such as TU Munich, RWTH Aachen, and TU Berlin.

With a severe engineering and IT talent shortage, graduates enjoy an 18-month post-study work visa (Jobseeker Permit) with pathways to EU Blue Cards and permanent residency within 21 to 33 months.'),
    programs_offered_notes = COALESCE(programs_offered_notes, 'Germany is renowned globally for Engineering (Mechanical, Automotive, Mechatronics), Data Science & AI, Renewable Energy, and its unique zero-tuition Ausbildung dual vocational programs.'),
    visa_type = COALESCE(visa_type, 'German National Student Visa (Subtype D)'),
    visa_processing_time = COALESCE(visa_processing_time, '4 to 8 weeks (Requires prior APS Certificate)'),
    work_hours_during_term = COALESCE(work_hours_during_term, '140 full days or 280 half days per calendar year (approx. 20 hours/week)'),
    financial_proof_required = COALESCE(financial_proof_required, '€11,904 in a government-recognized Blocked Account (Sperrkonto)'),
    pr_pathway_summary = COALESCE(pr_pathway_summary, 'Fast-track German Permanent Residence (Niederlassungserlaubnis) eligible after 21 months of employment with B1 German (or 27 months with A1 German).'),
    post_study_work_visa = COALESCE(post_study_work_visa, '18 Months (1.5 Years) Jobseeker Residence Permit')
  WHERE slug = 'germany';
UPDATE public.countries SET
    hero_subtitle = COALESCE(hero_subtitle, 'World-Leading STEM Research • Ivy League Prestige • 3-Year STEM OPT Work Authorization'),
    overview_heading = COALESCE(overview_heading, 'The Epicenter of Global Technology, Research, and Corporate Leadership'),
    overview_body = COALESCE(overview_body, 'The United States remains the premier destination for Indian graduate students, hosting over 260,000 Indian scholars across tech, engineering, and MBA programs.

With premier institutions like MIT, Stanford, Georgia Tech, and Carnegie Mellon, the US offers unmatched research infrastructure, Silicon Valley venture networks, and high starting compensation.

Under the F-1 visa STEM OPT extension, graduates in STEM disciplines receive up to 36 months (3 years) of post-study employment authorization without needing an immediate H-1B visa lottery sponsor.'),
    programs_offered_notes = COALESCE(programs_offered_notes, 'The US excels in Computer Science, AI/ML, Electrical Engineering, Mechanical Engineering, Healthcare Management, and Full-time / STEM MBA programs.'),
    visa_type = COALESCE(visa_type, 'F-1 Academic Student Visa'),
    visa_processing_time = COALESCE(visa_processing_time, '2 to 6 weeks (Requires I-20 form from university)'),
    work_hours_during_term = COALESCE(work_hours_during_term, 'Up to 20 hours/week strictly on-campus during academic terms'),
    financial_proof_required = COALESCE(financial_proof_required, 'Liquid funds covering 1 full year''s estimated Cost of Attendance (approx. ₹35 - 55 Lakhs on I-20)'),
    pr_pathway_summary = COALESCE(pr_pathway_summary, 'F-1 → 3-Year STEM OPT → Employer-sponsored H-1B Visa → EB-2 / EB-3 Employment-based Green Card.'),
    post_study_work_visa = COALESCE(post_study_work_visa, '12 Months Initial OPT + 24 Months STEM Extension = 36 Months Total')
  WHERE slug = 'usa';
UPDATE public.countries SET
    hero_subtitle = COALESCE(hero_subtitle, '1-Year Fast-Track Master’s • 18-Month Graduate Route Visa • Prestigious Russell Group Heritage'),
    overview_heading = COALESCE(overview_heading, 'World-Class Academic Rigor with Accelerated 1-Year Master''s Degrees'),
    overview_body = COALESCE(overview_body, 'The United Kingdom is famous for its intensive 1-year master''s degrees that enable Indian students to enter the global workforce a full year earlier than in other countries, dramatically lowering total living costs.

With 160+ universities—including historic Russell Group institutions like Oxford, Cambridge, Imperial, and Manchester—the UK maintains exceptional global brand prestige.

Graduates can apply for the Graduate Route Post-Study Work Visa, which lets them work in any sector without employer sponsorship. Applications made from 1 January 2027 get 18 months (3 years for PhD graduates).'),
    programs_offered_notes = COALESCE(programs_offered_notes, 'Strongest in Data Science, Finance, International Business, Public Health, Nursing, and Law (LLM).'),
    visa_type = COALESCE(visa_type, 'UK Student Visa (formerly Tier 4)'),
    visa_processing_time = COALESCE(visa_processing_time, '3 weeks (Priority visa available in 5 days)'),
    work_hours_during_term = COALESCE(work_hours_during_term, 'Up to 20 hours/week during term time; 40 hours/week during vacations'),
    financial_proof_required = COALESCE(financial_proof_required, 'Remaining tuition + 9 months living costs (approx. £1,023/mo outside London, £1,334/mo in London)'),
    pr_pathway_summary = COALESCE(pr_pathway_summary, 'Student Visa → 18-Month Graduate Route → Skilled Worker Visa (5 years continuous employment) → Indefinite Leave to Remain (ILR).'),
    post_study_work_visa = COALESCE(post_study_work_visa, '18 Months Graduate Route for applications from 1 Jan 2027 (3 Years for PhD graduates)')
  WHERE slug = 'uk';
UPDATE public.countries SET
    hero_subtitle = COALESCE(hero_subtitle, '30+ Years of Medical Trust • NMC & WHO Compliant MBBS • ₹18 - 25 Lakhs All-Inclusive'),
    overview_heading = COALESCE(overview_heading, 'The Most Affordable, High-Exposure Destination for Global MBBS Aspirants'),
    overview_body = COALESCE(overview_body, 'Russia has been the trusted destination for Indian medical aspirants for over three decades, currently educating more than 20,000 Indian students across government medical universities.

Russian medical degrees are recognized by the National Medical Commission (NMC), World Health Organization (WHO), and ECFMG (USA), providing a direct pathway to FMGE/NExT licensure in India.

With total 6-year MBBS budgets starting at just ₹18 to ₹25 Lakhs (inclusive of tuition, hostel, and Indian food), it offers an accessible alternative to expensive private medical colleges in India.'),
    programs_offered_notes = COALESCE(programs_offered_notes, 'Exclusively focused on General Medicine (MBBS / MD) with high clinical bed-to-student ratios.'),
    visa_type = COALESCE(visa_type, 'Russian Student Visa'),
    visa_processing_time = COALESCE(visa_processing_time, '2 to 4 weeks'),
    work_hours_during_term = COALESCE(work_hours_during_term, 'Part-time student employment allowed with university permission'),
    financial_proof_required = COALESCE(financial_proof_required, 'Affidavit of parental support and basic bank balance (₹3 - 5 Lakhs)'),
    pr_pathway_summary = COALESCE(pr_pathway_summary, 'Students typically return to India to clear the NExT/FMGE licensing examination or pursue USMLE/PLAB.'),
    post_study_work_visa = COALESCE(post_study_work_visa, 'Clinical Residency / Internship pathways')
  WHERE slug = 'russia';
UPDATE public.countries SET
    hero_subtitle = COALESCE(hero_subtitle, '3-Year Post-Graduation Work Permit (PGWP) • Direct Express Entry PR Pathways • World-Class Public Universities'),
    overview_heading = COALESCE(overview_heading, 'High-Quality Public Education with Predictable Permanent Residency Pathways'),
    overview_body = COALESCE(overview_body, 'Canada is home to top-tier research institutions like the University of Toronto, UBC, McGill, and Waterloo, delivering global degree prestige with lower cost barriers than the US.

Graduates from eligible Designated Learning Institutions (DLIs) can obtain a 3-year Post-Graduation Work Permit (PGWP), enabling them to gain skilled Canadian work experience.

Through Express Entry (Canadian Experience Class) and Provincial Nominee Programs (PNP), international graduates benefit from world-leading permanent residency transitions.'),
    programs_offered_notes = COALESCE(programs_offered_notes, 'Leading in Software Engineering, AI & Robotics, Business Analytics, Environmental Science, and Health Informatics.'),
    visa_type = COALESCE(visa_type, 'Canadian Study Permit (PAL needed for bachelor''s/college; not for master''s/PhD)'),
    visa_processing_time = COALESCE(visa_processing_time, '4 to 8 weeks'),
    work_hours_during_term = COALESCE(work_hours_during_term, 'Up to 24 hours/week off-campus during terms; 40 hours/week during breaks'),
    financial_proof_required = COALESCE(financial_proof_required, '1st year tuition receipt + CAD $20,635 GIC Certificate'),
    pr_pathway_summary = COALESCE(pr_pathway_summary, 'Study Permit → 3-Year PGWP → 1 Year Canadian Skilled Work → Express Entry CEC / Provincial Nominee Program (PNP).'),
    post_study_work_visa = COALESCE(post_study_work_visa, 'Up to 3 Years Post-Graduation Work Permit (PGWP); needs CLB 7 English for university graduates')
  WHERE slug = 'canada';
UPDATE public.countries SET
    hero_subtitle = COALESCE(hero_subtitle, 'Group of Eight (Go8) Excellence • Up to 3-Year Post-Study Work • High Minimum Wage & Career Growth'),
    overview_heading = COALESCE(overview_heading, 'Premier Southern Hemisphere Education with High Quality of Life'),
    overview_body = COALESCE(overview_body, 'Australia combines world top-50 universities (University of Melbourne, Sydney, UNSW, ANU) with a high minimum wage ($24.10/hr) and favorable regional post-study work incentives.

The Australian higher education framework is internationally acclaimed for engineering, biotechnology, mining tech, business analytics, and nursing.

Graduates from eligible master''s and bachelor''s programs benefit from Temporary Graduate Visas (Subclass 485), with additional post-study work rights for studying in designated regional cities.'),
    programs_offered_notes = COALESCE(programs_offered_notes, 'Outstanding for Computer Science, Mining & Petroleum Engineering, Data Analytics, Healthcare & Nursing, and MBA.'),
    visa_type = COALESCE(visa_type, 'Subclass 500 Student Visa'),
    visa_processing_time = COALESCE(visa_processing_time, '4 to 6 weeks'),
    work_hours_during_term = COALESCE(work_hours_during_term, '48 hours per fortnight during study terms; unrestricted during breaks'),
    financial_proof_required = COALESCE(financial_proof_required, '1 year tuition + AUD $29,710 living expenses in savings/loan'),
    pr_pathway_summary = COALESCE(pr_pathway_summary, 'Subclass 500 → Subclass 485 Graduate Visa → SkillSelect Points System (Subclass 189/190/491 PR Visas).'),
    post_study_work_visa = COALESCE(post_study_work_visa, '2 to 3 Years on Subclass 485 (plus extra 1-2 years in regional cities)')
  WHERE slug = 'australia';
UPDATE public.countries SET
    hero_subtitle = COALESCE(hero_subtitle, 'European Silicon Valley • 2-Year Stay Back Visa • Global HQ for Google, Meta & Pfizer'),
    overview_heading = COALESCE(overview_heading, 'The English-Speaking Tech & Pharma Gateway to Europe'),
    overview_body = COALESCE(overview_body, 'Ireland is the only native English-speaking country in the Eurozone and the European headquarters for 9 of the top 10 global ICT companies and 9 of the top 10 pharma multinationals.

With institutions like Trinity College Dublin (TCD), University College Dublin (UCD), and University of Galway, students enjoy high academic prestige.

The Irish Third Level Graduate Scheme provides a 2-year post-study work visa for master''s graduates, facilitating direct conversion into Critical Skills Employment Permits.'),
    programs_offered_notes = COALESCE(programs_offered_notes, 'World-class in Data Science, Cloud Computing, Pharmaceutical Chemistry, Finance & FinTech, and MedTech.'),
    visa_type = COALESCE(visa_type, 'Irish Long Stay Study Visa (Stamp 2)'),
    visa_processing_time = COALESCE(visa_processing_time, '4 to 6 weeks'),
    work_hours_during_term = COALESCE(work_hours_during_term, '20 hours/week during term; 40 hours/week during June–September & Christmas'),
    financial_proof_required = COALESCE(financial_proof_required, 'Full 1st year tuition paid + €10,000 in student/sponsor bank account'),
    pr_pathway_summary = COALESCE(pr_pathway_summary, 'Stamp 2 (Student) → 2-Year Third Level Scheme → Critical Skills Employment Permit (2 Years) → Stamp 4 (Permanent Residency).'),
    post_study_work_visa = COALESCE(post_study_work_visa, '24 Months (2 Years) Third Level Graduate Scheme for Master''s graduates')
  WHERE slug = 'ireland';
UPDATE public.countries SET
    hero_subtitle = COALESCE(hero_subtitle, 'Triple-Accredited Business Schools • 2-Year Post-Study Visa • French Tech Visa & Schengen Mobility'),
    overview_heading = COALESCE(overview_heading, 'World-Class Management Education and Engineering Innovation in Europe'),
    overview_body = COALESCE(overview_body, 'France is celebrated for its elite Grande École business schools (HEC Paris, INSEAD, ESSEC, EDHEC, emlyon) and top public universities with state-subsidized tuition.

Indian students can choose from more than 1,700 English-taught master''s degrees in management, luxury marketing, artificial intelligence, aerospace, and culinary arts.

Under the bilateral agreement between India and France, Indian master''s graduates receive a 2-year post-study work visa (APS / Recherche d''emploi) and a 5-year short-stay Schengen visa upon graduation.'),
    programs_offered_notes = COALESCE(programs_offered_notes, 'Elite for Master in Management (MiM), Luxury Brand Management, Aerospace Engineering, AI/Data Science, and Hospitality.'),
    visa_type = COALESCE(visa_type, 'Long-Stay Student Visa (VLS-TS)'),
    visa_processing_time = COALESCE(visa_processing_time, '2 to 4 weeks (Requires prior Campus France interview)'),
    work_hours_during_term = COALESCE(work_hours_during_term, 'Up to 20 hours/week (60% of annual working time)'),
    financial_proof_required = COALESCE(financial_proof_required, 'Minimum €615/month (€7,380 per year) in liquid savings or loan'),
    pr_pathway_summary = COALESCE(pr_pathway_summary, 'VLS-TS → 2-Year APS → Passeport Talent (Tech/Executive) → Permanent Residence (Carte de Résident).'),
    post_study_work_visa = COALESCE(post_study_work_visa, '2 Years (APS / Recherche d''Emploi) for Indian Master''s graduates')
  WHERE slug = 'france';
UPDATE public.countries SET
    hero_subtitle = COALESCE(hero_subtitle, 'Govt Medical Universities • 100% NMC 2021 Compliant • ₹14 - 18 Lakhs Complete 6-Year MBBS'),
    overview_heading = COALESCE(overview_heading, 'The Most Cost-Effective, High-Quality NMC Compliant MBBS Destination'),
    overview_body = COALESCE(overview_body, 'Uzbekistan has rapidly become a premier medical education hub for Indian students, offering government-recognized medical academies like Tashkent Medical Academy and Samarkand State Medical University.

The MBBS curriculum in Uzbekistan strictly complies with the National Medical Commission (NMC) 2021 Gazette regulations, offering 5.4 years of English-medium academic instruction followed by a 1-year clinical internship in affiliated tertiary hospitals.

With total 6-year budgets of just ₹14 to ₹18 Lakhs (including tuition, air-conditioned hostel, and Indian mess facilities), it provides the highest affordability in medical education.'),
    programs_offered_notes = COALESCE(programs_offered_notes, 'Exclusively focused on NMC-Compliant General Medicine (MBBS / MD) with high bed-to-student clinical exposure.'),
    visa_type = COALESCE(visa_type, 'Uzbek Student Visa'),
    visa_processing_time = COALESCE(visa_processing_time, '2 to 3 weeks'),
    work_hours_during_term = COALESCE(work_hours_during_term, 'Clinical ward rounds and assistantships'),
    financial_proof_required = COALESCE(financial_proof_required, 'Parental bank account showing ₹3–5 Lakhs balance'),
    pr_pathway_summary = COALESCE(pr_pathway_summary, 'Graduates return to India to write NExT / FMGE or appear for USMLE / PLAB licensing exams.'),
    post_study_work_visa = COALESCE(post_study_work_visa, '1-Year Clinical Internship in-country (NMC compliant)')
  WHERE slug = 'uzbekistan';
UPDATE public.countries SET
    hero_subtitle = COALESCE(hero_subtitle, 'Leading Central Asian Medical Hub • WHO & NMC Recognized • ₹16 - 22 Lakhs Complete MBBS'),
    overview_heading = COALESCE(overview_heading, 'High-Volume Clinical Exposure at Historic National Medical Universities'),
    overview_body = COALESCE(overview_body, 'Kazakhstan has educated over 10,000 Indian doctors through premier institutions such as Kazakh National Medical University and Astana Medical University.

All medical programs adhere strictly to the NMC 2021 guidelines, featuring a 5.4-year English-taught MD/MBBS curriculum followed by a mandatory 1-year hospital internship.

With modern university simulation labs, high patient footfall, and dedicated Indian mess facilities, Kazakhstan provides world-standard clinical training at a fraction of private college costs.'),
    programs_offered_notes = COALESCE(programs_offered_notes, 'General Medicine (MBBS / MD), Dentistry, and Pharmacy.'),
    visa_type = COALESCE(visa_type, 'Kazakhstan Student Visa (C9)'),
    visa_processing_time = COALESCE(visa_processing_time, '3 to 4 weeks'),
    work_hours_during_term = COALESCE(work_hours_during_term, 'Clinical hospital rotation focus'),
    financial_proof_required = COALESCE(financial_proof_required, 'Basic bank balance proof (₹3 - 5 Lakhs)'),
    pr_pathway_summary = COALESCE(pr_pathway_summary, 'Graduates clear NExT/FMGE in India or pursue international residency in the UK/USA.'),
    post_study_work_visa = COALESCE(post_study_work_visa, '1-Year Clinical Internship')
  WHERE slug = 'kazakhstan';
UPDATE public.countries SET
    hero_subtitle = COALESCE(hero_subtitle, 'European Standard Medical Education • ECFMG & NMC Approved • Safe & Scenic Country'),
    overview_heading = COALESCE(overview_heading, 'European Standards of Clinical Medicine at Accessible Annual Tuition'),
    overview_body = COALESCE(overview_body, 'Located at the intersection of Eastern Europe and Western Asia, Georgia has become a top medical education destination with over 15,000 Indian students in cities like Tbilisi and Batumi.

Medical universities like Tbilisi State Medical University and David Tvildiani Medical University follow US and European medical curricula with high USMLE passing rates.

Georgia provides a clean, safe European lifestyle, 100% English medium instruction, and full NMC 2021 compliance.'),
    programs_offered_notes = COALESCE(programs_offered_notes, 'MBBS / MD in General Medicine, Dentistry, and Healthcare Management.'),
    visa_type = COALESCE(visa_type, 'Georgian Immigration Visa (D3)'),
    visa_processing_time = COALESCE(visa_processing_time, '4 to 6 weeks'),
    work_hours_during_term = COALESCE(work_hours_during_term, 'Student study focus'),
    financial_proof_required = COALESCE(financial_proof_required, 'Sponsor bank statement showing ₹5 - 7 Lakhs liquid funds'),
    pr_pathway_summary = COALESCE(pr_pathway_summary, 'Graduates write NExT (India), USMLE (USA) or PLAB (UK) for hospital residency.'),
    post_study_work_visa = COALESCE(post_study_work_visa, 'Clinical internship & licensing')
  WHERE slug = 'georgia';
UPDATE public.countries SET
    hero_subtitle = COALESCE(hero_subtitle, 'American Pattern MD Curriculum • 100% English Speaking Nation • High USMLE Pass Rate'),
    overview_heading = COALESCE(overview_heading, 'US-Patterned Medical Training in an English-Speaking Tropical Country'),
    overview_body = COALESCE(overview_body, 'The Philippines follows the US education model, offering the Doctor of Medicine (MD) degree with strong clinical disease exposure similar to Indian epidemiology.

As the world''s third-largest English-speaking nation, language is never a barrier in classrooms, hospitals, or local communities.

Leading institutions like Davao Medical School Foundation and University of Perpetual Help educate thousands of Indian medical doctors every year.'),
    programs_offered_notes = COALESCE(programs_offered_notes, 'BS-MD (Bachelor of Science + Doctor of Medicine).'),
    visa_type = COALESCE(visa_type, '9(f) Student Visa'),
    visa_processing_time = COALESCE(visa_processing_time, '4 to 6 weeks'),
    work_hours_during_term = COALESCE(work_hours_during_term, 'Dedicated clinical training'),
    financial_proof_required = COALESCE(financial_proof_required, 'Parent bank balance showing ₹4 - 6 Lakhs'),
    pr_pathway_summary = COALESCE(pr_pathway_summary, 'Graduates return to India for NExT / FMGE licensing or apply for USMLE clinical residencies.'),
    post_study_work_visa = COALESCE(post_study_work_visa, 'Clinical internship & licensing')
  WHERE slug = 'philippines';
UPDATE public.countries SET
    hero_subtitle = COALESCE(hero_subtitle, 'Continental Europe''s #1 Tech Hub • 1-Year Orientation Year Visa (Zoekjaar) • 2,100+ English Programs'),
    overview_heading = COALESCE(overview_heading, 'Progressive, English-Taught European Higher Education and Tech Ecosystem'),
    overview_body = COALESCE(overview_body, 'The Netherlands is celebrated for world-class research universities like TU Delft, University of Amsterdam, and Eindhoven University of Technology, offering over 2,100 programs taught 100% in English.

With 95% of the population speaking fluent English, it is the most internationally accessible country in continental Europe.

Graduates receive a 1-year Orientation Year (Zoekjaar) visa to work freely across European tech giants (ASML, Philips, Booking.com, Uber European HQ) and innovative startups.'),
    programs_offered_notes = COALESCE(programs_offered_notes, 'World-leading in Computer Science & AI, Semiconductor Tech, Mechanical Engineering, Civil & Water Management, and Business.'),
    visa_type = COALESCE(visa_type, 'Dutch MVV Entry Visa & VVR Residence Permit'),
    visa_processing_time = COALESCE(visa_processing_time, '2 to 4 weeks (Handled directly by the university)'),
    work_hours_during_term = COALESCE(work_hours_during_term, 'Up to 16 hours/week (Requires employer work permit)'),
    financial_proof_required = COALESCE(financial_proof_required, '€12,500 proof of living funds + tuition fee to university'),
    pr_pathway_summary = COALESCE(pr_pathway_summary, 'Student Permit → 1-Year Zoekjaar → Highly Skilled Migrant (Kennismigrant) Permit → Permanent Residence after 5 years.'),
    post_study_work_visa = COALESCE(post_study_work_visa, '1 Year Orientation Year (Zoekjaar) permit')
  WHERE slug = 'netherlands';
UPDATE public.countries SET
    hero_subtitle = COALESCE(hero_subtitle, 'Asia''s Top Universities (NUS & NTU) • Global Financial Hub • 1-Year Post-Study Visa'),
    overview_heading = COALESCE(overview_heading, 'The Epicenter of Asian Innovation, Banking, and Technology Leadership'),
    overview_body = COALESCE(overview_body, 'Singapore hosts two of the world''s top 15 universities—National University of Singapore (NUS) and Nanyang Technological University (NTU)—offering elite global academic credentials just a 4-hour flight from India.

As Asia''s premier financial and tech capital, Singapore provides unparalleled access to multinational headquarters, venture capital, and cutting-edge research.

International graduates can obtain a 1-year Long Term Visit Pass (LTVP) to seek employment and transition into an Employment Pass (EP).'),
    programs_offered_notes = COALESCE(programs_offered_notes, 'Elite in AI, Computer Science, Financial Engineering, Supply Chain, and MBA.'),
    visa_type = COALESCE(visa_type, 'Singapore Student’s Pass (STP)'),
    visa_processing_time = COALESCE(visa_processing_time, '2 to 4 weeks'),
    work_hours_during_term = COALESCE(work_hours_during_term, 'Up to 16 hours/week for eligible government university students'),
    financial_proof_required = COALESCE(financial_proof_required, 'Proof of financial capability for 1 year (approx. SGD $30,000)'),
    pr_pathway_summary = COALESCE(pr_pathway_summary, 'Student Pass → 1-Year LTVP → Employment Pass (EP) / S Pass → Singapore Permanent Residence (PR).'),
    post_study_work_visa = COALESCE(post_study_work_visa, '1 Year Long Term Visit Pass (LTVP) for university graduates')
  WHERE slug = 'singapore';
UPDATE public.countries SET
    hero_subtitle = COALESCE(hero_subtitle, 'Low Tuition at Historic Universities • DSU Regional Scholarships • 1-Year Post-Study Visa'),
    overview_heading = COALESCE(overview_heading, 'Prestigious Architecture, Engineering, and Design with Generous Regional Scholarships'),
    overview_body = COALESCE(overview_body, 'Italy is home to Europe''s oldest and most prestigious institutions, including Politecnico di Milano, University of Bologna, and Sapienza University of Rome.

Tuition fees at public universities are calculated based on family income (ISEE-U), making top European education available from just €1,000 to €3,500 per year (₹90,000 to ₹3 Lakhs).

Through the DSU (Diritto allo Studio Universitario) regional scholarships, thousands of eligible Indian students receive full tuition waivers and free hostel accommodation.'),
    programs_offered_notes = COALESCE(programs_offered_notes, 'Leader in Mechanical & Automotive Engineering, Architecture, Industrial Design, Luxury Management, and Physics.'),
    visa_type = COALESCE(visa_type, 'Italian National Visa (Type D - Study)'),
    visa_processing_time = COALESCE(visa_processing_time, '3 to 6 weeks'),
    work_hours_during_term = COALESCE(work_hours_during_term, 'Up to 20 hours/week (max 1,040 hours per year)'),
    financial_proof_required = COALESCE(financial_proof_required, '€6,000 in student bank account + accommodation proof'),
    pr_pathway_summary = COALESCE(pr_pathway_summary, 'Permesso di Soggiorno Studio → 1-Year Job Search Permit → Work Permit (Lavoro Subordinato) → EU Long-Term Residence.'),
    post_study_work_visa = COALESCE(post_study_work_visa, '12 Months (1 Year) Permesso di Soggiorno per Ricerca Lavoro')
  WHERE slug = 'italy';
UPDATE public.countries SET
    hero_subtitle = COALESCE(hero_subtitle, 'All 8 Universities in Global Top 3% • 3-Year Post-Study Work Visa • Green List PR Pathways'),
    overview_heading = COALESCE(overview_heading, 'World-Ranked Public Universities with High Safety and Green List Residency Tracks'),
    overview_body = COALESCE(overview_body, 'All 8 state universities in New Zealand—including University of Auckland and University of Otago—rank in the top 3% worldwide, offering recognized qualifications in a safe, pristine environment.

Graduates from master''s and bachelor''s degrees receive up to a 3-year Post-Study Work Visa with open employment rights.

Under Immigration New Zealand''s ''Green List'', occupations in IT, engineering, healthcare, and environmental sciences have fast-track Straight to Residence PR pathways.'),
    programs_offered_notes = COALESCE(programs_offered_notes, 'Excellence in Environmental Engineering, Data Analytics, Agriculture Tech, Cybersecurity, and Tourism Management.'),
    visa_type = COALESCE(visa_type, 'Fee Paying Student Visa'),
    visa_processing_time = COALESCE(visa_processing_time, '4 to 8 weeks'),
    work_hours_during_term = COALESCE(work_hours_during_term, 'Up to 20 hours/week during term; 40 hours/week during breaks'),
    financial_proof_required = COALESCE(financial_proof_required, 'Tuition fee paid + NZD $20,000 proof of living funds per year'),
    pr_pathway_summary = COALESCE(pr_pathway_summary, 'Student Visa → 3-Year Post Study Work Visa → Green List Straight to Residence / Skilled Migrant Category (SMC) PR.'),
    post_study_work_visa = COALESCE(post_study_work_visa, 'Up to 3 Years Post-Study Work Visa (Open)')
  WHERE slug = 'new-zealand';
UPDATE public.countries SET
    hero_subtitle = COALESCE(hero_subtitle, 'Global Branch Campuses (NYU, Wollongong, BITS Pilani) • 10-Year Golden Visa • Zero Tax Economy'),
    overview_heading = COALESCE(overview_heading, 'World-Class Branch Campuses in a Global Tax-Free Business Hub'),
    overview_body = COALESCE(overview_body, 'Dubai and Abu Dhabi host leading international branch campuses—including NYU Abu Dhabi, University of Wollongong Dubai, BITS Pilani Dubai, and Heriot-Watt—offering globally identical degrees.

Indian students study in a tax-free economy with a massive multinational corporate presence, international internship opportunities, and luxury student housing.

High-performing graduates can qualify for the UAE 10-Year Golden Visa, establishing long-term residency in the Middle East''s commercial center.'),
    programs_offered_notes = COALESCE(programs_offered_notes, 'Leading in International Business & MBA, Civil Engineering, AI & Fintech, Hospitality Management, and Media.'),
    visa_type = COALESCE(visa_type, 'UAE Student Residence Visa'),
    visa_processing_time = COALESCE(visa_processing_time, '2 to 3 weeks'),
    work_hours_during_term = COALESCE(work_hours_during_term, 'Part-time student work permitted with university NOC'),
    financial_proof_required = COALESCE(financial_proof_required, 'Tuition payment and basic financial affidavit'),
    pr_pathway_summary = COALESCE(pr_pathway_summary, 'Student Visa → UAE Green Visa / Golden Visa → Corporate Employment.'),
    post_study_work_visa = COALESCE(post_study_work_visa, '2-Year Green Visa or 10-Year Golden Visa for high achievers')
  WHERE slug = 'uae';
UPDATE public.countries SET
    hero_subtitle = COALESCE(hero_subtitle, 'UK & Australian Twinning Campuses (Monash, Nottingham) • ₹6 - 10 Lakhs / yr All-Inclusive'),
    overview_heading = COALESCE(overview_heading, 'Affordable Global Degrees with Direct Twinning & Transfer to UK/Australia'),
    overview_body = COALESCE(overview_body, 'Malaysia offers foreign branch campuses of top universities—such as Monash University Malaysia, University of Nottingham, and Curtin University—at one-third the tuition cost of studying in Australia or the UK.

Through unique ''2+1'' and ''1+2'' twinning programs, students can complete the initial years in Malaysia and transfer seamlessly to the home campus in Melbourne or Nottingham.

With modern infrastructure in Kuala Lumpur, halal food, and a very low cost of living, Malaysia is a top value-for-money study hub.'),
    programs_offered_notes = COALESCE(programs_offered_notes, 'Computer Science, Chemical Engineering, Business & Finance, and Biotechnology.'),
    visa_type = COALESCE(visa_type, 'Malaysian Student Pass (via EMGS)'),
    visa_processing_time = COALESCE(visa_processing_time, '3 to 5 weeks'),
    work_hours_during_term = COALESCE(work_hours_during_term, 'Up to 20 hours/week during semester breaks only'),
    financial_proof_required = COALESCE(financial_proof_required, 'Bank balance showing ₹4 - 6 Lakhs'),
    pr_pathway_summary = COALESCE(pr_pathway_summary, 'Student Pass → Malaysian Employment Pass or transfer to UK/Australia.'),
    post_study_work_visa = COALESCE(post_study_work_visa, 'Direct transition into Employment Pass (EP) upon job offer')
  WHERE slug = 'malaysia';
UPDATE public.countries SET
    hero_subtitle = COALESCE(hero_subtitle, 'Tropical Island Hub • NMC-Compliant Medical & Tech Degrees • Visa-Friendly for Indians'),
    overview_heading = COALESCE(overview_heading, 'Safe, English-Medium Tropical Education with Direct Ties to India'),
    overview_body = COALESCE(overview_body, 'Mauritius offers a safe, multicultural, and English-speaking academic environment with strong historical and diplomatic connections to India.

Renowned medical institutions such as SSR Medical College provide NMC-compliant MBBS degrees, and technology campuses deliver accredited UK/French curriculum degrees.

With visa-on-arrival facilitation, low living expenses, and shared cultural ties, Mauritius is an attractive education destination.'),
    programs_offered_notes = COALESCE(programs_offered_notes, 'MBBS (General Medicine), Hospitality & Tourism, and Information Technology.'),
    visa_type = COALESCE(visa_type, 'Mauritius Student Visa'),
    visa_processing_time = COALESCE(visa_processing_time, '2 to 4 weeks'),
    work_hours_during_term = COALESCE(work_hours_during_term, 'Up to 20 hours/week part-time work permitted'),
    financial_proof_required = COALESCE(financial_proof_required, 'Bank statement showing ₹4 - 6 Lakhs'),
    pr_pathway_summary = COALESCE(pr_pathway_summary, 'Graduates clear NExT/FMGE in India or pursue international clinical licensure.'),
    post_study_work_visa = COALESCE(post_study_work_visa, 'YEP (Young Enterprise Scheme) work permits available')
  WHERE slug = 'mauritius';

-- Anchor destinations
UPDATE public.countries SET is_anchor = TRUE WHERE slug IN ('usa', 'uk', 'canada', 'australia', 'germany', 'ireland') AND is_anchor = FALSE;

-- Country highlights, costs, FAQs and scholarships
-- Germany
INSERT INTO public.country_highlights (country_id, kind, title, description, sort_order)
SELECT c.id, 'reason', 'Zero to Low Tuition Fees', 'Most public universities charge €0 tuition for international students, saving ₹25–40 Lakhs compared to US or UK counterparts.', 0
FROM public.countries c
WHERE c.slug = 'germany'
  AND NOT EXISTS (SELECT 1 FROM public.country_highlights t WHERE t.country_id = c.id AND t.title = 'Zero to Low Tuition Fees');
INSERT INTO public.country_highlights (country_id, kind, title, description, sort_order)
SELECT c.id, 'reason', '18-Month Jobseeker Visa', 'Graduates receive a generous 1.5-year post-study residence permit to find full-time employment matching their qualifications.', 1
FROM public.countries c
WHERE c.slug = 'germany'
  AND NOT EXISTS (SELECT 1 FROM public.country_highlights t WHERE t.country_id = c.id AND t.title = '18-Month Jobseeker Visa');
INSERT INTO public.country_highlights (country_id, kind, title, description, sort_order)
SELECT c.id, 'reason', 'Industrial Innovation & Co-ops', 'Direct partnerships with automotive and tech giants (BMW, Siemens, Bosch, SAP) offer paid student-worker (Werkstudent) contracts.', 2
FROM public.countries c
WHERE c.slug = 'germany'
  AND NOT EXISTS (SELECT 1 FROM public.country_highlights t WHERE t.country_id = c.id AND t.title = 'Industrial Innovation & Co-ops');
INSERT INTO public.country_highlights (country_id, kind, title, description, sort_order)
SELECT c.id, 'tradeoff', 'German Language Barrier', 'While master''s degrees are taught in English, conversational German (B1/B2 level) is vital for local corporate hiring and daily integration.', 3
FROM public.countries c
WHERE c.slug = 'germany'
  AND NOT EXISTS (SELECT 1 FROM public.country_highlights t WHERE t.country_id = c.id AND t.title = 'German Language Barrier');
INSERT INTO public.country_highlights (country_id, kind, title, description, sort_order)
SELECT c.id, 'tradeoff', 'Strict APS Verification', 'Indian students must clear the mandatory APS Certificate verification process before applying for their German student visa.', 4
FROM public.countries c
WHERE c.slug = 'germany'
  AND NOT EXISTS (SELECT 1 FROM public.country_highlights t WHERE t.country_id = c.id AND t.title = 'Strict APS Verification');
INSERT INTO public.country_highlights (country_id, kind, title, description, sort_order)
SELECT c.id, 'tradeoff', 'Mandatory Blocked Account', 'You must deposit €11,904 (approx. ₹11 Lakhs) in a designated blocked bank account (Coracle, Expatrio, or Fintiba) prior to visa approval.', 5
FROM public.countries c
WHERE c.slug = 'germany'
  AND NOT EXISTS (SELECT 1 FROM public.country_highlights t WHERE t.country_id = c.id AND t.title = 'Mandatory Blocked Account');
INSERT INTO public.country_program_costs (country_id, program_label, tuition_range_inr, living_cost_inr, total_annual_inr, notes, sort_order)
SELECT c.id, 'Master''s (MS/MSc - Public)', '₹0 - ₹60,000 / yr (Semester fee only)', '₹9 - 11 Lakhs / yr', '₹9 - 11.5 Lakhs', 'TU9 and state public universities charge no tuition.', 0
FROM public.countries c
WHERE c.slug = 'germany'
  AND NOT EXISTS (SELECT 1 FROM public.country_program_costs t WHERE t.country_id = c.id AND t.program_label = 'Master''s (MS/MSc - Public)');
INSERT INTO public.country_program_costs (country_id, program_label, tuition_range_inr, living_cost_inr, total_annual_inr, notes, sort_order)
SELECT c.id, 'MBA / Private Business', '₹14 - 24 Lakhs / yr', '₹9 - 11 Lakhs / yr', '₹23 - 35 Lakhs', 'Private universities like ESMT Berlin, Frankfurt School.', 1
FROM public.countries c
WHERE c.slug = 'germany'
  AND NOT EXISTS (SELECT 1 FROM public.country_program_costs t WHERE t.country_id = c.id AND t.program_label = 'MBA / Private Business');
INSERT INTO public.country_program_costs (country_id, program_label, tuition_range_inr, living_cost_inr, total_annual_inr, notes, sort_order)
SELECT c.id, 'Bachelor''s Degrees', '₹0 - ₹80,000 / yr', '₹9 - 11 Lakhs / yr', '₹9 - 12 Lakhs', 'Requires Studienkolleg foundation year for 12-year Indian schooling.', 2
FROM public.countries c
WHERE c.slug = 'germany'
  AND NOT EXISTS (SELECT 1 FROM public.country_program_costs t WHERE t.country_id = c.id AND t.program_label = 'Bachelor''s Degrees');
INSERT INTO public.country_program_costs (country_id, program_label, tuition_range_inr, living_cost_inr, total_annual_inr, notes, sort_order)
SELECT c.id, 'Ausbildung (Vocational)', '₹0 (Zero Tuition + Paid Stipend)', 'Covered by monthly €1,000 - €1,400 stipend', '₹0 Net Cost', 'Dual vocational training with healthcare, IT, and mechanics.', 3
FROM public.countries c
WHERE c.slug = 'germany'
  AND NOT EXISTS (SELECT 1 FROM public.country_program_costs t WHERE t.country_id = c.id AND t.program_label = 'Ausbildung (Vocational)');
INSERT INTO public.country_hidden_costs (country_id, item, cost_inr, frequency, sort_order)
SELECT c.id, 'APS Certificate Processing Fee', '₹18,000', 'One-time', 0
FROM public.countries c
WHERE c.slug = 'germany'
  AND NOT EXISTS (SELECT 1 FROM public.country_hidden_costs t WHERE t.country_id = c.id AND t.item = 'APS Certificate Processing Fee');
INSERT INTO public.country_hidden_costs (country_id, item, cost_inr, frequency, sort_order)
SELECT c.id, 'Blocked Account Setup & Fee', '₹12,000', 'One-time', 1
FROM public.countries c
WHERE c.slug = 'germany'
  AND NOT EXISTS (SELECT 1 FROM public.country_hidden_costs t WHERE t.country_id = c.id AND t.item = 'Blocked Account Setup & Fee');
INSERT INTO public.country_hidden_costs (country_id, item, cost_inr, frequency, sort_order)
SELECT c.id, 'Public Health Insurance (TK / Barmer)', '₹11,500 / month', 'Monthly', 2
FROM public.countries c
WHERE c.slug = 'germany'
  AND NOT EXISTS (SELECT 1 FROM public.country_hidden_costs t WHERE t.country_id = c.id AND t.item = 'Public Health Insurance (TK / Barmer)');
INSERT INTO public.country_hidden_costs (country_id, item, cost_inr, frequency, sort_order)
SELECT c.id, 'Semester Ticket (Free Regional Transit)', 'Included in Semester Fee', 'Per Semester', 3
FROM public.countries c
WHERE c.slug = 'germany'
  AND NOT EXISTS (SELECT 1 FROM public.country_hidden_costs t WHERE t.country_id = c.id AND t.item = 'Semester Ticket (Free Regional Transit)');
INSERT INTO public.faqs (scope, scope_id, question, answer, sort_order)
SELECT 'country', c.id, 'Is studying in Germany truly tuition-free for Indian students?', 'Yes. At public universities in 15 out of 16 German federal states (except Baden-Württemberg which charges €1,500/sem), both EU and non-EU international students pay zero tuition fees, only a semester admin fee of €250–€350.', 0
FROM public.countries c
WHERE c.slug = 'germany'
  AND NOT EXISTS (SELECT 1 FROM public.faqs t WHERE t.scope = 'country' AND t.scope_id = c.id AND t.question = 'Is studying in Germany truly tuition-free for Indian students?');
INSERT INTO public.faqs (scope, scope_id, question, answer, sort_order)
SELECT 'country', c.id, 'What is an APS Certificate and why is it mandatory?', 'The Akademische Prüfstelle (APS) certificate verifies the authenticity of Indian academic marksheets. Issued by the German Embassy in New Delhi, it is a mandatory prerequisite before applying for a student visa.', 1
FROM public.countries c
WHERE c.slug = 'germany'
  AND NOT EXISTS (SELECT 1 FROM public.faqs t WHERE t.scope = 'country' AND t.scope_id = c.id AND t.question = 'What is an APS Certificate and why is it mandatory?');
INSERT INTO public.faqs (scope, scope_id, question, answer, sort_order)
SELECT 'country', c.id, 'Can I study a Master''s degree in Germany in English?', 'Yes, over 1,800 master''s degree programs in Germany are conducted 100% in English, specifically in STEM, Business, Computer Science, and Data Analytics.', 2
FROM public.countries c
WHERE c.slug = 'germany'
  AND NOT EXISTS (SELECT 1 FROM public.faqs t WHERE t.scope = 'country' AND t.scope_id = c.id AND t.question = 'Can I study a Master''s degree in Germany in English?');
INSERT INTO public.faqs (scope, scope_id, question, answer, sort_order)
SELECT 'country', c.id, 'How much money do I need in my blocked account for 2026-2027?', 'The official requirement is €11,904 per year (€992 per month) deposited into an approved blocked account provider like Expatrio, Coracle, or Fintiba before your visa appointment.', 3
FROM public.countries c
WHERE c.slug = 'germany'
  AND NOT EXISTS (SELECT 1 FROM public.faqs t WHERE t.scope = 'country' AND t.scope_id = c.id AND t.question = 'How much money do I need in my blocked account for 2026-2027?');
INSERT INTO public.faqs (scope, scope_id, question, answer, sort_order)
SELECT 'country', c.id, 'What is Germany Ausbildung for Indian students?', 'Ausbildung is a government-regulated 3-year dual apprenticeship where you work for a company 3–4 days a week while attending vocational school 1–2 days. You pay zero tuition and receive a monthly stipend of €1,000 to €1,400.', 4
FROM public.countries c
WHERE c.slug = 'germany'
  AND NOT EXISTS (SELECT 1 FROM public.faqs t WHERE t.scope = 'country' AND t.scope_id = c.id AND t.question = 'What is Germany Ausbildung for Indian students?');
INSERT INTO public.scholarships (name, provider, country_id, award_summary, eligibility_note, deadline_note, sort_order)
SELECT 'DAAD Master Studies Scholarships', 'Government', c.id, '€934/month + Travel allowance', 'Top academic performers in Bachelor''s applying for German master''s', 'October - November annually', 100
FROM public.countries c
WHERE c.slug = 'germany'
  AND NOT EXISTS (SELECT 1 FROM public.scholarships t WHERE t.name = 'DAAD Master Studies Scholarships');
INSERT INTO public.scholarships (name, provider, country_id, award_summary, eligibility_note, deadline_note, sort_order)
SELECT 'Deutschlandstipendium', 'Government', c.id, '€300/month', 'Enrolled students with outstanding high-school/college grades & social commitment', 'Rolling per university', 101
FROM public.countries c
WHERE c.slug = 'germany'
  AND NOT EXISTS (SELECT 1 FROM public.scholarships t WHERE t.name = 'Deutschlandstipendium');
INSERT INTO public.scholarships (name, provider, country_id, award_summary, eligibility_note, deadline_note, sort_order)
SELECT 'Konrad-Adenauer-Stiftung Fellowship', 'Private', c.id, '€861/month + insurance coverage', 'Students with proven leadership and interest in public policy/academics', 'July 15 annually', 102
FROM public.countries c
WHERE c.slug = 'germany'
  AND NOT EXISTS (SELECT 1 FROM public.scholarships t WHERE t.name = 'Konrad-Adenauer-Stiftung Fellowship');
-- United States
INSERT INTO public.country_highlights (country_id, kind, title, description, sort_order)
SELECT c.id, 'reason', '3-Year STEM OPT Work Rights', 'Work for up to 36 months post-graduation in the US tech and engineering ecosystem on an F-1 student visa.', 0
FROM public.countries c
WHERE c.slug = 'usa'
  AND NOT EXISTS (SELECT 1 FROM public.country_highlights t WHERE t.country_id = c.id AND t.title = '3-Year STEM OPT Work Rights');
INSERT INTO public.country_highlights (country_id, kind, title, description, sort_order)
SELECT c.id, 'reason', 'Top Starting Compensation', 'US STEM master''s and MBA graduates command median starting salaries of $85,000 to $130,000 (₹75 Lakhs to ₹1.1 Crore).', 1
FROM public.countries c
WHERE c.slug = 'usa'
  AND NOT EXISTS (SELECT 1 FROM public.country_highlights t WHERE t.country_id = c.id AND t.title = 'Top Starting Compensation');
INSERT INTO public.country_highlights (country_id, kind, title, description, sort_order)
SELECT c.id, 'reason', 'Research & Teaching Assistantships', 'Graduate Assistantships (GRA/GTA) often waive 50%–100% of tuition while providing a living monthly stipend.', 2
FROM public.countries c
WHERE c.slug = 'usa'
  AND NOT EXISTS (SELECT 1 FROM public.country_highlights t WHERE t.country_id = c.id AND t.title = 'Research & Teaching Assistantships');
INSERT INTO public.country_highlights (country_id, kind, title, description, sort_order)
SELECT c.id, 'tradeoff', 'Higher Cost of Attendance', 'Average annual tuition ranges between ₹25 and ₹45 Lakhs, making education loans and financial planning critical.', 3
FROM public.countries c
WHERE c.slug = 'usa'
  AND NOT EXISTS (SELECT 1 FROM public.country_highlights t WHERE t.country_id = c.id AND t.title = 'Higher Cost of Attendance');
INSERT INTO public.country_highlights (country_id, kind, title, description, sort_order)
SELECT c.id, 'tradeoff', 'Competitive Visa Interview', 'F-1 student visa approval relies heavily on a 2-minute consular interview proving strong non-immigrant intent and funding.', 4
FROM public.countries c
WHERE c.slug = 'usa'
  AND NOT EXISTS (SELECT 1 FROM public.country_highlights t WHERE t.country_id = c.id AND t.title = 'Competitive Visa Interview');
INSERT INTO public.country_highlights (country_id, kind, title, description, sort_order)
SELECT c.id, 'tradeoff', 'H-1B Lottery Cap', 'Transition from F-1 STEM OPT to long-term work authorization is subject to the annual US H-1B lottery cap.', 5
FROM public.countries c
WHERE c.slug = 'usa'
  AND NOT EXISTS (SELECT 1 FROM public.country_highlights t WHERE t.country_id = c.id AND t.title = 'H-1B Lottery Cap');
INSERT INTO public.country_program_costs (country_id, program_label, tuition_range_inr, living_cost_inr, total_annual_inr, notes, sort_order)
SELECT c.id, 'Master''s (STEM MS)', '₹25 - 42 Lakhs / yr', '₹10 - 15 Lakhs / yr', '₹35 - 57 Lakhs', 'Public state universities (e.g. GaTech, Purdue) offer high ROI.', 0
FROM public.countries c
WHERE c.slug = 'usa'
  AND NOT EXISTS (SELECT 1 FROM public.country_program_costs t WHERE t.country_id = c.id AND t.program_label = 'Master''s (STEM MS)');
INSERT INTO public.country_program_costs (country_id, program_label, tuition_range_inr, living_cost_inr, total_annual_inr, notes, sort_order)
SELECT c.id, 'MBA (Top 50 Schools)', '₹38 - 65 Lakhs / yr', '₹14 - 20 Lakhs / yr', '₹52 - 85 Lakhs', 'Top MBA programs yield six-figure dollar starting packages.', 1
FROM public.countries c
WHERE c.slug = 'usa'
  AND NOT EXISTS (SELECT 1 FROM public.country_program_costs t WHERE t.country_id = c.id AND t.program_label = 'MBA (Top 50 Schools)');
INSERT INTO public.country_program_costs (country_id, program_label, tuition_range_inr, living_cost_inr, total_annual_inr, notes, sort_order)
SELECT c.id, 'Undergraduate (BS/BA)', '₹28 - 48 Lakhs / yr', '₹12 - 16 Lakhs / yr', '₹40 - 64 Lakhs', '4-year degrees with rich campus life and Co-op options.', 2
FROM public.countries c
WHERE c.slug = 'usa'
  AND NOT EXISTS (SELECT 1 FROM public.country_program_costs t WHERE t.country_id = c.id AND t.program_label = 'Undergraduate (BS/BA)');
INSERT INTO public.country_hidden_costs (country_id, item, cost_inr, frequency, sort_order)
SELECT c.id, 'SEVIS I-901 Fee', '₹30,500 ($350)', 'One-time', 0
FROM public.countries c
WHERE c.slug = 'usa'
  AND NOT EXISTS (SELECT 1 FROM public.country_hidden_costs t WHERE t.country_id = c.id AND t.item = 'SEVIS I-901 Fee');
INSERT INTO public.country_hidden_costs (country_id, item, cost_inr, frequency, sort_order)
SELECT c.id, 'DS-160 Visa Application Fee', '₹16,100 ($185)', 'One-time', 1
FROM public.countries c
WHERE c.slug = 'usa'
  AND NOT EXISTS (SELECT 1 FROM public.country_hidden_costs t WHERE t.country_id = c.id AND t.item = 'DS-160 Visa Application Fee');
INSERT INTO public.country_hidden_costs (country_id, item, cost_inr, frequency, sort_order)
SELECT c.id, 'University Mandatory Health Insurance', '₹1.5 - 2.5 Lakhs / yr', 'Annual', 2
FROM public.countries c
WHERE c.slug = 'usa'
  AND NOT EXISTS (SELECT 1 FROM public.country_hidden_costs t WHERE t.country_id = c.id AND t.item = 'University Mandatory Health Insurance');
INSERT INTO public.country_hidden_costs (country_id, item, cost_inr, frequency, sort_order)
SELECT c.id, 'Standardized Tests (GRE/TOEFL/IELTS)', '₹40,000 total', 'One-time', 3
FROM public.countries c
WHERE c.slug = 'usa'
  AND NOT EXISTS (SELECT 1 FROM public.country_hidden_costs t WHERE t.country_id = c.id AND t.item = 'Standardized Tests (GRE/TOEFL/IELTS)');
INSERT INTO public.faqs (scope, scope_id, question, answer, sort_order)
SELECT 'country', c.id, 'What is STEM OPT and how does it help Indian students?', 'STEM OPT allows graduates of science, technology, engineering, and mathematics programs to work in the US for up to 3 years post-graduation on their student visa, giving them multiple chances in the H-1B visa lottery.', 0
FROM public.countries c
WHERE c.slug = 'usa'
  AND NOT EXISTS (SELECT 1 FROM public.faqs t WHERE t.scope = 'country' AND t.scope_id = c.id AND t.question = 'What is STEM OPT and how does it help Indian students?');
INSERT INTO public.faqs (scope, scope_id, question, answer, sort_order)
SELECT 'country', c.id, 'Is the GRE mandatory for MS in the USA in 2026-2027?', 'Many top US universities (such as GaTech, UIUC, Columbia) have made GRE optional or waived it for select master''s programs, though submitting a 315+ GRE score significantly strengthens scholarship chances.', 1
FROM public.countries c
WHERE c.slug = 'usa'
  AND NOT EXISTS (SELECT 1 FROM public.faqs t WHERE t.scope = 'country' AND t.scope_id = c.id AND t.question = 'Is the GRE mandatory for MS in the USA in 2026-2027?');
INSERT INTO public.faqs (scope, scope_id, question, answer, sort_order)
SELECT 'country', c.id, 'How much total budget should an Indian family plan for a 2-year MS in USA?', 'A typical 2-year MS in the US requires ₹45 to ₹75 Lakhs all-inclusive. However, students who secure Graduate Assistantships or internships can recover 40%–60% of this cost during their degree.', 2
FROM public.countries c
WHERE c.slug = 'usa'
  AND NOT EXISTS (SELECT 1 FROM public.faqs t WHERE t.scope = 'country' AND t.scope_id = c.id AND t.question = 'How much total budget should an Indian family plan for a 2-year MS in USA?');
INSERT INTO public.scholarships (name, provider, country_id, award_summary, eligibility_note, deadline_note, sort_order)
SELECT 'Fullbright-Nehru Master’s Fellowships', 'Government', c.id, 'Full tuition + Airfare + Living Stipend', 'Indian graduates with 3+ years professional work experience', 'Mid-May annually', 100
FROM public.countries c
WHERE c.slug = 'usa'
  AND NOT EXISTS (SELECT 1 FROM public.scholarships t WHERE t.name = 'Fullbright-Nehru Master’s Fellowships');
INSERT INTO public.scholarships (name, provider, country_id, award_summary, eligibility_note, deadline_note, sort_order)
SELECT 'University Graduate Assistantships (GRA/GTA)', 'University', c.id, '50% - 100% Tuition waiver + $1,500 - $2,500/mo', 'Strong undergraduate research, coding skills, and GRE scores', 'Departmental intake deadlines', 101
FROM public.countries c
WHERE c.slug = 'usa'
  AND NOT EXISTS (SELECT 1 FROM public.scholarships t WHERE t.name = 'University Graduate Assistantships (GRA/GTA)');
INSERT INTO public.scholarships (name, provider, country_id, award_summary, eligibility_note, deadline_note, sort_order)
SELECT 'Inlaks Shivdasani Foundation Scholarships', 'Private', c.id, 'Up to $100,000 for elite institutions', 'Top-tier Indian admits to Harvard, Stanford, MIT, Columbia, etc.', 'March 30 annually', 102
FROM public.countries c
WHERE c.slug = 'usa'
  AND NOT EXISTS (SELECT 1 FROM public.scholarships t WHERE t.name = 'Inlaks Shivdasani Foundation Scholarships');
-- United Kingdom
INSERT INTO public.country_highlights (country_id, kind, title, description, sort_order)
SELECT c.id, 'reason', '1-Year Master''s Programs', 'Complete your MSc or MA in just 12 months, saving a full year of overseas living expenses.', 0
FROM public.countries c
WHERE c.slug = 'uk'
  AND NOT EXISTS (SELECT 1 FROM public.country_highlights t WHERE t.country_id = c.id AND t.title = '1-Year Master''s Programs');
INSERT INTO public.country_highlights (country_id, kind, title, description, sort_order)
SELECT c.id, 'reason', 'Unrestricted Graduate Visa', 'Work for 18 months after graduation (3 years after a PhD) with no minimum salary or sponsorship requirements.', 1
FROM public.countries c
WHERE c.slug = 'uk'
  AND NOT EXISTS (SELECT 1 FROM public.country_highlights t WHERE t.country_id = c.id AND t.title = 'Unrestricted Graduate Visa');
INSERT INTO public.country_highlights (country_id, kind, title, description, sort_order)
SELECT c.id, 'reason', 'Russell Group Global Recognition', 'Degrees from historic research powerhouses carry immense weight with Indian MNCs and global recruiters.', 2
FROM public.countries c
WHERE c.slug = 'uk'
  AND NOT EXISTS (SELECT 1 FROM public.country_highlights t WHERE t.country_id = c.id AND t.title = 'Russell Group Global Recognition');
INSERT INTO public.country_highlights (country_id, kind, title, description, sort_order)
SELECT c.id, 'tradeoff', 'Competitive Skilled Worker Threshold', 'Transitioning to a Skilled Worker Visa within the 18-month Graduate Route requires meeting current Home Office salary thresholds.', 3
FROM public.countries c
WHERE c.slug = 'uk'
  AND NOT EXISTS (SELECT 1 FROM public.country_highlights t WHERE t.country_id = c.id AND t.title = 'Competitive Skilled Worker Threshold');
INSERT INTO public.country_highlights (country_id, kind, title, description, sort_order)
SELECT c.id, 'tradeoff', 'Higher London Living Costs', 'Living expenses in Central London (approx. ₹13–15 Lakhs/yr) are considerably higher than in Northern England or Scotland.', 4
FROM public.countries c
WHERE c.slug = 'uk'
  AND NOT EXISTS (SELECT 1 FROM public.country_highlights t WHERE t.country_id = c.id AND t.title = 'Higher London Living Costs');
INSERT INTO public.country_program_costs (country_id, program_label, tuition_range_inr, living_cost_inr, total_annual_inr, notes, sort_order)
SELECT c.id, 'Master''s (1-Year MSc)', '₹18 - 32 Lakhs total', '₹10 - 13 Lakhs total', '₹28 - 45 Lakhs total', 'Entire degree is completed in 1 year, minimizing total spend.', 0
FROM public.countries c
WHERE c.slug = 'uk'
  AND NOT EXISTS (SELECT 1 FROM public.country_program_costs t WHERE t.country_id = c.id AND t.program_label = 'Master''s (1-Year MSc)');
INSERT INTO public.country_program_costs (country_id, program_label, tuition_range_inr, living_cost_inr, total_annual_inr, notes, sort_order)
SELECT c.id, 'MBA (1-Year)', '₹25 - 45 Lakhs total', '₹11 - 15 Lakhs total', '₹36 - 60 Lakhs total', 'Fast-track executive and management training.', 1
FROM public.countries c
WHERE c.slug = 'uk'
  AND NOT EXISTS (SELECT 1 FROM public.country_program_costs t WHERE t.country_id = c.id AND t.program_label = 'MBA (1-Year)');
INSERT INTO public.country_program_costs (country_id, program_label, tuition_range_inr, living_cost_inr, total_annual_inr, notes, sort_order)
SELECT c.id, 'Bachelor''s (3-Year)', '₹16 - 28 Lakhs / yr', '₹10 - 13 Lakhs / yr', '₹26 - 41 Lakhs / yr', 'Standard UK undergraduate honours degree.', 2
FROM public.countries c
WHERE c.slug = 'uk'
  AND NOT EXISTS (SELECT 1 FROM public.country_program_costs t WHERE t.country_id = c.id AND t.program_label = 'Bachelor''s (3-Year)');
INSERT INTO public.country_hidden_costs (country_id, item, cost_inr, frequency, sort_order)
SELECT c.id, 'Immigration Health Surcharge (IHS)', '₹85,000 (£776) / yr', 'Annual', 0
FROM public.countries c
WHERE c.slug = 'uk'
  AND NOT EXISTS (SELECT 1 FROM public.country_hidden_costs t WHERE t.country_id = c.id AND t.item = 'Immigration Health Surcharge (IHS)');
INSERT INTO public.country_hidden_costs (country_id, item, cost_inr, frequency, sort_order)
SELECT c.id, 'Student Visa Application Fee', '₹54,000 (£490)', 'One-time', 1
FROM public.countries c
WHERE c.slug = 'uk'
  AND NOT EXISTS (SELECT 1 FROM public.country_hidden_costs t WHERE t.country_id = c.id AND t.item = 'Student Visa Application Fee');
INSERT INTO public.country_hidden_costs (country_id, item, cost_inr, frequency, sort_order)
SELECT c.id, 'CAS Deposit to University', '₹2 - 4 Lakhs', 'Adjusted against tuition', 2
FROM public.countries c
WHERE c.slug = 'uk'
  AND NOT EXISTS (SELECT 1 FROM public.country_hidden_costs t WHERE t.country_id = c.id AND t.item = 'CAS Deposit to University');
INSERT INTO public.faqs (scope, scope_id, question, answer, sort_order)
SELECT 'country', c.id, 'Is the UK Graduate Route (Post-Study Work Visa) still active for Indian students?', 'Yes, but it is shorter. Graduate Route applications made on or after 1 January 2027 are granted 18 months instead of 2 years. PhD graduates still get 3 years.', 0
FROM public.countries c
WHERE c.slug = 'uk'
  AND NOT EXISTS (SELECT 1 FROM public.faqs t WHERE t.scope = 'country' AND t.scope_id = c.id AND t.question = 'Is the UK Graduate Route (Post-Study Work Visa) still active for Indian students?');
INSERT INTO public.faqs (scope, scope_id, question, answer, sort_order)
SELECT 'country', c.id, 'Can Indian students study in the UK without IELTS?', 'Many UK universities waive the IELTS requirement if you scored 70%+ in 12th Standard English from CBSE, ICSE, or selected State Boards.', 1
FROM public.countries c
WHERE c.slug = 'uk'
  AND NOT EXISTS (SELECT 1 FROM public.faqs t WHERE t.scope = 'country' AND t.scope_id = c.id AND t.question = 'Can Indian students study in the UK without IELTS?');
INSERT INTO public.faqs (scope, scope_id, question, answer, sort_order)
SELECT 'country', c.id, 'Are 1-year UK master’s degrees recognized in India by AIU?', 'Yes, the Association of Indian Universities (AIU) and the Ministry of Education have signed an MoU on mutual recognition of educational qualifications with the UK.', 2
FROM public.countries c
WHERE c.slug = 'uk'
  AND NOT EXISTS (SELECT 1 FROM public.faqs t WHERE t.scope = 'country' AND t.scope_id = c.id AND t.question = 'Are 1-year UK master’s degrees recognized in India by AIU?');
INSERT INTO public.scholarships (name, provider, country_id, award_summary, eligibility_note, deadline_note, sort_order)
SELECT 'Chevening Scholarships', 'Government', c.id, 'Full tuition + flights + monthly living allowance', 'Indian graduates with 2+ years work experience & leadership acumen', 'Early November annually', 100
FROM public.countries c
WHERE c.slug = 'uk'
  AND NOT EXISTS (SELECT 1 FROM public.scholarships t WHERE t.name = 'Chevening Scholarships');
INSERT INTO public.scholarships (name, provider, country_id, award_summary, eligibility_note, deadline_note, sort_order)
SELECT 'Commonwealth Scholarships', 'Government', c.id, 'Full funding for master''s & PhD', 'Talented Indian students unable to afford overseas education', 'December annually', 101
FROM public.countries c
WHERE c.slug = 'uk'
  AND NOT EXISTS (SELECT 1 FROM public.scholarships t WHERE t.name = 'Commonwealth Scholarships');
INSERT INTO public.scholarships (name, provider, country_id, award_summary, eligibility_note, deadline_note, sort_order)
SELECT 'GREAT Scholarships (India)', 'Government', c.id, '£10,000 tuition fee discount', 'Open to Indian passport holders applying to participating UK institutions', 'March - May annually', 102
FROM public.countries c
WHERE c.slug = 'uk'
  AND NOT EXISTS (SELECT 1 FROM public.scholarships t WHERE t.name = 'GREAT Scholarships (India)');
-- Russia
INSERT INTO public.country_highlights (country_id, kind, title, description, sort_order)
SELECT c.id, 'reason', '100% NMC & WHO Compliant', '5+1 year curriculum adhering strictly to NMC 2021 Gazette regulations with English instruction.', 0
FROM public.countries c
WHERE c.slug = 'russia'
  AND NOT EXISTS (SELECT 1 FROM public.country_highlights t WHERE t.country_id = c.id AND t.title = '100% NMC & WHO Compliant');
INSERT INTO public.country_highlights (country_id, kind, title, description, sort_order)
SELECT c.id, 'reason', 'Low Tuition & Cost of Living', 'Complete your entire 6-year medical degree for the cost of a single year in an Indian private medical college.', 1
FROM public.countries c
WHERE c.slug = 'russia'
  AND NOT EXISTS (SELECT 1 FROM public.country_highlights t WHERE t.country_id = c.id AND t.title = 'Low Tuition & Cost of Living');
INSERT INTO public.country_highlights (country_id, kind, title, description, sort_order)
SELECT c.id, 'reason', 'Indian Food & Dedicated Hostels', 'Major universities feature dedicated Indian mess facilities, hostel wardens, and established senior alumni networks.', 2
FROM public.countries c
WHERE c.slug = 'russia'
  AND NOT EXISTS (SELECT 1 FROM public.country_highlights t WHERE t.country_id = c.id AND t.title = 'Indian Food & Dedicated Hostels');
INSERT INTO public.country_highlights (country_id, kind, title, description, sort_order)
SELECT c.id, 'tradeoff', 'Russian Language for Clinicals', 'While classes are in English, conversational Russian is taught from Year 1 to interact with local hospital patients during clinical rotations.', 3
FROM public.countries c
WHERE c.slug = 'russia'
  AND NOT EXISTS (SELECT 1 FROM public.country_highlights t WHERE t.country_id = c.id AND t.title = 'Russian Language for Clinicals');
INSERT INTO public.country_highlights (country_id, kind, title, description, sort_order)
SELECT c.id, 'tradeoff', 'Cold Winter Climate', 'Temperatures can drop below freezing during winter months, requiring appropriate thermal winterwear.', 4
FROM public.countries c
WHERE c.slug = 'russia'
  AND NOT EXISTS (SELECT 1 FROM public.country_highlights t WHERE t.country_id = c.id AND t.title = 'Cold Winter Climate');
INSERT INTO public.country_program_costs (country_id, program_label, tuition_range_inr, living_cost_inr, total_annual_inr, notes, sort_order)
SELECT c.id, 'MBBS (6 Years Total)', '₹3 - 5 Lakhs / yr', '₹1.5 - 2.5 Lakhs / yr (incl. hostel & food)', '₹4.5 - 7.5 Lakhs / yr', 'Total 6-year package ranges between ₹20 and ₹32 Lakhs.', 0
FROM public.countries c
WHERE c.slug = 'russia'
  AND NOT EXISTS (SELECT 1 FROM public.country_program_costs t WHERE t.country_id = c.id AND t.program_label = 'MBBS (6 Years Total)');
INSERT INTO public.country_hidden_costs (country_id, item, cost_inr, frequency, sort_order)
SELECT c.id, 'Medical Insurance & Registration', '₹15,000 / yr', 'Annual', 0
FROM public.countries c
WHERE c.slug = 'russia'
  AND NOT EXISTS (SELECT 1 FROM public.country_hidden_costs t WHERE t.country_id = c.id AND t.item = 'Medical Insurance & Registration');
INSERT INTO public.country_hidden_costs (country_id, item, cost_inr, frequency, sort_order)
SELECT c.id, 'Hostel Fee', '₹40,000 - 80,000 / yr', 'Annual', 1
FROM public.countries c
WHERE c.slug = 'russia'
  AND NOT EXISTS (SELECT 1 FROM public.country_hidden_costs t WHERE t.country_id = c.id AND t.item = 'Hostel Fee');
INSERT INTO public.country_hidden_costs (country_id, item, cost_inr, frequency, sort_order)
SELECT c.id, 'Indian Food Mess', '₹10,000 - 12,000 / month', 'Monthly', 2
FROM public.countries c
WHERE c.slug = 'russia'
  AND NOT EXISTS (SELECT 1 FROM public.country_hidden_costs t WHERE t.country_id = c.id AND t.item = 'Indian Food Mess');
INSERT INTO public.faqs (scope, scope_id, question, answer, sort_order)
SELECT 'country', c.id, 'Is NEET qualification mandatory for Indian students studying MBBS in Russia?', 'Yes, per National Medical Commission (NMC) regulations, NEET qualification is mandatory to study MBBS abroad if you wish to practice medicine in India.', 0
FROM public.countries c
WHERE c.slug = 'russia'
  AND NOT EXISTS (SELECT 1 FROM public.faqs t WHERE t.scope = 'country' AND t.scope_id = c.id AND t.question = 'Is NEET qualification mandatory for Indian students studying MBBS in Russia?');
INSERT INTO public.faqs (scope, scope_id, question, answer, sort_order)
SELECT 'country', c.id, 'Are Russian medical degrees taught in English?', 'Yes, universities like Bashkir State Medical University and Kazan Federal University offer complete 6-year MBBS instruction in English.', 1
FROM public.countries c
WHERE c.slug = 'russia'
  AND NOT EXISTS (SELECT 1 FROM public.faqs t WHERE t.scope = 'country' AND t.scope_id = c.id AND t.question = 'Are Russian medical degrees taught in English?');
INSERT INTO public.faqs (scope, scope_id, question, answer, sort_order)
SELECT 'country', c.id, 'Can I practice as a doctor in India after completing MBBS in Russia?', 'Yes. Once you complete the 5.4 years coursework + 1-year clinical internship in Russia, you are eligible to appear for the NExT / FMGE licensing exam to practice medicine across India.', 2
FROM public.countries c
WHERE c.slug = 'russia'
  AND NOT EXISTS (SELECT 1 FROM public.faqs t WHERE t.scope = 'country' AND t.scope_id = c.id AND t.question = 'Can I practice as a doctor in India after completing MBBS in Russia?');
INSERT INTO public.scholarships (name, provider, country_id, award_summary, eligibility_note, deadline_note, sort_order)
SELECT 'Russian Government State Scholarships (Quota)', 'Government', c.id, '100% Tuition waiver for selected applicants', 'High marks in 12th PCB and Russian embassy entrance exam', 'February - March annually', 100
FROM public.countries c
WHERE c.slug = 'russia'
  AND NOT EXISTS (SELECT 1 FROM public.scholarships t WHERE t.name = 'Russian Government State Scholarships (Quota)');
-- Canada
INSERT INTO public.country_highlights (country_id, kind, title, description, sort_order)
SELECT c.id, 'reason', 'Up to 3-Year PGWP', 'Gain 3 years of open work authorization without needing an employer sponsorship upon graduating from an eligible university program.', 0
FROM public.countries c
WHERE c.slug = 'canada'
  AND NOT EXISTS (SELECT 1 FROM public.country_highlights t WHERE t.country_id = c.id AND t.title = 'Up to 3-Year PGWP');
INSERT INTO public.country_highlights (country_id, kind, title, description, sort_order)
SELECT c.id, 'reason', 'Express Entry & PNP Advantage', 'Canadian master''s degrees award additional CRS points under Express Entry and unlock province-specific tech nominee streams.', 1
FROM public.countries c
WHERE c.slug = 'canada'
  AND NOT EXISTS (SELECT 1 FROM public.country_highlights t WHERE t.country_id = c.id AND t.title = 'Express Entry & PNP Advantage');
INSERT INTO public.country_highlights (country_id, kind, title, description, sort_order)
SELECT c.id, 'reason', 'Diverse & Welcoming Culture', 'With extensive multicultural student associations, Indian students integrate quickly into Canadian academic and civic life.', 2
FROM public.countries c
WHERE c.slug = 'canada'
  AND NOT EXISTS (SELECT 1 FROM public.country_highlights t WHERE t.country_id = c.id AND t.title = 'Diverse & Welcoming Culture');
INSERT INTO public.country_highlights (country_id, kind, title, description, sort_order)
SELECT c.id, 'tradeoff', 'Study Permit Caps & PAL', 'Bachelor''s and college applicants need a Provincial Attestation Letter (PAL) under the national cap. Master''s and PhD applicants are exempt from January 2026, but approvals for Indian students remain tight.', 3
FROM public.countries c
WHERE c.slug = 'canada'
  AND NOT EXISTS (SELECT 1 FROM public.country_highlights t WHERE t.country_id = c.id AND t.title = 'Study Permit Caps & PAL');
INSERT INTO public.country_highlights (country_id, kind, title, description, sort_order)
SELECT c.id, 'tradeoff', 'Cold Climate & Housing Costs', 'Winter temperatures in central and eastern Canada are severe, and housing in the Greater Toronto and Vancouver areas requires careful budgeting.', 4
FROM public.countries c
WHERE c.slug = 'canada'
  AND NOT EXISTS (SELECT 1 FROM public.country_highlights t WHERE t.country_id = c.id AND t.title = 'Cold Climate & Housing Costs');
INSERT INTO public.country_highlights (country_id, kind, title, description, sort_order)
SELECT c.id, 'tradeoff', 'GIC Living Proof Requirement', 'You must deposit CAD $20,635 (approx. ₹13 Lakhs) into a Canadian Guaranteed Investment Certificate (GIC) before visa submission.', 5
FROM public.countries c
WHERE c.slug = 'canada'
  AND NOT EXISTS (SELECT 1 FROM public.country_highlights t WHERE t.country_id = c.id AND t.title = 'GIC Living Proof Requirement');
INSERT INTO public.country_program_costs (country_id, program_label, tuition_range_inr, living_cost_inr, total_annual_inr, notes, sort_order)
SELECT c.id, 'Master''s (MS / Meng)', '₹15 - 28 Lakhs / yr', '₹10 - 13 Lakhs / yr', '₹25 - 41 Lakhs / yr', 'Top universities: U of T, UBC, McGill, Waterloo, Alberta.', 0
FROM public.countries c
WHERE c.slug = 'canada'
  AND NOT EXISTS (SELECT 1 FROM public.country_program_costs t WHERE t.country_id = c.id AND t.program_label = 'Master''s (MS / Meng)');
INSERT INTO public.country_program_costs (country_id, program_label, tuition_range_inr, living_cost_inr, total_annual_inr, notes, sort_order)
SELECT c.id, 'MBA (Rotman, Schulich, Sauder)', '₹28 - 50 Lakhs / yr', '₹12 - 16 Lakhs / yr', '₹40 - 66 Lakhs / yr', 'Top MBA programs offering access to Toronto and Vancouver financial hubs.', 1
FROM public.countries c
WHERE c.slug = 'canada'
  AND NOT EXISTS (SELECT 1 FROM public.country_program_costs t WHERE t.country_id = c.id AND t.program_label = 'MBA (Rotman, Schulich, Sauder)');
INSERT INTO public.country_program_costs (country_id, program_label, tuition_range_inr, living_cost_inr, total_annual_inr, notes, sort_order)
SELECT c.id, 'Undergraduate Degrees', '₹18 - 35 Lakhs / yr', '₹10 - 14 Lakhs / yr', '₹28 - 49 Lakhs / yr', '4-year bachelor''s degrees with integrated Co-op terms.', 2
FROM public.countries c
WHERE c.slug = 'canada'
  AND NOT EXISTS (SELECT 1 FROM public.country_program_costs t WHERE t.country_id = c.id AND t.program_label = 'Undergraduate Degrees');
INSERT INTO public.country_hidden_costs (country_id, item, cost_inr, frequency, sort_order)
SELECT c.id, 'GIC Living Deposit Account', 'CAD $20,635 (₹13 Lakhs)', 'One-time (Returned monthly)', 0
FROM public.countries c
WHERE c.slug = 'canada'
  AND NOT EXISTS (SELECT 1 FROM public.country_hidden_costs t WHERE t.country_id = c.id AND t.item = 'GIC Living Deposit Account');
INSERT INTO public.country_hidden_costs (country_id, item, cost_inr, frequency, sort_order)
SELECT c.id, 'Study Permit Visa Application Fee', 'CAD $150 (₹9,300)', 'One-time', 1
FROM public.countries c
WHERE c.slug = 'canada'
  AND NOT EXISTS (SELECT 1 FROM public.country_hidden_costs t WHERE t.country_id = c.id AND t.item = 'Study Permit Visa Application Fee');
INSERT INTO public.country_hidden_costs (country_id, item, cost_inr, frequency, sort_order)
SELECT c.id, 'Biometrics Fee', 'CAD $85 (₹5,300)', 'One-time', 2
FROM public.countries c
WHERE c.slug = 'canada'
  AND NOT EXISTS (SELECT 1 FROM public.country_hidden_costs t WHERE t.country_id = c.id AND t.item = 'Biometrics Fee');
INSERT INTO public.faqs (scope, scope_id, question, answer, sort_order)
SELECT 'country', c.id, 'How does the recent Canada student visa cap affect Indian applicants in 2026-2027?', 'From January 2026, master''s and doctoral applicants no longer need a PAL and have their own allocation under the cap. Bachelor''s and college applicants still need a PAL from the province. PGWP applicants from universities must show CLB 7 English.', 0
FROM public.countries c
WHERE c.slug = 'canada'
  AND NOT EXISTS (SELECT 1 FROM public.faqs t WHERE t.scope = 'country' AND t.scope_id = c.id AND t.question = 'How does the recent Canada student visa cap affect Indian applicants in 2026-2027?');
INSERT INTO public.faqs (scope, scope_id, question, answer, sort_order)
SELECT 'country', c.id, 'What is a GIC and why is it mandatory for Canada?', 'A Guaranteed Investment Certificate (GIC) is a special bank account holding CAD $20,635 that demonstrates proof of living funds. The bank dispenses a monthly living allowance back to the student once in Canada.', 1
FROM public.countries c
WHERE c.slug = 'canada'
  AND NOT EXISTS (SELECT 1 FROM public.faqs t WHERE t.scope = 'country' AND t.scope_id = c.id AND t.question = 'What is a GIC and why is it mandatory for Canada?');
INSERT INTO public.scholarships (name, provider, country_id, award_summary, eligibility_note, deadline_note, sort_order)
SELECT 'Vanier Canada Graduate Scholarships', 'Government', c.id, 'CAD $50,000 / year for 3 years', 'High-achieving doctoral students in STEM, health, and humanities', 'Early November annually', 100
FROM public.countries c
WHERE c.slug = 'canada'
  AND NOT EXISTS (SELECT 1 FROM public.scholarships t WHERE t.name = 'Vanier Canada Graduate Scholarships');
INSERT INTO public.scholarships (name, provider, country_id, award_summary, eligibility_note, deadline_note, sort_order)
SELECT 'University International Entrance Scholarships', 'University', c.id, 'CAD $5,000 - $25,000', 'Merit-based admission score above 85% in 12th/Undergrad', 'Automated at admission', 101
FROM public.countries c
WHERE c.slug = 'canada'
  AND NOT EXISTS (SELECT 1 FROM public.scholarships t WHERE t.name = 'University International Entrance Scholarships');
-- Australia
INSERT INTO public.country_highlights (country_id, kind, title, description, sort_order)
SELECT c.id, 'reason', 'Group of Eight (Go8) Prestige', '7 of the Go8 universities rank in the global top 50, delivering research quality and industry links.', 0
FROM public.countries c
WHERE c.slug = 'australia'
  AND NOT EXISTS (SELECT 1 FROM public.country_highlights t WHERE t.country_id = c.id AND t.title = 'Group of Eight (Go8) Prestige');
INSERT INTO public.country_highlights (country_id, kind, title, description, sort_order)
SELECT c.id, 'reason', 'Highest Global Student Wage', 'With Australia''s high minimum hourly wage ($24.10/hr), part-time student work covers a substantial portion of living expenses.', 1
FROM public.countries c
WHERE c.slug = 'australia'
  AND NOT EXISTS (SELECT 1 FROM public.country_highlights t WHERE t.country_id = c.id AND t.title = 'Highest Global Student Wage');
INSERT INTO public.country_highlights (country_id, kind, title, description, sort_order)
SELECT c.id, 'reason', 'Regional Study Bonus', 'Studying in cities like Adelaide, Perth, or Brisbane provides up to 1–2 additional years on your Post-Study Work visa.', 2
FROM public.countries c
WHERE c.slug = 'australia'
  AND NOT EXISTS (SELECT 1 FROM public.country_highlights t WHERE t.country_id = c.id AND t.title = 'Regional Study Bonus');
INSERT INTO public.country_highlights (country_id, kind, title, description, sort_order)
SELECT c.id, 'tradeoff', 'Genuine Student (GS) Requirement', 'Australia enforces a strict Genuine Student (GS) assessment focusing on career progression and financial capability.', 3
FROM public.countries c
WHERE c.slug = 'australia'
  AND NOT EXISTS (SELECT 1 FROM public.country_highlights t WHERE t.country_id = c.id AND t.title = 'Genuine Student (GS) Requirement');
INSERT INTO public.country_highlights (country_id, kind, title, description, sort_order)
SELECT c.id, 'tradeoff', 'High Living Costs in Sydney & Melbourne', 'Accommodation in Sydney and Melbourne requires planning (approx. ₹11–14 Lakhs/yr).', 4
FROM public.countries c
WHERE c.slug = 'australia'
  AND NOT EXISTS (SELECT 1 FROM public.country_highlights t WHERE t.country_id = c.id AND t.title = 'High Living Costs in Sydney & Melbourne');
INSERT INTO public.country_program_costs (country_id, program_label, tuition_range_inr, living_cost_inr, total_annual_inr, notes, sort_order)
SELECT c.id, 'Master''s (MS/MSc)', '₹18 - 32 Lakhs / yr', '₹11 - 14 Lakhs / yr', '₹29 - 46 Lakhs / yr', '2-year degrees with comprehensive industry capstones.', 0
FROM public.countries c
WHERE c.slug = 'australia'
  AND NOT EXISTS (SELECT 1 FROM public.country_program_costs t WHERE t.country_id = c.id AND t.program_label = 'Master''s (MS/MSc)');
INSERT INTO public.country_program_costs (country_id, program_label, tuition_range_inr, living_cost_inr, total_annual_inr, notes, sort_order)
SELECT c.id, 'MBA (Melbourne, AGSM, Monash)', '₹26 - 45 Lakhs / yr', '₹12 - 16 Lakhs / yr', '₹38 - 61 Lakhs / yr', 'Top Asia-Pacific business school rankings.', 1
FROM public.countries c
WHERE c.slug = 'australia'
  AND NOT EXISTS (SELECT 1 FROM public.country_program_costs t WHERE t.country_id = c.id AND t.program_label = 'MBA (Melbourne, AGSM, Monash)');
INSERT INTO public.country_program_costs (country_id, program_label, tuition_range_inr, living_cost_inr, total_annual_inr, notes, sort_order)
SELECT c.id, 'Bachelor''s Degrees (3-4 Years)', '₹16 - 30 Lakhs / yr', '₹11 - 14 Lakhs / yr', '₹27 - 44 Lakhs / yr', 'Direct entry for CBSE/ICSE students.', 2
FROM public.countries c
WHERE c.slug = 'australia'
  AND NOT EXISTS (SELECT 1 FROM public.country_program_costs t WHERE t.country_id = c.id AND t.program_label = 'Bachelor''s Degrees (3-4 Years)');
INSERT INTO public.country_hidden_costs (country_id, item, cost_inr, frequency, sort_order)
SELECT c.id, 'Overseas Student Health Cover (OSHC)', 'AUD $600 - $800 / yr (₹35,000 - ₹45,000)', 'Annual', 0
FROM public.countries c
WHERE c.slug = 'australia'
  AND NOT EXISTS (SELECT 1 FROM public.country_hidden_costs t WHERE t.country_id = c.id AND t.item = 'Overseas Student Health Cover (OSHC)');
INSERT INTO public.country_hidden_costs (country_id, item, cost_inr, frequency, sort_order)
SELECT c.id, 'Student Visa Subclass 500 Fee', 'AUD $1,600 (₹88,000)', 'One-time', 1
FROM public.countries c
WHERE c.slug = 'australia'
  AND NOT EXISTS (SELECT 1 FROM public.country_hidden_costs t WHERE t.country_id = c.id AND t.item = 'Student Visa Subclass 500 Fee');
INSERT INTO public.faqs (scope, scope_id, question, answer, sort_order)
SELECT 'country', c.id, 'What is the work hour limit for international students in Australia?', 'Students on a Subclass 500 visa can work up to 48 hours per fortnight during university terms and unlimited hours during scheduled vacations.', 0
FROM public.countries c
WHERE c.slug = 'australia'
  AND NOT EXISTS (SELECT 1 FROM public.faqs t WHERE t.scope = 'country' AND t.scope_id = c.id AND t.question = 'What is the work hour limit for international students in Australia?');
INSERT INTO public.faqs (scope, scope_id, question, answer, sort_order)
SELECT 'country', c.id, 'What are regional study benefits in Australia?', 'Studying in regional centers like Adelaide, Perth, Gold Coast, or Canberra gives students 1–2 additional years on their post-study work visa and 5 extra points for Permanent Residency.', 1
FROM public.countries c
WHERE c.slug = 'australia'
  AND NOT EXISTS (SELECT 1 FROM public.faqs t WHERE t.scope = 'country' AND t.scope_id = c.id AND t.question = 'What are regional study benefits in Australia?');
INSERT INTO public.scholarships (name, provider, country_id, award_summary, eligibility_note, deadline_note, sort_order)
SELECT 'Australia Awards Scholarships', 'Government', c.id, 'Full tuition + Airfare + Living allowance', 'High-potential Indian leaders in development & science', 'April 30 annually', 100
FROM public.countries c
WHERE c.slug = 'australia'
  AND NOT EXISTS (SELECT 1 FROM public.scholarships t WHERE t.name = 'Australia Awards Scholarships');
INSERT INTO public.scholarships (name, provider, country_id, award_summary, eligibility_note, deadline_note, sort_order)
SELECT 'Go8 Global Excellence Scholarships', 'University', c.id, '20% - 50% Tuition fee reduction', 'Merit-based on undergraduate CGPA > 8.0/10', 'Automated with offer', 101
FROM public.countries c
WHERE c.slug = 'australia'
  AND NOT EXISTS (SELECT 1 FROM public.scholarships t WHERE t.name = 'Go8 Global Excellence Scholarships');
-- Ireland
INSERT INTO public.country_highlights (country_id, kind, title, description, sort_order)
SELECT c.id, 'reason', '2-Year Third Level Stay Back', 'Master''s graduates receive a 24-month work authorization to work across European MNCs based in Dublin and Cork.', 0
FROM public.countries c
WHERE c.slug = 'ireland'
  AND NOT EXISTS (SELECT 1 FROM public.country_highlights t WHERE t.country_id = c.id AND t.title = '2-Year Third Level Stay Back');
INSERT INTO public.country_highlights (country_id, kind, title, description, sort_order)
SELECT c.id, 'reason', 'Global Tech & Pharma Hub', 'Europe''s largest concentration of software, medical device, and biotechnology employers actively hiring graduates.', 1
FROM public.countries c
WHERE c.slug = 'ireland'
  AND NOT EXISTS (SELECT 1 FROM public.country_highlights t WHERE t.country_id = c.id AND t.title = 'Global Tech & Pharma Hub');
INSERT INTO public.country_highlights (country_id, kind, title, description, sort_order)
SELECT c.id, 'reason', 'Fast PR via Critical Skills Permit', 'Convert to a Critical Skills Employment Permit and apply for Stamp 4 permanent residence in just 2 years.', 2
FROM public.countries c
WHERE c.slug = 'ireland'
  AND NOT EXISTS (SELECT 1 FROM public.country_highlights t WHERE t.country_id = c.id AND t.title = 'Fast PR via Critical Skills Permit');
INSERT INTO public.country_highlights (country_id, kind, title, description, sort_order)
SELECT c.id, 'tradeoff', 'Dublin Accommodation Market', 'Dublin has high rental demand; early booking in student residences like Yugo, Aparto, or university halls is critical.', 3
FROM public.countries c
WHERE c.slug = 'ireland'
  AND NOT EXISTS (SELECT 1 FROM public.country_highlights t WHERE t.country_id = c.id AND t.title = 'Dublin Accommodation Market');
INSERT INTO public.country_highlights (country_id, kind, title, description, sort_order)
SELECT c.id, 'tradeoff', 'Strict Visa Financial Proof', 'You must demonstrate access to €10,000 living funds in addition to first-year tuition fees.', 4
FROM public.countries c
WHERE c.slug = 'ireland'
  AND NOT EXISTS (SELECT 1 FROM public.country_highlights t WHERE t.country_id = c.id AND t.title = 'Strict Visa Financial Proof');
INSERT INTO public.country_program_costs (country_id, program_label, tuition_range_inr, living_cost_inr, total_annual_inr, notes, sort_order)
SELECT c.id, 'Master''s (1-Year MSc)', '₹14 - 24 Lakhs total', '₹9 - 12 Lakhs total', '₹23 - 36 Lakhs total', '1-year intensive curriculum saves living expenses.', 0
FROM public.countries c
WHERE c.slug = 'ireland'
  AND NOT EXISTS (SELECT 1 FROM public.country_program_costs t WHERE t.country_id = c.id AND t.program_label = 'Master''s (1-Year MSc)');
INSERT INTO public.country_program_costs (country_id, program_label, tuition_range_inr, living_cost_inr, total_annual_inr, notes, sort_order)
SELECT c.id, 'MBA (TCD / UCD Smurfit)', '₹25 - 40 Lakhs total', '₹10 - 13 Lakhs total', '₹35 - 53 Lakhs total', 'Top 100 global MBA rankings with direct corporate access.', 1
FROM public.countries c
WHERE c.slug = 'ireland'
  AND NOT EXISTS (SELECT 1 FROM public.country_program_costs t WHERE t.country_id = c.id AND t.program_label = 'MBA (TCD / UCD Smurfit)');
INSERT INTO public.country_hidden_costs (country_id, item, cost_inr, frequency, sort_order)
SELECT c.id, 'Irish Residence Permit (IRP Card)', '€300 (₹27,000)', 'Annual', 0
FROM public.countries c
WHERE c.slug = 'ireland'
  AND NOT EXISTS (SELECT 1 FROM public.country_hidden_costs t WHERE t.country_id = c.id AND t.item = 'Irish Residence Permit (IRP Card)');
INSERT INTO public.country_hidden_costs (country_id, item, cost_inr, frequency, sort_order)
SELECT c.id, 'Private Medical Insurance', '€160 - €300 / yr (₹15,000 - ₹27,000)', 'Annual', 1
FROM public.countries c
WHERE c.slug = 'ireland'
  AND NOT EXISTS (SELECT 1 FROM public.country_hidden_costs t WHERE t.country_id = c.id AND t.item = 'Private Medical Insurance');
INSERT INTO public.faqs (scope, scope_id, question, answer, sort_order)
SELECT 'country', c.id, 'Is Ireland completely English-speaking?', 'Yes, Ireland is an English-speaking country with English as the primary language of instruction, commerce, and daily life.', 0
FROM public.countries c
WHERE c.slug = 'ireland'
  AND NOT EXISTS (SELECT 1 FROM public.faqs t WHERE t.scope = 'country' AND t.scope_id = c.id AND t.question = 'Is Ireland completely English-speaking?');
INSERT INTO public.faqs (scope, scope_id, question, answer, sort_order)
SELECT 'country', c.id, 'How easily can I get a tech job in Dublin after MS?', 'Dublin is home to European headquarters of Google, Meta, Microsoft, Amazon, Stripe, and LinkedIn, creating consistent hiring demand for data, software, and cloud engineers.', 1
FROM public.countries c
WHERE c.slug = 'ireland'
  AND NOT EXISTS (SELECT 1 FROM public.faqs t WHERE t.scope = 'country' AND t.scope_id = c.id AND t.question = 'How easily can I get a tech job in Dublin after MS?');
INSERT INTO public.scholarships (name, provider, country_id, award_summary, eligibility_note, deadline_note, sort_order)
SELECT 'Government of Ireland International Education Scholarships (GOI-IES)', 'Government', c.id, '€10,000 stipend + Full tuition fee waiver', 'Outstanding non-EU students for 1 year of study', 'March annually', 100
FROM public.countries c
WHERE c.slug = 'ireland'
  AND NOT EXISTS (SELECT 1 FROM public.scholarships t WHERE t.name = 'Government of Ireland International Education Scholarships (GOI-IES)');
INSERT INTO public.scholarships (name, provider, country_id, award_summary, eligibility_note, deadline_note, sort_order)
SELECT 'Global Excellence Scholarships (TCD & UCD)', 'University', c.id, '€2,000 - €5,000 tuition waiver', 'Based on academic merit at offer stage', 'March - April annually', 101
FROM public.countries c
WHERE c.slug = 'ireland'
  AND NOT EXISTS (SELECT 1 FROM public.scholarships t WHERE t.name = 'Global Excellence Scholarships (TCD & UCD)');
-- France
INSERT INTO public.country_highlights (country_id, kind, title, description, sort_order)
SELECT c.id, 'reason', 'Top-Ranked Global Business Schools', 'HEC, ESSEC, INSEAD and ESCP consistently dominate Financial Times European Business School rankings.', 0
FROM public.countries c
WHERE c.slug = 'france'
  AND NOT EXISTS (SELECT 1 FROM public.country_highlights t WHERE t.country_id = c.id AND t.title = 'Top-Ranked Global Business Schools');
INSERT INTO public.country_highlights (country_id, kind, title, description, sort_order)
SELECT c.id, 'reason', '2-Year Post-Study Visa for Indians', 'Special bilateral India-France agreement granting a 2-year jobseeker residence permit.', 1
FROM public.countries c
WHERE c.slug = 'france'
  AND NOT EXISTS (SELECT 1 FROM public.country_highlights t WHERE t.country_id = c.id AND t.title = '2-Year Post-Study Visa for Indians');
INSERT INTO public.country_highlights (country_id, kind, title, description, sort_order)
SELECT c.id, 'reason', 'CAF Housing Subsidy', 'All international students are eligible for French government housing assistance (CAF), reducing monthly rent by 20%–40%.', 2
FROM public.countries c
WHERE c.slug = 'france'
  AND NOT EXISTS (SELECT 1 FROM public.country_highlights t WHERE t.country_id = c.id AND t.title = 'CAF Housing Subsidy');
INSERT INTO public.country_highlights (country_id, kind, title, description, sort_order)
SELECT c.id, 'tradeoff', 'French Language for Local Work', 'While degrees are 100% in English, conversational French (B1/B2) is key for local French corporate employment outside multinational tech teams.', 3
FROM public.countries c
WHERE c.slug = 'france'
  AND NOT EXISTS (SELECT 1 FROM public.country_highlights t WHERE t.country_id = c.id AND t.title = 'French Language for Local Work');
INSERT INTO public.country_highlights (country_id, kind, title, description, sort_order)
SELECT c.id, 'tradeoff', 'Campus France NOC & Interview', 'Indian students must complete the mandatory Campus France interview and verification before visa appointment.', 4
FROM public.countries c
WHERE c.slug = 'france'
  AND NOT EXISTS (SELECT 1 FROM public.country_highlights t WHERE t.country_id = c.id AND t.title = 'Campus France NOC & Interview');
INSERT INTO public.country_program_costs (country_id, program_label, tuition_range_inr, living_cost_inr, total_annual_inr, notes, sort_order)
SELECT c.id, 'Master in Management / Business', '₹12 - 24 Lakhs / yr', '₹8 - 11 Lakhs / yr', '₹20 - 35 Lakhs / yr', 'Grande École master''s programs offering global internships.', 0
FROM public.countries c
WHERE c.slug = 'france'
  AND NOT EXISTS (SELECT 1 FROM public.country_program_costs t WHERE t.country_id = c.id AND t.program_label = 'Master in Management / Business');
INSERT INTO public.country_program_costs (country_id, program_label, tuition_range_inr, living_cost_inr, total_annual_inr, notes, sort_order)
SELECT c.id, 'Public Universities (Engineering)', '₹3.5 - 4 Lakhs / yr', '₹7 - 10 Lakhs / yr', '₹10.5 - 14 Lakhs / yr', 'Heavily subsidized by the French government.', 1
FROM public.countries c
WHERE c.slug = 'france'
  AND NOT EXISTS (SELECT 1 FROM public.country_program_costs t WHERE t.country_id = c.id AND t.program_label = 'Public Universities (Engineering)');
INSERT INTO public.country_hidden_costs (country_id, item, cost_inr, frequency, sort_order)
SELECT c.id, 'Campus France Registration Fee', '₹17,000', 'One-time', 0
FROM public.countries c
WHERE c.slug = 'france'
  AND NOT EXISTS (SELECT 1 FROM public.country_hidden_costs t WHERE t.country_id = c.id AND t.item = 'Campus France Registration Fee');
INSERT INTO public.country_hidden_costs (country_id, item, cost_inr, frequency, sort_order)
SELECT c.id, 'CVEC Student Life Contribution', '€103 (₹9,300)', 'Annual', 1
FROM public.countries c
WHERE c.slug = 'france'
  AND NOT EXISTS (SELECT 1 FROM public.country_hidden_costs t WHERE t.country_id = c.id AND t.item = 'CVEC Student Life Contribution');
INSERT INTO public.faqs (scope, scope_id, question, answer, sort_order)
SELECT 'country', c.id, 'Can Indian students get housing subsidy in France?', 'Yes! Every international student in France is eligible for the CAF (Caisse d''Allocations Familiales) housing grant, which reimburses €100 to €250 directly toward your monthly rent.', 0
FROM public.countries c
WHERE c.slug = 'france'
  AND NOT EXISTS (SELECT 1 FROM public.faqs t WHERE t.scope = 'country' AND t.scope_id = c.id AND t.question = 'Can Indian students get housing subsidy in France?');
INSERT INTO public.faqs (scope, scope_id, question, answer, sort_order)
SELECT 'country', c.id, 'Is French language required for admission to French master''s degrees?', 'No. Over 1,700 master''s degree programs in France are taught 100% in English, and admissions do not require French proficiency tests.', 1
FROM public.countries c
WHERE c.slug = 'france'
  AND NOT EXISTS (SELECT 1 FROM public.faqs t WHERE t.scope = 'country' AND t.scope_id = c.id AND t.question = 'Is French language required for admission to French master''s degrees?');
INSERT INTO public.scholarships (name, provider, country_id, award_summary, eligibility_note, deadline_note, sort_order)
SELECT 'Charpak Master''s Scholarship', 'Government', c.id, '€860/month stipend + Full tuition fee waiver + Visa fee waiver', 'High-achieving Indian students applying to French master''s', 'Late March annually', 100
FROM public.countries c
WHERE c.slug = 'france'
  AND NOT EXISTS (SELECT 1 FROM public.scholarships t WHERE t.name = 'Charpak Master''s Scholarship');
INSERT INTO public.scholarships (name, provider, country_id, award_summary, eligibility_note, deadline_note, sort_order)
SELECT 'Eiffel Excellence Scholarship', 'Government', c.id, '€1,181/month allowance + Airfare + Insurance', 'Top international admits nominated by French institutions', 'December annually', 101
FROM public.countries c
WHERE c.slug = 'france'
  AND NOT EXISTS (SELECT 1 FROM public.scholarships t WHERE t.name = 'Eiffel Excellence Scholarship');
-- Uzbekistan
INSERT INTO public.country_highlights (country_id, kind, title, description, sort_order)
SELECT c.id, 'reason', 'Strict NMC 2021 Gazette Compliance', '5+1 year curriculum with full English medium and hands-on clinical rotation at large teaching hospitals.', 0
FROM public.countries c
WHERE c.slug = 'uzbekistan'
  AND NOT EXISTS (SELECT 1 FROM public.country_highlights t WHERE t.country_id = c.id AND t.title = 'Strict NMC 2021 Gazette Compliance');
INSERT INTO public.country_highlights (country_id, kind, title, description, sort_order)
SELECT c.id, 'reason', 'Highest MBBS Affordability', 'Total 6-year MBBS cost from ₹14 to ₹18 Lakhs, making medical education accessible to middle-class Indian families.', 1
FROM public.countries c
WHERE c.slug = 'uzbekistan'
  AND NOT EXISTS (SELECT 1 FROM public.country_highlights t WHERE t.country_id = c.id AND t.title = 'Highest MBBS Affordability');
INSERT INTO public.country_highlights (country_id, kind, title, description, sort_order)
SELECT c.id, 'reason', 'Short Flight Distance & Safety', 'Just 3 hours direct flight from Delhi to Tashkent, with safe university campuses and Indian food mess on campus.', 2
FROM public.countries c
WHERE c.slug = 'uzbekistan'
  AND NOT EXISTS (SELECT 1 FROM public.country_highlights t WHERE t.country_id = c.id AND t.title = 'Short Flight Distance & Safety');
INSERT INTO public.country_highlights (country_id, kind, title, description, sort_order)
SELECT c.id, 'tradeoff', 'Local Uzbek Language for Patients', 'Basic conversational Uzbek or Russian is taught during the first two years to speak with patients during hospital rounds.', 3
FROM public.countries c
WHERE c.slug = 'uzbekistan'
  AND NOT EXISTS (SELECT 1 FROM public.country_highlights t WHERE t.country_id = c.id AND t.title = 'Local Uzbek Language for Patients');
INSERT INTO public.country_program_costs (country_id, program_label, tuition_range_inr, living_cost_inr, total_annual_inr, notes, sort_order)
SELECT c.id, 'MBBS (6-Year Package)', '₹2.8 - 3.5 Lakhs / yr', '₹1.2 - 1.5 Lakhs / yr (incl. hostel & food)', '₹4 - 5 Lakhs / yr', 'Entire 6-year package comes out to ₹14 - 18 Lakhs all-inclusive.', 0
FROM public.countries c
WHERE c.slug = 'uzbekistan'
  AND NOT EXISTS (SELECT 1 FROM public.country_program_costs t WHERE t.country_id = c.id AND t.program_label = 'MBBS (6-Year Package)');
INSERT INTO public.country_hidden_costs (country_id, item, cost_inr, frequency, sort_order)
SELECT c.id, 'Hostel & Registration', '₹35,000 / yr', 'Annual', 0
FROM public.countries c
WHERE c.slug = 'uzbekistan'
  AND NOT EXISTS (SELECT 1 FROM public.country_hidden_costs t WHERE t.country_id = c.id AND t.item = 'Hostel & Registration');
INSERT INTO public.country_hidden_costs (country_id, item, cost_inr, frequency, sort_order)
SELECT c.id, 'Indian Mess Fee', '₹10,000 / month', 'Monthly', 1
FROM public.countries c
WHERE c.slug = 'uzbekistan'
  AND NOT EXISTS (SELECT 1 FROM public.country_hidden_costs t WHERE t.country_id = c.id AND t.item = 'Indian Mess Fee');
INSERT INTO public.faqs (scope, scope_id, question, answer, sort_order)
SELECT 'country', c.id, 'Is NEET exam required for MBBS in Uzbekistan?', 'Yes, qualifying NEET is mandatory for all Indian students going to study MBBS in Uzbekistan to practice medicine in India later.', 0
FROM public.countries c
WHERE c.slug = 'uzbekistan'
  AND NOT EXISTS (SELECT 1 FROM public.faqs t WHERE t.scope = 'country' AND t.scope_id = c.id AND t.question = 'Is NEET exam required for MBBS in Uzbekistan?');
INSERT INTO public.faqs (scope, scope_id, question, answer, sort_order)
SELECT 'country', c.id, 'Are Uzbekistan medical universities recognized by WHO and NMC?', 'Yes, all major universities like Tashkent Medical Academy and Samarkand State Medical University are listed in the WHO World Directory of Medical Schools and fully recognized by the NMC.', 1
FROM public.countries c
WHERE c.slug = 'uzbekistan'
  AND NOT EXISTS (SELECT 1 FROM public.faqs t WHERE t.scope = 'country' AND t.scope_id = c.id AND t.question = 'Are Uzbekistan medical universities recognized by WHO and NMC?');
INSERT INTO public.scholarships (name, provider, country_id, award_summary, eligibility_note, deadline_note, sort_order)
SELECT 'University Merit Performance Grants', 'University', c.id, 'Up to 20% tuition concession', 'Scoring high marks in annual university medical examinations', 'End of Year 1', 100
FROM public.countries c
WHERE c.slug = 'uzbekistan'
  AND NOT EXISTS (SELECT 1 FROM public.scholarships t WHERE t.name = 'University Merit Performance Grants');
-- Kazakhstan
INSERT INTO public.country_highlights (country_id, kind, title, description, sort_order)
SELECT c.id, 'reason', 'NMC & WHO Recognized', 'Valid worldwide for FMGE/NExT (India), USMLE (USA), and PLAB (UK) medical licensing pathways.', 0
FROM public.countries c
WHERE c.slug = 'kazakhstan'
  AND NOT EXISTS (SELECT 1 FROM public.country_highlights t WHERE t.country_id = c.id AND t.title = 'NMC & WHO Recognized');
INSERT INTO public.country_highlights (country_id, kind, title, description, sort_order)
SELECT c.id, 'reason', 'Modern Clinical Simulation Labs', 'Hands-on medical simulation centers and direct access to multi-specialty government teaching hospitals.', 1
FROM public.countries c
WHERE c.slug = 'kazakhstan'
  AND NOT EXISTS (SELECT 1 FROM public.country_highlights t WHERE t.country_id = c.id AND t.title = 'Modern Clinical Simulation Labs');
INSERT INTO public.country_highlights (country_id, kind, title, description, sort_order)
SELECT c.id, 'reason', 'Affordable Living & Indian Mess', 'Campuses feature Indian chefs, on-campus security, and low cost of living (₹10,000–₹12,000/month).', 2
FROM public.countries c
WHERE c.slug = 'kazakhstan'
  AND NOT EXISTS (SELECT 1 FROM public.country_highlights t WHERE t.country_id = c.id AND t.title = 'Affordable Living & Indian Mess');
INSERT INTO public.country_highlights (country_id, kind, title, description, sort_order)
SELECT c.id, 'tradeoff', 'Kazakh/Russian for Wards', 'Basic Russian or Kazakh language is taught in early semesters to converse with patients in clinical wards.', 3
FROM public.countries c
WHERE c.slug = 'kazakhstan'
  AND NOT EXISTS (SELECT 1 FROM public.country_highlights t WHERE t.country_id = c.id AND t.title = 'Kazakh/Russian for Wards');
INSERT INTO public.country_program_costs (country_id, program_label, tuition_range_inr, living_cost_inr, total_annual_inr, notes, sort_order)
SELECT c.id, 'MBBS (6 Years Total)', '₹3.2 - 4.2 Lakhs / yr', '₹1.4 - 1.8 Lakhs / yr', '₹4.6 - 6 Lakhs / yr', 'Total 6-year package is approximately ₹16 - 22 Lakhs.', 0
FROM public.countries c
WHERE c.slug = 'kazakhstan'
  AND NOT EXISTS (SELECT 1 FROM public.country_program_costs t WHERE t.country_id = c.id AND t.program_label = 'MBBS (6 Years Total)');
INSERT INTO public.country_hidden_costs (country_id, item, cost_inr, frequency, sort_order)
SELECT c.id, 'Visa Extension & Registration', '₹18,000 / yr', 'Annual', 0
FROM public.countries c
WHERE c.slug = 'kazakhstan'
  AND NOT EXISTS (SELECT 1 FROM public.country_hidden_costs t WHERE t.country_id = c.id AND t.item = 'Visa Extension & Registration');
INSERT INTO public.country_hidden_costs (country_id, item, cost_inr, frequency, sort_order)
SELECT c.id, 'Medical Insurance', '₹12,000 / yr', 'Annual', 1
FROM public.countries c
WHERE c.slug = 'kazakhstan'
  AND NOT EXISTS (SELECT 1 FROM public.country_hidden_costs t WHERE t.country_id = c.id AND t.item = 'Medical Insurance');
INSERT INTO public.faqs (scope, scope_id, question, answer, sort_order)
SELECT 'country', c.id, 'What is the medium of instruction for MBBS in Kazakhstan?', 'Top universities provide 100% English-medium instruction for all 6 years of the MBBS curriculum for international students.', 0
FROM public.countries c
WHERE c.slug = 'kazakhstan'
  AND NOT EXISTS (SELECT 1 FROM public.faqs t WHERE t.scope = 'country' AND t.scope_id = c.id AND t.question = 'What is the medium of instruction for MBBS in Kazakhstan?');
INSERT INTO public.faqs (scope, scope_id, question, answer, sort_order)
SELECT 'country', c.id, 'How safe is Kazakhstan for Indian girl students?', 'Kazakhstan is very peaceful and safe, with secure university hostels, 24/7 CCTV surveillance, and a large Indian student community.', 1
FROM public.countries c
WHERE c.slug = 'kazakhstan'
  AND NOT EXISTS (SELECT 1 FROM public.faqs t WHERE t.scope = 'country' AND t.scope_id = c.id AND t.question = 'How safe is Kazakhstan for Indian girl students?');
INSERT INTO public.scholarships (name, provider, country_id, award_summary, eligibility_note, deadline_note, sort_order)
SELECT 'Academic Excellence Concessions', 'University', c.id, '5% - 15% tuition waiver', 'Class top-ranking students with A grades in all medical modules', 'Annual assessment', 100
FROM public.countries c
WHERE c.slug = 'kazakhstan'
  AND NOT EXISTS (SELECT 1 FROM public.scholarships t WHERE t.name = 'Academic Excellence Concessions');
-- Georgia
INSERT INTO public.country_highlights (country_id, kind, title, description, sort_order)
SELECT c.id, 'reason', 'European Curriculum Standards', 'Curriculum aligned with European Bologna process and USMLE step-1 preparation.', 0
FROM public.countries c
WHERE c.slug = 'georgia'
  AND NOT EXISTS (SELECT 1 FROM public.country_highlights t WHERE t.country_id = c.id AND t.title = 'European Curriculum Standards');
INSERT INTO public.country_highlights (country_id, kind, title, description, sort_order)
SELECT c.id, 'reason', 'High USMLE & PLAB Success', 'Graduates achieve impressive success rates on USMLE (USA) and PLAB (UK) exams.', 1
FROM public.countries c
WHERE c.slug = 'georgia'
  AND NOT EXISTS (SELECT 1 FROM public.country_highlights t WHERE t.country_id = c.id AND t.title = 'High USMLE & PLAB Success');
INSERT INTO public.country_highlights (country_id, kind, title, description, sort_order)
SELECT c.id, 'reason', 'Safe European Environment', 'Ranked among the safest countries globally with excellent infrastructure and living quality.', 2
FROM public.countries c
WHERE c.slug = 'georgia'
  AND NOT EXISTS (SELECT 1 FROM public.country_highlights t WHERE t.country_id = c.id AND t.title = 'Safe European Environment');
INSERT INTO public.country_highlights (country_id, kind, title, description, sort_order)
SELECT c.id, 'tradeoff', 'Moderate Tuition Compared to Central Asia', 'Tuition is slightly higher (₹4.5–6 Lakhs/yr) compared to Russia or Uzbekistan, but reflects European clinical facilities.', 3
FROM public.countries c
WHERE c.slug = 'georgia'
  AND NOT EXISTS (SELECT 1 FROM public.country_highlights t WHERE t.country_id = c.id AND t.title = 'Moderate Tuition Compared to Central Asia');
INSERT INTO public.country_program_costs (country_id, program_label, tuition_range_inr, living_cost_inr, total_annual_inr, notes, sort_order)
SELECT c.id, 'MBBS (6 Years)', '₹4.5 - 6 Lakhs / yr', '₹2 - 2.5 Lakhs / yr', '₹6.5 - 8.5 Lakhs / yr', 'Total 6-year package is approximately ₹26 - 35 Lakhs.', 0
FROM public.countries c
WHERE c.slug = 'georgia'
  AND NOT EXISTS (SELECT 1 FROM public.country_program_costs t WHERE t.country_id = c.id AND t.program_label = 'MBBS (6 Years)');
INSERT INTO public.country_hidden_costs (country_id, item, cost_inr, frequency, sort_order)
SELECT c.id, 'TRC Residence Card', '₹18,000 / yr', 'Annual', 0
FROM public.countries c
WHERE c.slug = 'georgia'
  AND NOT EXISTS (SELECT 1 FROM public.country_hidden_costs t WHERE t.country_id = c.id AND t.item = 'TRC Residence Card');
INSERT INTO public.country_hidden_costs (country_id, item, cost_inr, frequency, sort_order)
SELECT c.id, 'Medical Insurance', '₹10,000 / yr', 'Annual', 1
FROM public.countries c
WHERE c.slug = 'georgia'
  AND NOT EXISTS (SELECT 1 FROM public.country_hidden_costs t WHERE t.country_id = c.id AND t.item = 'Medical Insurance');
INSERT INTO public.faqs (scope, scope_id, question, answer, sort_order)
SELECT 'country', c.id, 'Is the MBBS degree from Georgia valid in Europe and the USA?', 'Yes, Georgian medical degrees are recognized by ECFMG, WHO, WFME, and the National Medical Commission of India.', 0
FROM public.countries c
WHERE c.slug = 'georgia'
  AND NOT EXISTS (SELECT 1 FROM public.faqs t WHERE t.scope = 'country' AND t.scope_id = c.id AND t.question = 'Is the MBBS degree from Georgia valid in Europe and the USA?');
INSERT INTO public.faqs (scope, scope_id, question, answer, sort_order)
SELECT 'country', c.id, 'Is the Georgian language difficult?', 'All medical lectures and textbooks are in English. Basic Georgian phrases are learned in Year 1 for day-to-day communication.', 1
FROM public.countries c
WHERE c.slug = 'georgia'
  AND NOT EXISTS (SELECT 1 FROM public.faqs t WHERE t.scope = 'country' AND t.scope_id = c.id AND t.question = 'Is the Georgian language difficult?');
INSERT INTO public.scholarships (name, provider, country_id, award_summary, eligibility_note, deadline_note, sort_order)
SELECT 'Institutional Merit Awards', 'University', c.id, 'Up to $1,000 annual fee deduction', 'Top 5% students in university semester exams', 'Semester end', 100
FROM public.countries c
WHERE c.slug = 'georgia'
  AND NOT EXISTS (SELECT 1 FROM public.scholarships t WHERE t.name = 'Institutional Merit Awards');
-- Philippines
INSERT INTO public.country_highlights (country_id, kind, title, description, sort_order)
SELECT c.id, 'reason', 'US-Patterned Curriculum', 'Problem-based medical training matching USMLE standards and high clinical diagnostic exposure.', 0
FROM public.countries c
WHERE c.slug = 'philippines'
  AND NOT EXISTS (SELECT 1 FROM public.country_highlights t WHERE t.country_id = c.id AND t.title = 'US-Patterned Curriculum');
INSERT INTO public.country_highlights (country_id, kind, title, description, sort_order)
SELECT c.id, 'reason', 'Complete English Immersion', 'No foreign language to learn; English is an official language spoken by hospital patients and locals.', 1
FROM public.countries c
WHERE c.slug = 'philippines'
  AND NOT EXISTS (SELECT 1 FROM public.country_highlights t WHERE t.country_id = c.id AND t.title = 'Complete English Immersion');
INSERT INTO public.country_highlights (country_id, kind, title, description, sort_order)
SELECT c.id, 'reason', 'Tropical Disease Profile', 'Disease pathology closely mirrors tropical conditions in India, giving practical clinical advantages for NExT/FMGE.', 2
FROM public.countries c
WHERE c.slug = 'philippines'
  AND NOT EXISTS (SELECT 1 FROM public.country_highlights t WHERE t.country_id = c.id AND t.title = 'Tropical Disease Profile');
INSERT INTO public.country_highlights (country_id, kind, title, description, sort_order)
SELECT c.id, 'tradeoff', 'NMC Dual Registration Clause', 'Ensure your program includes the full dual-degree track and in-country medical registration matching current NMC Gazette requirements.', 3
FROM public.countries c
WHERE c.slug = 'philippines'
  AND NOT EXISTS (SELECT 1 FROM public.country_highlights t WHERE t.country_id = c.id AND t.title = 'NMC Dual Registration Clause');
INSERT INTO public.country_program_costs (country_id, program_label, tuition_range_inr, living_cost_inr, total_annual_inr, notes, sort_order)
SELECT c.id, 'MD / MBBS (Total Course)', '₹3.5 - 4.5 Lakhs / yr', '₹1.5 - 2 Lakhs / yr', '₹5 - 6.5 Lakhs / yr', 'Total degree budget ranges between ₹20 and ₹26 Lakhs.', 0
FROM public.countries c
WHERE c.slug = 'philippines'
  AND NOT EXISTS (SELECT 1 FROM public.country_program_costs t WHERE t.country_id = c.id AND t.program_label = 'MD / MBBS (Total Course)');
INSERT INTO public.country_hidden_costs (country_id, item, cost_inr, frequency, sort_order)
SELECT c.id, 'ACR I-Card & Visa Renewal', '₹20,000 / yr', 'Annual', 0
FROM public.countries c
WHERE c.slug = 'philippines'
  AND NOT EXISTS (SELECT 1 FROM public.country_hidden_costs t WHERE t.country_id = c.id AND t.item = 'ACR I-Card & Visa Renewal');
INSERT INTO public.country_hidden_costs (country_id, item, cost_inr, frequency, sort_order)
SELECT c.id, 'Medical Checkup & Quarantine Clearance', '₹12,000', 'One-time', 1
FROM public.countries c
WHERE c.slug = 'philippines'
  AND NOT EXISTS (SELECT 1 FROM public.country_hidden_costs t WHERE t.country_id = c.id AND t.item = 'Medical Checkup & Quarantine Clearance');
INSERT INTO public.faqs (scope, scope_id, question, answer, sort_order)
SELECT 'country', c.id, 'Why is the Philippines popular for Indian medical students?', 'The Philippines uses American medical textbooks, 100% English communication with hospital patients, and a disease pattern nearly identical to India.', 0
FROM public.countries c
WHERE c.slug = 'philippines'
  AND NOT EXISTS (SELECT 1 FROM public.faqs t WHERE t.scope = 'country' AND t.scope_id = c.id AND t.question = 'Why is the Philippines popular for Indian medical students?');
INSERT INTO public.scholarships (name, provider, country_id, award_summary, eligibility_note, deadline_note, sort_order)
SELECT 'Academic Merit Concessions', 'University', c.id, '10% - 20% tuition concession', 'High scores in National Medical Admission Test (NMAT)', 'Annual', 100
FROM public.countries c
WHERE c.slug = 'philippines'
  AND NOT EXISTS (SELECT 1 FROM public.scholarships t WHERE t.name = 'Academic Merit Concessions');
-- Netherlands
INSERT INTO public.country_highlights (country_id, kind, title, description, sort_order)
SELECT c.id, 'reason', 'Global Top 100 Universities', 'TU Delft, Amsterdam, and Utrecht consistently rank among the world''s most innovative technical institutes.', 0
FROM public.countries c
WHERE c.slug = 'netherlands'
  AND NOT EXISTS (SELECT 1 FROM public.country_highlights t WHERE t.country_id = c.id AND t.title = 'Global Top 100 Universities');
INSERT INTO public.country_highlights (country_id, kind, title, description, sort_order)
SELECT c.id, 'reason', 'Zoekjaar Orientation Visa', '1-year post-study open work visa with low salary threshold requirement for Highly Skilled Migrant status.', 1
FROM public.countries c
WHERE c.slug = 'netherlands'
  AND NOT EXISTS (SELECT 1 FROM public.country_highlights t WHERE t.country_id = c.id AND t.title = 'Zoekjaar Orientation Visa');
INSERT INTO public.country_highlights (country_id, kind, title, description, sort_order)
SELECT c.id, 'reason', 'Silicon Valley of Europe', 'Home to semiconductor giant ASML and European tech hubs in Amsterdam and Eindhoven.', 2
FROM public.countries c
WHERE c.slug = 'netherlands'
  AND NOT EXISTS (SELECT 1 FROM public.country_highlights t WHERE t.country_id = c.id AND t.title = 'Silicon Valley of Europe');
INSERT INTO public.country_highlights (country_id, kind, title, description, sort_order)
SELECT c.id, 'tradeoff', 'Dutch Housing Shortage', 'Student accommodation in Amsterdam, Delft, and Utrecht is in high demand; applying 6 months in advance is essential.', 3
FROM public.countries c
WHERE c.slug = 'netherlands'
  AND NOT EXISTS (SELECT 1 FROM public.country_highlights t WHERE t.country_id = c.id AND t.title = 'Dutch Housing Shortage');
INSERT INTO public.country_program_costs (country_id, program_label, tuition_range_inr, living_cost_inr, total_annual_inr, notes, sort_order)
SELECT c.id, 'Master''s (MS / MSc)', '₹14 - 22 Lakhs / yr', '₹10 - 13 Lakhs / yr', '₹24 - 35 Lakhs / yr', '2-year degrees with high graduate starting packages.', 0
FROM public.countries c
WHERE c.slug = 'netherlands'
  AND NOT EXISTS (SELECT 1 FROM public.country_program_costs t WHERE t.country_id = c.id AND t.program_label = 'Master''s (MS / MSc)');
INSERT INTO public.country_program_costs (country_id, program_label, tuition_range_inr, living_cost_inr, total_annual_inr, notes, sort_order)
SELECT c.id, 'Bachelor''s (BSc / BA)', '₹10 - 16 Lakhs / yr', '₹10 - 13 Lakhs / yr', '₹20 - 29 Lakhs / yr', '3-year bachelor''s degrees taught in English.', 1
FROM public.countries c
WHERE c.slug = 'netherlands'
  AND NOT EXISTS (SELECT 1 FROM public.country_program_costs t WHERE t.country_id = c.id AND t.program_label = 'Bachelor''s (BSc / BA)');
INSERT INTO public.country_hidden_costs (country_id, item, cost_inr, frequency, sort_order)
SELECT c.id, 'IND Residence Permit Fee', '€228 (₹20,500)', 'One-time', 0
FROM public.countries c
WHERE c.slug = 'netherlands'
  AND NOT EXISTS (SELECT 1 FROM public.country_hidden_costs t WHERE t.country_id = c.id AND t.item = 'IND Residence Permit Fee');
INSERT INTO public.country_hidden_costs (country_id, item, cost_inr, frequency, sort_order)
SELECT c.id, 'Health Insurance', '€50 - €120 / month', 'Monthly', 1
FROM public.countries c
WHERE c.slug = 'netherlands'
  AND NOT EXISTS (SELECT 1 FROM public.country_hidden_costs t WHERE t.country_id = c.id AND t.item = 'Health Insurance');
INSERT INTO public.faqs (scope, scope_id, question, answer, sort_order)
SELECT 'country', c.id, 'Is English widely spoken in the Netherlands?', 'Yes, over 95% of Dutch citizens speak fluent English, making daily life, internships, and corporate jobs completely comfortable without fluent Dutch.', 0
FROM public.countries c
WHERE c.slug = 'netherlands'
  AND NOT EXISTS (SELECT 1 FROM public.faqs t WHERE t.scope = 'country' AND t.scope_id = c.id AND t.question = 'Is English widely spoken in the Netherlands?');
INSERT INTO public.scholarships (name, provider, country_id, award_summary, eligibility_note, deadline_note, sort_order)
SELECT 'NL Scholarship (formerly Holland Scholarship)', 'Government', c.id, '€5,000 in the first year of study', 'High-achieving non-EEA students accepted into participating Dutch universities', 'February - May annually', 100
FROM public.countries c
WHERE c.slug = 'netherlands'
  AND NOT EXISTS (SELECT 1 FROM public.scholarships t WHERE t.name = 'NL Scholarship (formerly Holland Scholarship)');
INSERT INTO public.scholarships (name, provider, country_id, award_summary, eligibility_note, deadline_note, sort_order)
SELECT 'TU Delft Justus & Louise van Effen Excellence', 'University', c.id, 'Full tuition + Living expenses', 'Top international master''s applicants with GPA > 80%', 'December 1 annually', 101
FROM public.countries c
WHERE c.slug = 'netherlands'
  AND NOT EXISTS (SELECT 1 FROM public.scholarships t WHERE t.name = 'TU Delft Justus & Louise van Effen Excellence');
-- Singapore
INSERT INTO public.country_highlights (country_id, kind, title, description, sort_order)
SELECT c.id, 'reason', 'World Top 15 Universities', 'NUS and NTU consistently outrank almost all European and Australian universities on global league tables.', 0
FROM public.countries c
WHERE c.slug = 'singapore'
  AND NOT EXISTS (SELECT 1 FROM public.country_highlights t WHERE t.country_id = c.id AND t.title = 'World Top 15 Universities');
INSERT INTO public.country_highlights (country_id, kind, title, description, sort_order)
SELECT c.id, 'reason', 'Service Obligation Tuition Subsidy', 'The Singapore MOE offers significant tuition fee reductions in exchange for a 3-year post-graduation work commitment in Singapore.', 1
FROM public.countries c
WHERE c.slug = 'singapore'
  AND NOT EXISTS (SELECT 1 FROM public.country_highlights t WHERE t.country_id = c.id AND t.title = 'Service Obligation Tuition Subsidy');
INSERT INTO public.country_highlights (country_id, kind, title, description, sort_order)
SELECT c.id, 'reason', 'Close Proximity to India', 'Direct flights from over 15 Indian cities with zero time difference lag (GMT+2.5).', 2
FROM public.countries c
WHERE c.slug = 'singapore'
  AND NOT EXISTS (SELECT 1 FROM public.country_highlights t WHERE t.country_id = c.id AND t.title = 'Close Proximity to India');
INSERT INTO public.country_highlights (country_id, kind, title, description, sort_order)
SELECT c.id, 'tradeoff', 'High Living Costs', 'Rental and living expenses in Singapore are comparable to London and New York.', 3
FROM public.countries c
WHERE c.slug = 'singapore'
  AND NOT EXISTS (SELECT 1 FROM public.country_highlights t WHERE t.country_id = c.id AND t.title = 'High Living Costs');
INSERT INTO public.country_program_costs (country_id, program_label, tuition_range_inr, living_cost_inr, total_annual_inr, notes, sort_order)
SELECT c.id, 'Master''s (MS/MSc with MOE Subsidy)', '₹14 - 22 Lakhs / yr', '₹10 - 14 Lakhs / yr', '₹24 - 36 Lakhs / yr', 'Tuition is reduced by 30%–50% under the MOE Service Obligation.', 0
FROM public.countries c
WHERE c.slug = 'singapore'
  AND NOT EXISTS (SELECT 1 FROM public.country_program_costs t WHERE t.country_id = c.id AND t.program_label = 'Master''s (MS/MSc with MOE Subsidy)');
INSERT INTO public.country_program_costs (country_id, program_label, tuition_range_inr, living_cost_inr, total_annual_inr, notes, sort_order)
SELECT c.id, 'MBA (NUS / NTU / SMU)', '₹38 - 55 Lakhs total', '₹12 - 16 Lakhs total', '₹50 - 71 Lakhs total', 'Ranked among Asia''s #1 business programs.', 1
FROM public.countries c
WHERE c.slug = 'singapore'
  AND NOT EXISTS (SELECT 1 FROM public.country_program_costs t WHERE t.country_id = c.id AND t.program_label = 'MBA (NUS / NTU / SMU)');
INSERT INTO public.country_hidden_costs (country_id, item, cost_inr, frequency, sort_order)
SELECT c.id, 'Student Pass Issuance & Entry Visa', 'SGD $120 (₹7,500)', 'One-time', 0
FROM public.countries c
WHERE c.slug = 'singapore'
  AND NOT EXISTS (SELECT 1 FROM public.country_hidden_costs t WHERE t.country_id = c.id AND t.item = 'Student Pass Issuance & Entry Visa');
INSERT INTO public.faqs (scope, scope_id, question, answer, sort_order)
SELECT 'country', c.id, 'What is the Singapore MOE Service Obligation?', 'The Service Obligation scheme provides substantial tuition subsidies to international master''s students who agree to work for a Singapore-registered company for 3 years after graduation.', 0
FROM public.countries c
WHERE c.slug = 'singapore'
  AND NOT EXISTS (SELECT 1 FROM public.faqs t WHERE t.scope = 'country' AND t.scope_id = c.id AND t.question = 'What is the Singapore MOE Service Obligation?');
INSERT INTO public.scholarships (name, provider, country_id, award_summary, eligibility_note, deadline_note, sort_order)
SELECT 'Singapore International Graduate Award (SINGA)', 'Government', c.id, 'Full tuition + SGD $2,700/month stipend + Airfare', 'Top PhD and research master''s applicants in STEM', 'December 1 and June 1', 100
FROM public.countries c
WHERE c.slug = 'singapore'
  AND NOT EXISTS (SELECT 1 FROM public.scholarships t WHERE t.name = 'Singapore International Graduate Award (SINGA)');
INSERT INTO public.scholarships (name, provider, country_id, award_summary, eligibility_note, deadline_note, sort_order)
SELECT 'NUS / NTU Master’s Merit Scholarships', 'University', c.id, 'SGD $5,000 - $15,000 tuition grant', 'Outstanding academic track record at undergraduate level', 'Admissions cycle', 101
FROM public.countries c
WHERE c.slug = 'singapore'
  AND NOT EXISTS (SELECT 1 FROM public.scholarships t WHERE t.name = 'NUS / NTU Master’s Merit Scholarships');
-- Italy
INSERT INTO public.country_highlights (country_id, kind, title, description, sort_order)
SELECT c.id, 'reason', 'Income-Based Low Tuition', 'Public universities charge €1,000–€3,500/yr based on family income evaluation (ISEE-U Parificato).', 0
FROM public.countries c
WHERE c.slug = 'italy'
  AND NOT EXISTS (SELECT 1 FROM public.country_highlights t WHERE t.country_id = c.id AND t.title = 'Income-Based Low Tuition');
INSERT INTO public.country_highlights (country_id, kind, title, description, sort_order)
SELECT c.id, 'reason', 'DSU Regional Scholarships', 'Covers 100% of tuition and provides up to €7,000/year living stipend plus meal vouchers.', 1
FROM public.countries c
WHERE c.slug = 'italy'
  AND NOT EXISTS (SELECT 1 FROM public.country_highlights t WHERE t.country_id = c.id AND t.title = 'DSU Regional Scholarships');
INSERT INTO public.country_highlights (country_id, kind, title, description, sort_order)
SELECT c.id, 'reason', 'World #1 in Design & Architecture', 'Politecnico di Milano ranks in the global top 10 for Architecture, Design, and Civil Engineering.', 2
FROM public.countries c
WHERE c.slug = 'italy'
  AND NOT EXISTS (SELECT 1 FROM public.country_highlights t WHERE t.country_id = c.id AND t.title = 'World #1 in Design & Architecture');
INSERT INTO public.country_highlights (country_id, kind, title, description, sort_order)
SELECT c.id, 'tradeoff', 'Embassy CIMEA Verification', 'Indian marksheets require CIMEA Statement of Comparability or Declaration of Value (DOV) before visa filing.', 3
FROM public.countries c
WHERE c.slug = 'italy'
  AND NOT EXISTS (SELECT 1 FROM public.country_highlights t WHERE t.country_id = c.id AND t.title = 'Embassy CIMEA Verification');
INSERT INTO public.country_program_costs (country_id, program_label, tuition_range_inr, living_cost_inr, total_annual_inr, notes, sort_order)
SELECT c.id, 'Master''s (MSc / Laurea Magistrale)', '₹1 - 3.5 Lakhs / yr (Without Scholarship)', '₹6 - 9 Lakhs / yr', '₹7 - 12.5 Lakhs / yr', 'With DSU Scholarship, net tuition is €0 and living is heavily subsidized.', 0
FROM public.countries c
WHERE c.slug = 'italy'
  AND NOT EXISTS (SELECT 1 FROM public.country_program_costs t WHERE t.country_id = c.id AND t.program_label = 'Master''s (MSc / Laurea Magistrale)');
INSERT INTO public.country_hidden_costs (country_id, item, cost_inr, frequency, sort_order)
SELECT c.id, 'CIMEA Verification Fee', '€150 - €300 (₹13,500 - ₹27,000)', 'One-time', 0
FROM public.countries c
WHERE c.slug = 'italy'
  AND NOT EXISTS (SELECT 1 FROM public.country_hidden_costs t WHERE t.country_id = c.id AND t.item = 'CIMEA Verification Fee');
INSERT INTO public.country_hidden_costs (country_id, item, cost_inr, frequency, sort_order)
SELECT c.id, 'Permesso di Soggiorno (Residence Permit)', '€120 (₹11,000)', 'Annual', 1
FROM public.countries c
WHERE c.slug = 'italy'
  AND NOT EXISTS (SELECT 1 FROM public.country_hidden_costs t WHERE t.country_id = c.id AND t.item = 'Permesso di Soggiorno (Residence Permit)');
INSERT INTO public.faqs (scope, scope_id, question, answer, sort_order)
SELECT 'country', c.id, 'How does the DSU scholarship work in Italy for Indian students?', 'The DSU scholarship evaluates your family''s annual income. If your family income is under €25,000 (approx. ₹22 Lakhs), you qualify for a full tuition waiver, free hostel accommodation, and a living allowance.', 0
FROM public.countries c
WHERE c.slug = 'italy'
  AND NOT EXISTS (SELECT 1 FROM public.faqs t WHERE t.scope = 'country' AND t.scope_id = c.id AND t.question = 'How does the DSU scholarship work in Italy for Indian students?');
INSERT INTO public.scholarships (name, provider, country_id, award_summary, eligibility_note, deadline_note, sort_order)
SELECT 'DSU Regional Scholarship (Lombardy, Lazio, Emilia)', 'Government', c.id, 'Full tuition waiver + €6,000 - €7,000/yr stipend + Free meals', 'Family income (ISEE) under €25,000 per annum', 'July - September annually', 100
FROM public.countries c
WHERE c.slug = 'italy'
  AND NOT EXISTS (SELECT 1 FROM public.scholarships t WHERE t.name = 'DSU Regional Scholarship (Lombardy, Lazio, Emilia)');
INSERT INTO public.scholarships (name, provider, country_id, award_summary, eligibility_note, deadline_note, sort_order)
SELECT 'Invest Your Talent in Italy (IYT)', 'Government', c.id, '€900/month + Full tuition waiver + Mandatory internship', 'Top engineering and economics graduates from India', 'February - March annually', 101
FROM public.countries c
WHERE c.slug = 'italy'
  AND NOT EXISTS (SELECT 1 FROM public.scholarships t WHERE t.name = 'Invest Your Talent in Italy (IYT)');
-- New Zealand
INSERT INTO public.country_highlights (country_id, kind, title, description, sort_order)
SELECT c.id, 'reason', '3-Year Post-Study Work Visa', 'Generous 36-month open work rights for master''s degree graduates across all sectors.', 0
FROM public.countries c
WHERE c.slug = 'new-zealand'
  AND NOT EXISTS (SELECT 1 FROM public.country_highlights t WHERE t.country_id = c.id AND t.title = '3-Year Post-Study Work Visa');
INSERT INTO public.country_highlights (country_id, kind, title, description, sort_order)
SELECT c.id, 'reason', 'Green List Fast-Track PR', 'Direct pathways to permanent residency for engineers, software developers, and medical professionals.', 1
FROM public.countries c
WHERE c.slug = 'new-zealand'
  AND NOT EXISTS (SELECT 1 FROM public.country_highlights t WHERE t.country_id = c.id AND t.title = 'Green List Fast-Track PR');
INSERT INTO public.country_highlights (country_id, kind, title, description, sort_order)
SELECT c.id, 'reason', 'Unbeatable Quality of Life', 'Ranked among the top 5 safest and most peaceful countries globally with high student satisfaction.', 2
FROM public.countries c
WHERE c.slug = 'new-zealand'
  AND NOT EXISTS (SELECT 1 FROM public.country_highlights t WHERE t.country_id = c.id AND t.title = 'Unbeatable Quality of Life');
INSERT INTO public.country_highlights (country_id, kind, title, description, sort_order)
SELECT c.id, 'tradeoff', 'Tuition and Living Costs', 'Tuition and living costs are comparable to Australia; careful financial planning is recommended.', 3
FROM public.countries c
WHERE c.slug = 'new-zealand'
  AND NOT EXISTS (SELECT 1 FROM public.country_highlights t WHERE t.country_id = c.id AND t.title = 'Tuition and Living Costs');
INSERT INTO public.country_program_costs (country_id, program_label, tuition_range_inr, living_cost_inr, total_annual_inr, notes, sort_order)
SELECT c.id, 'Master''s (1.5 - 2 Years)', '₹16 - 25 Lakhs / yr', '₹10 - 13 Lakhs / yr', '₹26 - 38 Lakhs / yr', 'Comprehensive practical and research degrees.', 0
FROM public.countries c
WHERE c.slug = 'new-zealand'
  AND NOT EXISTS (SELECT 1 FROM public.country_program_costs t WHERE t.country_id = c.id AND t.program_label = 'Master''s (1.5 - 2 Years)');
INSERT INTO public.country_hidden_costs (country_id, item, cost_inr, frequency, sort_order)
SELECT c.id, 'Student Visa Fee', 'NZD $430 (₹22,000)', 'One-time', 0
FROM public.countries c
WHERE c.slug = 'new-zealand'
  AND NOT EXISTS (SELECT 1 FROM public.country_hidden_costs t WHERE t.country_id = c.id AND t.item = 'Student Visa Fee');
INSERT INTO public.country_hidden_costs (country_id, item, cost_inr, frequency, sort_order)
SELECT c.id, 'Mandatory Student Health Insurance', 'NZD $700 / yr (₹35,000)', 'Annual', 1
FROM public.countries c
WHERE c.slug = 'new-zealand'
  AND NOT EXISTS (SELECT 1 FROM public.country_hidden_costs t WHERE t.country_id = c.id AND t.item = 'Mandatory Student Health Insurance');
INSERT INTO public.faqs (scope, scope_id, question, answer, sort_order)
SELECT 'country', c.id, 'What is the Green List in New Zealand?', 'The Green List includes in-demand roles in tech, engineering, healthcare, and education that offer direct or fast-track permanent residence pathways for skilled graduates.', 0
FROM public.countries c
WHERE c.slug = 'new-zealand'
  AND NOT EXISTS (SELECT 1 FROM public.faqs t WHERE t.scope = 'country' AND t.scope_id = c.id AND t.question = 'What is the Green List in New Zealand?');
INSERT INTO public.scholarships (name, provider, country_id, award_summary, eligibility_note, deadline_note, sort_order)
SELECT 'Manaaki New Zealand Scholarships', 'Government', c.id, 'Full tuition + Living allowance + Airfare', 'High-potential international students committed to sustainable development', 'February annually', 100
FROM public.countries c
WHERE c.slug = 'new-zealand'
  AND NOT EXISTS (SELECT 1 FROM public.scholarships t WHERE t.name = 'Manaaki New Zealand Scholarships');
INSERT INTO public.scholarships (name, provider, country_id, award_summary, eligibility_note, deadline_note, sort_order)
SELECT 'University of Auckland International Excellence', 'University', c.id, 'Up to NZD $10,000 tuition reduction', 'Merit-based on high undergraduate CGPA', 'Admissions cycle', 101
FROM public.countries c
WHERE c.slug = 'new-zealand'
  AND NOT EXISTS (SELECT 1 FROM public.scholarships t WHERE t.name = 'University of Auckland International Excellence');
-- United Arab Emirates
INSERT INTO public.country_highlights (country_id, kind, title, description, sort_order)
SELECT c.id, 'reason', 'Identical Global Degrees', 'Graduate with the exact same degree certificate as home campuses in the US, UK, Australia, or India.', 0
FROM public.countries c
WHERE c.slug = 'uae'
  AND NOT EXISTS (SELECT 1 FROM public.country_highlights t WHERE t.country_id = c.id AND t.title = 'Identical Global Degrees');
INSERT INTO public.country_highlights (country_id, kind, title, description, sort_order)
SELECT c.id, 'reason', '10-Year Golden Visa Opportunities', 'Top university graduates with high GPAs qualify for the UAE Golden Visa for self-sponsored residency.', 1
FROM public.countries c
WHERE c.slug = 'uae'
  AND NOT EXISTS (SELECT 1 FROM public.country_highlights t WHERE t.country_id = c.id AND t.title = '10-Year Golden Visa Opportunities');
INSERT INTO public.country_highlights (country_id, kind, title, description, sort_order)
SELECT c.id, 'reason', '3 Hours from India with Zero Tax', 'Short flight time with tax-free graduate starting salaries in Dubai''s thriving tech and finance sectors.', 2
FROM public.countries c
WHERE c.slug = 'uae'
  AND NOT EXISTS (SELECT 1 FROM public.country_highlights t WHERE t.country_id = c.id AND t.title = '3 Hours from India with Zero Tax');
INSERT INTO public.country_highlights (country_id, kind, title, description, sort_order)
SELECT c.id, 'tradeoff', 'Campus Housing Costs', 'Accommodation in Dubai can be expensive; choosing university-managed residences provides better cost predictability.', 3
FROM public.countries c
WHERE c.slug = 'uae'
  AND NOT EXISTS (SELECT 1 FROM public.country_highlights t WHERE t.country_id = c.id AND t.title = 'Campus Housing Costs');
INSERT INTO public.country_program_costs (country_id, program_label, tuition_range_inr, living_cost_inr, total_annual_inr, notes, sort_order)
SELECT c.id, 'Master''s Degrees (MS / MSc / MBA)', '₹12 - 22 Lakhs / yr', '₹7 - 10 Lakhs / yr', '₹19 - 32 Lakhs / yr', '2-year or 1-year programs with evening/weekend schedules for working professionals.', 0
FROM public.countries c
WHERE c.slug = 'uae'
  AND NOT EXISTS (SELECT 1 FROM public.country_program_costs t WHERE t.country_id = c.id AND t.program_label = 'Master''s Degrees (MS / MSc / MBA)');
INSERT INTO public.country_hidden_costs (country_id, item, cost_inr, frequency, sort_order)
SELECT c.id, 'Student Visa & Emirates ID Processing', 'AED 3,000 - 4,500 (₹68,000 - ₹1,00,000)', 'Annual', 0
FROM public.countries c
WHERE c.slug = 'uae'
  AND NOT EXISTS (SELECT 1 FROM public.country_hidden_costs t WHERE t.country_id = c.id AND t.item = 'Student Visa & Emirates ID Processing');
INSERT INTO public.country_hidden_costs (country_id, item, cost_inr, frequency, sort_order)
SELECT c.id, 'Health Insurance', 'Included in visa package or AED 1,500 / yr', 'Annual', 1
FROM public.countries c
WHERE c.slug = 'uae'
  AND NOT EXISTS (SELECT 1 FROM public.country_hidden_costs t WHERE t.country_id = c.id AND t.item = 'Health Insurance');
INSERT INTO public.faqs (scope, scope_id, question, answer, sort_order)
SELECT 'country', c.id, 'Can Indian students work part-time in Dubai while studying?', 'Yes, students on university-sponsored visas can take up internships and part-time jobs with a No Objection Certificate (NOC) from their institution.', 0
FROM public.countries c
WHERE c.slug = 'uae'
  AND NOT EXISTS (SELECT 1 FROM public.faqs t WHERE t.scope = 'country' AND t.scope_id = c.id AND t.question = 'Can Indian students work part-time in Dubai while studying?');
INSERT INTO public.scholarships (name, provider, country_id, award_summary, eligibility_note, deadline_note, sort_order)
SELECT 'Academic Merit Scholarships', 'University', c.id, '20% - 50% Tuition fee reduction', 'Students with 85%+ in previous qualification', 'Rolling with admission', 100
FROM public.countries c
WHERE c.slug = 'uae'
  AND NOT EXISTS (SELECT 1 FROM public.scholarships t WHERE t.name = 'Academic Merit Scholarships');
-- Malaysia
INSERT INTO public.country_highlights (country_id, kind, title, description, sort_order)
SELECT c.id, 'reason', 'Foreign Branch Campuses', 'Obtain a Monash or Nottingham degree with identical curriculum at 60% lower total expense.', 0
FROM public.countries c
WHERE c.slug = 'malaysia'
  AND NOT EXISTS (SELECT 1 FROM public.country_highlights t WHERE t.country_id = c.id AND t.title = 'Foreign Branch Campuses');
INSERT INTO public.country_highlights (country_id, kind, title, description, sort_order)
SELECT c.id, 'reason', '2+1 Twinning & Transfer', 'Option to transfer to Australian or UK home campuses after 1 or 2 years in Malaysia.', 1
FROM public.countries c
WHERE c.slug = 'malaysia'
  AND NOT EXISTS (SELECT 1 FROM public.country_highlights t WHERE t.country_id = c.id AND t.title = '2+1 Twinning & Transfer');
INSERT INTO public.country_highlights (country_id, kind, title, description, sort_order)
SELECT c.id, 'reason', 'Low Living Cost', 'Quality apartment living, food, and transit for under ₹30,000 to ₹40,000 per month.', 2
FROM public.countries c
WHERE c.slug = 'malaysia'
  AND NOT EXISTS (SELECT 1 FROM public.country_highlights t WHERE t.country_id = c.id AND t.title = 'Low Living Cost');
INSERT INTO public.country_highlights (country_id, kind, title, description, sort_order)
SELECT c.id, 'tradeoff', 'Limited In-Country Work Rights', 'Post-study work visa options in Malaysia are limited; most students utilize the degree for global recruitment or campus transfer.', 3
FROM public.countries c
WHERE c.slug = 'malaysia'
  AND NOT EXISTS (SELECT 1 FROM public.country_highlights t WHERE t.country_id = c.id AND t.title = 'Limited In-Country Work Rights');
INSERT INTO public.country_program_costs (country_id, program_label, tuition_range_inr, living_cost_inr, total_annual_inr, notes, sort_order)
SELECT c.id, 'Master''s Degrees (Monash / Nottingham)', '₹7 - 12 Lakhs / yr', '₹3.5 - 5 Lakhs / yr', '₹10.5 - 17 Lakhs / yr', 'Identical Australian/UK degree certificate awarded upon graduation.', 0
FROM public.countries c
WHERE c.slug = 'malaysia'
  AND NOT EXISTS (SELECT 1 FROM public.country_program_costs t WHERE t.country_id = c.id AND t.program_label = 'Master''s Degrees (Monash / Nottingham)');
INSERT INTO public.country_hidden_costs (country_id, item, cost_inr, frequency, sort_order)
SELECT c.id, 'EMGS Student Visa Approval Letter (VAL)', 'RM 2,000 (₹38,000)', 'One-time', 0
FROM public.countries c
WHERE c.slug = 'malaysia'
  AND NOT EXISTS (SELECT 1 FROM public.country_hidden_costs t WHERE t.country_id = c.id AND t.item = 'EMGS Student Visa Approval Letter (VAL)');
INSERT INTO public.faqs (scope, scope_id, question, answer, sort_order)
SELECT 'country', c.id, 'Do graduates from Monash Malaysia receive the same degree as Monash Australia?', 'Yes, the degree certificate is issued directly by Monash University Australia and is identical to degrees awarded on the Melbourne campus.', 0
FROM public.countries c
WHERE c.slug = 'malaysia'
  AND NOT EXISTS (SELECT 1 FROM public.faqs t WHERE t.scope = 'country' AND t.scope_id = c.id AND t.question = 'Do graduates from Monash Malaysia receive the same degree as Monash Australia?');
INSERT INTO public.scholarships (name, provider, country_id, award_summary, eligibility_note, deadline_note, sort_order)
SELECT 'Monash High Achiever Award', 'University', c.id, 'RM 5,000 - 10,000 / semester', 'High academic marks in previous degree', 'Semester start', 100
FROM public.countries c
WHERE c.slug = 'malaysia'
  AND NOT EXISTS (SELECT 1 FROM public.scholarships t WHERE t.name = 'Monash High Achiever Award');
-- Mauritius
INSERT INTO public.country_highlights (country_id, kind, title, description, sort_order)
SELECT c.id, 'reason', '100% English Medium & NMC Compliant', 'SSR Medical College is established and recognized by NMC and WHO for medical practice.', 0
FROM public.countries c
WHERE c.slug = 'mauritius'
  AND NOT EXISTS (SELECT 1 FROM public.country_highlights t WHERE t.country_id = c.id AND t.title = '100% English Medium & NMC Compliant');
INSERT INTO public.country_highlights (country_id, kind, title, description, sort_order)
SELECT c.id, 'reason', 'Safe & Friendly Community', 'Over 60% of the population is of Indian origin; Indian festivals, food, and culture are universal.', 1
FROM public.countries c
WHERE c.slug = 'mauritius'
  AND NOT EXISTS (SELECT 1 FROM public.country_highlights t WHERE t.country_id = c.id AND t.title = 'Safe & Friendly Community');
INSERT INTO public.country_highlights (country_id, kind, title, description, sort_order)
SELECT c.id, 'reason', 'Affordable Island Living', 'Low tuition and budget-friendly student housing with pleasant tropical climate year-round.', 2
FROM public.countries c
WHERE c.slug = 'mauritius'
  AND NOT EXISTS (SELECT 1 FROM public.country_highlights t WHERE t.country_id = c.id AND t.title = 'Affordable Island Living');
INSERT INTO public.country_highlights (country_id, kind, title, description, sort_order)
SELECT c.id, 'tradeoff', 'Smaller Job Market', 'Due to island economy size, most students return to India or pursue international careers upon graduation.', 3
FROM public.countries c
WHERE c.slug = 'mauritius'
  AND NOT EXISTS (SELECT 1 FROM public.country_highlights t WHERE t.country_id = c.id AND t.title = 'Smaller Job Market');
INSERT INTO public.country_program_costs (country_id, program_label, tuition_range_inr, living_cost_inr, total_annual_inr, notes, sort_order)
SELECT c.id, 'MBBS (5-Year Program)', '₹6 - 8 Lakhs / yr', '₹2.5 - 3.5 Lakhs / yr', '₹8.5 - 11.5 Lakhs / yr', 'Total 5-year MBBS package approximately ₹38 - 45 Lakhs.', 0
FROM public.countries c
WHERE c.slug = 'mauritius'
  AND NOT EXISTS (SELECT 1 FROM public.country_program_costs t WHERE t.country_id = c.id AND t.program_label = 'MBBS (5-Year Program)');
INSERT INTO public.country_hidden_costs (country_id, item, cost_inr, frequency, sort_order)
SELECT c.id, 'Student Visa Processing Fee', '₹15,000', 'One-time', 0
FROM public.countries c
WHERE c.slug = 'mauritius'
  AND NOT EXISTS (SELECT 1 FROM public.country_hidden_costs t WHERE t.country_id = c.id AND t.item = 'Student Visa Processing Fee');
INSERT INTO public.faqs (scope, scope_id, question, answer, sort_order)
SELECT 'country', c.id, 'Is the MBBS from Mauritius recognized in India?', 'Yes, SSR Medical College in Mauritius is listed in the WHO directory and recognized by the National Medical Commission (NMC) for NExT/FMGE eligibility.', 0
FROM public.countries c
WHERE c.slug = 'mauritius'
  AND NOT EXISTS (SELECT 1 FROM public.faqs t WHERE t.scope = 'country' AND t.scope_id = c.id AND t.question = 'Is the MBBS from Mauritius recognized in India?');
INSERT INTO public.scholarships (name, provider, country_id, award_summary, eligibility_note, deadline_note, sort_order)
SELECT 'Mauritius-Africa Scholarship Scheme', 'Government', c.id, 'Full tuition coverage', 'Merit-based admission in participating higher education institutions', 'April annually', 100
FROM public.countries c
WHERE c.slug = 'mauritius'
  AND NOT EXISTS (SELECT 1 FROM public.scholarships t WHERE t.name = 'Mauritius-Africa Scholarship Scheme');

-- Country x program landing pages
INSERT INTO public.country_programs (country_id, program_id, url_alias, seo_priority, sort_order)
SELECT c.id, p.id, 'masters', 0.9, 0
FROM public.countries c, public.programs p
WHERE c.slug = 'uk' AND p.id = 'ms'
ON CONFLICT (country_id, program_id) DO NOTHING;
INSERT INTO public.country_programs (country_id, program_id, url_alias, seo_priority, sort_order)
SELECT c.id, p.id, NULL, 0.85, 1
FROM public.countries c, public.programs p
WHERE c.slug = 'uk' AND p.id = 'mba'
ON CONFLICT (country_id, program_id) DO NOTHING;
INSERT INTO public.country_programs (country_id, program_id, url_alias, seo_priority, sort_order)
SELECT c.id, p.id, 'executive-mba', 0.8, 2
FROM public.countries c, public.programs p
WHERE c.slug = 'uk' AND p.id = 'emba'
ON CONFLICT (country_id, program_id) DO NOTHING;
INSERT INTO public.country_programs (country_id, program_id, url_alias, seo_priority, sort_order)
SELECT c.id, p.id, NULL, 0.85, 3
FROM public.countries c, public.programs p
WHERE c.slug = 'uk' AND p.id = 'nursing'
ON CONFLICT (country_id, program_id) DO NOTHING;
INSERT INTO public.country_programs (country_id, program_id, url_alias, seo_priority, sort_order)
SELECT c.id, p.id, 'masters', 0.9, 4
FROM public.countries c, public.programs p
WHERE c.slug = 'usa' AND p.id = 'ms'
ON CONFLICT (country_id, program_id) DO NOTHING;
INSERT INTO public.country_programs (country_id, program_id, url_alias, seo_priority, sort_order)
SELECT c.id, p.id, NULL, 0.85, 5
FROM public.countries c, public.programs p
WHERE c.slug = 'usa' AND p.id = 'mba'
ON CONFLICT (country_id, program_id) DO NOTHING;
INSERT INTO public.country_programs (country_id, program_id, url_alias, seo_priority, sort_order)
SELECT c.id, p.id, 'executive-mba', 0.8, 6
FROM public.countries c, public.programs p
WHERE c.slug = 'usa' AND p.id = 'emba'
ON CONFLICT (country_id, program_id) DO NOTHING;
INSERT INTO public.country_programs (country_id, program_id, url_alias, seo_priority, sort_order)
SELECT c.id, p.id, 'masters', 0.9, 7
FROM public.countries c, public.programs p
WHERE c.slug = 'germany' AND p.id = 'ms'
ON CONFLICT (country_id, program_id) DO NOTHING;
INSERT INTO public.country_programs (country_id, program_id, url_alias, seo_priority, sort_order)
SELECT c.id, p.id, NULL, 0.85, 8
FROM public.countries c, public.programs p
WHERE c.slug = 'germany' AND p.id = 'ausbildung'
ON CONFLICT (country_id, program_id) DO NOTHING;
INSERT INTO public.country_programs (country_id, program_id, url_alias, seo_priority, sort_order)
SELECT c.id, p.id, 'masters', 0.85, 9
FROM public.countries c, public.programs p
WHERE c.slug = 'canada' AND p.id = 'ms'
ON CONFLICT (country_id, program_id) DO NOTHING;
INSERT INTO public.country_programs (country_id, program_id, url_alias, seo_priority, sort_order)
SELECT c.id, p.id, NULL, 0.9, 10
FROM public.countries c, public.programs p
WHERE c.slug = 'russia' AND p.id = 'mbbs'
ON CONFLICT (country_id, program_id) DO NOTHING;
INSERT INTO public.country_programs (country_id, program_id, url_alias, seo_priority, sort_order)
SELECT c.id, p.id, NULL, 0.9, 11
FROM public.countries c, public.programs p
WHERE c.slug = 'georgia' AND p.id = 'mbbs'
ON CONFLICT (country_id, program_id) DO NOTHING;

-- Test prep hub FAQs
INSERT INTO public.faqs (scope, question, answer, sort_order)
SELECT 'test_prep', 'Which English proficiency test is easiest for Indian students: IELTS, TOEFL, or PTE?', 'PTE Academic is widely considered the most objective because it is 100% computer-graded with automated speech algorithms, eliminating subjective human examiner bias. IELTS Academic remains the gold standard for UK, Canadian, and Australian university admissions and visa processing. TOEFL iBT is ideal for US universities and has a condensed 2-hour format.', 0
WHERE NOT EXISTS (SELECT 1 FROM public.faqs WHERE scope = 'test_prep' AND question = 'Which English proficiency test is easiest for Indian students: IELTS, TOEFL, or PTE?');
INSERT INTO public.faqs (scope, question, answer, sort_order)
SELECT 'test_prep', 'Do German public universities require the GRE for MS in STEM programs?', 'Many top German TU9 universities (such as TU Munich, RWTH Aachen, and University of Stuttgart) either mandate or highly recommend the GRE Quantitative score (usually 160+) for Indian engineering and computer science applicants to bypass stringent applicant screening.', 1
WHERE NOT EXISTS (SELECT 1 FROM public.faqs WHERE scope = 'test_prep' AND question = 'Do German public universities require the GRE for MS in STEM programs?');
INSERT INTO public.faqs (scope, question, answer, sort_order)
SELECT 'test_prep', 'What is the difference between NCLEX-RN and OET for Indian Nurses migrating abroad?', 'NCLEX-RN is the clinical nursing licensing examination required by US and Canadian State Boards of Nursing to practice as a Registered Nurse. OET (Occupational English Test) is a healthcare-specific English language proficiency test required by UK, Irish, and Australian Nursing Midwifery Councils (NMC/AHPRA) to prove clinical communication skills.', 2
WHERE NOT EXISTS (SELECT 1 FROM public.faqs WHERE scope = 'test_prep' AND question = 'What is the difference between NCLEX-RN and OET for Indian Nurses migrating abroad?');
INSERT INTO public.faqs (scope, question, answer, sort_order)
SELECT 'test_prep', 'Is PLAB replaced by the UKMLA for Indian MBBS doctors?', 'Yes, starting in 2024–2026, the General Medical Council (GMC UK) is transitioning the Professional and Linguistic Assessments Board (PLAB) into the United Kingdom Medical Licensing Assessment (UKMLA). The format remains two parts: the Applied Knowledge Test (AKT) and Clinical Assessment (CPSA).', 3
WHERE NOT EXISTS (SELECT 1 FROM public.faqs WHERE scope = 'test_prep' AND question = 'Is PLAB replaced by the UKMLA for Indian MBBS doctors?');
INSERT INTO public.faqs (scope, question, answer, sort_order)
SELECT 'test_prep', 'Can I use Duolingo English Test (DET) for Canada and Australia student visas?', 'While over 4,500 universities globally accept DET for academic admission, student visa regulations differ. Canada''s SDS stream requires IELTS Academic or PTE Academic. Australia primarily mandates PTE Academic or IELTS for visa compliance. However, DET is widely accepted for US universities and European institutions.', 4
WHERE NOT EXISTS (SELECT 1 FROM public.faqs WHERE scope = 'test_prep' AND question = 'Can I use Duolingo English Test (DET) for Canada and Australia student visas?');

-- AI counsellor starter questions
INSERT INTO public.ai_suggested_questions (category, question, sort_order)
SELECT 'Tuition-Free & Low Budget', 'Which European countries offer €0 or free tuition?', 0
WHERE NOT EXISTS (SELECT 1 FROM public.ai_suggested_questions WHERE question = 'Which European countries offer €0 or free tuition?');
INSERT INTO public.ai_suggested_questions (category, question, sort_order)
SELECT 'Tuition-Free & Low Budget', 'How does Germany''s €11,904 blocked account work?', 1
WHERE NOT EXISTS (SELECT 1 FROM public.ai_suggested_questions WHERE question = 'How does Germany''s €11,904 blocked account work?');
INSERT INTO public.ai_suggested_questions (category, question, sort_order)
SELECT 'Tuition-Free & Low Budget', 'What is Italy''s DSU 100% scholarship eligibility?', 2
WHERE NOT EXISTS (SELECT 1 FROM public.ai_suggested_questions WHERE question = 'What is Italy''s DSU 100% scholarship eligibility?');
INSERT INTO public.ai_suggested_questions (category, question, sort_order)
SELECT 'Tuition-Free & Low Budget', 'How does Germany Ausbildung dual training with monthly stipend work?', 3
WHERE NOT EXISTS (SELECT 1 FROM public.ai_suggested_questions WHERE question = 'How does Germany Ausbildung dual training with monthly stipend work?');
INSERT INTO public.ai_suggested_questions (category, question, sort_order)
SELECT 'NMC-Compliant MBBS Abroad', 'Which MBBS countries are 100% NMC FMGL compliant?', 4
WHERE NOT EXISTS (SELECT 1 FROM public.ai_suggested_questions WHERE question = 'Which MBBS countries are 100% NMC FMGL compliant?');
INSERT INTO public.ai_suggested_questions (category, question, sort_order)
SELECT 'NMC-Compliant MBBS Abroad', 'What is the total 6-year MBBS cost in Russia vs Georgia?', 5
WHERE NOT EXISTS (SELECT 1 FROM public.ai_suggested_questions WHERE question = 'What is the total 6-year MBBS cost in Russia vs Georgia?');
INSERT INTO public.ai_suggested_questions (category, question, sort_order)
SELECT 'NMC-Compliant MBBS Abroad', 'Is NEET qualification mandatory to study MBBS abroad?', 6
WHERE NOT EXISTS (SELECT 1 FROM public.ai_suggested_questions WHERE question = 'Is NEET qualification mandatory to study MBBS abroad?');
INSERT INTO public.ai_suggested_questions (category, question, sort_order)
SELECT 'NMC-Compliant MBBS Abroad', 'How does NEXT licensing exam work for foreign medical graduates?', 7
WHERE NOT EXISTS (SELECT 1 FROM public.ai_suggested_questions WHERE question = 'How does NEXT licensing exam work for foreign medical graduates?');
INSERT INTO public.ai_suggested_questions (category, question, sort_order)
SELECT 'USA, UK & High-ROI STEM', 'Which US master''s degrees offer 3-year STEM OPT extensions?', 8
WHERE NOT EXISTS (SELECT 1 FROM public.ai_suggested_questions WHERE question = 'Which US master''s degrees offer 3-year STEM OPT extensions?');
INSERT INTO public.ai_suggested_questions (category, question, sort_order)
SELECT 'USA, UK & High-ROI STEM', 'Top UK universities for MS Computer Science under ₹20 Lakhs?', 9
WHERE NOT EXISTS (SELECT 1 FROM public.ai_suggested_questions WHERE question = 'Top UK universities for MS Computer Science under ₹20 Lakhs?');
INSERT INTO public.ai_suggested_questions (category, question, sort_order)
SELECT 'USA, UK & High-ROI STEM', 'What are the Post-Study Work Visa rules in Ireland and Australia?', 10
WHERE NOT EXISTS (SELECT 1 FROM public.ai_suggested_questions WHERE question = 'What are the Post-Study Work Visa rules in Ireland and Australia?');
INSERT INTO public.ai_suggested_questions (category, question, sort_order)
SELECT 'USA, UK & High-ROI STEM', 'What are the average GRE and IELTS score requirements?', 11
WHERE NOT EXISTS (SELECT 1 FROM public.ai_suggested_questions WHERE question = 'What are the average GRE and IELTS score requirements?');

-- Home page testimonial (REVIEW: confirm this student story is genuine)
INSERT INTO public.testimonials (student_name, headline, quote, sort_order)
SELECT 'Rohan Verma', 'MS in Computer Science · Admitted to TU Munich', 'The shortlist and cost comparison helped our family understand the realistic total expenses in ₹ Lakhs before we ever committed to speaking with a counsellor.', 0
WHERE NOT EXISTS (SELECT 1 FROM public.testimonials WHERE student_name = 'Rohan Verma');

-- Footer trust badges (REVIEW: keep only claims you can evidence, e.g. ISO)
INSERT INTO public.trust_badges (title, description, sort_order)
SELECT 'NMC Recognised', 'Every MBBS university verified against official NMC gazette.', 0
WHERE NOT EXISTS (SELECT 1 FROM public.trust_badges WHERE title = 'NMC Recognised');
INSERT INTO public.trust_badges (title, description, sort_order)
SELECT 'WHO Verified', 'Cross-checked against WHO World Directory of Medical Schools.', 1
WHERE NOT EXISTS (SELECT 1 FROM public.trust_badges WHERE title = 'WHO Verified');
INSERT INTO public.trust_badges (title, description, sort_order)
SELECT 'DPDP Act 2023', 'Lawful data handling with zero spam and encryption guarantee.', 2
WHERE NOT EXISTS (SELECT 1 FROM public.trust_badges WHERE title = 'DPDP Act 2023');
INSERT INTO public.trust_badges (title, description, sort_order)
SELECT 'ISO Certified', 'Audited data security and student service operations standards.', 3
WHERE NOT EXISTS (SELECT 1 FROM public.trust_badges WHERE title = 'ISO Certified');

-- Partner page wallet packs
INSERT INTO public.b2b_wallet_packs (label, amount_inr, perk, sort_order)
SELECT 'Starter Pack', 10000, 'Standard cost per lead', 0
WHERE NOT EXISTS (SELECT 1 FROM public.b2b_wallet_packs WHERE label = 'Starter Pack');
INSERT INTO public.b2b_wallet_packs (label, amount_inr, perk, sort_order)
SELECT 'Growth Pack (Popular)', 25000, 'Includes 15% Bonus Credits', 1
WHERE NOT EXISTS (SELECT 1 FROM public.b2b_wallet_packs WHERE label = 'Growth Pack (Popular)');
INSERT INTO public.b2b_wallet_packs (label, amount_inr, perk, sort_order)
SELECT 'Enterprise Scale', 50000, 'Dedicated Account Manager + Priority Leads', 2
WHERE NOT EXISTS (SELECT 1 FROM public.b2b_wallet_packs WHERE label = 'Enterprise Scale');

-- Site settings (REVIEW: the hotline number looked like a placeholder)
INSERT INTO public.site_settings (key, label, value, sort_order)
VALUES ('company_name', 'Company legal name', 'Dnyanal Educon Pvt. Ltd.', 0)
ON CONFLICT (key) DO NOTHING;
INSERT INTO public.site_settings (key, label, value, sort_order)
VALUES ('founder_name', 'Founder director', 'Nikhita Pradeep Deshmukh', 1)
ON CONFLICT (key) DO NOTHING;
INSERT INTO public.site_settings (key, label, value, sort_order)
VALUES ('office_locations', 'Office locations', 'Pune & Mumbai, Maharashtra, India', 2)
ON CONFLICT (key) DO NOTHING;
INSERT INTO public.site_settings (key, label, value, sort_order)
VALUES ('contact_email', 'General contact email', 'contact@abroadroute.com', 3)
ON CONFLICT (key) DO NOTHING;
INSERT INTO public.site_settings (key, label, value, sort_order)
VALUES ('admissions_email', 'Admissions / support email', 'admissions@abroadroute.com', 4)
ON CONFLICT (key) DO NOTHING;
INSERT INTO public.site_settings (key, label, value, sort_order)
VALUES ('grievance_email', 'Grievance officer (DPO) email', 'dpo@abroadroute.com', 5)
ON CONFLICT (key) DO NOTHING;
INSERT INTO public.site_settings (key, label, value, sort_order)
VALUES ('support_phone', 'Admissions hotline', '+91 (020) 8492-3000', 6)
ON CONFLICT (key) DO NOTHING;
INSERT INTO public.site_settings (key, label, value, sort_order)
VALUES ('support_hours', 'Hotline hours', 'Mon - Sat: 9:30 AM - 6:30 PM IST', 7)
ON CONFLICT (key) DO NOTHING;
INSERT INTO public.site_settings (key, label, value, sort_order)
VALUES ('b2b_cost_per_lead_inr', 'B2B cost per lead (INR)', '1500', 8)
ON CONFLICT (key) DO NOTHING;

-- University official email domains (used to verify profile claims)
UPDATE public.universities SET official_email_domain = 'gatech.edu' WHERE slug = 'georgia-tech' AND official_email_domain IS NULL;
UPDATE public.universities SET official_email_domain = 'tum.de' WHERE slug = 'technical-university-of-munich' AND official_email_domain IS NULL;
UPDATE public.universities SET official_email_domain = 'stanford.edu' WHERE slug = 'university-of-stanford' AND official_email_domain IS NULL;
UPDATE public.universities SET official_email_domain = 'stanford.edu' WHERE slug = 'stanford-university' AND official_email_domain IS NULL;
UPDATE public.universities SET official_email_domain = 'ox.ac.uk' WHERE slug = 'university-of-oxford' AND official_email_domain IS NULL;
UPDATE public.universities SET official_email_domain = 'unimelb.edu.au' WHERE slug = 'university-of-melbourne' AND official_email_domain IS NULL;
UPDATE public.universities SET official_email_domain = 'utoronto.ca' WHERE slug = 'university-of-toronto' AND official_email_domain IS NULL;
UPDATE public.universities SET official_email_domain = 'manchester.ac.uk' WHERE slug = 'university-of-manchester' AND official_email_domain IS NULL;
UPDATE public.universities SET official_email_domain = 'tcd.ie' WHERE slug = 'trinity-college-dublin' AND official_email_domain IS NULL;
UPDATE public.universities SET official_email_domain = 'tma.uz' WHERE slug = 'tashkent-medical-academy' AND official_email_domain IS NULL;
UPDATE public.universities SET official_email_domain = 'sorbonne-universite.fr' WHERE slug = 'sorbonne-university' AND official_email_domain IS NULL;
UPDATE public.universities SET official_email_domain = 'hec.fr' WHERE slug = 'hec-paris' AND official_email_domain IS NULL;
UPDATE public.universities SET official_email_domain = 'polytechnique.edu' WHERE slug = 'polytechnique-paris' AND official_email_domain IS NULL;
UPDATE public.universities SET official_email_domain = 'essec.edu' WHERE slug = 'essec-business-school' AND official_email_domain IS NULL;
UPDATE public.universities SET official_email_domain = 'psl.eu' WHERE slug = 'psl-university' AND official_email_domain IS NULL;
UPDATE public.universities SET official_email_domain = 'tudelft.nl' WHERE slug = 'tu-delft' AND official_email_domain IS NULL;
UPDATE public.universities SET official_email_domain = 'uniroma1.it' WHERE slug = 'sapienza-university-of-rome' AND official_email_domain IS NULL;
UPDATE public.universities SET official_email_domain = 'nus.edu.sg' WHERE slug = 'national-university-of-singapore' AND official_email_domain IS NULL;
UPDATE public.universities SET official_email_domain = 'auckland.ac.nz' WHERE slug = 'university-of-auckland' AND official_email_domain IS NULL;

NOTIFY pgrst, 'reload schema';
