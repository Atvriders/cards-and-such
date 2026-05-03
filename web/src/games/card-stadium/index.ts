import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { CardStadiumState, CardStadiumAction, CardStadiumSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { CardStadiumGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const cardStadiumPlugin: GamePlugin<CardStadiumState, CardStadiumAction, typeof settings> = {
  id:"card-stadium", title:"Card Stadium", category:"cards",
  players:{ min:1, max:1, multiplayer:false },
  description:"Cheer on the cards — only Hearts (the home team) score!",
  howToPlay:`Card Stadium is a card collection game with a sports stadium theme. Over 12 cards drawn from a shuffled deck, only Hearts (the home team) score points. Each Heart is worth 10. Spades, Clubs, and Diamonds — the visiting fans — score zero.

Press Draw Card to reveal your next card. The score updates with each draw. After 12 cards, the game ends. With 13 Hearts in a deck and 12 cards drawn, you'd expect about 3 Hearts per game on average — that's around 30 points. Lucky draws can yield 50-80 points; unlucky ones may leave you under 20.

There are no strategic choices — it's pure red-suit luck. Cheer for the Hearts and hope your stadium is full of fans! The home team always brings the points.`,
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as CardStadiumSettings),
  reducer,isTerminal,
  hint: (s: any) => { const p = (s as any).phase; if (p === "gameover" || p === "done" || p === "ended" || (s as any).gameOver) return null; return { selector: '[data-testid="hint-target-card-stadium-action"]', pulses: 3 }; },
  component:CardStadiumGame,
};
