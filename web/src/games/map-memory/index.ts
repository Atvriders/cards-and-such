import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { MapMemoryState, MapMemoryAction, MapMemorySettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const MapMemoryGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.MapMemoryGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const mapMemoryPlugin: GamePlugin<MapMemoryState, MapMemoryAction, typeof settings> = {
  id: "map-memory", title: "Map Memory", category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Match cities with their countries.",
  howToPlay: "Map Memory tests city-country pairings across the world. Fifteen rounds each name a city and ask which of four candidate countries contains it. Cities span Paris (France), Tokyo (Japan), Rome (Italy), Berlin (Germany), Madrid (Spain), Cairo (Egypt), Lima (Peru), Oslo (Norway), Athens (Greece), Hanoi (Vietnam), Helsinki (Finland), Lisbon (Portugal), Vienna (Austria), Budapest (Hungary), Dublin (Ireland), Bangkok (Thailand), Cape Town (South Africa), and Ottawa (Canada) — capitals and major centers across six continents. Correct picks score ten points; max 150 across fifteen rounds. Geography buffs hit 130+; casual players 80-110. Distractors are drawn from the same country pool, so all four candidates are real countries. Hit Submit to lock, Next to advance. Map Memory makes a solid drill for school geography units and a casual challenge for trivia fans. A perfect score certifies your world-capitals knowledge — useful at any quiz night.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as MapMemorySettings),
  reducer, isTerminal, hint: (state: MapMemoryState): HintTarget | null => state.phase === "playing" ? { selector: '[data-testid="hint-target-map-memory-answer-0"]', pulses: 3 } : null, component: MapMemoryGame,
};
