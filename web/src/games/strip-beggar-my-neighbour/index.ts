import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { StripBeggarMyNeighbourState, StripBeggarMyNeighbourAction, StripBeggarMyNeighbourSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { StripBeggarMyNeighbourGame } from "./Game.js";
const settings = { questions: { kind:"enum" as const, label:"Questions", options:["10"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const stripBeggarMyNeighbourPlugin: GamePlugin<StripBeggarMyNeighbourState, StripBeggarMyNeighbourAction, typeof settings> = {
  id:"strip-beggar-my-neighbour", title:"Strip Beggar My Neighbour", category:"cards",
  players:{ min:1, max:1, multiplayer:false },
  description:"Trivia about Strip Beggar My Neighbour, a stripped-deck variant of Beggar My Neighbour.",
  howToPlay:"Strip Beggar My Neighbour Trivia is a ten-question quiz about a stripped-deck variant of the classic Beggar My Neighbour, the deterministic kids' card game where players slap down cards in turn until a face card forces an opponent to pay tribute. The 'strip' variant reduces the deck to a smaller subset (often 32 or 36 cards by removing low pip cards) which both shortens the game and changes the frequency of payment cards. Each question tests rules, deck modifications, history, and tactics of Strip Beggar My Neighbour. Tap an answer and Submit; correct answers earn 100 base points plus 10 per second remaining on the 15-second timer. Wrong answers reveal the correct option. After ten questions your final score is shown. Strip Beggar My Neighbour is a tighter, faster take on a venerable nursery classic — perfect when you want the same thrill in less time.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as StripBeggarMyNeighbourSettings),
  reducer,isTerminal,
  hint: (state: any) => {
    if (state.phase === "result") return { selector: '[data-testid="hint-target-strip-beggar-my-neighbour-next"]', pulses: 3 };
    if (state.phase === "playing" && state.selected !== null) return { selector: '[data-testid="hint-target-strip-beggar-my-neighbour-submit"]', pulses: 3 };
    return null;
  },component:StripBeggarMyNeighbourGame,
};
