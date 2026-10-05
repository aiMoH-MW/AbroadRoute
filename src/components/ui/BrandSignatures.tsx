import React from "react";
import Link from "next/link";

interface BrandLogoProps {
  variant?: "wordmark" | "full" | "symbol";
  theme?: "light" | "dark";
  size?: "sm" | "md" | "lg" | "xl";
  showTagline?: boolean;
  className?: string;
  href?: string;
}

export function BrandLogo({
  variant = "wordmark",
  theme = "light",
  size = "md",
  showTagline = false,
  className = "",
  href = "/",
}: BrandLogoProps) {
  const isDark = theme === "dark";
  const textColor = isDark ? "text-white" : "text-[#103B47]";
  const accentColor = isDark ? "text-[#D89A3E]" : "text-[#D89A3E]";

  const iconSizes = {
    sm: 28,
    md: 34,
    lg: 42,
    xl: 52,
  };

  const textSizes = {
    sm: "text-base",
    md: "text-lg",
    lg: "text-xl",
    xl: "text-2xl",
  };

  const iconDim = iconSizes[size] || 34;
  const textSize = textSizes[size] || "text-lg";

  const getImageSrc = () => {
    if (variant === "symbol") {
      return isDark
        ? "/brand/logo-symbol-dark.png"
        : "/brand/logo-symbol-light.png";
    }
    if (variant === "full") {
      return isDark
        ? "/brand/logo-full-dark.png"
        : "/brand/logo-full-light.png";
    }
    // wordmark / standard
    return isDark
      ? "/brand/logo-wordmark-dark.png"
      : "/brand/logo-wordmark-light.png";
  };

  const symbolSrc = isDark
    ? "/brand/logo-symbol-dark.png"
    : "/brand/logo-symbol-light.png";

  let content;

  if (variant === "symbol") {
    content = (
      <div className={`inline-flex items-center select-none ${className}`}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={symbolSrc}
          alt="Abroadroute Logo Symbol"
          width={iconDim}
          height={iconDim}
          className="object-contain"
        />
      </div>
    );
  } else if (variant === "full" && !showTagline) {
    // Direct Full Artwork
    content = (
      <div className={`inline-flex items-center select-none ${className}`}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={getImageSrc()}
          alt="Abroadroute Logo Full Lockup"
          height={iconDim}
          className="h-auto object-contain max-h-[52px]"
        />
      </div>
    );
  } else {
    // Crisp Horizontal Lockup: Monogram Symbol + Editorial Typography with generous optical breathing room
    content = (
      <div
        className={`inline-flex items-center gap-3 select-none ${className}`}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={symbolSrc}
          alt="Abroadroute Logo Symbol"
          width={iconDim}
          height={iconDim}
          className="object-contain shrink-0"
        />
        <div className="flex flex-col justify-center leading-none">
          <span
            className={`font-display font-semibold ${textSize} tracking-normal ${textColor}`}
          >
            Abroad
            <span className={`font-serif italic font-normal ${accentColor}`}>
              Route
            </span>
          </span>
          {showTagline && (
            <div className="flex items-center gap-1.5 mt-1">
              <span className="h-px w-2.5 bg-[#D89A3E]" />
              <span className="text-[9px] tracking-[0.18em] uppercase font-sans font-bold text-[#D89A3E]">
                Study Abroad Simplified
              </span>
              <span className="h-px w-2.5 bg-[#D89A3E]" />
            </div>
          )}
        </div>
      </div>
    );
  }

  if (href) {
    return (
      <Link
        href={href}
        className="group inline-flex items-center focus:outline-none"
      >
        {content}
      </Link>
    );
  }

  return content;
}

/**
 * Signature 1: The Horizon Mark
 * A thin peacock rule broken in the centre by a single Saffron Gold six-point star ✦
 */
export function HorizonMark({
  size = "normal",
  className = "",
}: {
  size?: "normal" | "large";
  className?: string;
}) {
  const isLarge = size === "large";
  return (
    <div
      className={`flex items-center justify-center gap-3.5 w-full my-6 select-none ${
        isLarge ? "opacity-80" : "opacity-60"
      } ${className}`}
    >
      <div
        className={`flex-1 h-px bg-gradient-to-r from-transparent via-[#1D5A6C] to-[#1D5A6C] ${isLarge ? "max-w-[140px]" : "max-w-[90px]"}`}
      />
      <span className="text-[#D89A3E] font-bold text-sm">✦</span>
      <div
        className={`flex-1 h-px bg-gradient-to-l from-transparent via-[#1D5A6C] to-[#1D5A6C] ${isLarge ? "max-w-[140px]" : "max-w-[90px]"}`}
      />
    </div>
  );
}

/**
 * Signature 2: The Peacock Eye
 * 3-ring micro emblem (Peacock -> Saffron Gold -> Amethyst)
 */
export function PeacockEye({
  size = 14,
  className = "",
}: {
  size?: number;
  className?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`inline-block shrink-0 ${className}`}
    >
      <circle cx="24" cy="24" r="22" fill="#1D5A6C" />
      <circle cx="24" cy="24" r="14" fill="#D89A3E" />
      <circle cx="24" cy="24" r="6" fill="#7C6BAE" />
      <circle cx="24" cy="24" r="2" fill="#FDFCF7" />
    </svg>
  );
}

/**
 * Signature 3: The Compass Marks (Aperture Framing)
 * Four Saffron Gold cardinal L-shaped corner brackets that frame featured content
 */
export function CompassAperture({
  children,
  tight = false,
  className = "",
}: {
  children: React.ReactNode;
  tight?: boolean;
  className?: string;
}) {
  return (
    <div
      className={`relative ${tight ? "p-4 aperture tight" : "p-6 aperture"} ${className}`}
    >
      {children}
    </div>
  );
}
