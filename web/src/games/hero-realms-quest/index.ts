import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { HeroRealmsQuestState, HeroRealmsQuestAction, HeroRealmsQuestSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { HeroRealmsQuestGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const heroRealmsQuestPlugin: GamePlugin<HeroRealmsQuestState, HeroRealmsQuestAction, typeof settings> = {
  id:"hero-realms-quest",
  title:"Hero Realms Quest",
  category:"cards",
  players:{ min:1, max:1, multiplayer:false },
  description:"Recruit hero cards across rounds.",
  howToPlay:"Hero Realms Quest is a fantasy-themed card recruitment game in 10 quick rounds. Each round, three character cards are revealed from a deck of classes: Cleric (3), Fighter (4), Ranger (5), Thief (6), and Wizard (7). The sum of the round's three cards is your round score. 🛡️\n\nThere's no decision-making — pure draw-and-tally. Average rounds land around 15 points. Lucky rounds where three Wizards appear can score 21. Across 10 rounds, expect to land between 130 and 180 points depending on your seed.\n\nPress Draw to flip the three hero cards, view their classes and values, then Next to advance to the next round. Pure rhythm: draw, see, score, repeat. Aim for 160+ to be a true Hero Realms champion. Finish your quest in less than a minute. Brought to you by tabletop fantasy nostalgia in a pocket game.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as HeroRealmsQuestSettings),
  reducer,
  isTerminal,
  component:HeroRealmsQuestGame,
};
