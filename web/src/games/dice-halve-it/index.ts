import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { DiceHalveItState, DiceHalveItAction, DiceHalveItSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { DiceHalveItGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const diceHalveItPlugin: GamePlugin<DiceHalveItState, DiceHalveItAction, typeof settings> = {
  id:"dice-halve-it", title:"Dice Halve-It Darts", category:"dice",
  players:{ min:1, max:1, multiplayer:false },
  description:"Miss your target and your score halves.",
  howToPlay:"Halve-It is a darts pressure game where missing the round's required target halves your accumulated score. It rewards consistency and punishes sloppy throws — a single bad round can wipe out the whole game.\n\nIn this mini you Roll three dice for each of 10 rounds. The round target is to score at least 7 on the dice (think of it as hitting that round's required sector). If you score 7 or more, those points are added to your total. If you score under 7, your total score is halved (rounded down) — punishing for a missed sector exactly as in the pub game.\n\nA careful player will average between 30 and 60 by the end. Avoiding even one halving is the difference between a strong score and a wreckage. The real Halve-It uses targets like 'a 19', 'any double', 'a triple 17', 'the bullseye'; this mini abstracts those to a single dice threshold but keeps the brutal halving mechanic that defines the game.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as DiceHalveItSettings),
  reducer,isTerminal,component:DiceHalveItGame,
};
