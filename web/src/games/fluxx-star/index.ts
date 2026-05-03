import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { FluxxStarState, FluxxStarAction, FluxxStarSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const FluxxStarGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.FluxxStarGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const fluxxStarPlugin: GamePlugin<FluxxStarState, FluxxStarAction, typeof settings> = {
  id: "fluxx-star", title: "Star Fluxx", category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Star Fluxx variant trivia. Identify which sci-fi card belongs in the deck.",
  howToPlay: "Star Fluxx tests your knowledge of the sci-fi-themed Fluxx variant. Each round names a card and asks which type (Keeper, Goal, Action, New Rule, or Creeper) it occupies in Star Fluxx's deck. Twelve rounds, ten points each, 120 max. Star Fluxx was published in 2011 by Looney Labs and adds Creepers like Robot Overlord and Time Anomaly to the Fluxx lineup. Keepers include Spaceship, Robot, Alien, Astronaut and Wormhole. Goals tie them: 'Galactic Federation' (Spaceship + Astronaut), 'It Came from Outer Space' (Alien + Spaceship). Sci-fi fans and Fluxx fans both find Star Fluxx the most welcoming entry point and routinely score 100+. Casual quizzers expect 60-80. Two-minute run. Submit and Next on each round. Star Fluxx's sci-fi flavour scratches the same itch as Star Trek and Star Wars without being licensed — it's pure pulp space-opera tribute baked into the chaotic Fluxx framework.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as FluxxStarSettings),
  reducer, isTerminal, hint: (state: FluxxStarState): HintTarget | null => state.phase === "playing" ? { selector: '[data-testid="hint-target-fluxx-star-answer-0"]', pulses: 3 } : null, component: FluxxStarGame,
};
