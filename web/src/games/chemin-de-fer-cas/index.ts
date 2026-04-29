import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { CheminDeFerCasState, CheminDeFerCasAction, CheminDeFerCasSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { CheminDeFerCasGame } from "./Game.js";
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const cheminDeFerCasPlugin: GamePlugin<CheminDeFerCasState, CheminDeFerCasAction, typeof settings> = {
  id: "chemin-de-fer-cas", title: "Chemin de Fer", category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Player-banked Baccarat variant where players take turns as bank.",
  howToPlay: "Chemin de Fer is the player-banked variant of Baccarat in which the role of the bank rotates among players. Each round, the active banker holds the bank against the other players. The variant is played extensively in European casinos.\n\nIn this single-player adaptation you play twelve rounds. Each round you and the dealer (acting as banker) draw three cards each. The comparison uses sum-of-rank, aces high. You may play (compare) or fold (forfeit).\n\nA win pays fourteen points (with a king-high bonus of three); a tie pays five; a fold pays zero. Twelve rounds are played.\n\nExpected score across twelve rounds is sixty to ninety. Chemin de Fer's banker rotation is approximated by the consistent confrontation — every round is essentially the same competitive frame. Fold obvious losers, play average-or-better. A king-high winning hand puts you on track for the upper band; aim for at least one across the set.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as CheminDeFerCasSettings),
  reducer, isTerminal, component: CheminDeFerCasGame,
};
