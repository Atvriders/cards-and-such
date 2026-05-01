import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { PineapplePokerState, PineapplePokerAction, PineapplePokerSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { PineapplePokerGame } from "./Game.js";

const settings = {
  startingBankroll: { kind: "enum" as const, label: "Starting Stack", options: ["500", "1000", "5000"] as const, default: "1000" },
  smallBlind: { kind: "enum" as const, label: "Small Blind", options: ["5", "10", "25"] as const, default: "10" },
} as const;
type S = SettingsOf<typeof settings>;

export const pineapplePokerPlugin: GamePlugin<PineapplePokerState, PineapplePokerAction, typeof settings> = {
  id: "pineapple-poker",
  title: "Pineapple",
  category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Heads-up Pineapple: 3 hole cards, discard 1 before the flop, then play like Hold'em.",
  howToPlay:
    "Pineapple is a Hold'em variant where each player receives THREE hole cards. Before the flop is dealt, you must discard one — leaving the standard 2 hole cards used through the rest of the hand. Click on a hole card to discard it.\n\nFrom there it plays exactly like Texas Hold'em: flop, turn, river, betting on each street, then showdown. Your final hand uses your best 5 cards from the 2 hole + 5 board (any combination).\n\nUse Fold/Check/Call/Raise. Beat the CPU over 8 hands.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as PineapplePokerSettings),
  reducer,
  isTerminal,
  component: PineapplePokerGame,
};
