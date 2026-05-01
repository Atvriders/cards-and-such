import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { CrazyPineappleState, CrazyPineappleAction, CrazyPineappleSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { CrazyPineappleGame } from "./Game.js";

const settings = {
  startingBankroll: { kind: "enum" as const, label: "Starting Stack", options: ["500", "1000", "5000"] as const, default: "1000" },
  smallBlind: { kind: "enum" as const, label: "Small Blind", options: ["5", "10", "25"] as const, default: "10" },
} as const;
type S = SettingsOf<typeof settings>;

export const crazyPineapplePlugin: GamePlugin<CrazyPineappleState, CrazyPineappleAction, typeof settings> = {
  id: "crazy-pineapple",
  title: "Crazy Pineapple",
  category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Heads-up Crazy Pineapple: 3 hole cards, discard one AFTER the flop.",
  howToPlay:
    "Crazy Pineapple plays exactly like Pineapple — except you discard after seeing the flop instead of before. This creates wild post-flop decisions: you've got more information, but so does every play that comes after.\n\nDeal → preflop betting → flop → DISCARD → turn → river → showdown.\n\nUse Fold/Check/Call/Raise. Click a hole card after the flop to discard it.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as CrazyPineappleSettings),
  reducer,
  isTerminal,
  component: CrazyPineappleGame,
};
