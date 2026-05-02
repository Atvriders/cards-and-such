import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { BikeRaceState, BikeRaceAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { BikeRaceGame } from "./Game.js";

export const bikeRaceSettings = {
  distance: {
    kind: "enum" as const,
    label: "Distance",
    options: ["500", "1000"] as const,
    default: "500" as const,
  },
} as const;

type BikeRaceSettingsType = SettingsOf<typeof bikeRaceSettings>;

export const bikeRacePlugin: GamePlugin<BikeRaceState, BikeRaceAction, typeof bikeRaceSettings> = {
  id: "bike-race",
  title: "Bike Race",
  category: "arcade",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Race your bike across 500m or 1000m, managing stamina over hills and obstacles.",
  howToPlay: `Bike Race is a stamina-management arcade game where you cycle a set distance as fast as possible without burning out.

Each turn you choose one of three actions. Pedal is a steady push that increases speed by 1 and costs 6 stamina on flat, 10 on uphill. Coast reduces speed by 1 but only drains 2 stamina — great for recovery. Sprint adds 3 to speed and advances you the furthest, but costs 20 stamina. Sprint is disabled when your stamina drops below 20.

Terrain changes as you ride. Flat sections are neutral. Uphill sections drain more stamina from pedaling but are manageable. Downhill adds an extra +2 speed bonus when you Pedal. Obstacle sections have a 35% chance of slowing you down and costing extra stamina.

Watch the stamina bar carefully. If you hit zero, your speed drops and you risk a DNF. Finishing the race earns a base of 500 points plus up to 500 bonus points for remaining stamina — so conserving energy pays off. A DNF earns partial points based on distance covered.

Race is 500m or 1000m depending on your chosen setting. Plan your sprints for flat and downhill sections, and take it easy going uphill.`,
  settings: bikeRaceSettings,
  initialState: (seed: number, settings: BikeRaceSettingsType) => initialState(seed, settings),
  reducer,
  isTerminal,
  hint: (s: any) => { const p = (s as any).phase; if (p === "gameover" || p === "done" || p === "ended" || (s as any).gameOver) return null; return { selector: '[data-testid="hint-target-bike-race-action"]', pulses: 3 }; },
  component: BikeRaceGame,
};
