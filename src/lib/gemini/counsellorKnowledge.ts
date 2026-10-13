/**
 * Master Knowledge Base, Context Injector, and Guardrails for ✦ Route AI Counsellor
 * Powered by Google Gemini 3.8 Flash · Abroadroute
 */

export interface AIUserProfile {
  name?: string;
  email?: string;
  phone?: string;
  targetDegree?: string;
  targetCountry?: string;
  budgetRange?: string;
  cgpa?: string | number;
  testScores?: {
    ielts?: string | number;
    toefl?: string | number;
    gre?: string | number;
    gmat?: string | number;
    neet?: string | number;
  };
  preferredIntake?: string;
}

export interface AIPageContext {
  url?: string;
  country?: string;
  program?: string;
  university?: string;
  courseTitle?: string;
}

/**
 * [FR-AI-002] Context-Aware Initial Greeting
 * Opening greeting for the page the user is on. It names the destination or
 * topic from the URL but states no facts: figures come from the database or
 * the AI's answers, never from hardcoded copy.
 */
export function getContextAwareGreeting(pathname?: string): string {
  const generic =
    "Namaste! I am your ✦ Route AI Counsellor by Abroadroute. What destination, degree, or budget are you exploring today?";
  if (!pathname || pathname === "/" || pathname === "/ai-counsellor") {
    return generic;
  }

  const p = pathname.toLowerCase();
  // /study-in-<country>[/...] or /destinations/<country>[/...]
  const countryMatch =
    p.match(/^\/study-in-([a-z-]+)/) ?? p.match(/^\/destinations\/([a-z-]+)/);
  if (countryMatch) {
    const name = countryMatch[1]
      .split("-")
      .map((w) => (w.length <= 3 ? w.toUpperCase() : w[0].toUpperCase() + w.slice(1)))
      .join(" ");
    return `I see you are exploring ${name}. What would you like to know about universities, costs, visas or intakes there?`;
  }
  if (p.includes("mbbs")) {
    return "I see you are exploring MBBS abroad. How can I help with universities, NMC rules or costs?";
  }
  if (p.includes("cost-calculator")) {
    return "I see you are estimating study abroad expenses. Which country and course should we work out costs for?";
  }
  if (p.includes("scholarship")) {
    return "Looking for scholarships? Tell me your course, destination and profile and I'll help you find options.";
  }
  if (p.includes("compare") || p.includes("universities")) {
    return "Comparing universities? Tell me your preferred destination, CGPA, or budget, and I'll find the best academic and career matches for you.";
  }
  return generic;
}

/**
 * Builds the comprehensive system instruction for Gemini
 */
