import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { MultiHandVpFiveState, MultiHandVpFiveAction, MultiHandVpFiveSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { MultiHandVpFiveGame } from "./Game.js";
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const multiHandVpFivePlugin: GamePlugin<MultiHandVpFiveState, MultiHandVpFiveAction, typeof settings> = {
  id: "multi-hand-vp-five", title: "Five-Hand Video Poker", category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Video poker playing five hands per deal.",
  howToPlay: "Multi-Hand Video Poker (specifically the five-hand variant) lets you play five draw-poker hands simultaneously per deal, multiplying the round volume. Each hand is independent and pays the standard pay-table for its result.\n\nIn this single-stream adaptation the multi-hand intensity is reproduced via twelve rounds at the standard pay-table. Each round the engine deals five cards and pays out using a poker-rank schedule: pair of jacks-or-better one point, two pair two, three-of-a-kind three, straight four, flush six, full house nine, four-of-a-kind twenty-five, straight flush fifty, royal flush two hundred and fifty.\n\nLow pairs pay nothing.\n\nExpected score across twelve rounds is twenty-five to fifty. Multi-hand's signature is volume — more rounds means more shots at the long tail. A four-of-a-kind in the twelve-round set is realistic; a straight flush is a meaningful bonus. The royal flush is rare enough to be a once-per-many-sessions event.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as MultiHandVpFiveSettings),
  reducer, isTerminal, component: MultiHandVpFiveGame,
};
