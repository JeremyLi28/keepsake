// Ticket-card templates — ported verbatim from the Keepsake Pass design prototype.

export interface Template {
  id: string;
  match: string;
  /** Front-card theme key (see CardFront). The prototype used a PNG here. */
  player: string;
  round: string;
  matchNo: string;
  type: string;
  venue: string;
  city: string;
  date: string;
  time: string;
  dateISO: string;
  section: string;
  row: string;
  seat: string;
  longDesc: string;
  recipient: string;
  from: string;
  label: string;
  message: string;
  /** Alias of `match`, kept for the KeepsakeCard back template. */
  event: string;
}

/** Editable gift data — a Template plus the optional QR toggle. */
export type CardData = Template & { qr?: boolean };

export const templates: Template[] = [
  {
    id: "wc-bra-nor",
    match: "Brazil vs Norway",
    player: "Haaland",
    round: "Round of 16",
    matchNo: "Match 91",
    type: "Football",
    venue: "MetLife Stadium",
    city: "East Rutherford, NJ",
    date: "Sun Jul 5, 2026",
    time: "4:00 PM ET",
    dateISO: "2026-07-05T16:00:00-04:00",
    section: "122",
    row: "18",
    seat: "7",
    longDesc:
      "A holographic collector card for the Round of 16 at MetLife Stadium. Limited to 50,000 — a giftable keepsake of a night worth remembering.",
    recipient: "Alex",
    from: "Chen",
    label: "Matchday",
    message: "Surprise — we're going to the World Cup.",
    event: "Brazil vs Norway",
  },
  {
    id: "wc-arg-cv",
    match: "Argentina vs Cabo Verde",
    player: "Messi",
    round: "Round of 32",
    matchNo: "Match 86",
    type: "Football",
    venue: "Miami Stadium",
    city: "Miami Gardens, FL",
    date: "Fri Jul 3, 2026",
    time: "6:00 PM ET",
    dateISO: "2026-07-03T18:00:00-04:00",
    section: "122",
    row: "18",
    seat: "7",
    longDesc:
      "Miami under the lights for the Round of 32. A premium holographic ticket card made to be saved, framed, and remembered.",
    recipient: "Sam",
    from: "Jordan",
    label: "World Cup Gift",
    message: "For every match we watched together — this one is live.",
    event: "Argentina vs Cabo Verde",
  },
  {
    id: "wc-par-fra",
    match: "Paraguay vs France",
    player: "Mbappé",
    round: "Round of 16",
    matchNo: "Match 89",
    type: "Football",
    venue: "Philadelphia Stadium",
    city: "Philadelphia, PA",
    date: "Sat Jul 4, 2026",
    time: "5:00 PM ET",
    dateISO: "2026-07-04T17:00:00-04:00",
    section: "122",
    row: "18",
    seat: "7",
    longDesc:
      "A Fourth-of-July Round of 16 in Philadelphia. Collector-grade holographic finish, limited edition, and ready to gift.",
    recipient: "Taylor",
    from: "Casey",
    label: "Game Day",
    message: "Best seats in the house. Happy birthday — let’s go.",
    event: "Paraguay vs France",
  },
];

export const filters = [
  "All",
  "Brazil vs Norway",
  "Argentina vs Cabo Verde",
  "Paraguay vs France",
];

/** Derived, non-editable display fields for a template. */
export function augment(t: Template) {
  return {
    ...t,
    alt: `World Cup 2026 keepsake ticket card — ${t.match}, ${t.player}`,
    seatLine: `Sec ${t.section} · Row ${t.row} · Seat ${t.seat}`,
    tags: [t.round, t.player, "Limited edition"],
  };
}

export type AugmentedTemplate = ReturnType<typeof augment>;
