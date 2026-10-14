import Link from "next/link";
import { Compass, ShieldCheck, Award, HeartHandshake } from "lucide-react";
import {
  FooterDestinationLinks,
  FooterProgramLinks,
  FooterCatalogCount,
} from "@/components/layout/FooterCatalogLinks";
import { BrandLogo } from "@/components/ui/BrandSignatures";
import { FooterTestPrepLinks } from "@/components/layout/FooterTestPrepLinks";
import {
  FooterCompanyCredit,
  FooterLegalLine,
  FooterTrustStrip,
} from "@/components/layout/FooterSiteContent";

export function Footer() {
  return (
    <footer className="cv-auto border-t border-[#1D5A6C]/40 bg-[#103B47] text-[#FDFCF7]/80">
      {/* Trust and compliance strip (admin: Site Content) */}
      <FooterTrustStrip />

      {/* Main Taxonomy Directory — Brand Header + 6 Columns */}
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        {/* Brand Header & Mandate */}
        <div className="mb-12 flex flex-col items-start justify-between gap-6 border-b border-slate-800/80 pb-10 md:flex-row md:items-center">
          <BrandLogo
            variant="wordmark"
            theme="dark"
            size="md"
            showTagline={false}
          />

          <p className="max-w-md text-xs leading-relaxed text-slate-400">
            <FooterCompanyCredit />
            Empowering Indian students with zero-bias admissions intelligence
            across{" "}
            <FooterCatalogCount
              of="destinations"
              label="global destinations"
            />{" "}
            and <FooterCatalogCount of="programs" label="career disciplines" />.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-8 md:grid-cols-3 lg:grid-cols-6">
          {/* Column 1: Explore */}
          <div>
            <h4 className="mb-3.5 text-xs font-bold uppercase tracking-wider text-white">
              Explore
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link
                  href="/#destinations-grid"
                  className="text-slate-400 hover:text-white transition"
                >
                  <FooterCatalogCount of="destinations" label="Destinations" />
                </Link>
              </li>
              <li>
                <Link
                  href="/#programs-grid"
                  className="text-slate-400 hover:text-white transition"
                >
                  <FooterCatalogCount of="programs" label="Disciplines" />
                </Link>
              </li>
              <li>
                <Link
                  href="/universities"
                  className="text-slate-400 hover:text-white transition"
                >
                  Universities
                </Link>
              </li>
              <li>
                <Link
                  href="/cost-calculator"
                  className="text-slate-400 hover:text-white transition"
                >
                  Cost Calculator
                </Link>
              </li>
              <li>
                <Link
                  href="/compare/universities"
                  className="text-slate-400 hover:text-white transition font-semibold text-[#EA5C2B]"
                >
                  University Compare Matrix
                </Link>
              </li>
              <li>
                <Link
                  href="/compare/courses"
                  className="text-slate-400 hover:text-white transition"
                >
                  Course & Degree Compare
                </Link>
              </li>
              <li>
                <Link
                  href="/blog"
                  className="text-slate-400 hover:text-white transition"
                >
                  Editorial Guides
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 2: Popular Destinations */}
          <div>
            <h4 className="mb-3.5 text-xs font-bold uppercase tracking-wider text-white">
              Destinations
            </h4>
            <ul className="space-y-2 text-xs">
              <FooterDestinationLinks />
            </ul>
          </div>

          {/* Column 3: Programs & Degrees */}
          <div>
            <h4 className="mb-3.5 text-xs font-bold uppercase tracking-wider text-white">
              Programs
            </h4>
            <ul className="space-y-2 text-xs">
              <FooterProgramLinks />
            </ul>
          </div>

          {/* Column 4: Test Prep & Resources */}
          <div>
            <h4 className="mb-3.5 text-xs font-bold uppercase tracking-wider text-white">
              Test Prep & Hub
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link
                  href="/test-prep"
                  className="font-semibold text-[#EA5C2B] hover:text-white transition"
                >
                  ★ Test Prep Hub
                </Link>
              </li>
              <FooterTestPrepLinks />
              <li>
                <Link
                  href="/cost-calculator"
                  className="text-slate-400 hover:text-white transition"
                >
                  Cost Calculator
                </Link>
              </li>
              <li>
                <Link
                  href="/compare/universities"
                  className="text-slate-400 hover:text-white transition font-semibold text-[#EA5C2B]"
                >
                  University Compare Matrix
                </Link>
              </li>
              <li>
                <Link
                  href="/compare/courses"
                  className="text-slate-400 hover:text-white transition"
                >
                  Course & Degree Compare
                </Link>
              </li>
              <li>
                <Link
                  href="/blog"
                  className="text-slate-400 hover:text-white transition"
                >
                  Editorial Guides
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 5: Company & Portals */}
          <div>
            <h4 className="mb-3.5 text-xs font-bold uppercase tracking-wider text-white">
              Company
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link
                  href="/about"
                  className="text-slate-400 hover:text-white transition"
                >
                  About AbroadRoute
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="text-slate-400 hover:text-white transition"
                >
                  Contact Admissions Desk
                </Link>
              </li>
              <li>
                <Link
                  href="/portal/buyer"
                  className="text-slate-400 hover:text-white transition"
                >
                  B2B Consultant Portal
                </Link>
              </li>
              <li>
                <Link
                  href="/portal/university"
                  className="text-slate-400 hover:text-white transition"
                >
                  University Partners
                </Link>
              </li>
              <li>
                <Link
                  href="/dashboard/student"
                  className="text-slate-400 hover:text-white transition"
                >
                  Student Dashboard
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 6: Legal & Compliance */}
          <div>
            <h4 className="mb-3.5 text-xs font-bold uppercase tracking-wider text-white">
              Legal & Trust
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link
                  href="/privacy-policy"
                  className="text-slate-400 hover:text-white transition"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  href="/terms-of-service"
                  className="text-slate-400 hover:text-white transition"
                >
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link
                  href="/refund-policy"
                  className="text-slate-400 hover:text-white transition"
                >
                  Refund & Cancellation
                </Link>
              </li>
              <li>
                <Link
                  href="/dpdp-consent"
                  className="text-slate-400 hover:text-white transition"
                >
                  DPDP Act 2023 Consent
                </Link>
              </li>
              <li>
                <Link
                  href="/sitemap"
                  className="text-slate-400 hover:text-white transition"
                >
                  HTML Sitemap
                </Link>
              </li>
              <li>
                <Link
                  href="/login"
                  className="text-slate-400 hover:text-white transition"
                >
                  Authorized Sign In
                </Link>
              </li>
              <li>
                <Link
                  href="/signup"
                  className="text-slate-400 hover:text-white transition"
                >
                  Student Registration
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar with Parent Entity & Legal Notice */}
        <div className="mt-14 flex flex-col items-center justify-between border-t border-slate-800 pt-8 text-xs text-slate-500 sm:flex-row">
          <div className="flex flex-col gap-1 text-center sm:text-left">
            <FooterLegalLine />
            <p className="mt-1 text-[11px] text-slate-400">
              Website developed by{" "}
              <a
                href="https://magicworksitsolutions.com"
                rel="nofollow"
                target="_blank"
                className="font-semibold text-[#D89A3E] hover:underline"
              >
                MagicWorks
              </a>
            </p>
          </div>
          <div className="mt-4 flex gap-6 sm:mt-0">
            <Link
              href="/privacy-policy"
              className="hover:text-slate-300 transition"
            >
              Privacy
            </Link>
            <Link
              href="/terms-of-service"
              className="hover:text-slate-300 transition"
            >
              Terms
            </Link>
            <Link
              href="/dpdp-consent"
              className="hover:text-slate-300 transition"
            >
              DPDP
            </Link>
            <Link href="/about" className="hover:text-slate-300 transition">
              About
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
