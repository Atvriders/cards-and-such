import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { MilleBornesState, MilleBornesAction, MilleBornesSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { MilleBornesGame } from "./Game.js";
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const milleBornesPlugin: GamePlugin<MilleBornesState, MilleBornesAction, typeof settings> = {
  id: "mille-bornes", title: "Mille Bornes", category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "French road-trip card game: pile up kilometers vs CPU.",
  howToPlay: "Mille Bornes (literally \"a thousand milestones\" in French) is a classic road-trip card game where players accumulate kilometer cards while sabotaging opponents with hazards. This mini-version frames a road race as 12 kilometer-card duels against the CPU.\n\nEach round (each \"kilometer\"), you and the CPU each draw one card. Higher rank wins (you drove farther this round). Aces high (13), twos low (1). Suit is ignored.\n\nScoring: round win awards 9 points. Tie awards 3 sympathy points. Loss awards zero.\n\nTwelve rounds total. Expected score: 45-65 points; lucky runs cross 75.\n\nThe full Mille Bornes has special hazard cards (Flat Tire, Out of Gas, Speed Limit) and remedies, plus distance cards from 25-200 km. Win by crossing 1000 km cumulatively. This mini distills the ride-it-out feel without the hazard-and-remedy bookkeeping. A clean, smooth taste of the 1954 French classic from the Edmond Dujardin design.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as MilleBornesSettings),
  reducer, isTerminal, component: MilleBornesGame,
};
