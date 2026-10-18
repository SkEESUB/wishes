import React, { useRef } from "react";
import { motion } from "framer-motion";

interface PremiumButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  type?: "button" | "submit";
  disabled?: boolean;
  variant?: "gold" | "rose" | "glass";
  size?: "sm" | "md" | "lg";
}

export function PremiumButton({
  children,
  onClick,
  className = "",
  type = "button",
  disabled = false,
  variant = "gold",
  size = "md",
}: PremiumButtonProps) {
  const isNavigatingRef = useRef(false);

  const handleClick = () => {
    if (disabled || isNavigatingRef.current) return;
    isNavigatingRef.current = true;
    setTimeout(() => {
      isNavigatingRef.current = false;
    }, 500);
    onClick?.();
  };

  const sizeClasses = {
    sm: "min-h-[38px] px-5 py-1.5 text-xs",
    md: "min-h-[46px] px-7 py-2.5 text-sm",
    lg: "min-h-[52px] px-9 py-3.5 text-base",
  }[size];

  const variantClasses = {
    gold: "bg-[rgba(14,11,18,0.82)] hover:bg-[rgba(22,17,28,0.92)] text-[#fff5ea] hover:text-[#fed7aa] font-serif font-semibold border border-[rgba(217,168,94,0.42)] hover:border-[rgba(254,240,138,0.7)] backdrop-blur-md shadow-[0_4px_16px_rgba(0,0,0,0.55)] hover:shadow-[0_6px_22px_rgba(0,0,0,0.7),0_0_16px_rgba(217,168,94,0.22)]",
    rose: "bg-[rgba(16,10,18,0.82)] hover:bg-[rgba(24,14,26,0.92)] text-[#fff5ea] hover:text-rose-200 font-serif font-semibold border border-[rgba(217,168,94,0.4)] hover:border-rose-400/60 backdrop-blur-md shadow-[0_4px_16px_rgba(0,0,0,0.55)] hover:shadow-[0_6px_22px_rgba(0,0,0,0.7),0_0_16px_rgba(244,114,182,0.2)]",
    glass:
      "bg-black/60 hover:bg-black/80 text-[#fff5ea] hover:text-[#fed7aa] font-serif font-medium border border-[#d9a85e]/35 hover:border-[#fef08a]/60 backdrop-blur-md shadow-[0_4px_16px_rgba(0,0,0,0.5)] hover:shadow-[0_6px_20px_rgba(0,0,0,0.65),0_0_14px_rgba(217,168,94,0.18)]",
  }[variant];

  return (
    <motion.button
      type={type}
      disabled={disabled}
      onClick={handleClick}
      whileHover={
        disabled
          ? {}
          : {
              y: -1.5,
              scale: 1.015,
            }
      }
      whileTap={
        disabled
          ? {}
          : {
              scale: 0.98,
              y: 0.5,
            }
      }
      transition={{ type: "spring", stiffness: 450, damping: 25 }}
      className={`relative group inline-flex items-center justify-center rounded-full tracking-wider transition-all duration-300 cursor-pointer overflow-hidden select-none ${sizeClasses} ${variantClasses} ${
        disabled ? "opacity-50 cursor-not-allowed filter grayscale" : ""
      } ${className}`}
    >
      {/* Light shimmer sweep animation */}
      <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out bg-gradient-to-r from-transparent via-white/30 to-transparent pointer-events-none" />

      <span className="relative z-10 flex items-center justify-center gap-2">
        {children}
      </span>
    </motion.button>
  );
}

export default PremiumButton;
