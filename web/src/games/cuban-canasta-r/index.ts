import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { CubanCanastaRState, CubanCanastaRAction, CubanCanastaRSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { CubanCanastaRGame } from "./Game.js";
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const cubanCanastaRPlugin: GamePlugin<CubanCanastaRState, CubanCanastaRAction, typeof settings> = {
  id: "cuban-canasta-r", title: "Cuban Canasta", category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Canasta variant with reward rules for special card combinations.",
  howToPlay: "Cuban Canasta is a Canasta variant featuring special reward rules for specific card combinations, such as bonuses for melds containing both red threes and twos. The variant adds Caribbean flair to traditional scoring.\n\nIn this single-player drill, five rounds are played from an eleven-card hand. The engine auto-melds your hand into rank-sets and same-suit runs. Aces count one for value, pip cards face value, faces count ten. Sets are three-or-more matching ranks; runs are three-or-more consecutive same-suit cards.\n\nA matched meld pays eighteen base plus six per extra card. With no melds you receive a small consolation. Going out earns thirty bonus. Long melds compound — a seven-card canasta-equivalent pays forty-two.\n\nExpected score across five rounds is sixty-five to one hundred and ten. Cuban's reward-rule flavour is approximated by the consistent meld bonuses; play disciplined and steady. Three melds in any round is a strong showing; two in every round is the path to the upper band.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as CubanCanastaRSettings),
  reducer, isTerminal, component: CubanCanastaRGame,
};
