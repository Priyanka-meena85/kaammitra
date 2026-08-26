import React from 'react';
import { Helmet } from 'react-helmet-async';

const COMPANY = 'KaamMitra';
const SUPPORT_EMAIL = 'support@kaammitra.in';
const SUPPORT_PHONE = '+91 85033 96575';
const LAST_UPDATED = '26 August 2026';

const Page = ({ title, intro, children }) => (
  <div className="max-w-3xl mx-auto px-4 sm:px-6 py-14">
    <Helmet>
      <title>{`${title} | ${COMPANY}`}</title>
    </Helmet>
    <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-accent-orange mb-3">Legal</p>
    <h1 className="text-3xl md:text-4xl font-extrabold text-navy mb-4">{title}</h1>
    <p className="text-sm text-text-gray mb-10">Last updated: {LAST_UPDATED}</p>
    {intro && <p className="text-lg text-text-gray leading-relaxed mb-10">{intro}</p>}
    <div className="legal-body flex flex-col gap-8">{children}</div>
  </div>
);

const Clause = ({ heading, children }) => (
  <section>
    <h2 className="text-xl font-extrabold text-navy mb-3">{heading}</h2>
    <div className="text-text-gray leading-relaxed flex flex-col gap-3">{children}</div>
  </section>
);

const Bullets = ({ items }) => (
  <ul className="list-disc pl-5 flex flex-col gap-2">
    {items.map((item) => <li key={item}>{item}</li>)}
  </ul>
);

export const Terms = () => (
  <Page
    title="Terms of Service"
    intro={`${COMPANY} is a marketplace that helps customers find verified local service professionals — electricians, plumbers, carpenters, masons and others. These terms explain what we do, what we do not do, and what each side is responsible for.`}
  >
    <Clause heading="1. What KaamMitra is">
      <p>
        {COMPANY} connects customers with independent service professionals. We are a marketplace and
        technology platform. We are not the employer of any professional listed on the platform, and we do
        not ourselves perform any service booked through it.
      </p>
      <p>
        Professionals on {COMPANY} are independent contractors. They set their own availability and rates,
        and they are responsible for the quality, safety and legality of the work they perform.
      </p>
    </Clause>

    <Clause heading="2. Accounts and eligibility">
      <Bullets items={[
        'You must be at least 18 years old to create an account.',
        'Accounts are verified using your mobile number and a one-time password. Keep your phone and password secure.',
        'You are responsible for activity that takes place under your account.',
        'Service professionals must provide accurate identity and address documents during verification.',
        'Providing false information, or impersonating another person, may result in your account being blocked.',
      ]} />
    </Clause>

    <Clause heading="3. Bookings">
      <p>
        When you request a booking, you are making an offer to the professional you selected. A booking is
        confirmed only when that professional accepts it. Prices shown are the professional&rsquo;s expected
        charge and may change if the actual work differs from what was described — any change should be
        agreed between you and the professional before the work begins.
      </p>
      <p>
        You may cancel a booking through the app. Repeated late cancellations or no-shows may affect your
        reliability score and, in serious cases, your access to the platform.
      </p>
    </Clause>

    <Clause heading="4. Payments and platform fee">
      <Bullets items={[
        'Payments made through the app are processed by our payment partner. We do not store your card or UPI credentials.',
        'You may pay in cash directly to the professional where that option is offered.',
        `${COMPANY} charges the professional a platform commission on the job value. The commission is deducted from the professional's settlement, not added to your price.`,
        'Professional earnings are held in a platform wallet and become available for payout once a job is marked complete.',
      ]} />
    </Clause>

    <Clause heading="5. Ratings, reviews and conduct">
      <p>
        Ratings may be left only by a customer who has completed a job with that professional. Reviews must
        be honest and relate to the work performed. We may remove content that is abusive, misleading, or
        posted to manipulate a professional&rsquo;s standing.
      </p>
      <p>
        Harassment, discrimination, threats or unsafe behaviour — by a customer or a professional — will
        result in removal from the platform.
      </p>
    </Clause>

    <Clause heading="6. Our responsibility, and its limits">
      <p>
        We verify identity documents and maintain a ratings and complaints system, but we do not supervise
        work as it is performed. We are not liable for loss, damage or injury arising from the acts or
        omissions of an independent professional or a customer.
      </p>
      <p>
        Where we are found liable despite the above, our total liability for any claim is limited to the
        platform commission we received on the booking that gave rise to it.
      </p>
      <p>
        If something goes wrong with a job, raise a complaint through the app. We will review it, mediate
        where we reasonably can, and act against professionals who repeatedly fall short.
      </p>
    </Clause>

    <Clause heading="7. Suspension">
      <p>
        We may suspend or close an account that breaches these terms, is used fraudulently, or presents a
        safety risk. Where an account is closed, any earnings already settled and owed to a professional
        remain payable.
      </p>
    </Clause>

    <Clause heading="8. Changes and governing law">
      <p>
        We may update these terms as the service develops. Material changes will be notified in the app.
        These terms are governed by the laws of India, and the courts of Rajasthan have exclusive
        jurisdiction over any dispute.
      </p>
    </Clause>

    <Clause heading="9. Contact">
      <p>Questions about these terms: {SUPPORT_EMAIL} &middot; {SUPPORT_PHONE}</p>
    </Clause>
  </Page>
);

