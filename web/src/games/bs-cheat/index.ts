import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { BsCheatState, BsCheatAction, BsCheatSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const BsCheatGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.BsCheatGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const bsCheatPlugin: GamePlugin<BsCheatState, BsCheatAction, typeof settings> = {
  id: "bs-cheat", title: "BS (Cheat)", category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Cheat: bluff your card, see if CPU calls; high card wins anyway.",
  howToPlay: "BS — also called Cheat — is a game of bluffing about ranks played. In this mini-version, you and the CPU each face-down play one card, and the round is decided by who actually has the higher rank, regardless of what either claimed. The bluff is implicit.\n\nEach round, both players \"play\" a card (drawn at random). Higher rank wins. Aces high, twos low. Suit is irrelevant.\n\nScoring: round win awards 12 points (the bigger payout reflects the swingy nature of bluff games). Tie awards 4 sympathy points. Loss awards zero.\n\nNine rounds total. Expected score around 55-75 points; lucky runs cross 90.\n\nThe full BS / Cheat game involves players claiming sequential ranks while passing cards to the center, with calls of \"Bullshit!\" forcing reveals. Calling falsely punishes the caller; calling truly punishes the bluffer. This mini version captures the gambling-on-cards energy with a quick rank-reveal mechanic. No name-calling required, just the rolling deal.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as BsCheatSettings),
  reducer, isTerminal, hint: (state: BsCheatState): HintTarget | null => (state.phase === "ready" ? { selector: '[data-testid="hint-target-bs-cheat-primary"]', pulses: 3 } : null), component: BsCheatGame,
};
