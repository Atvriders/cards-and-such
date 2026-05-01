import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { PineappleOfcState, PineappleOfcAction, PineappleOfcSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { PineappleOfcGame } from "./Game.js";

const settings = {
  rounds: { kind: "enum" as const, label: "Rounds", options: ["1", "3", "5"] as const, default: "3" },
} as const;
type S = SettingsOf<typeof settings>;

export const pineappleOfcPlugin: GamePlugin<PineappleOfcState, PineappleOfcAction, typeof settings> = {
  id: "pineapple-ofc",
  title: "Pineapple OFC",
  category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Pineapple OFC: deal 5 then 3 each draw, discard 1 of 3, build a valid OFC layout.",
  howToPlay:
    "Pineapple OFC is OFC with a draw-and-discard mechanic. Each hand:\n\n1. You're dealt 5 cards. Place all 5 across top/middle/bottom.\n2. Draw 3 cards. Place 2 and discard 1.\n3. Repeat step 2 four times until your board has 13 placed cards (3 top / 5 mid / 5 bot).\n\nYour board must remain valid — bottom >= middle >= top — or you foul. Standard OFC scoring: 1 point per row won; sweep bonus +3.\n\nFor each card in hand, click the row (Top / Mid / Bot) to place it. After placing 2 of 3, click a card to discard.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as PineappleOfcSettings),
  reducer,
  isTerminal,
  component: PineappleOfcGame,
};
