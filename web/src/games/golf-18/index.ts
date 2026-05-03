import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin } from "../../platform/game-plugin/types.js";
import { initialState, reducer, isTerminal, type Golf18State, type Golf18Action } from "./state.js";
const Golf18 = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.Golf18 as unknown as React.ComponentType<unknown> })));
export const golf18Settings = {
  difficulty: { kind: "enum" as const, label: "Difficulty", options: ["easy", "medium", "hard"] as const, default: "medium" as const },
} as const;

export const golf18Plugin: GamePlugin<Golf18State, Golf18Action, typeof golf18Settings> = {
  id: "golf-18",
  title: "Golf — 18 Holes",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Full 18-hole round with driver, iron, wedge, and putter. Navigate fairways, rough, and sand.",
  howToPlay: `Golf — 18 Holes puts you on a full regulation course. Each of the 18 holes has a designated par (3, 4, or 5) and a starting distance in yards. Your goal is to complete all 18 holes in as few strokes as possible relative to par.

Before each shot, choose a club: Driver (200 yds max, for long distances), Iron (140 yds, all-around), Wedge (80 yds, for close approach shots), or Putter (30 yds, for the green). Select based on your remaining distance.

Then set your Angle (center = straight, deviation curves left or right) and Power (75% is ideal baseline). Click Swing! Your shot travels based on quality, terrain, and randomness. Terrain affects distance: tee and fairway give full range, rough reduces it, sand cuts it heavily. Poor angle over hazard zones may trigger a water hazard — adding a penalty stroke and yards.

Holing out awards Eagle, Birdie, Par, Bogey, etc. You have up to 12 strokes per hole. Final score = 1000 + 30 per stroke under par (or −30 per over). Difficulty controls how forgiving the angle/power physics are.`,
  settings: golf18Settings,
  initialState,
  reducer,
  isTerminal,
  hint: (s: any) => { const p = (s as any).phase; if (p === "done" || p === "gameover" || p === "ended" || p === "finished" || (s as any).gameOver || (s as any).won || (s as any).complete || (s as any).isComplete) return null; return { selector: ".g18-btn-sec", pulses: 3 }; },
  component: Golf18,
};
