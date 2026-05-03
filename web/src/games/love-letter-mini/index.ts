import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { LoveLetterMiniState, LoveLetterMiniAction, LoveLetterMiniSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const LoveLetterMiniGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.LoveLetterMiniGame as unknown as React.ComponentType<unknown> })));
const settings = {
  rounds: { kind: "enum" as const, label: "Rounds", options: ["10"] as const, default: "10" as const },
} as const;
type S = SettingsOf<typeof settings>;

export const loveLetterMiniPlugin: GamePlugin<LoveLetterMiniState, LoveLetterMiniAction, typeof settings> = {
  id: "love-letter-mini",
  title: "Love Letter Mini",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: `Solo Love Letter: CPU plays a Guard guessing your card — bluff or be honest.`,
  howToPlay: `Love Letter is a tiny 16-card deduction game. Each round you hold one card; opponents play one card each turn that affects who's still in the running to deliver a love letter to the Princess.

In this solo adaptation, the CPU plays a card and announces an effect (often a Guard guessing your held card). You hold a hidden card; the CPU's announcement may match it (truthful) or be a deliberate bluff to bait you. Decide whether to trust the announcement or call bluff before the reveal.

Calm CPUs are usually telling the truth about their effect; nervous CPUs are more likely bluffing.

Ten rounds, 100 points per correct call, 1000 max. Mastery here translates to better bluff-detection in the real game.

Tips: in actual Love Letter, the Guard (1) is played most often. Watch for over-claimed Princesses (8) and Kings (6) — those are usually bluffs since they're rare cards. Trust mid-deck claims like Priest (2) and Baron (3) more readily.`,
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as LoveLetterMiniSettings),
  reducer,
  isTerminal,
  hint: (s: any) => { const p = (s as any).phase; if (p === "done" || p === "gameover" || p === "ended" || p === "finished" || (s as any).gameOver || (s as any).won || (s as any).complete || (s as any).isComplete) return null; return { selector: ".bluff-btn", pulses: 3 }; },
  component: LoveLetterMiniGame,
};
