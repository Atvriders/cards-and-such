import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { DiceKaisaState, DiceKaisaStateAction, DiceKaisaSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { DiceKaisaGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const diceKaisaPlugin: GamePlugin<DiceKaisaState, DiceKaisaStateAction, typeof settings> = {
  id: "dice-kaisa", title: "Dice Kaisa", category: "dice",
  players: { min:1, max:1, multiplayer:false },
  description: "Nordic billiards variant; numbered ball pocketing.",
  howToPlay: "Dice Kaisa models a Nordic billiards variant played in Finland and parts of Sweden. The table has five balls — two cue balls (red and yellow), two object balls (white), and the kaisa (a red object ball worth 6 points). Pocketing the kaisa is the centerpiece of scoring, alternating with shots at the white object balls.\n\nThis dice-only sim mirrors the staccato Nordic scoring. Each round (a shot), you Roll three dice. Outcomes: triple (kaisa +6), sum >= 14 (white pot +2), sum <= 6 (foul, opp +5 because kaisa fouls are heavy), otherwise miss (no change).\n\nGame ends at 60 your points or 12 rounds. Final score formula: 80 + (2 × your points) - (1 × opponent points) + (3 × rounds remaining if you finish early). Kaisa rewards aggressive kaisa-targeting — a single kaisa pot equals three white pots. Average runs 110 to 165. Press Roll, Next.",
  settings,
  initialState: (seed:number, s:S) => initialState(seed, s as DiceKaisaSettings),
  reducer, isTerminal, component: DiceKaisaGame,
};
