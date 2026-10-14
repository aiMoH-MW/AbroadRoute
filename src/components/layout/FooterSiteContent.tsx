"use client";

import { useSiteContent, useSiteSettings } from "@/lib/useSiteContent";
import type { TrustBadge } from "@/lib/siteContent";

/** Trust strip above the footer (admin: Site Content → Trust Badges). */
export function FooterTrustStrip() {
  const badges = useSiteContent<TrustBadge[]>("trust-badges", []);
  if (badges.length === 0) return null;

  return (
    <div className="border-b border-[#1D5A6C]/30 bg-[#0D2F39] py-6">
      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-4 px-4 sm:grid-cols-4 sm:px-6 lg:px-8">
        {badges.map((badge) => (
          <div key={badge.id} className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#1D5A6C]/30 border border-[#1D5A6C]/50 font-display font-bold text-sm text-[#A8CDBD]">
              {badge.title.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="text-xs font-bold text-white leading-tight">
                {badge.title}
              </p>
              {badge.description && (
                <p className="text-[10px] text-slate-300 mt-0.5">
                  {badge.description}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/** "A brand by <company> · Founder Director: <name>" */
export function FooterCompanyCredit() {
  const s = useSiteSettings();
  if (!s.company_name && !s.founder_name) return null;
  return (
    <>
      {s.company_name && (
        <>
          A brand by <strong>{s.company_name}</strong>
        </>
      )}
      {s.company_name && s.founder_name && " · "}
      {s.founder_name && (
        <>
          Founder Director: <strong>{s.founder_name}</strong>
        </>
      )}
      .{" "}
    </>
  );
}

/** Bottom bar: copyright, offices and contact emails from site settings. */
export function FooterLegalLine() {
  const s = useSiteSettings();
  const details = [
    s.founder_name && `Founder Director: ${s.founder_name}`,
    s.office_locations,
    s.contact_email && `Contact: ${s.contact_email}`,
    s.grievance_email && `Grievance Officer: ${s.grievance_email}`,
  ].filter(Boolean);

  return (
    <>
      <p className="font-semibold text-slate-400">
        © {new Date().getFullYear()} AbroadRoute · Study Abroad Simplified.
        {s.company_name && ` A brand by ${s.company_name}.`}
      </p>
      {details.length > 0 && (
        <p className="text-[11px] text-slate-500">{details.join(" · ")}</p>
      )}
    </>
  );
}
