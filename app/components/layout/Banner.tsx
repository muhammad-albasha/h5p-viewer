import React from 'react';

interface BannerProps {
  title: string;
}

const Banner = ({ title }: BannerProps) => {
  return (
    <div className="bg-primary text-primary-content py-3">
      <div className="container mx-auto text-center">
        <h1 className="text-2xl font-bold">{title}</h1>
      </div>
    </div>
  );
};

export default Banner;
