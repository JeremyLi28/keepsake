import type { AugmentedTemplate } from "../data";

/**
 * The "front" of the collectible card.
 *
 * The original design prototype used AI-generated holographic PNG photos here
 * (assets/cards/*.png). Those binaries exceeded the design import size cap, so
 * this component recreates the premium holographic collector aesthetic in pure
 * CSS/SVG, themed per match. Drop-in replaceable with real artwork later.
 */

interface Theme {
  bg: string;
  glow: string;
  home: string;
  away: string;
  homeColor: string;
  awayColor: string;
}

const THEMES: Record<string, Theme> = {
  "wc-bra-nor": {
    bg: "linear-gradient(160deg,#0b3d1f 0%,#12261a 55%,#0a1512 100%)",
    glow: "rgba(255,223,0,0.28)",
    home: "Brazil",
    away: "Norway",
    homeColor: "#FFDF00",
    awayColor: "#EF3340",
  },
  "wc-arg-cv": {
    bg: "linear-gradient(160deg,#123a63 0%,#0f2035 55%,#0a1420 100%)",
    glow: "rgba(108,172,228,0.32)",
    home: "Argentina",
    away: "Cabo Verde",
    homeColor: "#8FC5F0",
    awayColor: "#1F9E62",
  },
  "wc-par-fra": {
    bg: "linear-gradient(160deg,#3a1116 0%,#241021 55%,#0f0a1a 100%)",
    glow: "rgba(213,43,30,0.30)",
    home: "Paraguay",
    away: "France",
    homeColor: "#EF4B54",
    awayColor: "#8EA9F5",
  },
};

const FALLBACK: Theme = {
  bg: "linear-gradient(160deg,#1B2A4A,#0f1830)",
  glow: "rgba(167,232,255,0.3)",
  home: "Home",
  away: "Away",
  homeColor: "#E4CD92",
  awayColor: "#A7E8FF",
};

interface CardFrontProps {
  template: AugmentedTemplate;
  style?: React.CSSProperties;
}

