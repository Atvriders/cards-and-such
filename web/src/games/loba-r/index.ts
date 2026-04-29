import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { LobaRState, LobaRAction, LobaRSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { LobaRGame } from "./Game.js";
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const lobaRPlugin: GamePlugin<LobaRState, LobaRAction, typeof settings> = {
  id: "loba-r", title: "Loba", category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "South American Canasta-family rummy with shorter hands.",
  howToPlay: "Loba is a South American rummy in the Canasta family, typically played with shorter hands than full Canasta — nine cards is common — making it faster-paced and punchier. Partners or solo players race to complete sequences and sets.\n\nIn this single-player drill, six rounds are played from a nine-card hand. The engine auto-melds your hand into rank-sets and same-suit runs. Aces count one for value, pip cards face value, faces count ten. Sets are three-or-more matching ranks; runs are three-or-more consecutive same-suit cards.\n\nA matched meld pays eighteen base plus six per extra card. With no melds you collect a small consolation. Going out earns thirty bonus.\n\nExpected score across six rounds is sixty to ninety-five. Loba's brisk pace is approximated by the smaller hand size — every card matters more. Aim for two melds in most rounds; even one long sequence plus a triple in any single round can push you toward the high end of the band.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as LobaRSettings),
  reducer, isTerminal, component: LobaRGame,
};
