import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { ChinchonCardState, ChinchonCardAction, ChinchonCardSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { ChinchonCardGame } from "./Game.js";
const settings = { questions: { kind:"enum" as const, label:"Questions", options:["10"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const chinchonCardPlugin: GamePlugin<ChinchonCardState, ChinchonCardAction, typeof settings> = {
  id:"chinchon-card", title:"Chinchón", category:"cards",
  players:{ min:1, max:1, multiplayer:false },
  description:"Trivia about Chinchón, the popular Spanish/Latin American Rummy variant.",
  howToPlay:"Chinchón Trivia is a ten-question quiz about Chinchón, a popular Rummy-family card game from Spain played widely throughout Spanish-speaking Latin America (especially Argentina, Uruguay) and Italy. Played by 2-8 players with a 40-card or 50-card Spanish deck (Italian variants use a 40-card deck), each player gets seven cards. Players draw and discard each turn aiming to form sets/runs and minimize their unmatched 'puntos' (points). When a player melds all seven cards in two-or-three groups they 'cierran' (close) and the round ends. Lowest score wins; reaching 100 points eliminates a player. The eponymous 'chinchón' is a meld of seven cards in sequence in one suit (instant win). Each question tests rules and culture. Tap an answer and Submit; correct answers earn 100 base points plus 10 per second remaining on the 15-second timer. Wrong answers reveal the correct option. After ten questions your final score is shown.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as ChinchonCardSettings),
  reducer,isTerminal,
  hint: (state: any) => {
    if (state.phase === "result") return { selector: '[data-testid="hint-target-chinchon-card-next"]', pulses: 3 };
    if (state.phase === "playing" && state.selected !== null) return { selector: '[data-testid="hint-target-chinchon-card-submit"]', pulses: 3 };
    return null;
  },component:ChinchonCardGame,
};
