import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { SpitInTheOceanState, SpitInTheOceanAction, SpitInTheOceanSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { SpitInTheOceanGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const spitInTheOceanPlugin: GamePlugin<SpitInTheOceanState, SpitInTheOceanAction, typeof settings> = {
  id:"spit-in-the-ocean", title:"Spit-in-the-Ocean", category:"cards",
  players:{ min:1, max:1, multiplayer:false },
  description:"Solo Spit-in-the-Ocean: 5-card draw where one community card would normally be wild. Score the best five-card hand.",
  howToPlay:"Spit-in-the-Ocean is a draw-poker novelty where each player receives four cards and one shared community card sits face-up in the middle as a wild card for everyone. This solo edition deals you a straight five-card hand and the reducer scores it directly — no wild-card boost, just clean five-card poker.\n\nPress Deal each round to draw five random cards from a fresh 52-card deck. Hand values: High Card 0, Pair 10, Two Pair 30, Three of a Kind 50, Straight 70, Flush 80, Full House 100, Four of a Kind 150, Straight Flush 200.\n\nThere are ten independent rounds. Because you only have five cards (no seven-card combinatorial bonus), pairs and two-pair are still the bread-and-butter results, with straights and flushes appearing far less often than in Hold'em. Press Next between rounds and aim to chain enough strong hands to push your cumulative score over the line in this Spit-in-the-Ocean session.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as SpitInTheOceanSettings),
  reducer, isTerminal,   hint: (state: SpitInTheOceanState): HintTarget | null => {
    if (isTerminal(state)) return null;
    if (state.phase === "deal") return { selector: '[data-testid="hint-target-spit-in-the-ocean-deal"]', pulses: 3 };
    if (state.phase === "scored") return { selector: '[data-testid="hint-target-spit-in-the-ocean-next"]', pulses: 3 };
    return null;
  },
  component:SpitInTheOceanGame,
};
