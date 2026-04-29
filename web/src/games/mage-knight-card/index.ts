import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { MageKnightCardState, MageKnightCardAction, MageKnightCardSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { MageKnightCardGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const mageKnightCardPlugin: GamePlugin<MageKnightCardState, MageKnightCardAction, typeof settings> = {
  id:"mage-knight-card",
  title:"Mage Knight Cards",
  category:"cards",
  players:{ min:1, max:1, multiplayer:false },
  description:"Mage-Knight inspired card-driven hero combat.",
  howToPlay:"Mage Knight Cards is a ten-round card-focused tribute to Vlaada Chvátil's Mage Knight, where hand management drives a hero's movement and combat. Each round three cards are flipped from a deck themed on the original: Move (3), Attack (4), Block (2), Influence (4), Special (6). The sum gives your round score. 🗡️\n\nMage Knight is famously deep with full board play — this miniature simply mimics the card rhythm. Average per round is around 11-12 points. Special cards are the difference-maker; pulling two Specials in a round can score 14+. Across ten rounds, totals usually land between 100 and 130.\n\nPress Draw to reveal cards, Next to advance, and Finish on round ten. Aim for 120+ for a knightly run. The game completes in under a minute, distilling Mage Knight's hero-hand magic into a pocket-sized session you can replay endlessly.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as MageKnightCardSettings),
  reducer,
  isTerminal,
  component:MageKnightCardGame,
};
