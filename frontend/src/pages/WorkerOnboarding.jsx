import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, BadgeCheck, CalendarCheck, IndianRupee, MapPin, ShieldCheck, UsersRound } from 'lucide-react';

const WorkerOnboarding = () => {
    const navigate = useNavigate();
    
    return (
        <div className="min-h-screen bg-bg-warm">
            <section className="market-hero relative overflow-hidden py-14 md:py-20">
                <div className="market-hero-grid absolute inset-0 pointer-events-none" />
                <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-[1fr_0.8fr] gap-10 items-center">
                    <div>
                        <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-accent-orange mb-4">For skilled professionals</p>
                        <h1 className="text-4xl md:text-6xl font-extrabold text-navy leading-[1.05] mb-5">Your work. Your <span className="text-accent-orange">customers.</span></h1>
                        <p className="text-lg text-text-gray max-w-xl leading-relaxed mb-7">Get discovered by people nearby, manage your availability, and grow through the quality of work you already know how to do.</p>
                        <button onClick={() => navigate('/worker-register')} className="bg-accent-orange hover:bg-accent-orange-hover text-white px-6 py-3.5 rounded-xl font-extrabold inline-flex items-center gap-2 shadow-md">Start your profile <ArrowRight size={18} /></button>
                    </div>
                    <div className="bg-navy text-white rounded-2xl p-7 shadow-xl"><p className="text-blue-200 text-sm font-bold mb-5">What you get on KaamMitra</p><div className="space-y-5">{[[MapPin, 'Local visibility', 'Reach customers in your service areas'], [CalendarCheck, 'Direct bookings', 'Accept jobs that fit your schedule'], [BadgeCheck, 'Trust that compounds', 'Ratings help you earn the next job']].map(([Icon, title, copy]) => <div key={title} className="flex gap-3"><Icon className="text-orange-300 shrink-0" size={22} /><div><p className="font-extrabold">{title}</p><p className="text-sm text-blue-100 mt-1">{copy}</p></div></div>)}</div></div>
                </div>
            </section>
            <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
                <div className="grid md:grid-cols-3 gap-5 mb-12">
                    {[[ShieldCheck, 'Verified profile', 'Upload your documents once and earn a profile customers can trust.'], [UsersRound, 'Direct connection', 'Customers can call, message, or book you without a middleman.'], [IndianRupee, 'Transparent earnings', 'See your work, payments, and wallet activity in one place.']].map(([Icon, title, copy]) => <article key={title} className="bg-white border border-border-gray rounded-2xl p-6 shadow-sm"><div className="h-11 w-11 rounded-xl bg-orange-50 text-accent-orange flex items-center justify-center mb-5"><Icon size={23} /></div><h2 className="text-xl font-extrabold text-navy mb-2">{title}</h2><p className="text-text-gray leading-relaxed">{copy}</p></article>)}
                </div>
                <section className="bg-white border border-border-gray rounded-2xl p-7 md:p-10"><div className="flex flex-col md:flex-row md:items-center justify-between gap-6"><div><p className="text-sm font-bold text-accent-orange uppercase tracking-wider mb-2">Ready when you are</p><h2 className="text-3xl font-extrabold text-navy mb-2">Set up your profile in a few steps.</h2><p className="text-text-gray">Phone verification, service details, location, and documents.</p></div><button onClick={() => navigate('/worker-register')} className="bg-primary hover:bg-primary-hover text-white px-6 py-3 rounded-xl font-extrabold inline-flex items-center gap-2 whitespace-nowrap">Register as a worker <ArrowRight size={18} /></button></div></section>
            </main>
        </div>
    );
};
export default WorkerOnboarding;