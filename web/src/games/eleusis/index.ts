import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { EleusisState, EleusisAction, EleusisSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { EleusisGame } from "./Game.js";
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const eleusisPlugin: GamePlugin<EleusisState, EleusisAction, typeof settings> = {
  id: "eleusis", title: "Eleusis", category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Inductive card game: guess the secret rule by drawing cards.",
  howToPlay: "Eleusis is a brilliant 1956 card game by Robert Abbott where one player invents a secret rule and others must induce it through trial-and-error play. This mini-version reduces the inductive challenge to a 10-round high-card test: each round, your card is \"right\" if higher than the CPU's.\n\nEach round, you and the CPU each draw one card. Higher rank wins (your placement matched the implicit rule). Aces high (13), twos low (1). Suit is ignored.\n\nScoring: round win awards 10 points. Tie awards 4 sympathy points. Loss awards zero.\n\nTen rounds total. Expected score: 45-65 points; lucky runs cross 75.\n\nThe full Eleusis uses a \"high priest\" who knows the rule, a play-line of cards, and side-line cards for rejected plays. Players score for correct induction. Robert Abbott called it \"the scientific method as a game.\" This mini bypasses the induction and just rolls high cards — a tribute, not a faithful clone.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as EleusisSettings),
  reducer, isTerminal, component: EleusisGame,
};
