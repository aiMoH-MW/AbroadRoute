import { Metadata } from 'next';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { ShieldCheck, CheckCircle2 } from 'lucide-react';

export const metadata: Metadata = {
  title: "DPDP Act 2023 Consent & Student Privacy Notice | AbroadRoute",
  description:
    "Digital Personal Data Protection (DPDP) Act 2023 consent notice for AbroadRoute. Review data handling, privacy rights, and Indian student consent rules.",
};

export default function DPDPPage() {
  return (
    <div className='min-h-screen bg-slate-50 flex flex-col justify-between'>
      <Header />
      <main className='flex-1 py-16 sm:py-20'>
        <div className='mx-auto max-w-4xl px-4 sm:px-6 lg:px-8'>
          <div className='rounded-3xl border border-slate-200 bg-white p-8 sm:p-12 shadow-xs space-y-6 text-slate-700 text-sm leading-relaxed'>
            <div className='border-b border-slate-100 pb-6'>
              <div className='inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 uppercase tracking-wider mb-2'>
                <ShieldCheck className='h-4 w-4' /> Indian Data Protection Standard
              </div>
              <h1 className='font-serif text-3xl font-extrabold text-[#102C57] sm:text-4xl'>
                DPDP Act 2023 Compliance & Consent Architecture
              </h1>
              <p className='mt-1 text-xs text-slate-400'>Digital Personal Data Protection Act (DPDP Act, 2023) Notice</p>
            </div>

            <p>
              AbroadRoute strictly complies with India Digital Personal Data Protection Act, 2023. As a Data Fiduciary, Dnyanal Educon Pvt. Ltd. ensures that student data is processed lawfully, transparently, and only for explicit educational guidance purposes.
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}