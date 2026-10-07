

interface CinematicBackgroundProps {
  imageSrc?: string;
  overlayGradient?: boolean;
  warmGlowCenter?: boolean;
  hangingLights?: boolean;
  className?: string;
  children?: React.ReactNode;
}

export function CinematicBackground({
  imageSrc,
  overlayGradient = true,
  warmGlowCenter = true,
  hangingLights = true,
  className = "",
  children,
}: CinematicBackgroundProps) {
  return (
    <div className={`absolute inset-0 overflow-hidden pointer-events-none select-none z-0 ${className}`}>
      {/* 1. Base Dark Twilight / Burgundy / Midnight Gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#09030c] via-[#1a0718] to-[#07020a]" />

      {/* 2. Optional High-Definition Environmental Image Plate */}
      {imageSrc && (
        <div className="absolute inset-0">
          <img
            src={imageSrc}
            alt=""
            className="w-full h-full object-cover object-center filter contrast-[104%] brightness-[96%]"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).style.display = "none";
            }}
          />
        </div>
      )}

      {/* 3. Deep Atmospheric Vignette & Gradients */}
      {overlayGradient && (
        <>
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-black/75" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_transparent_35%,_rgba(0,0,0,0.85)_100%)]" />
        </>
      )}

      {/* 4. Center Warm Spotlight / Champagne-Rose Bloom */}
      {warmGlowCenter && (
        <div
          className="absolute inset-0 mix-blend-screen opacity-65 pointer-events-none"
          style={{
            background:
              "radial-gradient(circle at 50% 50%, rgba(217, 168, 94, 0.18) 0%, rgba(244, 63, 94, 0.12) 38%, transparent 68%)",
          }}
        />
      )}

      {/* 5. Hanging Fairy Lights & Lantern Garlands */}
      {hangingLights && (
        <div className="absolute top-0 left-0 right-0 h-24 pointer-events-none z-10 opacity-70 flex justify-around px-4 sm:px-12">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => {
            const h = (i % 3 === 0 ? 32 : i % 2 === 0 ? 24 : 16) + (i % 4) * 4;
            return (
              <div key={i} className="flex flex-col items-center">
                <div
                  className="w-[1px] bg-gradient-to-b from-white/10 via-amber-200/30 to-amber-200/70"
                  style={{ height: `${h}px` }}
                />
                <div
                  className="w-2 h-2 rounded-full bg-amber-200 shadow-[0_0_10px_rgba(254,240,138,0.95)] animate-pulse"
                  style={{
                    animationDelay: `${(i * 0.35) % 2.5}s`,
                    animationDuration: "2.6s",
                  }}
                />
              </div>
            );
          })}
        </div>
      )}

      {children}
    </div>
  );
}

export default CinematicBackground;
