import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { DiceTableTennisState, DiceTableTennisAction, DiceTableTennisSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { DiceTableTennisGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const diceTableTennisPlugin: GamePlugin<DiceTableTennisState, DiceTableTennisAction, typeof settings> = {
  id:"dice-table-tennis", title:"Dice Table Tennis", category:"dice",
  players:{ min:1, max:1, multiplayer:false },
  description:"Paddle-and-ball; first to 11.",
  howToPlay:"Dice Table Tennis simulates the Olympic paddle sport — known as ping-pong in casual settings — where rallies fly fast across a 9-foot table at speeds up to 70mph in elite play.\n\nEach round you Roll two dice. Point mapping: dice doubles where both >= 4 = your point (+1), doubles where both <= 3 = opponent point (-1), other rolls = continued rally (no score). Game ends at 11 your points or after 30 rounds.\n\nFinal score equals 70 + (8 × your points) - (4 × opponent points) + (3 × rounds remaining if you finish early). Average runs land between 90 and 130; an 11-0 sweep can clear 160.\n\nReal table tennis is dominated by Chinese players at the elite level and beloved as a casual basement and community-centre sport globally. The speed of high-end play is otherworldly. This mini compresses rally dynamics into dice rolls. Press Roll, Next. Quick, recognisably-international, and pleasingly rhythmic.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as DiceTableTennisSettings),
  reducer,isTerminal,component:DiceTableTennisGame,
};
