import React from 'react';

interface LogoProps {
  className?: string;
  showText?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const Logo: React.FC<LogoProps> = ({ 
  className = '', 
  showText = true,
  size = 'md'
}) => {
  const logoSizes = {
    sm: { height: '30px' },
    md: { height: '40px' },
    lg: { height: '60px' },
  };

  return (
    <div className={`flex items-center ${className}`}>
      <img 
        src="/src/assets/neutrinos-logo.png" 
        alt="Neutrinos Logo"
        style={logoSizes[size]}
        className="object-contain"
      />
    </div>
  );
};

export default Logo;