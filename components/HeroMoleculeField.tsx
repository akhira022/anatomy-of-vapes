/** Soft chemical-structure accents floating around the model pane. */
export function HeroMoleculeField() {
  return (
    <div
      className="pointer-events-none absolute inset-0 z-[1] overflow-hidden"
      aria-hidden="true"
    >
      {/* Benzene ring — upper left */}
      <div className="absolute top-[12%] left-[8%] w-[4.5rem] rotate-[-18deg] text-white/15 sm:left-[14%] sm:w-[5.5rem] light:text-gray-600/45">
        <div
          className="animate-molecule-float-slow"
          style={{ animationDelay: "0.4s" }}
        >
          <svg viewBox="0 0 80 80" fill="none" className="size-full">
            <polygon
              points="40,8 68,24 68,56 40,72 12,56 12,24"
              stroke="currentColor"
              strokeWidth="1.25"
            />
            <circle cx="40" cy="40" r="10" stroke="currentColor" strokeWidth="1" />
            <circle cx="40" cy="8" r="2.25" fill="currentColor" />
            <circle cx="68" cy="24" r="2.25" fill="currentColor" />
            <circle cx="68" cy="56" r="2.25" fill="currentColor" />
            <circle cx="40" cy="72" r="2.25" fill="currentColor" />
            <circle cx="12" cy="56" r="2.25" fill="currentColor" />
            <circle cx="12" cy="24" r="2.25" fill="currentColor" />
          </svg>
        </div>
      </div>

      {/* Linked atoms — right */}
      <div className="absolute top-[22%] right-[6%] w-[5.5rem] rotate-[22deg] text-white/12 sm:right-[12%] sm:w-[6.5rem] light:text-gray-600/40">
        <div
          className="animate-molecule-float"
          style={{ animationDelay: "1.6s" }}
        >
          <svg viewBox="0 0 100 70" fill="none" className="size-full">
            <line x1="14" y1="36" x2="36" y2="18" stroke="currentColor" strokeWidth="1.25" />
            <line x1="36" y1="18" x2="58" y2="36" stroke="currentColor" strokeWidth="1.25" />
            <line x1="58" y1="36" x2="80" y2="16" stroke="currentColor" strokeWidth="1.25" />
            <line x1="58" y1="36" x2="86" y2="52" stroke="currentColor" strokeWidth="1.25" />
            <line x1="36" y1="18" x2="28" y2="52" stroke="currentColor" strokeWidth="1.25" />
            <circle cx="14" cy="36" r="4" fill="currentColor" />
            <circle cx="36" cy="18" r="5" fill="currentColor" />
            <circle cx="58" cy="36" r="4.5" fill="currentColor" />
            <circle cx="80" cy="16" r="3.5" fill="currentColor" />
            <circle cx="86" cy="52" r="3.5" fill="currentColor" />
            <circle cx="28" cy="52" r="3.5" fill="currentColor" />
          </svg>
        </div>
      </div>

      {/* Hexagon lattice fragment — mid left */}
      <div className="absolute top-[40%] left-[2%] w-[3.75rem] rotate-[8deg] text-white/10 sm:left-[6%] sm:w-[4.5rem] light:text-gray-600/38">
        <div
          className="animate-molecule-float-slower"
          style={{ animationDelay: "2.8s" }}
        >
          <svg viewBox="0 0 100 86" fill="none" className="size-full">
            <polygon
              points="28,6 50,18 50,42 28,54 6,42 6,18"
              stroke="currentColor"
              strokeWidth="1.15"
            />
            <polygon
              points="50,18 72,6 94,18 94,42 72,54 50,42"
              stroke="currentColor"
              strokeWidth="1.15"
            />
            <polygon
              points="28,54 50,42 72,54 72,78 50,90 28,78"
              stroke="currentColor"
              strokeWidth="1.15"
            />
          </svg>
        </div>
      </div>

      {/* Small ring + side chain — upper right */}
      <div className="absolute top-[8%] right-[18%] w-[3.25rem] rotate-[-32deg] text-white/14 sm:right-[24%] sm:w-[4rem] light:text-gray-600/42">
        <div
          className="animate-molecule-float"
          style={{ animationDelay: "0.9s" }}
        >
          <svg viewBox="0 0 64 72" fill="none" className="size-full">
            <polygon
              points="24,14 42,24 42,44 24,54 6,44 6,24"
              stroke="currentColor"
              strokeWidth="1.2"
            />
            <line x1="42" y1="24" x2="56" y2="10" stroke="currentColor" strokeWidth="1.2" />
            <line x1="42" y1="44" x2="58" y2="58" stroke="currentColor" strokeWidth="1.2" />
            <circle cx="24" cy="14" r="2" fill="currentColor" />
            <circle cx="42" cy="24" r="2" fill="currentColor" />
            <circle cx="42" cy="44" r="2" fill="currentColor" />
            <circle cx="24" cy="54" r="2" fill="currentColor" />
            <circle cx="6" cy="44" r="2" fill="currentColor" />
            <circle cx="6" cy="24" r="2" fill="currentColor" />
            <circle cx="56" cy="10" r="2.5" fill="currentColor" />
            <circle cx="58" cy="58" r="2.5" fill="currentColor" />
          </svg>
        </div>
      </div>

      {/* Linear chain — lower right */}
      <div className="absolute top-[48%] right-[10%] w-[5rem] rotate-[12deg] text-white/11 sm:right-[16%] sm:top-[44%] sm:w-[5.75rem] light:text-gray-600/40">
        <div
          className="animate-molecule-float-slow"
          style={{ animationDelay: "3.4s" }}
        >
          <svg viewBox="0 0 110 40" fill="none" className="size-full">
            <line x1="8" y1="20" x2="102" y2="20" stroke="currentColor" strokeWidth="1.2" />
            <line x1="30" y1="20" x2="30" y2="6" stroke="currentColor" strokeWidth="1.2" />
            <line x1="54" y1="20" x2="54" y2="34" stroke="currentColor" strokeWidth="1.2" />
            <line x1="78" y1="20" x2="78" y2="8" stroke="currentColor" strokeWidth="1.2" />
            <circle cx="8" cy="20" r="3.5" fill="currentColor" />
            <circle cx="30" cy="20" r="3.5" fill="currentColor" />
            <circle cx="54" cy="20" r="3.5" fill="currentColor" />
            <circle cx="78" cy="20" r="3.5" fill="currentColor" />
            <circle cx="102" cy="20" r="3.5" fill="currentColor" />
            <circle cx="30" cy="6" r="2.5" fill="currentColor" />
            <circle cx="54" cy="34" r="2.5" fill="currentColor" />
            <circle cx="78" cy="8" r="2.5" fill="currentColor" />
          </svg>
        </div>
      </div>
    </div>
  );
}
