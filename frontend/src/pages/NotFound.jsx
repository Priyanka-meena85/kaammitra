import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Home, Search } from 'lucide-react';

const NotFound = () => (
  <div className="max-w-xl mx-auto px-4 py-24 text-center">
    <Helmet>
      <title>Page not found | KaamMitra</title>
      <meta name="robots" content="noindex" />
    </Helmet>

    <p className="text-6xl font-extrabold text-primary mb-4">404</p>
    <h1 className="text-2xl font-extrabold text-navy mb-3">Yeh page nahi mila</h1>
    <p className="text-text-gray mb-8">
      The page you are looking for has moved or does not exist. You can go back home
      or search for the worker you need.
    </p>

    <div className="flex flex-col sm:flex-row gap-3 justify-center">
      <Link
        to="/"
        className="inline-flex items-center justify-center gap-2 bg-primary hover:bg-primary-hover text-white font-bold px-6 py-3 rounded-xl shadow-md transition-colors"
      >
        <Home size={18} /> Go to home
      </Link>
      <Link
        to="/workers"
        className="inline-flex items-center justify-center gap-2 border border-border-gray text-navy font-bold px-6 py-3 rounded-xl hover:bg-bg-warm transition-colors"
      >
        <Search size={18} /> Find a worker
      </Link>
    </div>
  </div>
);

export default NotFound;
