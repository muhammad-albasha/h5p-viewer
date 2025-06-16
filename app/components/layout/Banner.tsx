import React from 'react';

interface BannerProps {
  title: string;
  subtitle?: string;
}

const Banner = ({ title, subtitle }: BannerProps) => {
  return (
    <div className="bg-gradient-to-r from-primary to-secondary text-primary-content py-6 relative overflow-hidden">
      <div className="banner-decoration absolute inset-0 opacity-10">
        <div className="banner-decoration-circle banner-circle-1"></div>
        <div className="banner-decoration-circle banner-circle-2"></div>
        <div className="banner-decoration-circle banner-circle-3"></div>
        <div className="banner-decoration-circle banner-circle-4"></div>
        <div className="banner-decoration-circle banner-circle-5"></div>
      </div>
      <div className="container-fluid mx-auto text-center relative z-10">
        <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
        {subtitle && <p className="mt-2 opacity-80">{subtitle}</p>}
      </div>
    </div>
  );
};

export default Banner;
