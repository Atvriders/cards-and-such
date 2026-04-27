import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { SnakeEyesHuntState, SnakeEyesHuntAction, SnakeEyesHuntSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { SnakeEyesHuntGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const snakeEyesHuntPlugin: GamePlugin<SnakeEyesHuntState, SnakeEyesHuntAction, typeof settings> = {
  id:"snake-eyes-hunt", title:"Snake Eyes Hunt", category:"dice",
  players:{ min:1, max:1, multiplayer:false },
  description:"Roll 2 dice 20 times. +50 per snake eyes (1+1).",
  howToPlay:`Snake Eyes Hunt is a long-shot dice chase. You'll roll two dice 20 times. Every roll that comes up double-ones — snake eyes — scores 50 points. Anything else scores nothing.

The probability of snake eyes on any roll is 1/36 (about 2.8%). Across 20 rolls, you can expect roughly 0.55 snake-eyes hits, or about 28 expected points. Most games end with zero or one snake eyes; landing two is exciting; three is a wild seed-blessed run.

There's no decision — just rapid-fire rolling. Press Roll, then Next, and march through 20 attempts. The display shows your hit count and running score, so you can savor each rare double-one. Take your time, settle in, and hope the dice see you. Snake eyes never get old when they finally show up!`,
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as SnakeEyesHuntSettings),
  reducer,isTerminal,component:SnakeEyesHuntGame,
};
