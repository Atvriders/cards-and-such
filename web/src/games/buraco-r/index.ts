import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { BuracoRState, BuracoRAction, BuracoRSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { BuracoRGame } from "./Game.js";
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const buracoRPlugin: GamePlugin<BuracoRState, BuracoRAction, typeof settings> = {
  id: "buraco-r", title: "Buraco", category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Brazilian/Italian partnership rummy with sets and sequences.",
  howToPlay: "Buraco is a Brazilian and Italian rummy in the Canasta family. Players form sets (three-or-more of a rank) and sequences (three-or-more same-suit consecutive). A canasta of seven cards earns major bonuses, and clean canastas (no wilds) pay even more.\n\nIn this single-player drill, five rounds are played from an eleven-card hand. The engine auto-melds your hand into sets and runs. Aces count one for value, pip cards face value, faces count ten. A seven-card canasta-equivalent pays forty-two points as a single chunk.\n\nA matched meld pays eighteen base plus six per extra card. With no melds you collect a small consolation. Going out earns thirty bonus.\n\nExpected score across five rounds is sixty to one hundred and five. Buraco's signature canasta payoff is well captured by the auto-meld engine, which extends sequences whenever possible. Aim for at least one canasta-length meld; combine it with two filler sets each round for the upper band.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as BuracoRSettings),
  reducer, isTerminal, component: BuracoRGame,
};
