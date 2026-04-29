import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { RubiconBeziqueState, RubiconBeziqueAction, RubiconBeziqueSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { RubiconBeziqueGame } from "./Game.js";
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const rubiconBeziquePlugin: GamePlugin<RubiconBeziqueState, RubiconBeziqueAction, typeof settings> = {
  id: "rubicon-bezique", title: "Rubicon Bezique", category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Two-deck melding trick game extended with rubicon scoring.",
  howToPlay: "Rubicon Bezique is the four-deck variant of Bezique, a two-handed melding and trick-taking classic that is the direct ancestor of Pinochle. Each round you race against the CPU to score points by capturing brisques (aces and tens) and declaring melds — bezique pairs, sequences, and four-of-a-kinds. The trump suit changes each round and special rubicon scoring rewards finishing above one thousand points and penalizes any player who falls below it. In this six-round duel you click Play Round to draw, play tricks, and meld; results sum into your final score. Strategy hinges on holding back queens of spades and jacks of diamonds (the bezique pair) until you can declare them, while still capturing brisques. Aim for at least three rounds where you cross the rubicon. A finishing score above five hundred is solid.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as RubiconBeziqueSettings),
  reducer, isTerminal, component: RubiconBeziqueGame,
};
