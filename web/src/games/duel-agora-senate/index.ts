import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { DuelAgoraSenateState, DuelAgoraSenateAction, DuelAgoraSenateSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { DuelAgoraSenateGame } from "./Game.js";

const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;

export const duelAgoraSenatePlugin: GamePlugin<DuelAgoraSenateState, DuelAgoraSenateAction, typeof settings> = {
  id: "duel-agora-senate",
  title: "7 Wonders Duel: Agora",
  category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Senate political intrigue in two-player draft.",
  howToPlay: "7 Wonders Duel: Agora is a homage to the Antoine Bauza and Bruno Cathala expansion that adds a Senate chamber and political decree cards to the two-player Duel structure. Each round three cards appear: pick one, the CPU takes the highest of the rest. Across eight rounds you build a tableau. Three of one suit earn +10 (a senate seat); five earn an additional +15 (a chamber majority). Pairs of rank earn +5 (a passed decree); three-of-a-kind +10 (a vetoed rival decree). Raw ranks sum as influence. Score equals tableau total plus +25 for beating the CPU. Strategy: the political layer rewards opportunistic denial — block the CPU's preferred suit at high ranks. Aim for 70-110 with the bonus.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as DuelAgoraSenateSettings),
  reducer,
  isTerminal,
  component: DuelAgoraSenateGame,
};
