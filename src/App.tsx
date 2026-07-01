import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { augment, filters, templates, type CardData } from "./data";
import KPLogo from "./components/KPLogo";
import KeepsakeCard from "./components/KeepsakeCard";
import CardFront from "./components/CardFront";

type Route = "home" | "detail" | "customize" | "finish" | "share";

// Design props (exposed as toggles in the prototype).
const BANNER_AUTOPLAY = true;
const SHOW_PRINT_BETA = true;

const NAVY = "#1B2A4A";
const RULE = "linear-gradient(90deg,#B0904E,#E4CD92)";
const CAPTION = "I turned a mobile ticket into a keepsake card 🎟️✨";
const SHARE_URL = "https://keepsakepass.co/card/demo-abc123";

const pad = (n: number) => String(n).padStart(2, "0");

export default function App() {
  const [route, setRoute] = useState<Route>("home");
  const [filter, setFilter] = useState("All");
  const [selectedId, setSelectedId] = useState("wc-bra-nor");
  const [cardData, setCardData] = useState<CardData>({ ...templates[0] });
  const [custSide, setCustSide] = useState<"front" | "back">("front");
  const [shareSide, setShareSide] = useState<"front" | "back">("front");
  const [printPlan, setPrintPlan] = useState("premium");
  const [betaEmail, setBetaEmail] = useState("");
  const [toast, setToast] = useState("");
  const [now, setNow] = useState(Date.now());
  const [bannerIdx, setBannerIdx] = useState(0);

  const bannerRef = useRef<HTMLDivElement>(null);
  const hoverRef = useRef(false);
  const toastTimer = useRef<ReturnType<typeof setTimeout>>();

  // ---- lifecycle: countdown tick + banner marquee ----
  useEffect(() => {
    const iv = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(iv);
  }, []);

  useEffect(() => {
    const spd = 0.6;
    const marquee = setInterval(() => {
      const el = bannerRef.current;
      if (el && BANNER_AUTOPLAY && route === "home" && !hoverRef.current) {
        const first = el.children[0] as HTMLElement | undefined;
        const clone = el.children[templates.length] as HTMLElement | undefined;
        if (first && clone) {
          el.scrollLeft += spd;
          const unit = clone.offsetLeft - first.offsetLeft;
          if (unit > 0 && el.scrollLeft - first.offsetLeft >= unit) el.scrollLeft -= unit;
        }
      }
    }, 16);
    return () => clearInterval(marquee);
  }, [route]);

  useEffect(() => () => clearTimeout(toastTimer.current), []);

  const top = () => {
    try {
      window.scrollTo({ top: 0, behavior: "auto" });
    } catch {
      /* noop */
    }
  };
  const go = (r: Route) => {
    setRoute(r);
    top();
  };
  const openTemplate = (id: string) => {
    setSelectedId(id);
    setRoute("detail");
    top();
  };
  const startCustomize = (id: string) => {
    const t = templates.find((x) => x.id === id) || templates[0];
    setSelectedId(id);
    setCustSide("front");
    setCardData({ ...t });
    setRoute("customize");
    top();
  };
  const setField = (k: keyof CardData, v: string) => setCardData((s) => ({ ...s, [k]: v }));
  const toggleQr = () => setCardData((s) => ({ ...s, qr: s.qr === false }));

  const notify = useCallback((msg: string) => {
    clearTimeout(toastTimer.current);
    setToast(msg);
    toastTimer.current = setTimeout(() => setToast(""), 2400);
  }, []);
  const copy = (text: string, msg: string) => {
    try {
      navigator.clipboard?.writeText(text);
    } catch {
      /* noop */
    }
    notify(msg);
  };

  const bannerGo = (i: number) => {
    const el = bannerRef.current;
    const c = el?.children[i] as HTMLElement | undefined;
    if (el && c) el.scrollTo({ left: c.offsetLeft - (el.clientWidth - c.clientWidth) / 2, behavior: "smooth" });
    setBannerIdx(i);
  };
  const bannerStep = (d: number) => bannerGo(Math.min(templates.length - 1, Math.max(0, bannerIdx + d)));
  const onBannerScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    const len = templates.length;
    const first = el.children[0] as HTMLElement | undefined;
    const clone = el.children[len] as HTMLElement | undefined;
    if (!first || !clone) return;
    const per = (clone.offsetLeft - first.offsetLeft) / len;
    if (per <= 0) return;
    let idx = Math.round((el.scrollLeft - first.offsetLeft) / per) % len;
    if (idx < 0) idx += len;
    if (idx !== bannerIdx) setBannerIdx(idx);
  };

  // ---- derived values ----
  const all = useMemo(() => templates.map(augment), []);
  const filtered = filter === "All" ? all : all.filter((t) => t.match === filter);
  const selected = useMemo(
    () => augment(templates.find((t) => t.id === selectedId) || templates[0]),
    [selectedId],
  );
  const bannerItems = useMemo(() => all.concat(all), [all]);

  const countdownData = useMemo(() => {
    let target = new Date(selected.dateISO);
    if (isNaN(target.getTime())) target = new Date(now + 86400000 * 30);
    let diff = Math.max(0, target.getTime() - now);
    const dd = Math.floor(diff / 86400000);
    diff -= dd * 86400000;
    const hh = Math.floor(diff / 3600000);
    diff -= hh * 3600000;
    const mm = Math.floor(diff / 60000);
    diff -= mm * 60000;
    const ss = Math.floor(diff / 1000);
    const past = target.getTime() - now <= 0;
    const countdown = past
      ? [
          { v: "—", l: "Days" },
          { v: "—", l: "Hours" },
          { v: "—", l: "Mins" },
          { v: "—", l: "Secs" },
        ]
      : [
          { v: String(dd), l: "Days" },
          { v: pad(hh), l: "Hours" },
          { v: pad(mm), l: "Mins" },
          { v: pad(ss), l: "Secs" },
        ];
    return { countdown, past };
  }, [selected.dateISO, now]);

  const planMeta = [
    { id: "premium", name: "Premium card", desc: "Matte 16pt stock, foil-pressed edges." },
    { id: "holographic", name: "Holographic card", desc: "Iridescent foil, true collector finish." },
    { id: "gift", name: "Gift package", desc: "Card, lined envelope and sleeve box." },
  ];

  const mainNav = route === "home" || route === "detail";
  const shareVenueLine = [selected.venue, selected.city, selected.date].filter(Boolean).join("  ·  ");

  // ---------- render ----------
  return (
    <div style={{ minHeight: "100vh", background: "#FFFFFF", color: "#1B1A18" }}>
      {/* ===== MAIN NAV ===== */}
      {mainNav && (
        <header
          style={{
            position: "sticky",
            top: 0,
            zIndex: 40,
            background: "rgba(255,255,255,0.82)",
            backdropFilter: "saturate(1.1) blur(12px)",
            borderBottom: "1px solid #EDEBE5",
          }}
        >
          <div
            className="kp-pad"
            style={{
              maxWidth: 1200,
              margin: "0 auto",
              padding: "14px 28px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 20,
            }}
          >
            <button onClick={() => go("home")} style={btnReset({ display: "inline-flex", alignItems: "center" })}>
              <KPLogo size={34} style={{ display: "inline-flex" }} />
            </button>
            <button
              onClick={() => notify("Print beta is coming soon ✨")}
              style={btnReset({ fontSize: 13, color: "#6E6A60", fontWeight: 500, display: "flex", alignItems: "center", gap: 8 })}
            >
              Print beta{" "}
              <span style={pill}>Soon</span>
            </button>
          </div>
        </header>
      )}

      {/* ===== HOME ===== */}
      {route === "home" && (
        <div className="kp-fade">
          {/* HERO + BANNER */}
          <section className="kp-pad" style={{ position: "relative", overflow: "hidden" }}>
            <div
              aria-hidden
              style={{
                position: "absolute",
                left: "50%",
                top: 300,
                width: 980,
                maxWidth: "96vw",
                height: 560,
                transform: "translateX(-50%)",
                background: "radial-gradient(closest-side, rgba(167,232,255,0.22), rgba(167,232,255,0) 70%)",
                pointerEvents: "none",
                zIndex: 0,
              }}
            />
            <div style={{ position: "relative", zIndex: 2, maxWidth: 1000, margin: "0 auto", padding: "56px 28px 8px", textAlign: "center" }}>
              <div style={{ fontSize: 12, letterSpacing: "0.26em", textTransform: "uppercase", color: "#8E8D85", fontWeight: 600, display: "inline-flex", alignItems: "center", gap: 12 }}>
                <span style={{ width: 26, height: 1.5, background: RULE, display: "inline-block" }} />
                Give the ticket. Keep the memory.
                <span style={{ width: 26, height: 1.5, background: RULE, display: "inline-block" }} />
              </div>
              <h1 className="kp-h1" style={{ fontFamily: "'Newsreader',Georgia,serif", fontWeight: 500, fontSize: 72, lineHeight: 1.0, letterSpacing: "-0.025em", margin: "20px 0 0", textWrap: "balance" }}>
                Give tickets like a real gift.
              </h1>
              <p style={{ fontSize: 18.5, lineHeight: 1.55, color: "#54534D", maxWidth: "34em", margin: "20px auto 0" }}>
                Turn World Cup and event tickets into premium, collectible keepsake cards for the people you love — personalize the gift, then keep the memory forever.
              </p>
            </div>

            {/* SCROLLABLE BANNER */}
            <div style={{ position: "relative", zIndex: 1, maxWidth: 1240, margin: "22px auto 0" }}>
              <button className="kp-arrow" onClick={() => bannerStep(-1)} aria-label="Previous" style={arrowBtn("left")}>
                ‹
              </button>
              <button className="kp-arrow" onClick={() => bannerStep(1)} aria-label="Next" style={arrowBtn("right")}>
                ›
              </button>
              <div
                ref={bannerRef}
                className="kp-scroll"
                onScroll={onBannerScroll}
                onMouseEnter={() => (hoverRef.current = true)}
                onMouseLeave={() => (hoverRef.current = false)}
                style={{ display: "flex", gap: 30, overflowX: "auto", scrollSnapType: "none", padding: "24px clamp(24px,4vw,60px) 30px" }}
              >
                {bannerItems.map((t, i) => (
                  <div key={`${t.id}-${i}`} style={{ flex: "0 0 auto", width: "clamp(290px,72vw,420px)", scrollSnapAlign: "center" }}>
                    <button onClick={() => openTemplate(t.id)} className="kp-card-lift" style={btnReset({ display: "block", width: "100%" })}>
                      <div className="kp-card-img" style={{ width: "100%", aspectRatio: "1122 / 1402", borderRadius: 18, overflow: "hidden", boxShadow: "0 30px 56px rgba(27,26,22,0.22),0 8px 18px rgba(27,26,22,0.10)" }}>
                        <CardFront template={t} />
                      </div>
                    </button>
                    <div style={{ textAlign: "center", marginTop: 18 }}>
                      <div style={{ fontFamily: "'Newsreader',serif", fontSize: 22, letterSpacing: "-0.01em" }}>{t.match}</div>
                      <div style={{ fontSize: 13, color: "#8E8D85", marginTop: 4 }}>
                        {t.round} · {t.city}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div style={{ display: "flex", gap: 8, justifyContent: "center", marginTop: 4 }}>
                {templates.map((_, i) => {
                  const active = i === bannerIdx;
                  return (
                    <button
                      key={i}
                      onClick={() => bannerGo(i)}
                      aria-label="Go to slide"
                      style={{ cursor: "pointer", border: "none", height: 5, borderRadius: 99, background: active ? NAVY : "#D7D6CF", width: active ? 24 : 9, transition: "all .25s" }}
                    />
                  );
                })}
              </div>
            </div>
          </section>

          {/* GALLERY */}
          <section id="gallery" className="kp-pad" style={{ maxWidth: 1200, margin: "0 auto", padding: "48px 28px 16px" }}>
            <div style={{ borderTop: "1px solid #EDEBE5", paddingTop: 40, display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 20, flexWrap: "wrap" }}>
              <div>
                <h2 style={{ fontFamily: "'Newsreader',Georgia,serif", fontWeight: 500, fontSize: 38, letterSpacing: "-0.02em", margin: 0 }}>World Cup 2026 ticket cards</h2>
                <p style={{ fontSize: 16, color: "#666660", margin: "8px 0 0" }}>Pick a match, personalize the gift, and keep the memory. More events coming soon.</p>
              </div>
              <div style={{ fontSize: 13, color: "#9A9A92", fontWeight: 500 }}>
                {filtered.length} {filtered.length === 1 ? "card" : "cards"}
              </div>
            </div>

            {/* FILTERS */}
            <div style={{ marginTop: 24 }}>
              <div style={{ fontSize: 11, letterSpacing: "0.16em", textTransform: "uppercase", color: "#A3A299", fontWeight: 600, marginBottom: 11 }}>Filter by match</div>
              <div style={{ display: "flex", gap: 9, flexWrap: "wrap" }}>
                {filters.map((f) => {
                  const a = f === filter;
                  return (
                    <button
                      key={f}
                      onClick={() => setFilter(f)}
                      style={{ cursor: "pointer", fontSize: 13.5, fontWeight: 600, padding: "8px 16px", borderRadius: 999, border: `1px solid ${a ? NAVY : "#E4E3DD"}`, background: a ? NAVY : "#FAFAF8", color: a ? "#fff" : "#54534D", transition: "all .15s" }}
                    >
                      {f}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* GRID */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))", gap: 30, marginTop: 30, paddingBottom: 8 }}>
              {filtered.map((t) => (
                <div key={t.id} className="kp-fade" style={{ display: "flex", flexDirection: "column" }}>
                  <button onClick={() => openTemplate(t.id)} className="kp-card-lift-sm" style={btnReset({ display: "block", width: "100%" })}>
                    <div className="kp-card-img" style={{ width: "100%", aspectRatio: "1122 / 1402", borderRadius: 16, overflow: "hidden", boxShadow: "0 16px 34px rgba(27,26,22,0.14)" }}>
                      <CardFront template={t} />
                    </div>
                  </button>
                  <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 10, marginTop: 16 }}>
                    <h3 style={{ fontFamily: "'Newsreader',Georgia,serif", fontWeight: 500, fontSize: 22, margin: 0, letterSpacing: "-0.01em" }}>{t.match}</h3>
                    <span style={{ fontSize: 10.5, letterSpacing: "0.12em", textTransform: "uppercase", color: "#A3A299", fontWeight: 600, whiteSpace: "nowrap" }}>{t.matchNo}</span>
                  </div>
                  <p style={{ fontSize: 13.5, lineHeight: 1.5, color: "#666660", margin: "7px 0 0" }}>
                    {t.date} · {t.venue}, {t.city}
                  </p>
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 12 }}>
                    {t.tags.map((tag) => (
                      <span key={tag} style={tagChip}>{tag}</span>
                    ))}
                  </div>
                  <div style={{ marginTop: 15 }}>
                    <button onClick={() => startCustomize(t.id)} className="kp-btn-outline" style={{ cursor: "pointer", fontSize: 13.5, fontWeight: 600, padding: "10px 18px", borderRadius: 999, width: "100%" }}>Customize</button>
                  </div>
                </div>
              ))}
            </div>
            {filtered.length === 0 && (
              <div style={{ padding: 40, textAlign: "center", color: "#9A9A92", fontSize: 15 }}>No cards for this match yet.</div>
            )}
          </section>

          <footer className="kp-pad" style={{ maxWidth: 1200, margin: "0 auto", padding: "56px 28px 60px" }}>
            <div style={{ borderTop: "1px solid #EDEBE5", paddingTop: 34, display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 24, flexWrap: "wrap" }}>
              <KPLogo size={40} tag style={{ display: "inline-flex" }} />
              <div style={{ fontSize: 12.5, color: "#A3A299", display: "flex", gap: 18, flexWrap: "wrap", alignItems: "center" }}>
                <span>Collectible keepsakes — not valid for venue entry</span>
                <span style={{ background: "#F2F1EC", color: "#86857C", padding: "4px 11px", borderRadius: 20, fontWeight: 600, letterSpacing: ".08em", textTransform: "uppercase", fontSize: 10.5 }}>Print beta soon</span>
              </div>
            </div>
          </footer>
        </div>
      )}

      {/* ===== DETAIL ===== */}
      {route === "detail" && (
        <section className="kp-pad kp-fade" style={{ maxWidth: 1140, margin: "0 auto", padding: "30px 28px 64px" }}>
          <button onClick={() => go("home")} style={btnReset({ fontSize: 14, color: "#666660", fontWeight: 500, display: "flex", alignItems: "center", gap: 8, marginBottom: 26 })}>← All cards</button>
          <div className="kp-2col" style={{ display: "grid", gridTemplateColumns: "1.05fr 0.95fr", gap: 52, alignItems: "start" }}>
            <div style={{ display: "flex", gap: 22, flexWrap: "wrap", alignItems: "flex-start" }}>
              <div style={{ flex: "1 1 230px" }}>
                <div style={eyebrowSm}>Front · the card</div>
                <div style={{ width: "100%", aspectRatio: "1122 / 1402", borderRadius: 16, overflow: "hidden", boxShadow: "0 20px 40px rgba(27,26,22,0.16)" }}>
                  <CardFront template={selected} />
                </div>
              </div>
              <div style={{ flex: "1 1 230px" }}>
                <div style={eyebrowSm}>Back · your gift note</div>
                <div style={{ width: "100%", aspectRatio: "1122 / 1402" }}>
                  <KeepsakeCard data={{ ...selected }} style={{ width: "100%", height: "100%" }} />
                </div>
              </div>
            </div>
            <div style={{ position: "sticky", top: 90 }}>
              <div style={{ fontSize: 12, letterSpacing: "0.2em", textTransform: "uppercase", color: "#8E8D85", fontWeight: 600 }}>
                {selected.round} · {selected.matchNo}
              </div>
              <h1 style={{ fontFamily: "'Newsreader',Georgia,serif", fontWeight: 500, fontSize: 46, lineHeight: 1.04, letterSpacing: "-0.02em", margin: "14px 0 0" }}>{selected.match}</h1>
              <p style={{ fontSize: 16.5, lineHeight: 1.6, color: "#54534D", margin: "18px 0 0" }}>{selected.longDesc}</p>
              <div style={{ marginTop: 22, display: "flex", gap: 7, flexWrap: "wrap" }}>
                {selected.tags.map((tag) => (
                  <span key={tag} style={{ ...tagChip, fontSize: 12.5, padding: "5px 12px" }}>{tag}</span>
                ))}
              </div>
              <div style={{ marginTop: 24, background: "#FAFAF8", border: "1px solid #ECECE8", borderRadius: 16, padding: 20 }}>
                <div style={{ ...eyebrowSm, marginBottom: 14 }}>Event details</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "13px 16px", fontSize: 14 }}>
                  <Detail label="Date" value={`${selected.date} · ${selected.time}`} />
                  <Detail label="Venue" value={selected.venue} />
                  <Detail label="City" value={selected.city} />
                  <Detail label="Seat" value={selected.seatLine} />
                </div>
              </div>
              <button onClick={() => startCustomize(selectedId)} className="kp-btn-primary" style={{ marginTop: 24, width: "100%", border: "none", cursor: "pointer", fontSize: 15, fontWeight: 600, padding: 16, borderRadius: 999 }}>Customize this card</button>
              <p style={{ fontSize: 13, color: "#9A9A92", textAlign: "center", margin: "12px 0 0" }}>The template controls the layout — you add the gift.</p>
            </div>
          </div>
        </section>
      )}

      {/* ===== CUSTOMIZE ===== */}
      {route === "customize" && (
        <div className="kp-fade">
          <header style={stickyHeader(0.9)}>
            <div className="kp-pad" style={headerInner}>
              <button onClick={() => go("home")} style={btnReset({ fontSize: 14, color: "#666660", fontWeight: 500, display: "flex", alignItems: "center", gap: 8 })}>← <span className="kp-hide-sm">All cards</span></button>
              <div style={{ textAlign: "center", overflow: "hidden" }}>
                <div style={{ fontSize: 11, letterSpacing: "0.18em", textTransform: "uppercase", color: "#A3A299", fontWeight: 600 }}>Personalize</div>
                <div style={{ fontFamily: "'Newsreader',serif", fontSize: 17, marginTop: 1, whiteSpace: "nowrap", textOverflow: "ellipsis", overflow: "hidden" }}>{selected.match}</div>
              </div>
              <button onClick={() => go("finish")} className="kp-btn-primary" style={{ border: "none", cursor: "pointer", fontSize: 14, fontWeight: 600, padding: "11px 20px", borderRadius: 999 }}>Continue →</button>
            </div>
          </header>

          <section className="kp-pad" style={{ maxWidth: 1200, margin: "0 auto", padding: "30px 28px 70px" }}>
            <div className="kp-cust" style={{ display: "grid", gridTemplateColumns: "1fr 460px", gap: 48, alignItems: "start" }}>
              <div>
                <div style={{ fontSize: 14.5, color: "#666660", lineHeight: 1.5, background: "#FAFAF8", border: "1px solid #ECECE8", borderRadius: 14, padding: "14px 16px", marginBottom: 28 }}>
                  Event details come from the official card. You personalize the <strong style={{ color: "#1B1A18", fontWeight: 600 }}>gift</strong> — who it’s for and your note. The layout stays perfect.
                </div>

                <div style={sectionLabel}>Your gift</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                  <Field label="Recipient name" value={cardData.recipient} onChange={(v) => setField("recipient", v)} />
                  <Field label="From" value={cardData.from} onChange={(v) => setField("from", v)} />
                </div>
                <label style={{ display: "block", marginBottom: 18 }}>
                  <span style={fieldLabel}>Gift message</span>
                  <textarea value={cardData.message} onChange={(e) => setField("message", e.target.value)} rows={3} style={{ ...inputStyle, resize: "vertical", lineHeight: 1.5 }} />
                </label>
                <label style={{ display: "block", marginBottom: 18 }}>
                  <span style={fieldLabel}>Card label</span>
                  <select value={cardData.label} onChange={(e) => setField("label", e.target.value)} style={inputStyle}>
                    {["Matchday", "Game Day", "Birthday Gift", "Memory Card", "Date Night", "World Cup Gift"].map((o) => (
                      <option key={o}>{o}</option>
                    ))}
                  </select>
                </label>

                <div style={{ display: "flex", gap: 14, flexWrap: "wrap", alignItems: "stretch", marginTop: 4 }}>
                  <button onClick={toggleQr} style={{ flex: "1 1 240px", cursor: "pointer", border: "1px solid #DDDCD6", borderRadius: 14, padding: 16, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, background: "#FAFAF8" }}>
                    <span style={{ textAlign: "left" }}>
                      <span style={{ display: "block", fontSize: 14, fontWeight: 600, color: "#1B1A18" }}>QR code on back</span>
                      <span style={{ display: "block", fontSize: 12.5, color: "#9A9A92", marginTop: 2 }}>Links to the share page</span>
                    </span>
                    <span style={{ width: 46, height: 26, borderRadius: 999, background: cardData.qr === false ? "#D7D6CF" : NAVY, position: "relative", flex: "none", transition: "background .2s" }}>
                      <span style={{ position: "absolute", top: 3, left: cardData.qr === false ? 3 : 23, width: 20, height: 20, borderRadius: "50%", background: "#fff", boxShadow: "0 1px 3px rgba(0,0,0,.25)", transition: "left .2s" }} />
                    </span>
                  </button>
                </div>

                <div style={{ marginTop: 26, background: "#FAFAF8", border: "1px solid #ECECE8", borderRadius: 14, padding: "16px 18px" }}>
                  <div style={{ ...eyebrowSm, marginBottom: 12 }}>From the official card</div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "11px 16px", fontSize: 13.5, color: "#54534D" }}>
                    <MiniDetail label="Match" value={selected.match} />
                    <MiniDetail label="Date" value={`${selected.date} · ${selected.time}`} />
                    <MiniDetail label="Venue" value={`${selected.venue}, ${selected.city}`} />
                    <MiniDetail label="Seat" value={selected.seatLine} />
                  </div>
                </div>

                <button onClick={() => go("finish")} className="kp-btn-primary" style={{ marginTop: 28, width: "100%", border: "none", cursor: "pointer", fontSize: 15, fontWeight: 600, padding: 16, borderRadius: 999 }}>Continue to finish →</button>
              </div>

              <div className="kp-preview" style={{ position: "sticky", top: 90 }}>
                <div style={{ background: "#FAFAF8", border: "1px solid #ECECE8", borderRadius: 22, padding: 22 }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
                    <div style={{ fontSize: 11, letterSpacing: "0.16em", textTransform: "uppercase", color: "#A3A299", fontWeight: 600, display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#3FA66A", display: "inline-block" }} />Live preview
                    </div>
                    <div style={{ display: "flex", background: "#F2F1EC", borderRadius: 999, padding: 3 }}>
                      <TabBtn active={custSide === "front"} onClick={() => setCustSide("front")}>Front</TabBtn>
                      <TabBtn active={custSide === "back"} onClick={() => setCustSide("back")}>Back</TabBtn>
                    </div>
                  </div>
                  <div style={{ maxWidth: 330, margin: "0 auto", width: "100%", aspectRatio: "1122 / 1402" }}>
                    {custSide === "front" ? (
                      <div style={{ width: "100%", height: "100%", borderRadius: 14, overflow: "hidden", boxShadow: "0 16px 32px rgba(27,26,22,0.16)" }}>
                        <CardFront template={selected} />
                      </div>
                    ) : (
                      <KeepsakeCard data={cardData} style={{ width: "100%", height: "100%" }} />
                    )}
                  </div>
                  <p style={{ textAlign: "center", fontSize: 12.5, color: "#9A9A92", margin: "16px 0 0" }}>
                    {custSide === "front" ? "The official card — fixed layout" : "Your gift note · updates as you type"}
                  </p>
                </div>
              </div>
            </div>
          </section>
        </div>
      )}

      {/* ===== FINISH ===== */}
      {route === "finish" && (
        <div className="kp-fade">
          <header style={stickyHeader(0.9)}>
            <div className="kp-pad" style={headerInner}>
              <button onClick={() => go("customize")} style={btnReset({ fontSize: 14, color: "#666660", fontWeight: 500, display: "flex", alignItems: "center", gap: 8 })}>← <span className="kp-hide-sm">Edit gift</span></button>
              <button onClick={() => go("home")} style={btnReset({ display: "inline-flex", alignItems: "center" })}>
                <KPLogo size={30} style={{ display: "inline-flex" }} />
              </button>
              <div style={{ width: 90, textAlign: "right" }}>
                <button onClick={() => go("share")} className="kp-hide-sm" style={btnReset({ fontSize: 13.5, color: "#45453F", fontWeight: 600 })}>Share page →</button>
              </div>
            </div>
          </header>

          <section className="kp-pad" style={{ maxWidth: 880, margin: "0 auto", padding: "46px 28px 30px", textAlign: "center" }}>
            <div style={{ fontSize: 12, letterSpacing: "0.22em", textTransform: "uppercase", color: "#8E8D85", fontWeight: 600 }}>Ready to gift</div>
            <h1 style={{ fontFamily: "'Newsreader',Georgia,serif", fontWeight: 500, fontSize: 48, lineHeight: 1.05, letterSpacing: "-0.02em", margin: "14px 0 0" }}>Your keepsake is ready.</h1>
            <p style={{ fontSize: 17, lineHeight: 1.55, color: "#54534D", margin: "16px auto 0", maxWidth: "34em" }}>Share it now — printing &amp; shipping arrive with the print beta.</p>

            <div style={{ display: "flex", gap: 26, justifyContent: "center", flexWrap: "wrap", marginTop: 38 }}>
              <div style={{ width: 300, maxWidth: "80vw" }}>
                <div style={{ ...eyebrowSm, textAlign: "left" }}>Front</div>
                <div style={{ width: "100%", aspectRatio: "1122 / 1402", borderRadius: 14, overflow: "hidden", boxShadow: "0 18px 36px rgba(27,26,22,0.16)" }}>
                  <CardFront template={selected} />
                </div>
              </div>
              <div style={{ width: 300, maxWidth: "80vw" }}>
                <div style={{ ...eyebrowSm, textAlign: "left" }}>Back</div>
                <div style={{ width: "100%", aspectRatio: "1122 / 1402" }}>
                  <KeepsakeCard data={cardData} style={{ width: "100%", height: "100%" }} />
                </div>
              </div>
            </div>
          </section>

          <section className="kp-pad" style={{ maxWidth: 880, margin: "0 auto", padding: "8px 28px 20px" }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))", gap: 12 }}>
              <button onClick={() => notify("Full-res PNG export ships with the print beta.")} className="kp-btn-primary" style={{ cursor: "pointer", border: "none", fontSize: 14, fontWeight: 600, padding: "15px 14px", borderRadius: 14 }}>Download PNG</button>
              <button onClick={() => notify("Story image (1080×1920) export ships with the print beta.")} className="kp-btn-outline-soft" style={{ cursor: "pointer", fontSize: 14, fontWeight: 600, padding: "15px 14px", borderRadius: 14 }}>Story image</button>
              <button onClick={() => copy(SHARE_URL, "Share link copied 🔗")} className="kp-btn-ghost" style={{ cursor: "pointer", fontSize: 14, fontWeight: 600, padding: "15px 14px", borderRadius: 14 }}>Copy share link</button>
              <button onClick={() => copy(CAPTION, "Caption copied ✨")} className="kp-btn-ghost" style={{ cursor: "pointer", fontSize: 14, fontWeight: 600, padding: "15px 14px", borderRadius: 14 }}>Copy caption</button>
            </div>
            <div style={{ marginTop: 14, background: "#FAFAF8", border: "1px solid #ECECE8", borderRadius: 14, padding: "16px 18px", display: "flex", alignItems: "center", gap: 14, justifyContent: "space-between", flexWrap: "wrap" }}>
              <div style={{ textAlign: "left" }}>
                <div style={{ ...fieldLabel, marginBottom: 5 }}>Caption</div>
                <div style={{ fontSize: 14.5, color: "#36352F" }}>{CAPTION}</div>
              </div>
              <button onClick={() => copy(CAPTION, "Caption copied ✨")} style={{ cursor: "pointer", border: "1px solid #DDDCD6", background: "#fff", color: "#1B1A18", fontSize: 13, fontWeight: 600, padding: "9px 16px", borderRadius: 999, flex: "none" }}>Copy</button>
            </div>
            <div style={{ textAlign: "center", marginTop: 22 }}>
              <button onClick={() => go("home")} style={btnReset({ fontSize: 14, fontWeight: 600, color: "#666660" })}>+ Create another card</button>
            </div>
          </section>

          {SHOW_PRINT_BETA && (
            <section className="kp-pad" style={{ maxWidth: 880, margin: "0 auto", padding: "30px 28px 70px" }}>
              <div style={{ background: "linear-gradient(180deg,#FAFAF8,#F4F4F0)", border: "1px solid #EDEBE5", borderRadius: 24, padding: 34 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, justifyContent: "center" }}>
                  <span style={{ fontSize: 10.5, letterSpacing: "0.14em", textTransform: "uppercase", background: NAVY, color: "#fff", padding: "5px 12px", borderRadius: 20, fontWeight: 600 }}>Print beta · coming soon</span>
                </div>
                <h2 style={{ fontFamily: "'Newsreader',Georgia,serif", fontWeight: 500, fontSize: 32, letterSpacing: "-0.02em", textAlign: "center", margin: "18px 0 8px" }}>Want this printed and shipped?</h2>
                <p style={{ textAlign: "center", fontSize: 15.5, color: "#666660", margin: "0 auto", maxWidth: "30em", lineHeight: 1.55 }}>Real foil, heavy stock, and a gift-ready box. Join the beta and we’ll email you the moment printing opens.</p>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 12, marginTop: 26 }}>
                  {planMeta.map((p) => {
                    const a = p.id === printPlan;
                    return (
                      <button key={p.id} onClick={() => setPrintPlan(p.id)} style={{ cursor: "pointer", textAlign: "left", border: `1.5px solid ${a ? NAVY : "#E2E1DB"}`, background: a ? "#fff" : "#FAFAF8", borderRadius: 16, padding: 18 }}>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                          <span style={{ fontFamily: "'Newsreader',serif", fontSize: 18 }}>{p.name}</span>
                          <span style={{ width: 18, height: 18, borderRadius: "50%", border: `1.5px solid ${a ? NAVY : "#CFCEC7"}`, background: a ? NAVY : "transparent" }} />
                        </div>
                        <div style={{ fontSize: 13, color: "#666660", marginTop: 8, lineHeight: 1.45 }}>{p.desc}</div>
                      </button>
                    );
                  })}
                </div>
                <div style={{ display: "flex", gap: 10, marginTop: 22, maxWidth: 460, marginLeft: "auto", marginRight: "auto", flexWrap: "wrap" }}>
                  <input value={betaEmail} onChange={(e) => setBetaEmail(e.target.value)} placeholder="you@email.com" style={{ flex: "1 1 220px", padding: "14px 16px", border: "1px solid #DDDCD6", borderRadius: 999, background: "#fff", fontSize: 15, color: "#1B1A18" }} />
                  <button onClick={() => notify(betaEmail.trim() ? "You're on the print-beta list ✨" : "Add your email to join the print beta.")} className="kp-btn-primary" style={{ flex: "none", cursor: "pointer", border: "none", fontSize: 14, fontWeight: 600, padding: "14px 24px", borderRadius: 999 }}>Join print beta</button>
                </div>
                <p style={{ textAlign: "center", fontSize: 12.5, color: "#A3A299", margin: "14px 0 0" }}>No payment today — we’ll only email you when print opens.</p>
              </div>
            </section>
          )}
        </div>
      )}

      {/* ===== SHARE ===== */}
      {route === "share" && (
        <div className="kp-fade" style={{ background: "linear-gradient(180deg,#FFFFFF 0%,#F4F4F0 100%)", minHeight: "100vh" }}>
          <header style={{ ...stickyHeader(0.85) }}>
            <div className="kp-pad" style={{ maxWidth: 760, margin: "0 auto", padding: "12px 28px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16 }}>
              <KPLogo size={30} style={{ display: "inline-flex" }} />
              <button onClick={() => go("home")} className="kp-btn-primary" style={{ border: "none", cursor: "pointer", fontSize: 13.5, fontWeight: 600, padding: "10px 18px", borderRadius: 999 }}>Create your own</button>
            </div>
          </header>

          <section className="kp-pad" style={{ maxWidth: 600, margin: "0 auto", padding: "30px 28px 70px", textAlign: "center" }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "#F2F1EC", border: "1px solid #E4E3DD", color: "#86857C", fontSize: 12.5, padding: "7px 14px", borderRadius: 999, fontFamily: "ui-monospace,Menlo,monospace" }}>
              <span>🔒</span>keepsakepass.co/card/demo-abc123
            </div>
            <div style={{ fontFamily: "'Newsreader',serif", fontSize: 15, color: "#8E8D85", marginTop: 26 }}>A keepsake for</div>
            <h1 style={{ fontFamily: "'Newsreader',Georgia,serif", fontWeight: 500, fontSize: 40, letterSpacing: "-0.02em", margin: "4px 0 0" }}>{cardData.recipient}, you’ve got a gift</h1>

            <div style={{ maxWidth: 330, margin: "32px auto 0", width: "100%", aspectRatio: "1122 / 1402", cursor: "pointer" }} onClick={() => setShareSide((s) => (s === "front" ? "back" : "front"))}>
              {shareSide === "front" ? (
                <div style={{ width: "100%", height: "100%", borderRadius: 16, overflow: "hidden", boxShadow: "0 24px 44px rgba(27,26,22,0.2)" }}>
                  <CardFront template={selected} />
                </div>
              ) : (
                <KeepsakeCard data={cardData} style={{ width: "100%", height: "100%" }} />
              )}
            </div>
            <button onClick={() => setShareSide((s) => (s === "front" ? "back" : "front"))} style={btnReset({ fontSize: 12.5, color: "#9A9A92", fontWeight: 500, marginTop: 14 })}>Tap the card to flip ↺</button>

            <h2 style={{ fontFamily: "'Newsreader',Georgia,serif", fontWeight: 500, fontSize: 27, letterSpacing: "-0.01em", margin: "30px 0 0" }}>{selected.match}</h2>
            <div style={{ fontSize: 15, color: "#666660", marginTop: 8 }}>{shareVenueLine}</div>

            <div style={{ background: "#FAFAF8", border: "1px solid #ECECE8", borderRadius: 18, padding: 22, marginTop: 26, textAlign: "left" }}>
              <div style={eyebrowSm}>A note for you</div>
              <p style={{ fontFamily: "'Newsreader',serif", fontStyle: "italic", fontSize: 19, lineHeight: 1.4, margin: "12px 0 0", color: "#23314f" }}>“{cardData.message}”</p>
              <div style={{ fontSize: 14, color: "#666660", marginTop: 12 }}>— From {cardData.from}</div>
            </div>

            <div style={{ marginTop: 30 }}>
              <div style={{ fontSize: 11, letterSpacing: "0.2em", textTransform: "uppercase", color: "#8E8D85", fontWeight: 600 }}>
                {countdownData.past ? "This match has kicked off" : "Counting down to kickoff"}
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 10, marginTop: 14 }}>
                {countdownData.countdown.map((c, i) => (
                  <div key={i} style={{ background: "#fff", border: "1px solid #ECECE8", borderRadius: 14, padding: "14px 6px" }}>
                    <div style={{ fontFamily: "'Newsreader',serif", fontSize: 32, lineHeight: 1, fontVariantNumeric: "tabular-nums" }}>{c.v}</div>
                    <div style={{ fontSize: 10.5, letterSpacing: "0.12em", textTransform: "uppercase", color: "#A3A299", fontWeight: 600, marginTop: 7 }}>{c.l}</div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ display: "flex", gap: 12, alignItems: "flex-start", textAlign: "left", background: "#F2F1EC", borderRadius: 14, padding: "15px 16px", marginTop: 24 }}>
              <span style={{ fontSize: 16, lineHeight: 1.3, flex: "none" }}>🎟️</span>
              <p style={{ fontSize: 13.5, color: "#54534D", lineHeight: 1.5, margin: 0 }}>
                Your real ticket still lives in your official ticketing app. This card is a keepsake of the moment — <strong style={{ fontWeight: 600, color: "#36352F" }}>not valid for venue entry.</strong>
              </p>
            </div>

            <button onClick={() => go("home")} className="kp-btn-primary" style={{ marginTop: 30, border: "none", cursor: "pointer", fontSize: 15, fontWeight: 600, padding: "16px 32px", borderRadius: 999 }}>Create your own keepsake</button>
          </section>
        </div>
      )}

      {/* ===== TOAST ===== */}
      {toast && (
        <div style={{ position: "fixed", left: "50%", bottom: 28, transform: "translateX(-50%)", zIndex: 90, background: NAVY, color: "#fff", fontSize: 14, fontWeight: 500, padding: "13px 22px", borderRadius: 999, boxShadow: "0 8px 30px rgba(0,0,0,.25)", animation: "kp-rise .25s ease both" }}>
          {toast}
        </div>
      )}
    </div>
  );
}

