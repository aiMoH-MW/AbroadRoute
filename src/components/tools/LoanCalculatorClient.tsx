"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Banknote,
  DollarSign,
  Building,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Sparkles,
  Percent,
  Calendar,
  Calculator,
  UserCheck,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { useHomeModals } from "@/components/home/HomeClientContext";
import { LoanLender } from "@/types";
import { fetchLiveLoanLenders } from "@/lib/supabase/dataFetchers";
import { formatDateOnly } from "@/lib/deadlines";
import { formatRateRange, lenderTypeLabel } from "@/lib/loanLenders";

const COURSE_MONTH_OPTIONS = [12, 18, 24, 36, 48, 60, 72];

type CheckLevel = "good" | "warn" | "bad";
type CreditBand = "750+" | "700-749" | "650-699" | "below-650" | "none";
type AdmissionStatus = "admit" | "applied" | "not-applied";

const CREDIT_BANDS: { value: CreditBand; label: string }[] = [
  { value: "750+", label: "750 or above" },
  { value: "700-749", label: "700 – 749" },
  { value: "650-699", label: "650 – 699" },
  { value: "below-650", label: "Below 650" },
  { value: "none", label: "No credit history / not sure" },
];

const ADMISSION_STATUSES: { value: AdmissionStatus; label: string }[] = [
  { value: "admit", label: "Admit received" },
  { value: "applied", label: "Applied, waiting" },
  { value: "not-applied", label: "Not applied yet" },
];

const CHECK_STYLES: Record<CheckLevel, { dot: string; text: string }> = {
  good: { dot: "bg-emerald-500", text: "text-emerald-700" },
  warn: { dot: "bg-amber-500", text: "text-amber-700" },
  bad: { dot: "bg-rose-500", text: "text-rose-700" },
};
const TAX_SLABS = [0, 5, 20, 30]; // old regime slab rates, %
const CESS = 0.04; // health & education cess on income tax
const DEDUCTION_YEARS = 8; // Section 80E: year interest is first paid + 7

interface ScheduleYear {
  year: number; // 1 = first 12 months after the first disbursal
  phase: string; // "Studying", "Grace", "EMIs", or a mix like "Grace → EMIs"
  paid: number; // cash paid that year (interest while studying + EMIs)
  interest: number; // interest charged that year
  interestPaid: number; // interest actually paid that year (for Section 80E)
  principal: number; // principal repaid that year
  balance: number; // amount owed at the end of the year
}

interface LoanPlan {
  emi: number;
  repaymentPrincipal: number; // owed when EMIs start
  moratoriumInterest: number; // interest charged before EMIs start
  maxMonthlyStudyInterest: number; // once the whole loan is disbursed
  totalPaid: number;
  years: ScheduleYear[];
}

// Month-by-month plan. During the course + grace period the lender charges
// simple interest on what has been disbursed so far; it is either paid
// monthly or added to the loan when EMIs start. EMIs then repay that amount
// over the tenure.
function buildLoanPlan({
  loan,
  ratePct,
  courseMonths,
  graceMonths,
  payInterestDuringStudy,
  tenureYears,
  disburseYearly,
}: {
  loan: number;
  ratePct: number;
  courseMonths: number;
  graceMonths: number;
  payInterestDuringStudy: boolean;
  tenureYears: number;
  disburseYearly: boolean;
}): LoanPlan {
  const r = ratePct / 12 / 100;
  const moratorium = courseMonths + graceMonths;
  const tranches = disburseYearly
    ? Math.max(1, Math.ceil(courseMonths / 12))
    : 1;
  const years = new Map<number, ScheduleYear & { phases: Set<string> }>();
  const yearOf = (month: number) => {
    const year = Math.floor(month / 12) + 1;
    if (!years.has(year)) {
      years.set(year, {
        year,
        phase: "",
        phases: new Set(),
        paid: 0,
        interest: 0,
        interestPaid: 0,
        principal: 0,
        balance: 0,
      });
    }
    return years.get(year)!;
  };

  let disbursed = 0;
  let accrued = 0;
  let moratoriumInterest = 0;
  for (let m = 0; m < moratorium; m++) {
    if (m % 12 === 0 && m / 12 < tranches) disbursed += loan / tranches;
    const interest = disbursed * r;
    moratoriumInterest += interest;
    const y = yearOf(m);
    y.phases.add(m < courseMonths ? "Studying" : "Grace");
    y.interest += interest;
    if (payInterestDuringStudy) {
      y.paid += interest;
      y.interestPaid += interest;
    } else {
      accrued += interest;
    }
    y.balance = disbursed + accrued;
  }

  const repaymentPrincipal = loan + accrued;
  const n = tenureYears * 12;
  const emi =
    r === 0
      ? repaymentPrincipal / n
      : (repaymentPrincipal * r * Math.pow(1 + r, n)) /
        (Math.pow(1 + r, n) - 1);
  let balance = repaymentPrincipal;
  for (let k = 0; k < n; k++) {
    const interest = balance * r;
    const principal = k === n - 1 ? balance : emi - interest;
    balance -= principal;
    const y = yearOf(moratorium + k);
    y.phases.add("EMIs");
    y.interest += interest;
    y.interestPaid += interest;
    y.principal += principal;
    y.paid += interest + principal;
    y.balance = Math.max(0, balance);
  }

  const list = [...years.values()]
    .sort((a, b) => a.year - b.year)
    .map(({ phases, ...y }) => ({ ...y, phase: [...phases].join(" → ") }));
  return {
    emi,
    repaymentPrincipal,
    moratoriumInterest,
    maxMonthlyStudyInterest: loan * r,
    totalPaid: list.reduce((sum, y) => sum + y.paid, 0),
    years: list,
  };
}

