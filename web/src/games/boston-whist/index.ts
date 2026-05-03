import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { BostonWhistState, BostonWhistAction, BostonWhistSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { BostonWhistGame } from "./Game.js";
const settings = { questions: { kind:"enum" as const, label:"Questions", options:["10"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const bostonWhistPlugin: GamePlugin<BostonWhistState, BostonWhistAction, typeof settings> = {
  id:"boston-whist", title:"Boston Whist", category:"cards",
  players:{ min:1, max:1, multiplayer:false },
  description:"Trivia about Boston Whist, a bidding-trick whist game popular in 18th-century America.",
  howToPlay:"Boston Whist Trivia is a ten-question quiz about Boston Whist, an 18th-century American whist variant featuring bidding, contracts, and a French-Revolution-naming-flavor of bids. Played by four players with a standard 52-card deck, each receives 13 cards and the dealer turns up the last for trump. After auctions, the winning bidder must take a specified number of tricks — bid names like 'Boston' (5 tricks), 'Petite Misère', 'Grande Misère', and 'Grand Slam' track increasing difficulty. Tricks are scored according to the contract. Each question tests rules, bid names, history, and scoring of Boston Whist. Tap an answer and Submit; correct answers earn 100 base points plus 10 per second remaining on the 15-second timer. Wrong answers reveal the correct option. After ten questions your final score is shown. Boston Whist is an elegant ancestor of modern bridge and a snapshot of card-game culture from a revolutionary era.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as BostonWhistSettings),
  reducer,isTerminal,
  hint: (state: any) => {
    if (state.phase === "result") return { selector: '[data-testid="hint-target-boston-whist-next"]', pulses: 3 };
    if (state.phase === "playing" && state.selected !== null) return { selector: '[data-testid="hint-target-boston-whist-submit"]', pulses: 3 };
    return null;
  },component:BostonWhistGame,
};
