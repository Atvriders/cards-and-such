import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { DiceHorseRacingCardState, DiceHorseRacingCardStateAction, DiceHorseRacingCardSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { DiceHorseRacingCardGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const diceHorseRacingCardPlugin: GamePlugin<DiceHorseRacingCardState, DiceHorseRacingCardStateAction, typeof settings> = {
  id: "dice-horse-racing-card", title: "Dice Horse Racing", category: "dice",
  players: { min:1, max:1, multiplayer:false },
  description: "Card-and-dice horse race; furlong-by-furlong.",
  howToPlay: "Dice Horse Racing models a thoroughbred race played out furlong by furlong (each furlong = one-eighth of a mile). A typical race is 6 to 12 furlongs. Each furlong reveals positioning shifts as horses surge or fade, with a final-furlong drive determining the winner. Pace, post position, and jockey decisions all factor.\n\nThis dice-only sim plays a 12-furlong distance race. Each round (a furlong), you Roll three dice. Outcomes: triple (your horse surges to lead +3), sum >= 13 (gain ground +1 your horse), sum <= 6 (fade, opp horse gains +1), otherwise hold position (no change).\n\nGame ends at 12 your points or 12 rounds. Final score formula: 80 + (4 × your points) - (3 × opponent points) + (2 × rounds remaining if you finish early). Horse racing is unpredictable — a fading favorite can rally in the final furlongs. Average runs 110 to 165. Press Roll, Next.",
  settings,
  initialState: (seed:number, s:S) => initialState(seed, s as DiceHorseRacingCardSettings),
  reducer, isTerminal, component: DiceHorseRacingCardGame,
};