/* ---------------- small helpers & shared styles ---------------- */

function btnReset(extra: React.CSSProperties = {}): React.CSSProperties {
  return { border: "none", background: "none", cursor: "pointer", padding: 0, ...extra };
}

function arrowBtn(side: "left" | "right"): React.CSSProperties {
  return {
    position: "absolute",
    [side]: 6,
    top: "50%",
    transform: "translateY(-50%)",
    zIndex: 5,
    width: 46,
    height: 46,
    borderRadius: "50%",
    border: "1px solid #E4E3DD",
    background: "rgba(255,255,255,0.92)",
    backdropFilter: "blur(6px)",
    cursor: "pointer",
    fontSize: 18,
    color: "#1B1A18",
    boxShadow: "0 6px 18px rgba(27,26,22,0.12)",
  };
}

const pill: React.CSSProperties = {
  fontSize: 10,
  letterSpacing: ".1em",
  textTransform: "uppercase",
  background: "#F2F1EC",
  color: "#86857C",
  padding: "3px 8px",
  borderRadius: 20,
  fontWeight: 600,
};

const tagChip: React.CSSProperties = {
  fontSize: 11,
  color: "#74746D",
  background: "#F2F1EC",
  padding: "4px 10px",
  borderRadius: 999,
  fontWeight: 500,
};

