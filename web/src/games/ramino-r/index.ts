import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { RaminoRState, RaminoRAction, RaminoRSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { RaminoRGame } from "./Game.js";
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const raminoRPlugin: GamePlugin<RaminoRState, RaminoRAction, typeof settings> = {
  id: "ramino-r", title: "Ramino", category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Italian rummy family classic with tight melding rules.",
  howToPlay: "Ramino is the Italian family of rummy, played widely in Italy and parts of Switzerland. The rules sit between Gin Rummy and Canasta — players form melds and discard to a face-up pile, often with multiple decks for a deeper card pool.\n\nIn this single-player drill, five rounds are played from an eleven-card hand. The engine auto-melds your hand into rank-sets and same-suit runs. Aces count one for value, pip cards face value, faces count ten. Sets are three-or-more of a rank; runs are three-or-more consecutive same-suit cards.\n\nA matched meld pays eighteen base plus six per extra card. With no melds you collect a small consolation. Going out earns thirty bonus.\n\nExpected score across five rounds is sixty-five to one hundred and ten. Ramino's deeper hand favours run-heavy play; long sequences pay handsomely. Aim for one canasta-length sequence (forty-two points alone) plus filler sets each round to push toward the high end of the band.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as RaminoRSettings),
  reducer, isTerminal, component: RaminoRGame,
};
