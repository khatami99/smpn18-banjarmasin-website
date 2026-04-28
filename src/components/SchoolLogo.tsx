import React from 'react';
import { School } from 'lucide-react';

interface SchoolLogoProps {
  className?: string;
  size?: string;
  variant?: 'color' | 'white';
}

export const SchoolLogo: React.FC<SchoolLogoProps> = ({ className, size = "h-10", variant = 'color' }) => {
  const [errorCount, setErrorCount] = React.useState(0);
  
  const sources = [
    "/logo_smpn18Banjarmasin.png",
    "/logo.png",
    "https://ais-blob-orju4txz6jojch3bxxsfr3-404354862777.asia-southeast1.run.app/6ee583de-a8ac-482a-9f4a-7bc9be70de0b.png"
  ];

  if (errorCount >= sources.length) {
    const bgClass = variant === 'white' ? 'bg-white/10' : 'bg-school-navy';
    const iconClass = variant === 'white' ? 'text-white' : 'text-school-yellow';
    
    return (
      <div className={`${size} aspect-square ${bgClass} rounded-xl flex items-center justify-center ${iconClass} ${className}`}>
        <School className="h-1/2 w-1/2" />
      </div>
    );
  }

  return (
    <img 
      src={sources[errorCount]} 
      alt="Logo SMPN 18" 
      className={`${size} w-auto object-contain ${className}`}
      referrerPolicy="no-referrer"
      onError={() => setErrorCount(prev => prev + 1)}
    />
  );
};
