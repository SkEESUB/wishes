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
    gold: "bg-gradient-to-r from-[#d9a85e] via-[#f5d08a] to-[#d9a85e] text-[#2c1503] font-serif font-bold border border-[#fef08a]/60 shadow-[0_10px_28px_rgba(217,168,94,0.45),0_0_20px_rgba(254,240,138,0.3)] hover:shadow-[0_14px_36px_rgba(217,168,94,0.65),0_0_30px_rgba(254,240,138,0.5)]",
    rose: "bg-gradient-to-r from-[#881337] via-[#be123c] to-[#9f1239] text-[#fff1f2] font-serif font-semibold border border-[#fda4af]/45 shadow-[0_10px_28px_rgba(225,29,72,0.45),0_0_20px_rgba(244,63,94,0.3)] hover:shadow-[0_14px_36px_rgba(225,29,72,0.65),0_0_30px_rgba(244,63,94,0.5)]",
    glass:
      "bg-black/40 hover:bg-black/60 text-[#fed7aa] font-serif font-medium border border-[#e7b876]/45 hover:border-[#fef08a] backdrop-blur-md shadow-[0_8px_20px_rgba(0,0,0,0.5)] hover:shadow-[0_0_20px_rgba(231,184,118,0.35)]",
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
              y: -2.5,
              scale: 1.025,
            }
      }
      whileTap={
        disabled
          ? {}
          : {
              scale: 0.96,
              y: 0,
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
