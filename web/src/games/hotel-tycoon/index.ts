import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { HotelState, HotelAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const HotelTycoon = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.HotelTycoon as unknown as React.ComponentType<unknown> })));
export const hotelTycoonPlugin = {
  id: "hotel-tycoon",
  title: "Hotel Tycoon",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Manage a hotel over 20 weeks — set nightly rates, expand rooms, upgrade amenities and maximize occupancy!",
  howToPlay: `Hotel Tycoon puts you in charge of a small hotel for 20 weeks. Starting with 10 rooms and $600, grow your hotel into a thriving business by managing rates, capacity, and guest experience.

Each week you see the Season — Peak, Shoulder, or Off Season — which heavily affects traveler demand. Peak season brings high occupancy; off season requires smart pricing to attract guests.

Set your Nightly Rate ($40–$200). Higher rates earn more per room but reduce occupancy. Weekly Marketing ($0–$80) attracts more guests at a daily cost.

Invest between weeks: buy additional Rooms ($200 each, up to 30 total) to increase revenue capacity, or add Amenities ($100 each, up to 4) to boost your guest rating and attract more bookings. Guest Rating (1–5 stars) builds over time when occupancy is high.

Operating costs run $5 per room per night regardless of occupancy, so don't over-expand too early. Strategy: Match rates to season. Invest heavily in amenities to push rating up. Expand rooms during high seasons. Target $5000 cash by week 20!`,
  settings: {} as const,
  initialState: (seed: number) => initialState(seed),
  reducer: reducer as (state: HotelState, action: HotelAction) => HotelState,
  isTerminal,
  hint: (s: any) => { const p = (s as any).phase; if (p === "done" || p === "gameover" || p === "ended" || p === "finished" || (s as any).gameOver || (s as any).won || (s as any).complete || (s as any).isComplete) return null; return { selector: ".hotel-btn", pulses: 3 }; },
  component: HotelTycoon,
} as unknown as GamePlugin;