export default function CardFront({ template, style }: CardFrontProps) {
  const t = THEMES[template.id] ?? FALLBACK;
  const cqw = (n: number) => `${n}cqw`;

  return (
    <div
      style={{
        containerType: "size",
        position: "relative",
        width: "100%",
        height: "100%",
        fontFamily: "'Hanken Grotesk',system-ui,sans-serif",
        ...style,
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: cqw(4.6),
          overflow: "hidden",
          background: t.bg,
          color: "#F6F2EA",
        }}
      >
        {/* soft team-colored glow */}
        <div
          style={{
            position: "absolute",
            top: "-20%",
            left: "50%",
            width: "120%",
            height: "70%",
            transform: "translateX(-50%)",
            background: `radial-gradient(closest-side, ${t.glow}, transparent 70%)`,
          }}
        />
        {/* holographic sheen sweeping across the whole card */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(115deg,rgba(255,198,230,0.10),rgba(196,182,255,0.10) 22%,rgba(167,232,255,0.12) 42%,rgba(189,245,214,0.10) 60%,rgba(255,231,166,0.12) 80%,rgba(255,198,230,0.10))",
            backgroundSize: "300% 100%",
            animation: "kp-holo2 9s linear infinite",
            mixBlendMode: "screen",
            pointerEvents: "none",
          }}
        />
        {/* faint grid texture */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.05) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.05) 1px,transparent 1px)",
            backgroundSize: "9cqw 9cqw",
            opacity: 0.5,
            maskImage: "radial-gradient(circle at 50% 40%, #000 20%, transparent 75%)",
          }}
        />

        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            flexDirection: "column",
            padding: "7cqw 6.4cqw 6.4cqw",
          }}
        >
          {/* top row */}
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: cqw(3) }}>
            <div
              style={{
                fontSize: cqw(2.4),
                letterSpacing: "0.3em",
                textTransform: "uppercase",
                color: "#E4CD92",
                fontWeight: 700,
              }}
            >
              World Cup 2026
            </div>
            <div
              style={{
                fontSize: cqw(2.3),
                letterSpacing: "0.16em",
                textTransform: "uppercase",
                color: "rgba(246,242,234,0.7)",
                fontWeight: 600,
              }}
            >
              {template.matchNo}
            </div>
          </div>

          {/* holo divider */}
          <div
            style={{
              marginTop: cqw(2.4),
              height: cqw(0.6),
              width: "100%",
              borderRadius: cqw(1),
              background: "linear-gradient(90deg,#B0904E,#E4CD92,#B0904E)",
              opacity: 0.85,
            }}
          />

          {/* big decorative crest */}
          <div style={{ flex: 1, position: "relative", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div
              aria-hidden
              style={{
                position: "absolute",
                fontFamily: "'Newsreader',Georgia,serif",
                fontSize: cqw(46),
                fontWeight: 500,
                lineHeight: 1,
                color: "rgba(255,255,255,0.06)",
                letterSpacing: "-0.03em",
              }}
            >
              26
            </div>
            <div style={{ position: "relative", textAlign: "center", width: "100%" }}>
              <div
                style={{
                  fontFamily: "'Newsreader',Georgia,serif",
                  fontWeight: 500,
                  fontSize: cqw(11.5),
                  lineHeight: 0.98,
                  color: t.homeColor,
                  textShadow: "0 0.4cqw 2cqw rgba(0,0,0,0.35)",
                }}
              >
                {t.home}
              </div>
              <div
                style={{
                  fontFamily: "'Newsreader',serif",
                  fontStyle: "italic",
                  fontSize: cqw(4.4),
                  color: "rgba(246,242,234,0.72)",
                  margin: `${cqw(1.6)} 0`,
                }}
              >
                versus
              </div>
              <div
                style={{
                  fontFamily: "'Newsreader',Georgia,serif",
                  fontWeight: 500,
                  fontSize: cqw(11.5),
                  lineHeight: 0.98,
                  color: t.awayColor,
                  textShadow: "0 0.4cqw 2cqw rgba(0,0,0,0.35)",
                }}
              >
                {t.away}
              </div>

              <div
                style={{
                  marginTop: cqw(4.5),
                  display: "inline-flex",
                  alignItems: "center",
                  gap: cqw(2),
                  fontSize: cqw(2.6),
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                  fontWeight: 600,
                  color: "#F6F2EA",
                  background: "rgba(255,255,255,0.08)",
                  border: "0.3cqw solid rgba(255,255,255,0.14)",
                  padding: "1.4cqw 3cqw",
                  borderRadius: cqw(10),
                }}
              >
                ★ {template.player}
              </div>
            </div>
          </div>

          {/* bottom meta */}
          <div>
            <div
              style={{
                display: "flex",
                alignItems: "flex-end",
                justifyContent: "space-between",
                gap: cqw(3),
                paddingTop: cqw(3.6),
                borderTop: "0.35cqw solid rgba(255,255,255,0.14)",
              }}
            >
              <div>
                <div
                  style={{
                    fontSize: cqw(2.3),
                    letterSpacing: "0.16em",
                    textTransform: "uppercase",
                    color: "#E4CD92",
                    fontWeight: 700,
                  }}
                >
                  {template.round}
                </div>
                <div style={{ fontSize: cqw(2.7), color: "rgba(246,242,234,0.78)", marginTop: cqw(1) }}>
                  {template.venue} · {template.city}
                </div>
              </div>
              <div
                style={{
                  fontSize: cqw(2),
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                  color: "#0f1830",
                  fontWeight: 700,
                  background: "linear-gradient(120deg,#E4CD92,#B0904E)",
                  padding: "1.2cqw 2.6cqw",
                  borderRadius: cqw(10),
                  flex: "none",
                }}
              >
                Collector
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
