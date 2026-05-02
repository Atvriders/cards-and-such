import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { CardSnakeState, CardSnakeAction, CardSnakeSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { CardSnakeGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const cardSnakePlugin: GamePlugin<CardSnakeState, CardSnakeAction, typeof settings> = {
  id:"card-snake", title:"Card Snake", category:"cards",
  players:{ min:1, max:1, multiplayer:false },
  description:"Cards must alternate red/black; track the longest snake. 16 draws.",
  howToPlay:"Card Snake is a luck-based color-streak minigame. You draw 16 cards one at a time, and your goal is to extend the longest possible \"snake\" — a run of cards that perfectly alternates red and black colors.\n\nEach draw the deck is reshuffled internally and a new card flips up. If its color alternates from the previous card (red after black, or black after red), your current snake grows by one. If the colors match, the snake breaks and a new snake of length 1 starts.\n\nYour final score equals your longest snake achieved at any point during the 16 draws, multiplied by 10. The expected longest run is around 4-5 cards on a typical pull, so anything over 70 points is solid and a 10+ snake is exceptional.\n\nSnakes don't have to start at draw 1; the game tracks the best alternating run from anywhere in the sequence. Hiss!",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as CardSnakeSettings),
  reducer,isTerminal,hint: (state) => isTerminal(state) ? null : ({ selector: '[data-testid="hint-target-card-snake-primary"]', pulses: 3 }), component:CardSnakeGame,
};
