import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { hpDarkArtsState, hpDarkArtsAction, hpDarkArtsSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { hpDarkArtsGame } from "./Game.js";
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const hpDarkArtsPlugin: GamePlugin<hpDarkArtsState, hpDarkArtsAction, typeof settings> = {
  id: "hp-dark-arts",
  title: "HP: Defence Against the Dark Arts",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Cooperative HP duel — Hogwarts students against dark forces over ten rounds.",
  howToPlay: "Harry Potter: Defence Against the Dark Arts is the cooperative dueling variant of Hogwarts Battle distilled to ten dice rounds. You and your AI partner are wizards-in-training facing dark spell after dark spell.\n\nEach round, press Play Round. Two dice tumble and their sum (2-12) joins your defence-spell score. Press Next Round to advance, Finish on round ten.\n\nThe Hogwarts defence target is 70. Reach it and the dark magic is repelled with a +50 House Cup bonus. Miss it and the school feels the bite of dark magic, but you graduate next year.\n\nThe original Hogwarts Battle: Defence Against the Dark Arts is a competitive 2-player duel; this distillation flips it to cooperative dice survival across ten rounds. The original has spell cards, hero abilities, and the seven-book progression. This adaptation preserves the cooperative dueling feel without the deck-building complexity. Solid duelists score around 70; star students push 80+; struggling pairs end at 60.\n\nWand at the ready — let the dice cast your defences.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as hpDarkArtsSettings),
  reducer, isTerminal, hint: (state: hpDarkArtsState): HintTarget | null => ((state.phase === "ready" || state.phase === "rolled") ? { selector: ".coop-btn", pulses: 3 } : null), component: hpDarkArtsGame,
};
