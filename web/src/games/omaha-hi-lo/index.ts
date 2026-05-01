import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { OmahaHiLoState, OmahaHiLoAction, OmahaHiLoSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { OmahaHiLoGame } from "./Game.js";

const settings = {
  startingBankroll: { kind: "enum" as const, label: "Starting Stack", options: ["500", "1000", "5000"] as const, default: "1000" },
  smallBlind: { kind: "enum" as const, label: "Small Blind", options: ["5", "10", "25"] as const, default: "10" },
} as const;
type S = SettingsOf<typeof settings>;

export const omahaHiLoPlugin: GamePlugin<OmahaHiLoState, OmahaHiLoAction, typeof settings> = {
  id: "omaha-hi-lo",
  title: "Omaha Hi-Lo",
  category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Heads-up Omaha 8-or-Better: split pot between best high and best 8-or-better low.",
  howToPlay:
    "Omaha Hi-Lo (also called Omaha 8-or-Better) is a split-pot variant. Half the pot goes to the best high hand and half to the best A-5 lowball hand 8-or-better. Players use EXACTLY 2 of their 4 hole cards and EXACTLY 3 community cards — the same 2+3 rule applies for both halves and you can use different cards for each.\n\nIf no qualifying low exists, the high hand wins the entire pot.\n\nUse Fold/Check/Call/Raise; the bet slider sizes raises in small-blind increments.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as OmahaHiLoSettings),
  reducer,
  isTerminal,
  component: OmahaHiLoGame,
};
