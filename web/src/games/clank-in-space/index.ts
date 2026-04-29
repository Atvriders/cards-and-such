import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { ClankInSpaceState, ClankInSpaceAction, ClankInSpaceSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { ClankInSpaceGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const clankInSpacePlugin: GamePlugin<ClankInSpaceState, ClankInSpaceAction, typeof settings> = {
  id:"clank-in-space",
  title:"Clank! In! Space!",
  category:"cards",
  players:{ min:1, max:1, multiplayer:false },
  description:"Sci-fi Clank deckbuilder aboard a starship.",
  howToPlay:"Clank! In! Space! is a ten-round sci-fi deckbuilder card game inspired by the cooperative-but-competitive starship heist of the same name. Each round you reveal three cards from a deck of starship-themed loot: Crystal (4), Artifact (5), Power (2), Ship Card (3), Rare Tech (6). The total is added to your score. 🚀\n\nIn the real game, noise tokens alert the dragon — here they're abstracted away. The deck averages around 12 per round, with rare-tech bursts giving you 15+ rounds. Across ten rounds expect 100 to 130.\n\nPress Draw to flip three cards, Next to advance, and Finish on round ten. The game completes in well under a minute, evoking the sci-fi heist atmosphere in a fast, replayable form. Top totals over 130 demonstrate excellent loot luck. Try multiple seeds to chase the highest possible Clank! In! Space! score.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as ClankInSpaceSettings),
  reducer,
  isTerminal,
  component:ClankInSpaceGame,
};
