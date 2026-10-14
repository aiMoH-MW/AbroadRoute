import { Metadata } from 'next';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Mail, Phone, MapPin } from 'lucide-react';
import { fetchSiteSettings } from '@/lib/siteContent';
import { show } from '@/components/tools/NotProvided';

export const metadata: Metadata = {
  title: "Contact Admissions Desk | AbroadRoute",
  description:
    "Contact AbroadRoute admissions desk. Connect with international education strategists for university shortlists, intake guidance, and visa support.",
};

export default async function ContactPage() {
  // Contact details are edited in Admin → Site Content → Site Settings
  const s = await fetchSiteSettings();
  return (
    <div className='min-h-screen bg-slate-50 flex flex-col justify-between'>
      <Header />
      <main className='flex-1 py-16 sm:py-20'>
        <div className='mx-auto max-w-5xl px-4 sm:px-6 lg:px-8'>
          <div className='text-center max-w-2xl mx-auto'>
            <h1 className='font-serif text-4xl font-extrabold text-[#102C57] sm:text-5xl'>
              Get in Touch with Admissions Desk
            </h1>
            <p className='mt-3 text-sm text-slate-600'>
              Have questions regarding upcoming intakes, university shortlisting, or institutional partnerships? Reach our central support desk.
            </p>
          </div>

          <div className='mt-12 grid grid-cols-1 gap-8 md:grid-cols-3'>
            <div className='rounded-2xl border border-slate-200 bg-white p-6 shadow-xs text-center'>
              <div className='mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-orange-50 text-[#EA5C2B]'>
                <Mail className='h-6 w-6' />
              </div>
              <h3 className='mt-4 font-bold text-[#102C57]'>Email Support</h3>
              <p className='mt-1 text-xs text-slate-500'>Inquiries & Grievances</p>
              {s.admissions_email ? (
                <a href={`mailto:${s.admissions_email}`} className='mt-3 block text-xs font-bold text-[#EA5C2B] hover:underline'>
                  {s.admissions_email}
                </a>
              ) : (
                <p className='mt-3'>{show(null)}</p>
              )}
            </div>

            <div className='rounded-2xl border border-slate-200 bg-white p-6 shadow-xs text-center'>
              <div className='mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600'>
                <Phone className='h-6 w-6' />
              </div>
              <h3 className='mt-4 font-bold text-[#102C57]'>Admissions Hotline</h3>
              <p className='mt-1 text-xs text-slate-500'>{show(s.support_hours)}</p>
              <p className='mt-3 text-xs font-bold text-[#102C57]'>{show(s.support_phone)}</p>
            </div>

            <div className='rounded-2xl border border-slate-200 bg-white p-6 shadow-xs text-center'>
              <div className='mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600'>
                <MapPin className='h-6 w-6' />
              </div>
              <h3 className='mt-4 font-bold text-[#102C57]'>Corporate Office</h3>
              <p className='mt-1 text-xs text-slate-500'>{show(s.company_name)}</p>
              <p className='mt-3 text-xs text-slate-600'>{show(s.office_locations)}</p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}