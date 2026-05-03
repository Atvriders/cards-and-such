import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { TaxiState, TaxiAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { TaxiDriverGame } from "./Game.js";

export const taxiDriverPlugin = {
  id: "taxi-driver",
  title: "Taxi Driver Sim",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Drive a taxi across 20 shifts — pick zones, earn fares and tips, and manage your fuel!",
  howToPlay: `Taxi Driver Sim puts you behind the wheel of a cab for 20 shifts. Each shift you choose a destination zone to pick up passengers, balancing fare potential against fuel consumption.

Four zones are available: Downtown offers quick short trips with moderate pay. The Airport gives the biggest fares but burns the most fuel. Suburbs pay steadily with average fuel use. The Harbor sits in between with decent tip chances.

Each zone has a base fare that varies slightly each shift. Passengers sometimes tip — airport riders are the most generous. On rare occasions (10% chance) no passenger shows up, wasting only your fuel.

Watch your fuel gauge carefully. You start with a full tank of 20 units. If a zone would cost more fuel than you have, you cannot pick it. Use the Refuel button ($15) when fuel runs low — but only during the planning phase.

After each ride you see what you earned, then click Next Shift to continue. Your final score is based on total cash earned by shift 20. Aim for $400 to max your score!`,
  settings: {} as const,
  initialState: (seed: number) => initialState(seed),
  reducer: reducer as (state: TaxiState, action: TaxiAction) => TaxiState,
  isTerminal,
  hint: (s: any) => { const p = (s as any).phase; if (p === "done" || p === "gameover" || p === "ended" || p === "finished" || (s as any).gameOver || (s as any).won || (s as any).complete || (s as any).isComplete) return null; return { selector: ".taxi-zone-btn", pulses: 3 }; },
  component: TaxiDriverGame,
} as unknown as GamePlugin;
