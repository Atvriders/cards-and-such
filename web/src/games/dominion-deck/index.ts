import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { DominionDeckState, DominionDeckAction, DominionDeckSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { DominionDeckGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const dominionDeckPlugin: GamePlugin<DominionDeckState, DominionDeckAction, typeof settings> = {
  id:"dominion-deck",
  title:"Dominion Deck",
  category:"cards",
  players:{ min:1, max:1, multiplayer:false },
  description:"Buy fantasy cards to build a tiny tableau.",
  howToPlay:"Dominion Deck is a small ten-round card tableau game inspired by classic fantasy deckbuilders. Each round, three cards are revealed from a deck of fantasy denominations: 2 (copper), 3 (silver), 4 (gold), and a wild Estate worth 1 plus the round number. Score is the sum of the cards drawn that round. 👑\n\nYour score builds steadily — better cards arrive late, so the final rounds matter most. Estates rise in value as the kingdom grows. Sums of around 9 are average per round; pull a few high-value Estates and you'll dwarf the average. There's no decision-making, just the rhythm of the deck reveal.\n\nPress Draw to flip three cards and tally. Then Next to advance to the following round, or Finish at the end. The game completes in well under a minute. Aim for a high seventy-plus total to win the kingdom.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as DominionDeckSettings),
  reducer,
  isTerminal,
  component:DominionDeckGame,
};
