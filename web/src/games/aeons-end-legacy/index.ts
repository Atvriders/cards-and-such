import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { AeonsEndLegacyState, AeonsEndLegacyAction, AeonsEndLegacySettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { AeonsEndLegacyGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const aeonsEndLegacyPlugin: GamePlugin<AeonsEndLegacyState, AeonsEndLegacyAction, typeof settings> = {
  id:"aeons-end-legacy",
  title:"Aeon's End Legacy",
  category:"cards",
  players:{ min:1, max:1, multiplayer:false },
  description:"Campaign deckbuilder with permanent card upgrades.",
  howToPlay:"Aeon's End Legacy is a ten-round mage-themed deckbuilder homage to the campaign-style sequel of Aeon's End, where cards permanently change between sessions. Each round, three cards are revealed from a thematic deck: Spell (5), Gem (2), Relic (4), Crystal (3), Mage Power (6). The sum is added to your score. 🔮\n\nWithout the campaign permanence (this is a one-shot session), the deck still produces an exciting average around 12 per round. Mage Powers are the high-value pulls. Across ten rounds, expect totals between 100 and 130.\n\nPress Draw to reveal three cards, Next to advance to the next round, and Finish on the tenth. Aim for 130+ for an excellent legacy run. The game completes in well under a minute and captures the spell-flinging vibe of the original — pocket-sized, repeatable, and deeply satisfying.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as AeonsEndLegacySettings),
  reducer,
  isTerminal,
  component:AeonsEndLegacyGame,
};