const eyebrowSm: React.CSSProperties = {
  fontSize: 11,
  letterSpacing: "0.16em",
  textTransform: "uppercase",
  color: "#A3A299",
  fontWeight: 600,
  marginBottom: 10,
};

const sectionLabel: React.CSSProperties = {
  fontFamily: "'Newsreader',serif",
  fontSize: 13,
  letterSpacing: "0.04em",
  color: "#A3A299",
  textTransform: "uppercase",
  borderBottom: "1px solid #EDEBE5",
  paddingBottom: 8,
  marginBottom: 18,
};

const fieldLabel: React.CSSProperties = {
  fontSize: 11,
  letterSpacing: "0.14em",
  textTransform: "uppercase",
  color: "#88887F",
  fontWeight: 600,
  display: "block",
  marginBottom: 7,
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "12px 14px",
  border: "1px solid #DDDCD6",
  borderRadius: 12,
  background: "#fff",
  fontSize: 15,
  color: "#1B1A18",
};

function stickyHeader(alpha: number): React.CSSProperties {
  return {
    position: "sticky",
    top: 0,
    zIndex: 40,
    background: `rgba(255,255,255,${alpha})`,
    backdropFilter: "saturate(1.1) blur(12px)",
    borderBottom: "1px solid #EDEBE5",
  };
}

const headerInner: React.CSSProperties = {
  maxWidth: 1200,
  margin: "0 auto",
  padding: "14px 28px",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 16,
};

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div style={{ color: "#9A9A92", fontSize: 12 }}>{label}</div>
      <div style={{ marginTop: 2 }}>{value}</div>
    </div>
  );
}

function MiniDetail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <span style={{ color: "#9A9A92" }}>{label}</span>
      <div>{value}</div>
    </div>
  );
}

function Field({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <label style={{ display: "block", marginBottom: 18 }}>
      <span style={fieldLabel}>{label}</span>
      <input value={value} onChange={(e) => onChange(e.target.value)} style={inputStyle} />
    </label>
  );
}

function TabBtn({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      style={{ cursor: "pointer", border: "none", fontSize: 12.5, fontWeight: 600, padding: "6px 16px", borderRadius: 999, background: active ? "#fff" : "transparent", color: active ? "#1B1A18" : "#88887F" }}
    >
      {children}
    </button>
  );
}
