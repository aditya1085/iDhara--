import React, { useState } from 'react';

interface LogoProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  showSubtitle?: boolean;
  showBadge?: boolean;
  className?: string;
  onClick?: () => void;
}

export const Logo: React.FC<LogoProps> = ({
  size = 'md',
  showText = true,
  showSubtitle = true,
  showBadge = true,
  className = '',
  onClick,
}) => {
  const [imageError, setImageError] = useState(false);

  // Proportionate dimension mapping preserving natural aspect ratio
  const sizeMap = {
    xs: { img: 'h-6 max-w-[70px]', title: 'text-xs', sub: 'text-[8.5px]', badge: 'text-[8px]' },
    sm: { img: 'h-7.5 max-w-[85px]', title: 'text-sm', sub: 'text-[9.5px]', badge: 'text-[9px]' },
    md: { img: 'h-9 max-w-[100px]', title: 'text-base', sub: 'text-[10px]', badge: 'text-[9.5px]' },
    lg: { img: 'h-11 max-w-[125px]', title: 'text-lg', sub: 'text-[11px]', badge: 'text-[10px]' },
    xl: { img: 'h-14 max-w-[155px]', title: 'text-2xl', sub: 'text-xs', badge: 'text-xs' },
  };

  const currentSize = sizeMap[size];

  return (
    <div
      onClick={onClick}
      className={`inline-flex items-center gap-2 select-none ${onClick ? 'cursor-pointer' : ''} ${className}`}
    >
      {/* Official iDhara Logo Asset with preserved green-blue water/nature identity */}
      <div className="relative shrink-0 flex items-center">
        {!imageError ? (
          <img
            src="/logo.jpg"
            alt="iDhara"
            className={`${currentSize.img} w-auto object-contain mix-blend-multiply transition-transform duration-200 hover:scale-102`}
            referrerPolicy="no-referrer"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="flex items-center font-bold tracking-tight text-[#263746]">
            <span className="text-[#258C91] text-lg font-extrabold">i</span>
            <span className="text-[#263746] text-lg font-bold">Dhara</span>
          </div>
        )}
      </div>

      {/* Brand Typography & Subtitle (displayed when showText is true) */}
      {showText && (
        <div className="flex flex-col leading-tight justify-center">
          <div className="flex items-center gap-1.5">
            <span
              className={`${currentSize.title} font-bold tracking-tight text-[#263746] font-sans flex items-center`}
            >
              <span className="text-[#258C91] font-extrabold">i</span>
              <span>Dhara</span>
            </span>
            {showBadge && (
              <span
                className={`${currentSize.badge} font-mono font-bold text-[#287FB5] px-1 py-0.2 bg-[#EDF3F7] border border-[#D4E0E8] rounded-xs`}
              >
                EOC
              </span>
            )}
          </div>
          {showSubtitle && (
            <span
              className={`${currentSize.sub} text-[#526778] font-mono font-medium tracking-wide mt-0.5 whitespace-nowrap`}
            >
              Urban Flood & Disaster Twin
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default Logo;
