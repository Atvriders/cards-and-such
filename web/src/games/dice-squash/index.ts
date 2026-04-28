import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { DiceSquashState, DiceSquashAction, DiceSquashSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { DiceSquashGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const diceSquashPlugin: GamePlugin<DiceSquashState, DiceSquashAction, typeof settings> = {
  id:"dice-squash", title:"Dice Squash", category:"dice",
  players:{ min:1, max:1, multiplayer:false },
  description:"Wall rally racquet duel; first to 11.",
  howToPlay:"Dice Squash simulates the racquet sport played in a four-walled court, where players hit a small rubber ball against the front wall in alternation, racing to win 11-point games (must win by 2). Squash demands phenomenal stamina and tactical court coverage.\n\nEach round (rally) you Roll two dice. Point mapping: dice both 5-6 = winning shot (+1), dice both 1-2 = error or unforced miss (-1), dice sum >=10 = your point (+1), dice sum <=4 = opponent point (-1), other sums = continued rally (no score). Game ends at 11 your points or after 25 rounds.\n\nFinal score equals 60 + (10 × your points) - (5 × opponent points) + (3 × rounds remaining if you finish early). Average runs land between 80 and 120; a 11-0 sweep can clear 150.\n\nReal squash is a high-altitude tournament sport (PSA World Tour) with thrilling drop shots and back-corner kills. This mini abstracts that into dice rhythm. Press Roll, Next. Crisp, classy, and unmistakably country-club-flavoured.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as DiceSquashSettings),
  reducer,isTerminal,component:DiceSquashGame,
};
