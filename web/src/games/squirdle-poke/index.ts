import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { SquirdlePokeState, SquirdlePokeAction, SquirdlePokeSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const SquirdlePokeGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.SquirdlePokeGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const squirdlePokePlugin: GamePlugin<SquirdlePokeState, SquirdlePokeAction, typeof settings> = {
  id: "squirdle-poke", title: "Squirdle Pokemon", category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Match Pokemon to their primary type.",
  howToPlay: "Squirdle Pokemon tests Pokemon type knowledge. Each of fifteen rounds names a Pokemon and asks which is its primary type. Pick from four candidate types, hit Submit, score ten points. Max 150 points across fifteen rounds. The Pokemon pool covers Pikachu (Electric), Bulbasaur (Grass), Charmander (Fire), Squirtle (Water), Eevee (Normal), Snorlax (Normal), Gengar (Ghost), Machop (Fighting), Onix (Rock), Magikarp (Water), Mewtwo (Psychic), Dragonite (Dragon), Jigglypuff (Normal), Mr. Mime (Psychic), Snubbull (Fairy), Sneasel (Dark), Skarmory (Steel), and Lugia (Psychic) — eighteen Pokemon spanning original Kanto and beyond. Pokemon fans hit 130+; casual players 80-110. The original Squirdle uses multi-stat columns; this version focuses on primary type alone. Distractor types come from the eighteen-type roster. Hit Submit to lock and Next to advance through all fifteen rounds. Total run is about a minute and a half. A perfect score certifies type-chart fluency for competitive battling.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as SquirdlePokeSettings),
  reducer, isTerminal, hint: (state: SquirdlePokeState): HintTarget | null => state.phase === "playing" ? { selector: '[data-testid="hint-target-squirdle-poke-answer-0"]', pulses: 3 } : null, component: SquirdlePokeGame,
};
