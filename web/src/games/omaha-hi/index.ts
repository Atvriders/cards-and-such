import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { OmahaHiState, OmahaHiAction, OmahaHiSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { OmahaHiGame } from "./Game.js";

const settings = {
  startingBankroll: { kind: "enum" as const, label: "Starting Stack", options: ["500", "1000", "5000"] as const, default: "1000" },
  smallBlind: { kind: "enum" as const, label: "Small Blind", options: ["5", "10", "25"] as const, default: "10" },
} as const;
type S = SettingsOf<typeof settings>;

export const omahaHiPlugin: GamePlugin<OmahaHiState, OmahaHiAction, typeof settings> = {
  id: "omaha-hi",
  title: "Omaha Hi",
  category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Heads-up Omaha Hi vs CPU. 4 hole cards, 5 community, must use exactly 2 hole + 3 board.",
  howToPlay:
    "Omaha Hi is a community-card poker game like Texas Hold'em, but with a twist: you receive FOUR hole cards and must use EXACTLY two of them plus EXACTLY three community cards to make your final five-card hand.\n\nBetting rounds: pre-flop, flop (3 cards), turn (1), river (1), then showdown. Standard high-hand rankings apply.\n\nUse Fold/Check/Call/Raise. Use the slider to size your raise. Beat the CPU over 8 hands to maximize your stack.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as OmahaHiSettings),
  reducer,
  isTerminal,
  component: OmahaHiGame,
};
