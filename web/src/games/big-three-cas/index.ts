import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { BigThreeCasState, BigThreeCasAction, BigThreeCasSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { BigThreeCasGame } from "./Game.js";
const settings = { questions: { kind:"enum" as const, label:"Questions", options:["10"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const bigThreeCasPlugin: GamePlugin<BigThreeCasState, BigThreeCasAction, typeof settings> = {
  id:"big-three-cas", title:"Big Three", category:"cards",
  players:{ min:1, max:1, multiplayer:false },
  description:"Trivia about Big Three, an East Asian climbing card game variant.",
  howToPlay:"Big Three Trivia is a ten-question quiz about Big Three, an Asian climbing card game in the Big Two family where the highest single card is the Three rather than the Two. Played with a standard 52-card deck dealt to four players (13 cards each), the goal is to be the first to discard all your cards. Players take turns playing a single card or combination — pairs, triples, full houses, or straights — that beats the previous play. The Three of a specified suit (often spades or hearts) is the strongest single, inverting the normal hierarchy. Each question tests rules, hands, hierarchy, and origin of Big Three. Tap an answer and Submit; a correct answer earns 100 base points plus 10 per second remaining on the 15-second timer. Wrong answers reveal the correct option. After ten questions your final score is shown. Big Three flips Big Two on its head with a clever new top card.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as BigThreeCasSettings),
  reducer,isTerminal,
  hint: (state: any) => {
    if (state.phase === "result") return { selector: '[data-testid="hint-target-big-three-cas-next"]', pulses: 3 };
    if (state.phase === "playing" && state.selected !== null) return { selector: '[data-testid="hint-target-big-three-cas-submit"]', pulses: 3 };
    return null;
  },component:BigThreeCasGame,
};
