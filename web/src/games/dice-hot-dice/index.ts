import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { DiceHotDiceState, DiceHotDiceAction, DiceHotDiceSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { DiceHotDiceGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const diceHotDicePlugin: GamePlugin<DiceHotDiceState, DiceHotDiceAction, typeof settings> = {
  id:"dice-hot-dice", title:"Dice Hot Dice", category:"dice",
  players:{ min:1, max:1, multiplayer:false },
  description:"Press your luck: keep rolling for streak bonuses, but a 1 busts the round.",
  howToPlay:`Dice Hot Dice is a press-your-luck game over 8 rounds. Each round you decide: roll the die or bank what you've earned and move on.

When you roll: if the die shows 2–6, that value is added to your round tally. Land 3 non-1 rolls in a row and a streak bonus kicks in (+4 per roll); 4 or more in a row bumps the bonus to +8 per roll. The hotter your streak, the faster points pile up.

But if you roll a 1, you BUST. The current round's tally is wiped to zero and you lose the round. The streak resets and the round counter advances.

Pressing Bank locks in the current round's tally as banked points and starts a new round with a fresh streak. The game ends after 8 rounds (whether banked or busted).

Strategy: short rounds are safer — banking after 2 rolls captures small but reliable points. Longer rolls compound bonuses but risk a 1 (1-in-6 odds per roll). The game's score is your total banked.

Test your nerve!`,
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as DiceHotDiceSettings),
  reducer, isTerminal, component: DiceHotDiceGame,
};
