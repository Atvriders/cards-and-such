import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { ConquianRState, ConquianRAction, ConquianRSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { ConquianRGame } from "./Game.js";
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const conquianRPlugin: GamePlugin<ConquianRState, ConquianRAction, typeof settings> = {
  id: "conquian-r", title: "Conquian", category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Mexican two-player rummy classic, ancestor of modern rummy.",
  howToPlay: "Conquian is a Mexican two-player rummy widely regarded as the historical ancestor of all modern rummy games. Players form sets and runs from an eight-card hand and race to be first to meld their entire hand.\n\nIn this single-player drill, seven rounds are played from an eight-card hand. The engine auto-melds your hand into rank-sets and same-suit runs. Aces count one for value, pip cards face value, faces count ten. Sets are three-or-more matching ranks; runs are three-or-more consecutive same-suit cards.\n\nA matched meld pays eighteen base plus six per extra card. With no melds you collect a small consolation. Going out (clearing the hand) earns thirty bonus.\n\nExpected score across seven rounds is sixty-five to one hundred and five. Conquian's lean eight-card hand makes for a precise scoring drill — every card is meaningful. Two consistent melds per round paired with one out across the seven-round set targets the upper band.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as ConquianRSettings),
  reducer, isTerminal, component: ConquianRGame,
};