export function buildSystemPrompt(
  pageContext?: AIPageContext,
  userProfile?: AIUserProfile,
  shortlistCount?: number,
  // From the database: active destination names and site settings
  destinations: string[] = [],
  company: { name?: string | null; founder?: string | null } = {},
): string {
  const dynamicContext: string[] = [];

  if (pageContext?.country) {
    dynamicContext.push(`CURRENT PAGE DESTINATION: ${pageContext.country}`);
  }
  if (pageContext?.program) {
    dynamicContext.push(
      `CURRENT PAGE PROGRAM CATEGORY: ${pageContext.program}`,
    );
  }
  if (pageContext?.university) {
    dynamicContext.push(`CURRENT PAGE UNIVERSITY: ${pageContext.university}`);
  }
  if (pageContext?.courseTitle) {
    dynamicContext.push(`CURRENT VIEWED COURSE: ${pageContext.courseTitle}`);
  }

  if (userProfile?.name) {
    dynamicContext.push(`STUDENT NAME: ${userProfile.name}`);
  }
  if (userProfile?.targetDegree) {
    dynamicContext.push(`TARGET DEGREE: ${userProfile.targetDegree}`);
  }
  if (userProfile?.budgetRange) {
    dynamicContext.push(`BUDGET PREFERENCE: ${userProfile.budgetRange}`);
  }
  if (shortlistCount && shortlistCount > 0) {
    dynamicContext.push(
      `USER HAS ${shortlistCount} UNIVERSITIES IN THEIR SHORTLIST`,
    );
  }

  const dynamicContextSection =
    dynamicContext.length > 0
      ? `\n### ACTIVE STUDENT SESSION CONTEXT:\n${dynamicContext.map((c) => `- ${c}`).join("\n")}\n`
      : "";

  return `
You are the **✦ AbroadRoute AI Counsellor**, an expert, empathetic, and strategic global admissions counsellor for Indian students and working professionals.
You represent **AbroadRoute**${
    company.name
      ? ` (a brand by ${company.name}${company.founder ? ` · Founder Director: ${company.founder}` : ""})`
      : ""
  }.

${dynamicContextSection}

### CORE MISSION & PERSONA:
1. Provide accurate, practical, and highly transparent advice on studying abroad${
    destinations.length > 0
      ? ` across our ${destinations.length} destinations (${destinations.join(", ")})`
      : ""
  }.
2. Always quote estimated costs in **Indian Rupees (₹ Lakhs)** alongside the host nation's currency (format: "<amount in local currency>/year (~₹<amount> Lakhs)").
3. Break down responses into clean, readable sections with bullet points, bold highlights, and actionable steps.

### [FR-AI-006] FUNCTION-CALLING FOR SITE ACTIONS:
When relevant, recommend helpful site actions by including special action tags at the end of your response. The client UI will render these as interactive clickable cards:
- To calculate costs: \`[[ACTION:CALCULATE_COST:{"country":"Germany"}]]\`
- To search universities: \`[[ACTION:SEARCH_UNIVERSITIES:{"country":"UK","query":"Computer Science"}]]\`
- To suggest shortlisting a university: \`[[ACTION:SAVE_SHORTLIST:{"name":"Technical University of Munich","slug":"tum-germany"}]]\`
- To book a 1-on-1 counsellor consultation: \`[[ACTION:BOOK_CALL:{"country":"Germany","reason":"Profile Evaluation"}]]\`

### [FR-AI-008] STRICT GUARDRAILS & ETHICAL BOUNDARIES:
- **No Legal or Medical Advice**: Refuse to provide formal legal advice or medical diagnoses/prescriptions. If asked, state: "As an educational counsellor, I cannot provide legal or medical advice. Please consult an authorized immigration attorney or certified medical practitioner."
- **No Visa Guarantees**: Never promise or guarantee 100% visa approval. Visas are at the sole discretion of the destination embassy/consulate.
- **NMC Compliance**: For MBBS abroad, always emphasize the National Medical Commission (NMC) FMGL 54+12 month criteria (English medium, same-institute internship, single license).
- **No Politics or Religion**: Politely decline discussing political controversies or religious debates, steering the focus back to academic programs and career pathways.
- **No External Competitor Promotion**: Do not recommend or endorse third-party commercial consulting agencies outside the Abroadroute partner network.
- **Objective Factual Data**: Avoid subjective personal opinions; base all university and country insights on factual data (tuition, rankings, post-study work rights, living costs, accreditation).

### RESPONSE FORMATTING RULES:
- Use clean Markdown with bullet points and bold headers.
- Keep responses concise (under 250 words unless providing a comprehensive multi-country breakdown).
- Include practical next steps at the end of every answer.
`.trim();
}

/**
 * Follow-up suggestions: the starter questions (ai_suggested_questions)
 * that share the most words with the user's message and page context.
 */
export function getSmartFollowUpQuestions(
  query: string,
  questions: { category: string; question: string }[],
  pageContext?: AIPageContext,
  limit = 4,
): string[] {
  const words = (text: string) =>
    new Set(text.toLowerCase().match(/[a-z0-9]{3,}/g) ?? []);
  const asked = words(
    `${query} ${pageContext?.country ?? ""} ${pageContext?.program ?? ""}`,
  );
  return questions
    .map((q, idx) => {
      const candidate = words(`${q.category} ${q.question}`);
      let overlap = 0;
      asked.forEach((w) => candidate.has(w) && overlap++);
      return { q: q.question, overlap, idx };
    })
    .filter((c) => c.q.toLowerCase() !== query.trim().toLowerCase())
    .sort((a, b) => b.overlap - a.overlap || a.idx - b.idx)
    .slice(0, limit)
    .map((c) => c.q);
}
