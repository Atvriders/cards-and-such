import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { MarryBoffKillState, MarryBoffKillAction, MarryBoffKillSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const MarryBoffKillGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.MarryBoffKillGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const marryBoffKillPlugin: GamePlugin<MarryBoffKillState, MarryBoffKillAction, typeof settings> = {
  id: "marry-boff-kill", title: "Marry Boff Kill", category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Match each iconic trio with which member to marry, boff, or kill.",
  howToPlay: "Marry Boff Kill is a tongue-in-cheek party micro-quiz built around the classic 'Marry, Boff, Kill' party prompt. Each round shows you a famous trio (three celebrities, characters, or icons) and a question asking who fits a specific outcome based on a popular consensus reading. Pick from four candidates including a few additions, hit Submit, and see if your party-vibe matches the official answer key. Scoring is straightforward: ten points per correct read across twelve rounds for a max of 120 points. The trios pull from movie casts, music groups, sitcoms, and tabloid pairings, so this works as a fun trivia warm-up at parties or game nights. Of course there's no objectively right answer in real Marry Boff Kill — but for our quiz the dataset locks one canonical pick per round to keep scoring clean. Average is around 70 points; trivia heads who watch a lot of pop-culture shows tend to land near 100. Quick and silly.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as MarryBoffKillSettings),
  reducer, isTerminal, hint: (state: MarryBoffKillState): HintTarget | null => state.phase === "playing" ? { selector: '[data-testid="hint-target-marry-boff-kill-answer-0"]', pulses: 3 } : null, component: MarryBoffKillGame,
};
