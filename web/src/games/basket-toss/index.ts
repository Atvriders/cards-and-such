import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { BasketTossState, BasketTossAction, BasketTossSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { BasketToss } from "./Game.js";
const settings = { balls: { kind:"enum" as const, label:"Balls", options:["5","10"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const basketTossPlugin: GamePlugin<BasketTossState, BasketTossAction, typeof settings> = {
  id:"basket-toss", title:"Basket Toss", category:"arcade",
  players:{min:1,max:1,multiplayer:false},
  description:"Toss the ball into the basket! Click at the basket position and build streaks for big points.",
  howToPlay:`Basket Toss is a carnival basketball aim game. Each round a basket appears at a random position on the board. Click at the basket's horizontal position to toss the ball into it.

Land the ball in the basket (within a narrow window) to score 100 points. Building a streak of consecutive makes adds 20 bonus points per consecutive basket — so a 3-streak earns 160 pts per make!

The basket moves to a new position after each throw. Use Settings to play 5 or 10 balls. After all balls are thrown your final score and make percentage are shown.

The key skill is accurately reading the basket's position and clicking precisely. The basket is small — a narrow 14% of screen width. Be exact! With a perfect 10-ball streak the score would be massive. How many can you make in a row?`,
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as BasketTossSettings),
  reducer, isTerminal,
    hint: (state: BasketTossState) => {
      if (state.phase === "gameover") return null;
      return { selector: '[data-testid="hint-target-basket-toss-action"]', pulses: 3 };
    },
  component:BasketToss,
};
