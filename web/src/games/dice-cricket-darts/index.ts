import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { DiceCricketDartsState, DiceCricketDartsAction, DiceCricketDartsSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { DiceCricketDartsGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const diceCricketDartsPlugin: GamePlugin<DiceCricketDartsState, DiceCricketDartsAction, typeof settings> = {
  id:"dice-cricket-darts", title:"Dice Cricket Darts", category:"dice",
  players:{ min:1, max:1, multiplayer:false },
  description:"Close 15-20 and bull, then score.",
  howToPlay:"Cricket Darts is the classic pub darts game where players must close numbers 15 through 20 and the bullseye (each requires three hits) before scoring extra. Closed numbers earn points until the opponent also closes them.\n\nIn this mini you have 25 rounds to close all seven targets (15, 16, 17, 18, 19, 20 and bull). Each round you Roll three dice. Each die value 1-6 maps to one of the targets (1=15, 2=16, 3=17, 4=18, 5=19, 6=20; bull is closed when all three other-die-values appear in one round). Each hit on a not-yet-closed target adds 1 to its progress; the target closes at 3 hits.\n\nClosed targets earn +5 each round they remain open after closing. Your final score equals 5 per closed target plus accumulated overflow. Average runs close 4-5 targets in 25 rounds; full closure plus overflow lands well over 50. Real Cricket is two-player back-and-forth; this mini is a solo scoring grind. Press Roll, Next.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as DiceCricketDartsSettings),
  reducer,isTerminal,component:DiceCricketDartsGame,
};
