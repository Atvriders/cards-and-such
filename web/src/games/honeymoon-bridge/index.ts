import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { HoneymoonBridgeState, HoneymoonBridgeAction, HoneymoonBridgeSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { HoneymoonBridgeGame } from "./Game.js";
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const honeymoonBridgePlugin: GamePlugin<HoneymoonBridgeState, HoneymoonBridgeAction, typeof settings> = {
  id: "honeymoon-bridge", title: "Honeymoon Bridge", category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Two-hand bridge variant played by couples on long evenings.",
  howToPlay: "Honeymoon Bridge is the two-player version of Contract Bridge, designed for couples to play head-to-head without partners. Each player receives thirteen cards, with the remaining twenty-six dealt as a draw pile or as a face-up stock that players take turns selecting from. The auction proceeds normally — both players bid for the contract, choosing trump or no-trump and a tricks-target. After bidding, a phantom dummy may be revealed, or play may proceed with both hands concealed. Tricks follow standard bridge rules. In this six-round CPU duel, click Play Round to bid and play. Strategy: in two-handed bridge the cards are evenly split so suit voids are common — exploit them by leading short suits to ruff with trump. Bid only firm contracts since there is no partner to back you up. Aim for at least three made contracts across the match.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as HoneymoonBridgeSettings),
  reducer, isTerminal, component: HoneymoonBridgeGame,
};
