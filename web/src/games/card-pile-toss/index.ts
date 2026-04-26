import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { CardPileTossState, CardPileTossAction, CardPileTossSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { CardPileTossGame } from "./Game.js";
const settings = { rounds: { kind:"enum" as const, label:"Rounds", options:["10","20"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const cardPileTossPlugin: GamePlugin<CardPileTossState, CardPileTossAction, typeof settings> = {
  id: "card-pile-toss", title: "Card Pile Toss", category: "cards",
  players: { min:1, max:1, multiplayer:false },
  description: "Set the toss angle and fling cards into the pile for maximum points.",
  howToPlay: `Card Pile Toss is a skill-and-luck mini game. Each round you adjust an angle slider and toss cards toward a pile. The closer your angle is to the secret target angle, the more points you score — up to 100 points for a perfect toss.

You can't see the target directly; you'll get feedback after each toss showing how many points you earned. Use the slider strategically and try to keep close to center angles as that's often where targets cluster.

Play 10 or 20 rounds and build the highest cumulative score you can!`,
  settings,
  initialState: (seed:number, s:S) => initialState(seed, s as CardPileTossSettings),
  reducer, isTerminal, component: CardPileTossGame,
};
