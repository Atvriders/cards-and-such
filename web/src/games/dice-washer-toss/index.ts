import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { DiceWasherTossState, DiceWasherTossAction, DiceWasherTossSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { DiceWasherTossGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const diceWasherTossPlugin: GamePlugin<DiceWasherTossState, DiceWasherTossAction, typeof settings> = {
  id:"dice-washer-toss", title:"Dice Washer Toss", category:"dice",
  players:{ min:1, max:1, multiplayer:false },
  description:"Metal-washer toss to scoring zones.",
  howToPlay:"Dice Washer Toss simulates the American/Canadian backyard sport where players throw small metal washers at a target box with cup zones, each cup scoring different points. Outer cup = 1, middle = 3, centre cup = 5.\n\nEach of 10 frames you Roll three dice (your three washers). Die values map to zones: 6 = centre cup (5 points), 5 = middle cup (3 points), 4 = outer cup (1 point), 1-3 = miss (0).\n\nA typical frame scores 3-6 points; a hot frame with 5-6s can score 12+; the max (three 6s) is 15. Ten frames totalling 35-65 is a normal game; the absolute max is 150.\n\nWasher toss is a beloved tailgate, lake-cabin and backyard staple, with regional rule variants — some boxes have a single cup, some have three concentric scoring zones. This mini uses the three-zone variant. Press Roll to throw, Next to advance. Quick, blue-collar Americana, and fits perfectly between bigger games.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as DiceWasherTossSettings),
  reducer,isTerminal,component:DiceWasherTossGame,
};
