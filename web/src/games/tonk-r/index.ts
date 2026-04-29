import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { TonkRState, TonkRAction, TonkRSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { TonkRGame } from "./Game.js";
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const tonkRPlugin: GamePlugin<TonkRState, TonkRAction, typeof settings> = {
  id: "tonk-r", title: "Tonk", category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Fast US knock-rummy with aggressive scoring.",
  howToPlay: "Tonk (Tunk) is a fast knock-rummy popular in the United States, especially in jazz and barbershop circles. Players race to lay down melds and reach a low deadwood total, knocking to end the round.\n\nIn this single-player drill, eight rounds are played from a seven-card hand. The engine auto-melds your hand into sets and runs. Aces count one for value, pip cards face value, faces count ten. Sets are three-or-more of a rank; runs are three-or-more consecutive same-suit cards.\n\nA matched meld pays eighteen base plus six per extra card. With no melds you collect a small consolation. Going out (zero deadwood) earns thirty bonus.\n\nExpected score across eight rounds is seventy to one hundred and ten. Tonk's fast-paced rummy core is well suited to the auto-meld drill — every round is a fresh opportunity to lock in points. Two melds per round is the consistent path to the upper band; one out across the eight-round set is realistic.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as TonkRSettings),
  reducer, isTerminal, component: TonkRGame,
};
