import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { CardZooState, CardZooAction, CardZooSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { CardZooGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const cardZooPlugin: GamePlugin<CardZooState, CardZooAction, typeof settings> = {
  id:"card-zoo", title:"Card Zoo", category:"cards",
  players:{ min:1, max:1, multiplayer:false },
  description:"Spot the animals — face cards are zoo animals!",
  howToPlay:`Card Zoo is a quick card-spotting game with a zoo theme. Over 12 cards drawn from a shuffled deck, the face cards (Jacks, Queens, Kings, Aces) are the zoo animals — each one scores 15 points. Number cards (2-10) are empty cages and score 0.

Press Draw Card to reveal each card. With each draw the score updates and after 12 cards the game ends. The deck has 16 face cards out of 52 (about 30.8%), so on average you'll spot 3-4 zoo animals per visit, scoring 45-60 points. A particularly good run can hit 75 or more; a quiet day at the zoo may leave you under 30.

There are no decisions — just enjoy the trip and see what wildlife shows up. Lions, tigers, and bears (er, Jacks, Queens, and Kings) — oh my!`,
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as CardZooSettings),
  reducer,isTerminal,
  hint: (s: any) => { const p = (s as any).phase; if (p === "gameover" || p === "done" || p === "ended" || (s as any).gameOver) return null; return { selector: '[data-testid="hint-target-card-zoo-action"]', pulses: 3 }; },
  component:CardZooGame,
};
