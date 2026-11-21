import React from "react";

interface LogoProps {
  className?: string;
  size?: number;
}

export function Logo({ className = "w-10 h-10", size }: LogoProps) {
  const style = size ? { width: size, height: size } : undefined;

  return (
    <div className={`relative inline-flex items-center justify-center shrink-0 ${className}`} style={style}>
      <svg
        viewBox="0 0 120 120"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full drop-shadow-sm"
      >
        <defs>
          <linearGradient id="shieldGradReact" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#1B4332" />
            <stop offset="100%" stopColor="#122C20" />
          </linearGradient>
          <linearGradient id="accentGradReact" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#E26D46" />
            <stop offset="100%" stopColor="#C85A32" />
          </linearGradient>
        </defs>

        {/* Base Shield */}
        <path
          d="M60 6 L104 22 V58 C104 84 85 106 60 114 C35 106 16 84 16 58 V22 Z"
          fill="url(#shieldGradReact)"
        />
        <path
          d="M60 11 L99 25 V57 C99 80 82 100 60 108 C38 100 21 80 21 57 V25 Z"
          stroke="#E6E1D6"
          strokeWidth="1.5"
          strokeOpacity="0.35"
          fill="none"
        />

        {/* Municipal Capitol Dome */}
        <path d="M60 30 C50 30 45 37 45 42 H75 C75 37 70 30 60 30 Z" fill="url(#accentGradReact)" />
        <circle cx="60" cy="27" r="3" fill="#FAF8F5" />

        {/* Arch Pediment */}
        <polygon points="41,45 79,45 60,38" fill="#FAF8F5" />

        {/* Civic Pillars */}
        <rect x="44" y="47" width="5" height="22" rx="1" fill="#FAF8F5" />
        <rect x="52" y="47" width="5" height="22" rx="1" fill="#FAF8F5" />
        <rect x="63" y="47" width="5" height="22" rx="1" fill="#FAF8F5" />
        <rect x="71" y="47" width="5" height="22" rx="1" fill="#FAF8F5" />

        {/* Foundation Plinth */}
        <rect x="38" y="71" width="44" height="4.5" rx="1" fill="#FAF8F5" />
        <rect x="35" y="76" width="50" height="3.5" rx="1" fill="#C85A32" />

        {/* Central Accountability Checkmark Seal */}
        <circle cx="60" cy="91" r="11" fill="url(#accentGradReact)" />
        <path
          d="M55 91 L58.5 94.5 L65.5 87.5"
          stroke="#FFFFFF"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}
