import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { LegendaryMarvelState, LegendaryMarvelAction, LegendaryMarvelSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { LegendaryMarvelGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const legendaryMarvelPlugin: GamePlugin<LegendaryMarvelState, LegendaryMarvelAction, typeof settings> = {
  id:"legendary-marvel",
  title:"Legendary Marvel",
  category:"cards",
  players:{ min:1, max:1, multiplayer:false },
  description:"Marvel deckbuilder; recruit heroes to defeat villains.",
  howToPlay:"Legendary Marvel is a ten-round superhero-deckbuilder tribute inspired by Upper Deck's Legendary: A Marvel Deck Building Game, where players recruit Marvel heroes to defeat schemes. Each round three cards flip from a Marvel-themed deck: Hero (4), Mastermind (6), Recruit (2), Henchman (3), Bystander (1). The total is added to your running score. 🦸\n\nThe deck averages around 11 per round; Mastermind pulls and Hero stacks are the big scorers. Across ten rounds expect totals near 100 to 120.\n\nPress Draw to reveal three cards, Next to advance, and Finish on round ten. Aim for 110+ to truly defeat the scheme. The game wraps in well under a minute, distilling Legendary's signature hero-recruiting drama into a compact, fast, replayable session that fits in any spare moment.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as LegendaryMarvelSettings),
  reducer,
  isTerminal,
  component:LegendaryMarvelGame,
};
