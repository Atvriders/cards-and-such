import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { ShipCaptainCrewState, SCCAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { ShipCaptainCrew } from "./ShipCaptainCrew.js";

export const sccSettings = {
  rounds: {
    kind: "enum" as const,
    label: "Rounds",
    options: ["3", "5", "7", "10"] as const,
    default: "5",
  },
} as const;

type SCCSettingsType = SettingsOf<typeof sccSettings>;

export const shipCaptainCrewPlugin: GamePlugin<ShipCaptainCrewState, SCCAction, typeof sccSettings> = {
  id: "ship-captain-crew",
  title: "Ship Captain Crew",
  category: "dice",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Roll a Ship (6), Captain (5), Crew (4) in order. Remaining dice = cargo score.",
  howToPlay: `Ship Captain Crew (also called 6-5-4) is a classic bar dice game. Roll 5 dice up to 3 times per round to collect a ship (6), captain (5), and crew (4) in that exact order.

Each turn, roll all 5 dice. If you roll a 6, it becomes your ship and is locked. Once you have the ship, a 5 becomes your captain (locked). Once you have the captain, a 4 becomes your crew (locked). The remaining 2 dice score points as your "cargo" — their sum is your round score.

If you fail to secure all three — ship, captain, crew — in 3 rolls, you score 0 for that round. You can also re-roll as many times as you want (up to 3) once the crew is locked to try to improve your cargo dice.

After your turn, the bot plays optimally: it locks 6-5-4 as soon as they appear and banks immediately on success.

Play over 3, 5, 7, or 10 rounds. Final score is based on your total cargo compared to the bot. Higher cargo total wins.

Tips: if you get ship+captain+crew on the first roll and your cargo is high (10+), consider banking rather than re-rolling for a small improvement.`,
  settings: sccSettings,
  initialState: (seed: number, settings: SCCSettingsType) => initialState(seed, settings),
  reducer,
  isTerminal,
  component: ShipCaptainCrew,
};