export function LoanCalculatorClient() {
  const homeModals = useHomeModals();
  // From the loan_lenders table; null while loading
  const [lenders, setLenders] = useState<LoanLender[] | null>(null);

  useEffect(() => {
    fetchLiveLoanLenders().then(setLenders);
  }, []);

  // Inputs
  const [loanAmountINR, setLoanAmountINR] = useState<number>(3500000); // ₹35 Lakhs
  const [coSignerIncomeINR, setCoSignerIncomeINR] = useState<number>(120000); // ₹1.2 Lakhs / month
  const [existingEmisINR, setExistingEmisINR] = useState<number>(0);
  const [creditBand, setCreditBand] = useState<CreditBand>("750+");
  const [admissionStatus, setAdmissionStatus] =
    useState<AdmissionStatus>("applied");
  const [hasCollateral, setHasCollateral] = useState<boolean>(false);
  const [repaymentTenureYears, setRepaymentTenureYears] = useState<number>(10);
  // Annual rate in %; picking collateral / non-collateral suggests the
  // lowest listed lender rate, which the user can overwrite with a quote.
  // 0 until lenders load or the user enters one.
  const [interestRate, setInterestRate] = useState<number>(0);
  const [rateEdited, setRateEdited] = useState(false);
  const [courseMonths, setCourseMonths] = useState<number>(24);
  const [graceMonths, setGraceMonths] = useState<number>(6);
  const [payInterestDuringStudy, setPayInterestDuringStudy] =
    useState<boolean>(false);
  // Most lenders pay out per year / semester rather than all at once
  const [disburseYearly, setDisburseYearly] = useState<boolean>(false);
  // Optional: total cost of study and the share the family pays (margin)
  const [totalCostINR, setTotalCostINR] = useState<number>(0);
  const [marginPct, setMarginPct] = useState<number>(0);
  // Old-regime income tax slab of whoever repays (0 = not claiming)
  const [taxSlabPct, setTaxSlabPct] = useState<number>(0);

  // Lowest starting rates among the listed INR lenders (loan_lenders table):
  // secured = any lender; unsecured = lenders that lend without collateral
  const inrLenders = (lenders ?? []).filter(
    (l) => l.currency === "INR" && l.rateMin !== null,
  );
  const lowestRate = (list: LoanLender[]) =>
    list.length > 0 ? Math.min(...list.map((l) => l.rateMin as number)) : null;
  const securedFromRate = lowestRate(inrLenders);
  const unsecuredFromRate = lowestRate(
    inrLenders.filter((l) => l.maxUnsecuredINR !== 0),
  );
  // Largest collateral-free amount offered by a listed public sector bank
  const publicBankUnsecuredLimits = (lenders ?? [])
    .filter((l) => l.lenderType === "public_bank" && l.maxUnsecuredINR)
    .map((l) => l.maxUnsecuredINR as number);
  const publicBankUnsecuredINR =
    publicBankUnsecuredLimits.length > 0
      ? Math.max(...publicBankUnsecuredLimits)
      : null;

  // Suggest the listed starting rate once lenders load, unless the user typed one
  useEffect(() => {
    if (rateEdited) return;
    const suggested = hasCollateral ? securedFromRate : unsecuredFromRate;
    if (suggested !== null) setInterestRate(suggested);
  }, [hasCollateral, securedFromRate, unsecuredFromRate, rateEdited]);

  const chooseCollateral = (collateral: boolean) => {
    setHasCollateral(collateral);
    setRateEdited(false);
  };

  // Loan needed after the family's own contribution, rounded to ₹50,000
  const suggestedLoanINR =
    totalCostINR > 0
      ? Math.min(
          30000000,
          Math.max(
            500000,
            Math.round((totalCostINR * (1 - marginPct / 100)) / 50000) * 50000,
          ),
        )
      : null;

  // Prefill from the cost calculator link: ?cost=<total INR>&course=<months>
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const cost = Number(params.get("cost"));
    const course = Number(params.get("course"));
    if (cost > 0) {
      setTotalCostINR(Math.round(cost));
      setLoanAmountINR(
        Math.min(
          30000000,
          Math.max(500000, Math.round((cost * 0.9) / 50000) * 50000),
        ),
      );
    }
    if (course > 0 && course <= 120) setCourseMonths(Math.round(course));
  }, []);

  const moratoriumMonths = courseMonths + graceMonths;
  const plan = buildLoanPlan({
    loan: loanAmountINR,
    ratePct: interestRate,
    courseMonths,
    graceMonths,
    payInterestDuringStudy,
    tenureYears: repaymentTenureYears,
    disburseYearly,
  });
  const emiINR = Math.round(plan.emi);
  const moratoriumInterestINR = Math.round(plan.moratoriumInterest);
  const monthlyInterestDuringStudyINR = Math.round(
    plan.maxMonthlyStudyInterest,
  );
  const repaymentPrincipalINR = Math.round(plan.repaymentPrincipal);
  const totalRepaymentINR = Math.round(plan.totalPaid);
  const totalInterestPayableINR = totalRepaymentINR - loanAmountINR;

  // Section 80E: interest paid is deductible for the year it is first paid
  // and the next 7, under the old tax regime only
  const firstInterestYear = plan.years.findIndex((y) => y.interestPaid > 0);
  const deductibleInterestINR =
    firstInterestYear < 0
      ? 0
      : plan.years
          .slice(firstInterestYear, firstInterestYear + DEDUCTION_YEARS)
          .reduce((sum, y) => sum + y.interestPaid, 0);
  const taxSavedINR = Math.round(
    (deductibleInterestINR * taxSlabPct * (1 + CESS)) / 100,
  );

  const courseOptions = COURSE_MONTH_OPTIONS.includes(courseMonths)
    ? COURSE_MONTH_OPTIONS
    : [...COURSE_MONTH_OPTIONS, courseMonths].sort((a, b) => a - b);

  // Year-by-year schedule as a CSV file
  const downloadSchedule = () => {
    const rows = [
      [
        "Year",
        "Phase",
        "Paid (INR)",
        "Interest (INR)",
        "Principal (INR)",
        "Balance (INR)",
      ],
      ...plan.years.map((y) => [
        y.year,
        y.phase,
        Math.round(y.paid),
        Math.round(y.interest),
        Math.round(y.principal),
        Math.round(y.balance),
      ]),
    ];
    const csv = rows.map((r) => r.map((v) => `"${v}"`).join(",")).join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = "education-loan-schedule.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  const formatMonths = (months: number) => {
    const years = Math.floor(months / 12);
    const rest = months % 12;
    return (
      [
        years ? `${years} ${years === 1 ? "yr" : "yrs"}` : "",
        rest ? `${rest} mo` : "",
      ]
        .filter(Boolean)
        .join(" ") || "0 mo"
    );
  };

  // Eligibility: a rough guide using common lender rules, not an approval
  const foirPct =
    coSignerIncomeINR > 0
      ? Math.round(((existingEmisINR + emiINR) / coSignerIncomeINR) * 100)
      : 100;
  // Income at which EMIs would be 60% of it
  const incomeNeededINR =
    Math.ceil((existingEmisINR + emiINR) / 0.6 / 1000) * 1000;
  const lendersWithoutCollateral =
    lenders?.filter(
      (l) => l.maxUnsecuredINR !== null && l.maxUnsecuredINR >= loanAmountINR,
    ).length ?? 0;
  const lendersWithLimit =
    lenders?.filter((l) => l.maxUnsecuredINR !== null).length ?? 0;

  const eligibilityChecks: {
    label: string;
    level: CheckLevel;
    detail: string;
  }[] = [
    {
      label: "Repayment capacity",
      level: foirPct <= 50 ? "good" : foirPct <= 60 ? "warn" : "bad",
      detail:
        foirPct <= 60
          ? `EMIs would take ${foirPct}% of the co-applicant's income (existing EMIs + this loan). Lenders usually want this below about 60%.`
          : `EMIs would take ${foirPct}% of the co-applicant's income. Lenders usually want this below about 60%, which needs about ${formatCurrency(incomeNeededINR)} / month, a smaller loan, or a longer tenure.`,
    },
    {
      label: "Co-applicant credit score",
      level:
        creditBand === "750+"
          ? "good"
          : creditBand === "700-749" || creditBand === "none"
            ? "warn"
            : "bad",
      detail: {
        "750+": "750 or above is what most lenders prefer.",
        "700-749":
          "Accepted by most lenders, though the rate may be higher than for 750+.",
        "650-699":
          "Below 700 many lenders decline; a few NBFCs accept from about 685. A co-applicant with a higher score helps.",
        "below-650":
          "Most lenders decline below 650. Consider a different co-applicant with a stronger credit history.",
        none: "With no credit history, lenders rely more on income and collateral. A co-applicant with a credit history helps.",
      }[creditBand],
    },
    hasCollateral
      ? {
          label: "Collateral",
          level: "good",
          detail:
            "Property or FD backed loans get the lowest rates and highest limits.",
        }
      : publicBankUnsecuredINR !== null &&
          loanAmountINR <= publicBankUnsecuredINR
        ? {
            label: "Collateral",
            level: "good",
            detail: `Up to ${formatCurrency(publicBankUnsecuredINR)}, listed public sector banks lend without collateral.`,
          }
        : lendersWithLimit > 0
          ? {
              label: "Collateral",
              level: lendersWithoutCollateral > 0 ? "warn" : "bad",
              detail:
                lendersWithoutCollateral > 0
                  ? `${lendersWithoutCollateral} of the lenders listed below lend ${formatCurrency(loanAmountINR)} without collateral, usually at higher rates and often only for listed universities.`
                  : `None of the lenders listed below lend ${formatCurrency(loanAmountINR)} without collateral. Consider collateral or a smaller loan.`,
            }
          : {
              label: "Collateral",
              level: "warn",
              detail:
                "Larger loans usually need collateral unless your university is on the lender's premier list. NBFCs lend more without collateral at higher rates.",
            },
    {
      label: "Admission",
      level: admissionStatus === "admit" ? "good" : "warn",
      detail: {
        admit: "With an admit letter, lenders can give a final sanction.",
        applied:
          "Some lenders, mostly NBFCs, give a pre-admission sanction; banks usually need the admit letter.",
        "not-applied":
          "Lenders sanction loans after admission, so treat this as a planning estimate.",
      }[admissionStatus],
    },
  ];
  const overallLevel: CheckLevel = eligibilityChecks.some(
    (c) => c.level === "bad",
  )
    ? "bad"
    : eligibilityChecks.some((c) => c.level === "warn")
      ? "warn"
      : "good";
  const overallLabel = {
    good: "Looks workable",
    warn: "Check flagged points",
    bad: "Likely problems",
  }[overallLevel];

  return (
    <div className="min-h-screen bg-[#FDFCF7] pb-20 pt-8 sm:pt-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header Breadcrumb & Hero */}
        <div className="mb-8 text-center sm:text-left">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[#D9CFB8] bg-[#F5EFE0] px-3.5 py-1 text-xs font-semibold text-[#1D5A6C]">
            <Banknote className="h-3.5 w-3.5 text-[#D89A3E]" />
            <span>Education Loan Planning</span>
          </div>
          <h1 className="font-serif text-3xl font-black text-[#103B47] sm:text-4xl lg:text-5xl">
            Study Abroad Education Loan & EMI Calculator
          </h1>
          <p className="mt-3 max-w-3xl text-xs sm:text-sm md:text-base leading-relaxed text-[#6B6B6B]">
            Work out your monthly EMI in{" "}
            <span className="font-mono text-[#103B47] font-semibold">
              ₹ Lakhs
            </span>
            , including the interest that builds up while you study, and compare
            education loan lenders.
          </p>
        </div>

        {/* 2-Column: Loan Parameters + EMI Schedule & Partner Banks */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left: Interactive Loan Inputs */}
          <div className="lg:col-span-5 rounded-2xl border border-[#D9CFB8] bg-white p-6 sm:p-8 shadow-xs space-y-6 h-fit">
            <h2 className="text-base font-serif font-bold text-[#103B47] flex items-center gap-2">
              <Calculator className="h-4 w-4 text-[#D89A3E]" />
              <span>1. Your Education Loan Requirements</span>
            </h2>

            {/* Total cost & own contribution (margin) */}
            <div className="rounded-xl border border-[#D9CFB8]/70 bg-[#FDFCF7] p-4 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label
                    htmlFor="loan-total-cost"
                    className="block text-[11px] font-mono font-bold uppercase tracking-wider text-[#103B47] mb-1.5"
                  >
                    Total Cost of Study (₹)
                  </label>
                  <input
                    id="loan-total-cost"
                    type="number"
                    min={0}
                    step={10000}
                    value={totalCostINR || ""}
                    onChange={(e) =>
                      setTotalCostINR(Math.max(0, Number(e.target.value) || 0))
                    }
                    placeholder="Optional"
                    className="min-h-[44px] w-full rounded-xl border border-[#D9CFB8] bg-white px-3 py-2 text-sm font-mono font-bold text-[#103B47] focus:border-[#1D5A6C] focus:outline-none"
                  />
                </div>
                <div>
                  <label
                    htmlFor="loan-margin"
                    className="block text-[11px] font-mono font-bold uppercase tracking-wider text-[#103B47] mb-1.5"
                  >
                    You Pay Yourself (%)
                  </label>
                  <input
                    id="loan-margin"
                    type="number"
                    min={0}
                    max={100}
                    step={1}
                    value={marginPct}
                    onChange={(e) =>
                      setMarginPct(
                        Math.min(100, Math.max(0, Number(e.target.value) || 0)),
                      )
                    }
                    className="min-h-[44px] w-full rounded-xl border border-[#D9CFB8] bg-white px-3 py-2 text-sm font-mono font-bold text-[#103B47] focus:border-[#1D5A6C] focus:outline-none"
                  />
                </div>
              </div>
              <p className="text-[11px] text-[#6B6B6B] leading-snug">
                Lenders usually ask you to fund part of the cost yourself (the
                &ldquo;margin&rdquo;); check your lender&apos;s figure.
                Scholarships count towards it.
              </p>
              {suggestedLoanINR !== null && (
                <div className="flex items-center justify-between gap-2 text-xs">
                  <span className="text-[#103B47]">
                    Loan needed:{" "}
                    <strong className="font-mono">
                      {formatCurrency(suggestedLoanINR)}
                    </strong>
                    <span className="text-[#6B6B6B]">
                      {" "}
                      (you pay{" "}
                      {formatCurrency(
                        Math.max(0, totalCostINR - suggestedLoanINR),
                      )}
                      )
                    </span>
                  </span>
                  {suggestedLoanINR !== loanAmountINR && (
                    <button
                      type="button"
                      onClick={() => setLoanAmountINR(suggestedLoanINR)}
                      className="shrink-0 rounded-lg border border-[#1D5A6C] bg-white px-3 py-1.5 text-[11px] font-bold text-[#1D5A6C] hover:bg-[#1D5A6C] hover:text-white transition cursor-pointer"
                    >
                      Use this amount
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Target Loan Amount Slider */}
            <div>
              <div className="flex justify-between items-center text-xs font-semibold mb-1.5">
                <span className="text-[#103B47]">Target Loan Amount (INR)</span>
                <span className="text-[#103B47] font-mono font-bold bg-[#F5EFE0] border border-[#D9CFB8]/70 px-2.5 py-1 rounded-md text-sm">
                  {formatCurrency(loanAmountINR)}
                </span>
              </div>
              <input
                type="range"
                min={500000}
                max={30000000}
                step={50000}
                value={loanAmountINR}
                onChange={(e) => setLoanAmountINR(Number(e.target.value))}
                className="w-full accent-[#D89A3E] cursor-pointer h-2 bg-[#F5EFE0] rounded-lg"
              />
              <div className="flex justify-between text-[11px] font-mono text-[#6B6B6B] mt-1">
                <span>₹5 Lakhs</span>
                <span>₹1.5 Crores</span>
                <span>₹3 Crores</span>
              </div>
            </div>

            {/* Co-Signer Monthly Income */}
            <div>
              <div className="flex justify-between items-center text-xs font-semibold mb-1.5">
                <span className="text-[#103B47]">
                  Co-Signer Monthly Net Income (INR)
                </span>
                <span className="text-[#103B47] font-mono font-bold bg-[#F5EFE0] border border-[#D9CFB8]/70 px-2.5 py-1 rounded-md text-sm">
                  {formatCurrency(coSignerIncomeINR)} / mo
                </span>
              </div>
              <input
                type="range"
                min={30000}
                max={500000}
                step={10000}
                value={coSignerIncomeINR}
                onChange={(e) => setCoSignerIncomeINR(Number(e.target.value))}
                className="w-full accent-[#1D5A6C] cursor-pointer h-2 bg-[#F5EFE0] rounded-lg"
              />
              <div className="flex justify-between text-[11px] font-mono text-[#6B6B6B] mt-1">
                <span>₹30,000</span>
                <span>₹2.5 Lakhs</span>
                <span>₹5.0 Lakhs</span>
              </div>
            </div>

            {/* Co-applicant's existing EMIs, credit score, admission */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label
                  htmlFor="loan-existing-emis"
                  className="block text-[11px] font-mono font-bold uppercase tracking-wider text-[#103B47] mb-1.5"
                >
                  Existing EMIs (₹ / mo)
                </label>
                <input
                  id="loan-existing-emis"
                  type="number"
                  min={0}
                  step={1000}
                  value={existingEmisINR || ""}
                  onChange={(e) =>
                    setExistingEmisINR(Math.max(0, Number(e.target.value) || 0))
                  }
                  placeholder="0"
                  className="min-h-[44px] w-full rounded-xl border border-[#D9CFB8] bg-[#FDFCF7] px-3 py-2 text-sm font-mono font-bold text-[#103B47] focus:border-[#1D5A6C] focus:outline-none"
                />
              </div>
              <div>
                <label
                  htmlFor="loan-credit-score"
                  className="block text-[11px] font-mono font-bold uppercase tracking-wider text-[#103B47] mb-1.5"
                >
                  Credit Score (CIBIL)
                </label>
                <select
                  id="loan-credit-score"
                  value={creditBand}
                  onChange={(e) => setCreditBand(e.target.value as CreditBand)}
                  className="min-h-[44px] w-full rounded-xl border border-[#D9CFB8] bg-[#FDFCF7] px-3 py-2 text-xs font-mono font-bold text-[#103B47] focus:border-[#1D5A6C] focus:outline-none cursor-pointer"
                >
                  {CREDIT_BANDS.map((b) => (
                    <option key={b.value} value={b.value}>
                      {b.label}
                    </option>
                  ))}
                </select>
              </div>
              <p className="col-span-2 -mt-1 text-[11px] text-[#6B6B6B] leading-snug">
                Both are for the co-applicant (usually a parent). Lenders look
                mainly at their income and credit score.
              </p>
              <div className="col-span-2">
                <label
                  htmlFor="loan-admission"
                  className="block text-[11px] font-mono font-bold uppercase tracking-wider text-[#103B47] mb-1.5"
                >
                  Admission Status
                </label>
                <select
                  id="loan-admission"
                  value={admissionStatus}
                  onChange={(e) =>
                    setAdmissionStatus(e.target.value as AdmissionStatus)
                  }
                  className="min-h-[44px] w-full rounded-xl border border-[#D9CFB8] bg-[#FDFCF7] px-3 py-2 text-xs font-mono font-bold text-[#103B47] focus:border-[#1D5A6C] focus:outline-none cursor-pointer"
                >
                  {ADMISSION_STATUSES.map((s) => (
                    <option key={s.value} value={s.value}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Collateral Security Option */}
            <div className="border-t border-[#D9CFB8]/60 pt-4">
              <label className="block text-xs font-mono font-bold uppercase tracking-wider text-[#103B47] mb-2">
                Collateral Security Available?
              </label>
              <div className="grid grid-cols-2 gap-2 text-xs font-medium">
                <button
                  type="button"
                  onClick={() => chooseCollateral(false)}
                  className={`min-h-[44px] p-3 rounded-xl border text-left transition cursor-pointer ${
                    !hasCollateral
                      ? "border-[#D89A3E] bg-[#F5EFE0] text-[#103B47] ring-1 ring-[#D89A3E]"
                      : "border-[#D9CFB8] bg-[#FDFCF7] text-[#6B6B6B] hover:bg-[#F5EFE0]"
                  }`}
                >
                  <p className="font-bold text-[#103B47]">Non-Collateral</p>
                  <p className="text-[11px] text-[#6B6B6B] font-mono mt-0.5">
                    Unsecured •{" "}
                    {unsecuredFromRate !== null
                      ? `from ~${unsecuredFromRate}%`
                      : "rate not provided"}
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => chooseCollateral(true)}
                  className={`min-h-[44px] p-3 rounded-xl border text-left transition cursor-pointer ${
                    hasCollateral
                      ? "border-[#D89A3E] bg-[#F5EFE0] text-[#103B47] ring-1 ring-[#D89A3E]"
                      : "border-[#D9CFB8] bg-[#FDFCF7] text-[#6B6B6B] hover:bg-[#F5EFE0]"
                  }`}
                >
                  <p className="font-bold text-[#103B47]">
                    Property / FD Backed
                  </p>
                  <p className="text-[11px] text-[#6B6B6B] font-mono mt-0.5">
                    Secured •{" "}
                    {securedFromRate !== null
                      ? `from ~${securedFromRate}%`
                      : "rate not provided"}
                  </p>
                </button>
              </div>
            </div>

            {/* Interest Rate (editable) */}
            <div>
              <label
                htmlFor="loan-interest-rate"
                className="block text-xs font-mono font-bold uppercase tracking-wider text-[#103B47] mb-2"
              >
                Interest Rate (% p.a.)
              </label>
              <div className="flex items-center gap-2">
                <input
                  id="loan-interest-rate"
                  type="number"
                  min={0}
                  max={30}
                  step={0.05}
                  value={interestRate}
                  onChange={(e) => {
                    setRateEdited(true);
                    setInterestRate(
                      Math.min(30, Math.max(0, Number(e.target.value) || 0)),
                    );
                  }}
                  className="min-h-[44px] w-28 rounded-xl border border-[#D9CFB8] bg-[#FDFCF7] px-3 py-2 text-sm font-mono font-bold text-[#103B47] focus:border-[#1D5A6C] focus:outline-none"
                />
                <span className="text-[11px] text-[#6B6B6B] leading-snug">
                  Enter the rate from your lender&apos;s quote. The collateral
                  choice above only suggests a starting rate.
                </span>
              </div>
            </div>

            {/* Course + Grace Period (moratorium) */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label
                  htmlFor="loan-course-length"
                  className="block text-xs font-mono font-bold uppercase tracking-wider text-[#103B47] mb-2"
                >
                  Course Length
                </label>
                <select
                  id="loan-course-length"
                  value={courseMonths}
                  onChange={(e) => setCourseMonths(Number(e.target.value))}
                  className="min-h-[44px] w-full rounded-xl border border-[#D9CFB8] bg-[#FDFCF7] px-3 py-2 text-xs font-mono font-bold text-[#103B47] focus:border-[#1D5A6C] focus:outline-none cursor-pointer"
                >
                  {courseOptions.map((m) => (
                    <option key={m} value={m}>
                      {formatMonths(m)}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label
                  htmlFor="loan-grace-period"
                  className="block text-xs font-mono font-bold uppercase tracking-wider text-[#103B47] mb-2"
                >
                  Grace After Course
                </label>
                <select
                  id="loan-grace-period"
                  value={graceMonths}
                  onChange={(e) => setGraceMonths(Number(e.target.value))}
                  className="min-h-[44px] w-full rounded-xl border border-[#D9CFB8] bg-[#FDFCF7] px-3 py-2 text-xs font-mono font-bold text-[#103B47] focus:border-[#1D5A6C] focus:outline-none cursor-pointer"
                >
                  {[0, 6, 12].map((m) => (
                    <option key={m} value={m}>
                      {m === 0 ? "None" : `${m} months`}
                    </option>
                  ))}
                </select>
              </div>
              <p className="col-span-2 text-[11px] text-[#6B6B6B] leading-snug">
                EMIs start {formatMonths(moratoriumMonths)} after the loan is
                disbursed. Interest is charged throughout this period.
              </p>
            </div>

            {/* Interest during the course */}
            <div>
              <label className="block text-xs font-mono font-bold uppercase tracking-wider text-[#103B47] mb-2">
                Interest During Course & Grace Period
              </label>
              <div className="grid grid-cols-2 gap-2 text-xs font-medium">
                {[
                  {
                    pay: false,
                    title: "Add to Loan",
                    note: "Nothing to pay while studying",
                  },
                  {
                    pay: true,
                    title: "Pay Monthly",
                    note: `${disburseYearly ? "up to " : ""}${formatCurrency(monthlyInterestDuringStudyINR)} / mo while studying`,
                  },
                ].map((opt) => (
                  <button
                    key={opt.title}
                    type="button"
                    onClick={() => setPayInterestDuringStudy(opt.pay)}
                    className={`min-h-[44px] p-3 rounded-xl border text-left transition cursor-pointer ${
                      payInterestDuringStudy === opt.pay
                        ? "border-[#D89A3E] bg-[#F5EFE0] text-[#103B47] ring-1 ring-[#D89A3E]"
                        : "border-[#D9CFB8] bg-[#FDFCF7] text-[#6B6B6B] hover:bg-[#F5EFE0]"
                    }`}
                  >
                    <p className="font-bold text-[#103B47]">{opt.title}</p>
                    <p className="text-[11px] text-[#6B6B6B] font-mono mt-0.5">
                      {opt.note}
                    </p>
                  </button>
                ))}
              </div>
              <p className="mt-1.5 text-[11px] text-[#6B6B6B] leading-snug">
                Some lenders lower the rate if you pay interest while studying.
                Check with yours.
              </p>
            </div>

            {/* How the loan is paid out */}
            <div>
              <label className="block text-xs font-mono font-bold uppercase tracking-wider text-[#103B47] mb-2">
                Loan Paid Out
              </label>
              <div className="grid grid-cols-2 gap-2 text-xs font-medium">
                {[
                  {
                    yearly: false,
                    title: "All at Start",
                    note: "Interest on the full loan from day one",
                  },
                  {
                    yearly: true,
                    title: "Year by Year",
                    note: "Equal part each year of the course",
                  },
                ].map((opt) => (
                  <button
                    key={opt.title}
                    type="button"
                    onClick={() => setDisburseYearly(opt.yearly)}
                    className={`min-h-[44px] p-3 rounded-xl border text-left transition cursor-pointer ${
                      disburseYearly === opt.yearly
                        ? "border-[#D89A3E] bg-[#F5EFE0] text-[#103B47] ring-1 ring-[#D89A3E]"
                        : "border-[#D9CFB8] bg-[#FDFCF7] text-[#6B6B6B] hover:bg-[#F5EFE0]"
                    }`}
                  >
                    <p className="font-bold text-[#103B47]">{opt.title}</p>
                    <p className="text-[11px] text-[#6B6B6B] font-mono mt-0.5">
                      {opt.note}
                    </p>
                  </button>
                ))}
              </div>
              <p className="mt-1.5 text-[11px] text-[#6B6B6B] leading-snug">
                Lenders usually pay fees to the university as they fall due, so
                interest is only charged on what has been paid out.
              </p>
            </div>

            {/* Repayment Tenure */}
            <div>
              <label className="block text-xs font-mono font-bold uppercase tracking-wider text-[#103B47] mb-2">
                Repayment Tenure
              </label>
              <div className="flex gap-2">
                {[5, 7, 10, 12, 15].map((yrs) => (
                  <button
                    key={yrs}
                    type="button"
                    onClick={() => setRepaymentTenureYears(yrs)}
                    className={`min-h-[44px] flex-1 rounded-xl py-2 text-xs font-mono font-bold transition cursor-pointer ${
                      repaymentTenureYears === yrs
                        ? "bg-[#1D5A6C] text-white shadow-xs"
                        : "bg-[#F5EFE0] text-[#103B47] border border-[#D9CFB8] hover:bg-[#ede5d0]"
                    }`}
                  >
                    {yrs} Yrs
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right: EMI Financial Summary & Partner Banks */}
          <div className="lg:col-span-7 space-y-6">
            {/* Top EMI Summary Card */}
            <div className="rounded-2xl border border-[#1D5A6C] bg-gradient-to-br from-[#103B47] via-[#103B47] to-[#0B2830] p-6 sm:p-8 text-[#FDFCF7] shadow-xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <span className="text-xs font-mono font-semibold uppercase tracking-wider text-[#A8CDBD]">
                  Estimated Monthly EMI (Post Moratorium)
                </span>
                <a
                  href="#eligibility-check"
                  className="inline-flex items-center gap-1.5 rounded-full bg-[#A8CDBD]/20 px-3 py-1 text-xs font-mono font-bold text-[#A8CDBD] border border-[#A8CDBD]/30 self-start sm:self-auto hover:bg-[#A8CDBD]/30"
                >
                  <span
                    className={`h-2 w-2 rounded-full ${CHECK_STYLES[overallLevel].dot}`}
                  />
                  Eligibility: {overallLabel}
                </a>
              </div>

              <div className="mt-4 flex items-baseline gap-2">
                <span className="text-3xl font-mono font-bold text-[#EBC783] sm:text-5xl">
                  {formatCurrency(emiINR)}
                </span>
                <span className="text-xs font-mono text-[#A8CDBD]">
                  / Month
                </span>
              </div>

              <p className="mt-1 text-[11px] font-mono text-[#A8CDBD]">
                For {repaymentTenureYears} years, starting{" "}
                {formatMonths(moratoriumMonths)} after disbursal
              </p>

              <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 gap-3 border-t border-[#1D5A6C]/60 pt-5 text-xs">
                <div className="rounded-xl bg-white/5 p-3 border border-[#1D5A6C]">
                  <span className="text-[#A8CDBD] block text-[10px] font-mono uppercase font-semibold">
                    Interest Rate
                  </span>
                  <span className="text-sm font-mono font-bold text-[#EBC783] mt-0.5 block">
                    {interestRate}% p.a.
                  </span>
                </div>

                <div className="rounded-xl bg-white/5 p-3 border border-[#1D5A6C]">
                  <span className="text-[#A8CDBD] block text-[10px] font-mono uppercase font-semibold">
                    {payInterestDuringStudy
                      ? "Interest Paid While Studying"
                      : "Interest Added Before EMIs"}
                  </span>
                  <span className="text-sm font-mono font-bold text-white mt-0.5 block">
                    {formatCurrency(moratoriumInterestINR)}
                  </span>
                </div>

                <div className="rounded-xl bg-white/5 p-3 border border-[#1D5A6C]">
                  <span className="text-[#A8CDBD] block text-[10px] font-mono uppercase font-semibold">
                    Loan When EMIs Start
                  </span>
                  <span className="text-sm font-mono font-bold text-white mt-0.5 block">
                    {formatCurrency(repaymentPrincipalINR)}
                  </span>
                </div>

                <div className="rounded-xl bg-white/5 p-3 border border-[#1D5A6C]">
                  <span className="text-[#A8CDBD] block text-[10px] font-mono uppercase font-semibold">
                    Total Interest
                  </span>
                  <span className="text-sm font-mono font-bold text-white mt-0.5 block">
                    {formatCurrency(totalInterestPayableINR)}
                  </span>
                </div>

                <div className="rounded-xl bg-white/5 p-3 border border-[#1D5A6C] col-span-2 sm:col-span-1">
                  <span className="text-[#A8CDBD] block text-[10px] font-mono uppercase font-semibold">
                    Total Repayment
                  </span>
                  <span className="text-sm font-mono font-bold text-[#A8CDBD] mt-0.5 block">
                    {formatCurrency(totalRepaymentINR)}
                  </span>
                </div>
              </div>

              {/* Context-Aware Lead Action */}
              <div className="mt-6 pt-4 border-t border-[#1D5A6C]/60">
                <button
                  onClick={() =>
                    homeModals.openLeadModal(
                      `Education Loan Sanction: ${formatCurrency(loanAmountINR)} (${hasCollateral ? "Collateral" : "Non-Collateral"}, ${interestRate}% p.a., ${formatMonths(courseMonths)} course, EMI: ${formatCurrency(emiINR)}/mo for ${repaymentTenureYears} yrs)`,
                    )
                  }
                  className="min-h-[44px] w-full flex items-center justify-center gap-2 rounded-xl bg-[#D89A3E] py-3.5 px-6 text-xs sm:text-sm font-bold text-[#103B47] shadow-md hover:bg-[#c4872d] transition cursor-pointer"
                >
                  <ShieldCheck className="h-4 w-4" />
                  <span>Get Help With Your Loan Application →</span>
                </button>
              </div>
            </div>

            {/* Eligibility check (common lender rules) */}
            <div
              id="eligibility-check"
              className="scroll-mt-24 rounded-2xl border border-[#D9CFB8] bg-white p-6 sm:p-8 shadow-xs"
            >
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-base font-serif font-bold text-[#103B47]">
                  Eligibility Check
                </h3>
                <span
                  className={`inline-flex items-center gap-1.5 text-xs font-mono font-bold ${CHECK_STYLES[overallLevel].text}`}
                >
                  <span
                    className={`h-2 w-2 rounded-full ${CHECK_STYLES[overallLevel].dot}`}
                  />
                  {overallLabel}
                </span>
              </div>
              <p className="mt-1 text-[11px] text-[#6B6B6B]">
                A rough guide based on common lender rules, not an approval.
                Each lender decides on its own criteria.
              </p>
              <ul className="mt-4 space-y-3">
                {eligibilityChecks.map((check) => (
                  <li key={check.label} className="flex items-start gap-2.5">
                    <span
                      className={`mt-1 h-2.5 w-2.5 shrink-0 rounded-full ${CHECK_STYLES[check.level].dot}`}
                    />
                    <div className="text-xs">
                      <p className="font-bold text-[#103B47]">{check.label}</p>
                      <p className="mt-0.5 text-[#6B6B6B] leading-relaxed">
                        {check.detail}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            {/* Tax deduction on loan interest (Section 80E) */}
            <div className="rounded-2xl border border-[#D9CFB8] bg-white p-6 sm:p-8 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div>
                  <h3 className="text-base font-serif font-bold text-[#103B47]">
                    Tax Saving on Loan Interest (Section 80E)
                  </h3>
                  <p className="mt-1 text-[11px] text-[#6B6B6B] leading-relaxed max-w-md">
                    Whoever repays the loan can deduct all interest paid, with
                    no upper limit, for the year it is first paid and the next 7
                    years. Only under the <strong>old tax regime</strong>, and
                    only for loans from banks and approved lenders.
                  </p>
                </div>
                <div className="shrink-0">
                  <label
                    htmlFor="loan-tax-slab"
                    className="block text-[11px] font-mono font-bold uppercase tracking-wider text-[#103B47] mb-1"
                  >
                    Their Tax Slab
                  </label>
                  <select
                    id="loan-tax-slab"
                    value={taxSlabPct}
                    onChange={(e) => setTaxSlabPct(Number(e.target.value))}
                    className="min-h-[44px] rounded-xl border border-[#D9CFB8] bg-[#FDFCF7] px-3 py-2 text-xs font-mono font-bold text-[#103B47] focus:border-[#1D5A6C] focus:outline-none cursor-pointer"
                  >
                    {TAX_SLABS.map((slab) => (
                      <option key={slab} value={slab}>
                        {slab === 0 ? "Not claiming" : `${slab}% (old regime)`}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              {taxSlabPct > 0 && (
                <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
                  <div className="rounded-xl bg-[#FDFCF7] border border-[#D9CFB8]/70 p-3">
                    <span className="block text-[10px] font-mono uppercase font-semibold text-[#6B6B6B]">
                      Interest Deductible ({DEDUCTION_YEARS} yrs)
                    </span>
                    <span className="mt-0.5 block text-sm font-mono font-bold text-[#103B47]">
                      {formatCurrency(Math.round(deductibleInterestINR))}
                    </span>
                  </div>
                  <div className="rounded-xl bg-[#F5EFE0] border border-[#D89A3E]/40 p-3">
                    <span className="block text-[10px] font-mono uppercase font-semibold text-[#6B6B6B]">
                      Estimated Tax Saved
                    </span>
                    <span className="mt-0.5 block text-sm font-mono font-bold text-[#1D5A6C]">
                      {formatCurrency(taxSavedINR)}
                    </span>
                  </div>
                  <p className="col-span-2 text-[10px] text-[#6B6B6B]">
                    Includes 4% cess; ignores surcharge. Interest added to the
                    loan during studies is counted only when repaid through
                    EMIs. Check with a tax adviser.
                  </p>
                </div>
              )}
            </div>

            {/* Year-by-year repayment schedule */}
            <div className="rounded-2xl border border-[#D9CFB8] bg-white p-6 sm:p-8 shadow-xs">
              <div className="flex items-center justify-between gap-3 mb-4">
                <h3 className="text-base font-serif font-bold text-[#103B47]">
                  Year-by-Year Repayment Schedule
                </h3>
                <button
                  type="button"
                  onClick={downloadSchedule}
                  className="min-h-[36px] shrink-0 rounded-lg border border-[#1D5A6C] bg-white px-3 py-1.5 text-xs font-bold text-[#1D5A6C] hover:bg-[#1D5A6C] hover:text-white transition cursor-pointer"
                >
                  Download CSV
                </button>
              </div>
              <div className="max-h-96 overflow-auto rounded-xl border border-[#D9CFB8]/70">
                <table className="w-full text-xs">
                  <thead className="sticky top-0 bg-[#F5EFE0] text-[#103B47] font-mono">
                    <tr>
                      <th className="px-3 py-2 text-left font-semibold">
                        Year
                      </th>
                      <th className="px-3 py-2 text-right font-semibold">
                        You Pay
                      </th>
                      <th className="px-3 py-2 text-right font-semibold">
                        Interest
                      </th>
                      <th className="px-3 py-2 text-right font-semibold">
                        Principal
                      </th>
                      <th className="px-3 py-2 text-right font-semibold">
                        Owed at Year End
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#D9CFB8]/50 font-mono">
                    {plan.years.map((y) => (
                      <tr key={y.year}>
                        <td className="px-3 py-2">
                          <span className="font-bold text-[#103B47]">
                            {y.year}
                          </span>
                          <span className="block text-[10px] text-[#6B6B6B] font-sans">
                            {y.phase}
                          </span>
                        </td>
                        <td className="px-3 py-2 text-right text-[#103B47]">
                          {formatCurrency(Math.round(y.paid))}
                        </td>
                        <td className="px-3 py-2 text-right text-[#6B6B6B]">
                          {formatCurrency(Math.round(y.interest))}
                        </td>
                        <td className="px-3 py-2 text-right text-[#6B6B6B]">
                          {formatCurrency(Math.round(y.principal))}
                        </td>
                        <td className="px-3 py-2 text-right font-bold text-[#103B47]">
                          {formatCurrency(Math.round(y.balance))}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="mt-2 text-[10px] text-[#6B6B6B]">
                Year 1 starts with the first payout. Interest charged while
                studying is added to what you owe unless you pay it monthly.
              </p>
            </div>

            {/* Education Loan Lenders (loan_lenders table) */}
            <div className="rounded-2xl border border-[#D9CFB8] bg-white p-6 sm:p-8 shadow-xs">
              <h3 className="text-base font-serif font-bold text-[#103B47] mb-1">
                Education Loan Lenders
              </h3>
              <p className="text-[11px] text-[#6B6B6B] mb-4">
                Indicative figures. Rates change often, so confirm with the
                lender before applying.
              </p>

              {lenders === null ? (
                <div className="py-8 text-center text-xs font-mono text-[#6B6B6B]">
                  Loading lenders…
                </div>
              ) : lenders.length === 0 ? (
                <div className="rounded-xl border border-dashed border-[#D9CFB8] bg-[#FDFCF7] py-8 text-center text-xs font-mono text-[#6B6B6B]">
                  Lenders not added yet
                </div>
              ) : (
                <div className="space-y-3">
                  {lenders.map((lender) => {
                    const rate = formatRateRange(lender);
                    const canUseRate =
                      lender.currency === "INR" && lender.rateMin !== null;
                    const details = [
                      {
                        label: "Rate",
                        value: rate ? `${rate} p.a.` : null,
                      },
                      {
                        label: "Max",
                        value:
                          lender.maxAmountINR !== null
                            ? formatCurrency(lender.maxAmountINR)
                            : null,
                      },
                      {
                        label: "Without collateral",
                        value:
                          lender.maxUnsecuredINR === null
                            ? null
                            : lender.maxUnsecuredINR === 0
                              ? "Not offered"
                              : `up to ${formatCurrency(lender.maxUnsecuredINR)}`,
                      },
                      { label: "Moratorium", value: lender.moratoriumNote },
                      {
                        label: "Processing fee",
                        value: lender.processingFeeNote,
                      },
                    ].filter((item) => item.value);
                    return (
                      <div
                        key={lender.id}
                        className="p-4 rounded-xl border border-[#D9CFB8]/70 bg-[#FDFCF7] hover:bg-[#F5EFE0]/60 transition flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                      >
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="text-xs sm:text-sm font-bold text-[#103B47]">
                              {lender.name}
                            </h4>
                            <span className="rounded-md bg-[#F5EFE0] border border-[#D9CFB8] px-2 py-0.5 text-[10px] font-mono font-semibold text-[#1D5A6C]">
                              {lenderTypeLabel(lender.lenderType)}
                            </span>
                            {lender.currency !== "INR" && (
                              <span className="rounded-md bg-white border border-[#D9CFB8] px-2 py-0.5 text-[10px] font-mono font-semibold text-[#B5452F]">
                                Loan in {lender.currency}
                              </span>
                            )}
                          </div>
                          {details.length > 0 && (
                            <div className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1 text-xs text-[#6B6B6B] font-mono">
                              {details.map((item) => (
                                <span key={item.label}>
                                  {item.label}:{" "}
                                  <strong className="text-[#103B47] font-bold">
                                    {item.value}
                                  </strong>
                                </span>
                              ))}
                            </div>
                          )}
                          {lender.rateNote && (
                            <p className="mt-1 text-[11px] text-[#6B6B6B]">
                              {lender.rateNote}
                            </p>
                          )}
                          {lender.notes && (
                            <p className="mt-1 text-[11px] text-[#6B6B6B]">
                              {lender.notes}
                            </p>
                          )}
                          <p className="mt-1.5 text-[10px] font-mono text-[#6B6B6B]">
                            {lender.lastVerifiedOn
                              ? `Last checked ${formatDateOnly(lender.lastVerifiedOn)}`
                              : "Not yet checked"}
                            {lender.websiteUrl && (
                              <>
                                {" · "}
                                <a
                                  href={lender.websiteUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="font-semibold text-[#1D5A6C] hover:underline"
                                >
                                  Official page
                                </a>
                              </>
                            )}
                          </p>
                        </div>

                        <div className="flex sm:flex-col gap-2 shrink-0">
                          {canUseRate && (
                            <button
                              type="button"
                              onClick={() => {
                                setRateEdited(true);
                                setInterestRate(lender.rateMin as number);
                              }}
                              className="min-h-[44px] rounded-lg border border-[#D9CFB8] bg-white px-4 py-2 text-xs font-bold text-[#103B47] hover:bg-[#F5EFE0] transition cursor-pointer"
                            >
                              Use {lender.rateMin}% rate
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() =>
                              homeModals.openLeadModal(
                                `Loan Application with ${lender.name} (${formatCurrency(loanAmountINR)})`,
                              )
                            }
                            className="min-h-[44px] rounded-lg border border-[#1D5A6C] bg-white px-4 py-2 text-xs font-bold text-[#1D5A6C] hover:bg-[#1D5A6C] hover:text-white transition shadow-2xs cursor-pointer"
                          >
                            Get Help Applying →
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
