import { useId } from "react";

interface KPLogoProps {
  /** Seal size in px. */
  size?: number;
  tone?: "dark" | "light";
  /** Hide the wordmark, show only the seal. */
  mono?: boolean;
  /** Show the "Give the ticket · Keep the memory" tagline. */
  tag?: boolean;
  style?: React.CSSProperties;
}

export default function KPLogo({
  size = 40,
  tone = "dark",
  mono = false,
  tag = false,
  style,
}: KPLogoProps) {
  const uid = useId().replace(/:/g, "");
  const seal = Number(size) || 36;
  const light = tone === "light";

  const gap = seal * 0.34;
  const wordGap = Math.max(2, seal * 0.08);
  const word = seal * 0.6;
  const tagSize = Math.max(7, seal * 0.2);
  const shadowY = Math.max(1, seal * 0.05);
  const shadowB = Math.max(3, seal * 0.14);
  const wordColor = light ? "#FBFBFA" : "#1B1A18";
  const tagColor = light ? "rgba(251,251,250,0.62)" : "#A3A096";

  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: `${gap}px`,
        fontFamily: "'Hanken Grotesk',system-ui,sans-serif",
        lineHeight: 1,
        ...style,
      }}
    >
      <svg
        width={seal}
        height={seal}
        viewBox="0 0 144 144"
        fill="none"
        style={{
          flex: "none",
          display: "block",
          filter: `drop-shadow(0 ${shadowY}px ${shadowB}px rgba(27,26,22,0.20))`,
        }}
      >
        <defs>
          <linearGradient
            id={`${uid}p`}
            x1="18"
            y1="18"
            x2="126"
            y2="126"
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0" stopColor="#F6F7F9" />
            <stop offset="0.4" stopColor="#D4D7DC" />
            <stop offset="0.56" stopColor="#ABB0B8" />
            <stop offset="0.78" stopColor="#E9EAED" />
            <stop offset="1" stopColor="#C5C8CE" />
          </linearGradient>
          <mask id={`${uid}n`}>
            <rect x="18" y="18" width="108" height="108" rx="27" fill="#fff" />
            <circle cx="18" cy="72" r="8.5" fill="#000" />
            <circle cx="126" cy="72" r="8.5" fill="#000" />
          </mask>
        </defs>
        <g mask={`url(#${uid}n)`}>
          <rect x="18" y="18" width="108" height="108" rx="27" fill={`url(#${uid}p)`} />
          <rect x="18" y="18" width="108" height="52" rx="27" fill="#FFFFFF" opacity="0.22" />
        </g>
        <rect
          x="25"
          y="25"
          width="94"
          height="94"
          rx="21"
          fill="none"
          stroke="#B0904E"
          strokeWidth="1.4"
          opacity="0.72"
        />
        <text
          x="72"
          y="92"
          textAnchor="middle"
          fontFamily="Newsreader, Georgia, serif"
          fontSize="62"
          fontWeight="500"
          fill="#1B2A4A"
        >
          K
        </text>
        <path
          d="M100 40 C100.3 45.6 102.6 47.9 108 49 C102.6 50.1 100.3 52.4 100 58 C99.7 52.4 97.4 50.1 92 49 C97.4 47.9 99.7 45.6 100 40 Z"
          fill="#B0904E"
        />
      </svg>
      {!mono && (
        <span style={{ display: "inline-flex", flexDirection: "column", gap: `${wordGap}px` }}>
          <span
            style={{
              fontFamily: "'Newsreader',Georgia,serif",
              fontWeight: 500,
              fontSize: `${word}px`,
              letterSpacing: "-0.014em",
              color: wordColor,
            }}
          >
            Keepsake Pass
          </span>
          {tag && (
            <span
              style={{
                fontSize: `${tagSize}px`,
                letterSpacing: "0.26em",
                textTransform: "uppercase",
                color: tagColor,
                fontWeight: 600,
              }}
            >
              Give the ticket · Keep the memory
            </span>
          )}
        </span>
      )}
    </div>
  );
}
