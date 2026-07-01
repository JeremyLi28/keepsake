import type { CardData } from "../data";

interface KeepsakeCardProps {
  data?: Partial<CardData>;
  style?: React.CSSProperties;
}

const s = (v: unknown) => (v == null ? "" : String(v));
const join = (arr: unknown[], sep: string) => arr.map(s).filter(Boolean).join(sep);

/**
 * The "back" of the keepsake — the personalized gift card.
 * Rendered entirely in CSS using container query units so it scales to any box.
 */
export default function KeepsakeCard({ data = {}, style }: KeepsakeCardProps) {
  const d = data;
  const round = s(d.round) || "World Cup 2026";
  const matchNo = s(d.matchNo);
  const event = s(d.event) || "Event Name";
  const type = s(d.type) || "Football";
  const dateTime = join([d.date, d.time], "  ·  ") || "Date · Time";
  const venueCity = join([d.venue, d.city], "  ·  ") || "Venue";
  const seatLine =
    "Sec " + (s(d.section) || "—") + " · Row " + (s(d.row) || "—") + " · Seat " + (s(d.seat) || "—");
  const recipient = s(d.recipient) || "Friend";
  const from = s(d.from) || "Someone who loves you";
  const message = s(d.message) || "A little something to remember this by.";
  const label = s(d.label) || "Matchday";
  const showQr = d.qr !== false;

  const cqw = (n: number) => `${n}cqw`;
  const eyebrow: React.CSSProperties = {
    fontSize: cqw(2.2),
    letterSpacing: "0.16em",
    textTransform: "uppercase",
    color: "#9A9486",
    fontWeight: 600,
  };
  const fieldVal: React.CSSProperties = { fontSize: cqw(3.1), marginTop: cqw(1.2), fontWeight: 500 };

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
          background: "#F7F4EC",
          color: "#1B2A4A",
          boxShadow: "0 2.4cqw 6cqw rgba(27,26,22,0.16),0 0.5cqw 1.4cqw rgba(27,26,22,0.08)",
        }}
      >
        {/* holographic foil bar */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: cqw(1.4),
            background:
              "linear-gradient(115deg,#ffc6e6,#c4b6ff 22%,#a7e8ff 42%,#bdf5d6 60%,#ffe7a6 80%,#ffc6e6)",
            backgroundSize: "300% 100%",
            animation: "kp-holo2 8s linear infinite",
            opacity: 0.85,
          }}
        />

        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            flexDirection: "column",
            padding: "7cqw 6.4cqw 6cqw",
          }}
        >
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: cqw(3) }}>
            <div>
              <div
                style={{
                  fontSize: cqw(2.4),
                  letterSpacing: "0.32em",
                  textTransform: "uppercase",
                  color: "#B0904E",
                  fontWeight: 700,
                }}
              >
                Keepsake Pass
              </div>
              <div
                style={{
                  marginTop: cqw(1.4),
                  height: cqw(0.5),
                  width: cqw(12),
                  borderRadius: cqw(1),
                  background: "linear-gradient(90deg,#B0904E,#E4CD92)",
                }}
              />
            </div>
            <div style={{ textAlign: "right" }}>
              <div
                style={{
                  fontSize: cqw(2.3),
                  letterSpacing: "0.16em",
                  textTransform: "uppercase",
                  color: "#8A8579",
                  fontWeight: 600,
                }}
              >
                {round}
              </div>
              <div style={{ fontFamily: "'Newsreader',serif", fontSize: cqw(3), marginTop: cqw(0.6), color: "#1B2A4A" }}>
                {matchNo}
              </div>
            </div>
          </div>

          <div
            style={{
              fontFamily: "'Newsreader',Georgia,serif",
              fontWeight: 500,
              fontSize: cqw(6.6),
              lineHeight: 1.02,
              letterSpacing: "-0.012em",
              marginTop: cqw(4.6),
            }}
          >
            {event}
          </div>
          <div style={{ fontSize: cqw(2.7), color: "#6E6A60", marginTop: cqw(1.6), letterSpacing: "0.02em" }}>
            {type} · Matchday Gift Ticket
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "3.6cqw 4cqw",
              marginTop: cqw(5),
              paddingTop: cqw(4.4),
              borderTop: "0.35cqw solid rgba(27,42,74,0.13)",
            }}
          >
            <div>
              <div style={eyebrow}>Date &amp; time</div>
              <div style={fieldVal}>{dateTime}</div>
            </div>
            <div>
              <div style={eyebrow}>Venue</div>
              <div style={fieldVal}>{venueCity}</div>
            </div>
            <div>
              <div style={eyebrow}>Your seats</div>
              <div style={{ fontFamily: "ui-monospace,Menlo,monospace", fontSize: cqw(2.9), marginTop: cqw(1.2) }}>
                {seatLine}
              </div>
            </div>
            <div>
              <div style={eyebrow}>For</div>
              <div style={{ fontFamily: "'Newsreader',serif", fontSize: cqw(3.4), marginTop: cqw(0.9) }}>{recipient}</div>
            </div>
          </div>

          <div style={{ marginTop: cqw(4.6), paddingTop: cqw(4), borderTop: "0.35cqw solid rgba(27,42,74,0.13)" }}>
            <div style={{ ...eyebrow, letterSpacing: "0.18em" }}>A note for you</div>
            <div
              style={{
                fontFamily: "'Newsreader',Georgia,serif",
                fontStyle: "italic",
                fontSize: cqw(4),
                lineHeight: 1.32,
                marginTop: cqw(1.8),
                color: "#23314f",
              }}
            >
              “{message}”
            </div>
            <div style={{ fontSize: cqw(2.7), color: "#6E6A60", marginTop: cqw(1.8) }}>— From {from}</div>
          </div>

          <div style={{ flex: 1, minHeight: cqw(2) }} />

          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: cqw(4) }}>
            <div style={{ maxWidth: "64%" }}>
              <div
                style={{
                  display: "inline-block",
                  fontSize: cqw(2.1),
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                  color: "#B0904E",
                  fontWeight: 700,
                  border: "0.3cqw solid rgba(176,144,78,0.5)",
                  padding: "1cqw 2.2cqw",
                  borderRadius: cqw(10),
                }}
              >
                {label}
              </div>
              <div style={{ fontSize: cqw(2.35), color: "#7C776C", lineHeight: 1.45, marginTop: cqw(2.4) }}>
                Collectible keepsake. Not valid for venue entry.
              </div>
            </div>
            {showQr && (
              <div
                style={{
                  position: "relative",
                  flex: "none",
                  width: cqw(17),
                  height: cqw(17),
                  borderRadius: cqw(2.2),
                  background: "#FFFFFF",
                  padding: cqw(1.8),
                  boxShadow: "inset 0 0 0 0.35cqw rgba(27,42,74,0.16)",
                  color: "#1B2A4A",
                }}
              >
                <div
                  style={{
                    width: "100%",
                    height: "100%",
                    backgroundImage: "radial-gradient(currentColor 35%,transparent 38%)",
                    backgroundSize: "13% 13%",
                    opacity: 0.9,
                  }}
                />
                {[
                  { top: cqw(1.8), left: cqw(1.8) },
                  { top: cqw(1.8), right: cqw(1.8) },
                  { bottom: cqw(1.8), left: cqw(1.8) },
                ].map((pos, i) => (
                  <div
                    key={i}
                    style={{
                      position: "absolute",
                      ...pos,
                      width: cqw(4.4),
                      height: cqw(4.4),
                      border: "0.9cqw solid #1B2A4A",
                      borderRadius: cqw(1),
                      background: "#fff",
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
