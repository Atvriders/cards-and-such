import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { FiveStudPokerState, FiveStudPokerAction, FiveStudPokerSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { FiveStudPokerGame } from "./Game.js";

const settings = {
  startingBankroll: { kind: "enum" as const, label: "Starting Stack", options: ["500", "1000", "5000"] as const, default: "1000" },
  ante: { kind: "enum" as const, label: "Ante", options: ["5", "10", "25"] as const, default: "10" },
} as const;
type S = SettingsOf<typeof settings>;

export const fiveStudPokerPlugin: GamePlugin<FiveStudPokerState, FiveStudPokerAction, typeof settings> = {
  id: "five-stud-poker",
  title: "5-Card Stud",
  category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Heads-up 5-Card Stud: 1 down + 4 up cards dealt over 4 streets with betting between.",
  howToPlay:
    "5-Card Stud is the original stud poker game. Each player gets one face-down card and a face-up card to start, then receives an additional face-up card on each of three subsequent streets — five cards total.\n\nBetting occurs after each deal. The CPU's hole card stays hidden until showdown; everything else is visible. Best 5-card poker hand wins.\n\nUse Fold/Check/Call/Raise.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as FiveStudPokerSettings),
  reducer,
  isTerminal,
  component: FiveStudPokerGame,
};
