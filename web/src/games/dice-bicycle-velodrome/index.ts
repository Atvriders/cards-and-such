import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { DiceBicycleVelodromeState, DiceBicycleVelodromeStateAction, DiceBicycleVelodromeSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { DiceBicycleVelodromeGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const diceBicycleVelodromePlugin: GamePlugin<DiceBicycleVelodromeState, DiceBicycleVelodromeStateAction, typeof settings> = {
  id: "dice-bicycle-velodrome", title: "Dice Velodrome Sprint", category: "dice",
  players: { min:1, max:1, multiplayer:false },
  description: "Track cycling sprint and pursuit; draft slipstream rolls.",
  howToPlay: "Dice Velodrome Sprint models track cycling events on a banked velodrome — sprints, pursuits, keirins, and Madisons. The classic sprint event features two cyclists on the banked oval engaged in tactical mind games before exploding into a final-lap sprint. Slipstreaming the leader and timing your jump are the key skills.\n\nThis dice-only sim plays 12 races. Each round, you Roll three dice. Outcomes: triple (perfect timing, win by half-wheel +2 your team), sum >= 14 (jump on final lap, win race +1 your team), sum <= 6 (caught flat-footed, opp +1), otherwise tactical loss (no change).\n\nGame ends at 9 your points (race wins in a series) or 12 rounds. Final score formula: 80 + (5 × your points) - (3 × opponent points) + (2 × rounds remaining if you finish early). Velodrome racing is psychology as much as power. Average runs 115 to 155. Press Roll, Next.",
  settings,
  initialState: (seed:number, s:S) => initialState(seed, s as DiceBicycleVelodromeSettings),
  reducer, isTerminal, component: DiceBicycleVelodromeGame,
};
