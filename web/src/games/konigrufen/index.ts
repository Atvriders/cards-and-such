import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { KonigrufenState, KonigrufenAction, KonigrufenSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { KonigrufenGame } from "./Game.js";
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const konigrufenPlugin: GamePlugin<KonigrufenState, KonigrufenAction, typeof settings> = {
  id: "konigrufen", title: "Königrufen", category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Austrian Tarot — the king-calling partnership variant.",
  howToPlay: "Königrufen, also called Königsrufen, is the Austrian national Tarot game — a four-handed partnership Tarot played with a fifty-four card deck. The declarer wins the auction and then calls a specific king, the holder of which becomes the silent partner for that hand. Trumps and bonuses (Pagat, Uhu, Kakadu, Trull) reward specific finishing tricks with the lowest trumps. In this simplified one-on-one duel against the CPU you click Play Round to bid and play twelve-card hands across six rounds. Strategy: when the CPU is declarer, hold back high trumps to capture the Pagat (one of trumps) for bonus points. When you declare, call a king matching your strongest side suit. Aim to make contract in at least three of six rounds. A total above four hundred points is a strong Königrufen finish.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as KonigrufenSettings),
  reducer, isTerminal, component: KonigrufenGame,
};
