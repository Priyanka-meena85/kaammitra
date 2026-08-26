import React from 'react';
import { Mic, Search, ShieldCheck, PhoneCall, Calendar, ArrowRight, WalletCards, UserRoundCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const HowItWorks = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-bg-warm">
      <section className="market-hero relative overflow-hidden py-14 md:py-20">
        <div className="market-hero-grid absolute inset-0 pointer-events-none" />
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-primary mb-4">Simple by design</p>
          <div className="grid lg:grid-cols-[1fr_0.75fr] gap-10 items-end">
            <div>
              <h1 className="text-4xl md:text-6xl font-extrabold text-navy leading-[1.05] mb-5">From problem to <span className="text-primary">solved.</span></h1>
              <p className="text-lg text-text-gray max-w-xl leading-relaxed">KaamMitra makes local service simple: describe the job, compare people you can trust, and choose how you want to connect.</p>
            </div>
            <div className="bg-navy text-white rounded-2xl p-6 shadow-xl">
              <p className="text-sm text-blue-200 mb-2">Your choice, every time</p>
              <p className="text-2xl font-extrabold leading-tight">Call, WhatsApp, or book a time that works.</p>
            </div>
          </div>
        </div>
      </section>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <section className="mb-16">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
            <div><p className="text-sm font-bold text-accent-green uppercase tracking-wider mb-2">For customers</p><h2 className="text-3xl font-extrabold text-navy">Get help without the guesswork</h2></div>
            <button onClick={() => navigate('/services')} className="text-primary font-bold inline-flex items-center gap-2">Browse services <ArrowRight size={18} /></button>
          </div>
          <div className="grid md:grid-cols-3 gap-5">
            {[
              [Mic, 'Say it or search it', 'Tell us what needs fixing in your own words, by voice or text.'],
              [Search, 'Compare nearby options', 'See distance, ratings, availability, experience, and expected charge together.'],
              [PhoneCall, 'Connect your way', 'Call, WhatsApp, or book a clear time directly with the worker.']
            ].map(([Icon, title, copy], index) => (
              <article key={title} className="bg-white border border-border-gray rounded-2xl p-6 shadow-sm relative overflow-hidden">
                <span className="text-6xl font-black text-bg-soft-blue absolute -right-1 -top-4">0{index + 1}</span>
                <div className="relative"><div className="h-12 w-12 rounded-xl bg-bg-soft-blue text-primary flex items-center justify-center mb-6"><Icon size={24} /></div><h3 className="text-xl font-extrabold text-navy mb-2">{title}</h3><p className="text-text-gray leading-relaxed">{copy}</p></div>
              </article>
            ))}
          </div>
        </section>

        <section className="bg-white border border-border-gray rounded-2xl p-6 md:p-10 mb-12">
          <div className="grid lg:grid-cols-[0.8fr_1.2fr] gap-10 items-center">
            <div><p className="text-sm font-bold text-accent-orange uppercase tracking-wider mb-2">Trust, built in</p><h2 className="text-3xl font-extrabold text-navy mb-3">Know who is coming to your door.</h2><p className="text-text-gray leading-relaxed">Every profile is designed for a confident decision, with verification status, community ratings, response time, and direct communication in one place.</p></div>
            <div className="grid sm:grid-cols-3 gap-3">
              {[[ShieldCheck, 'Verified identity'], [UserRoundCheck, 'Real profiles'], [Calendar, 'Clear schedules']].map(([Icon, label]) => <div key={label} className="bg-bg-warm rounded-xl p-4"><Icon className="text-accent-green mb-3" size={24} /><p className="font-bold text-navy text-sm">{label}</p></div>)}
            </div>
          </div>
        </section>

        <section className="bg-accent-orange rounded-2xl p-7 md:p-10 text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div><h2 className="text-2xl md:text-3xl font-extrabold mb-2">Need urgent help?</h2><p className="text-orange-100">Get matched with emergency-ready workers near you.</p></div>
          <button onClick={() => navigate('/emergency')} className="bg-white text-accent-orange px-5 py-3 rounded-xl font-extrabold inline-flex items-center gap-2 whitespace-nowrap">Get emergency help <ArrowRight size={18} /></button>
        </section>

        <section className="pt-16">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8"><div><p className="text-sm font-bold text-accent-orange uppercase tracking-wider mb-2">For workers</p><h2 className="text-3xl font-extrabold text-navy">Turn your skill into local work</h2></div><button onClick={() => navigate('/worker-onboarding')} className="text-accent-orange font-bold inline-flex items-center gap-2">Join KaamMitra <ArrowRight size={18} /></button></div>
          <div className="grid md:grid-cols-3 gap-5">
            {[[UserRoundCheck, 'Build your profile', 'Register once, verify your identity, and show customers what you do best.'], [Calendar, 'Receive nearby work', 'Set your availability and get direct booking requests in your service area.'], [WalletCards, 'Earn and grow', 'Deliver great work, collect ratings, and build a reputation that brings repeat customers.']].map(([Icon, title, copy]) => <article key={title} className="border-t-4 border-accent-orange bg-white rounded-b-2xl p-6 shadow-sm"><Icon className="text-accent-orange mb-5" size={26} /><h3 className="text-xl font-extrabold text-navy mb-2">{title}</h3><p className="text-text-gray leading-relaxed">{copy}</p></article>)}
          </div>
        </section>
      </main>
    </div>
  );
};

export default HowItWorks;