export const Privacy = () => (
  <Page
    title="Privacy Policy"
    intro={`This policy explains what personal data ${COMPANY} collects, why we collect it, and the rights you have over it under India's Digital Personal Data Protection Act, 2023.`}
  >
    <Clause heading="1. What we collect">
      <p><strong className="text-navy">From everyone:</strong></p>
      <Bullets items={[
        'Name and mobile number, used to create and verify your account.',
        'City and area, used to show you people and work nearby.',
        'Device and usage information, used to keep the service working and secure.',
      ]} />
      <p><strong className="text-navy">From customers:</strong></p>
      <Bullets items={[
        'Service address and job description, shared with the professional you book.',
        'Booking and payment history.',
      ]} />
      <p><strong className="text-navy">From service professionals:</strong></p>
      <Bullets items={[
        'A profile photograph.',
        'An identity document (such as Aadhaar, Voter ID or Driving Licence) and an address proof, used solely to verify that you are who you say you are.',
        'Bank or UPI details, used only to pay you.',
        'Approximate live location during an active job, shared with that customer so they can see you are on the way.',
      ]} />
    </Clause>

    <Clause heading="2. Why we collect it">
      <Bullets items={[
        'To operate the marketplace — matching, booking, messaging and payment.',
        'To verify professionals, which is what makes the platform trustworthy.',
        'To resolve complaints and investigate misuse.',
        'To meet legal and tax obligations.',
      ]} />
      <p>
        We do not sell your personal data, and we do not share it with advertisers.
      </p>
    </Clause>

    <Clause heading="3. What is visible to others">
      <p>
        A professional&rsquo;s public profile shows their name, photograph, services, area, verification
        status, ratings and contact number — the contact number is shown so customers can call or message
        directly, which is core to how the platform works.
      </p>
      <p>
        A customer&rsquo;s name, phone number and service address are shared only with the professional they
        have booked, and only for that booking. Identity documents are never shown publicly; they are visible
        only to our verification team.
      </p>
    </Clause>

    <Clause heading="4. Who processes data for us">
      <Bullets items={[
        'Our cloud hosting and database providers, which store the platform data.',
        'Our OTP and messaging provider, used to verify your phone number.',
        'Our payment gateway, which processes payments and payouts. Card and UPI credentials go directly to them and are never stored by us.',
        'Our file storage provider, which holds uploaded photographs and documents.',
      ]} />
    </Clause>

    <Clause heading="5. How long we keep it">
      <p>
        Account data is kept while your account is active. Verification documents are kept for as long as the
        professional is listed, and for a reasonable period afterwards to handle disputes. Booking, payment
        and audit records are kept as long as tax and accounting law requires.
      </p>
    </Clause>

    <Clause heading="6. Your rights">
      <Bullets items={[
        'Access — ask for a copy of the personal data we hold about you.',
        'Correction — ask us to fix anything inaccurate.',
        'Erasure — ask us to delete your account and data, subject to records we must keep by law.',
        'Withdraw consent — you may withdraw consent for processing, though this may mean we can no longer provide the service.',
        'Grievance — raise a concern with us and receive a response.',
      ]} />
      <p>To exercise any of these, write to {SUPPORT_EMAIL}.</p>
    </Clause>

    <Clause heading="7. Security">
      <p>
        Passwords are stored hashed, never in plain text. Access to verification documents is restricted to
        authorised staff, and administrative actions are recorded in an audit log. No system is perfectly
        secure, but if a breach affects your data we will notify you and the Data Protection Board as
        required.
      </p>
    </Clause>

    <Clause heading="8. Children">
      <p>The platform is not intended for anyone under 18, and we do not knowingly collect their data.</p>
    </Clause>

    <Clause heading="9. Grievance officer">
      <p>
        Grievance Officer, {COMPANY}<br />
        Email: {SUPPORT_EMAIL}<br />
        Phone: {SUPPORT_PHONE}<br />
        We aim to acknowledge complaints within 48 hours and resolve them within 30 days.
      </p>
    </Clause>
  </Page>
);

export const Refunds = () => (
  <Page
    title="Cancellation &amp; Refund Policy"
    intro="This policy covers bookings paid for through the app. Cash paid directly to a professional is settled between you and them."
  >
    <Clause heading="1. Cancelling a booking">
      <Bullets items={[
        'Before the professional accepts — cancel free of charge, and any advance paid is refunded in full.',
        'After acceptance but before the professional sets out — cancel free of charge, and any advance paid is refunded in full.',
        'After the professional is on the way — the advance may be retained in part to compensate them for travel already made.',
        'Once work has begun — the advance is not refundable, but you may raise a complaint if the work is unsatisfactory.',
      ]} />
    </Clause>

    <Clause heading="2. If the professional cancels or does not arrive">
      <p>
        You receive a full refund of everything paid, including any advance. We will also help you find a
        replacement. Professionals who repeatedly fail to arrive are removed from the platform.
      </p>
    </Clause>

    <Clause heading="3. If the work is unsatisfactory">
      <p>
        Raise a complaint through the app within <strong className="text-navy">72 hours</strong> of the job
        being marked complete. We will review it with both sides. Depending on what we find, the outcome may
        be a rework at no extra cost, a partial refund, or a full refund.
      </p>
      <p>
        Payouts to a professional are held while a complaint on that booking is open, so a refund can be made
        where it is due.
      </p>
    </Clause>

    <Clause heading="4. How refunds are paid">
      <Bullets items={[
        'Refunds are returned to the original payment method.',
        'Once approved, refunds are initiated within 3 working days.',
        'Your bank or UPI provider typically credits the amount within 5 to 7 working days.',
        'You will be notified in the app when a refund is initiated.',
      ]} />
    </Clause>

    <Clause heading="5. Platform commission">
      <p>
        Where a booking is refunded in full, the platform commission is refunded along with it. We do not
        retain a fee on a job that did not happen.
      </p>
    </Clause>

    <Clause heading="6. Contact">
      <p>
        For anything related to a cancellation or refund: {SUPPORT_EMAIL} &middot; {SUPPORT_PHONE}
      </p>
    </Clause>
  </Page>
);
