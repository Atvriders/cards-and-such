import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { AcesUpMiniState, AcesUpMiniAction, AcesUpMiniSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { AcesUpMiniGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const acesUpMiniPlugin: GamePlugin<AcesUpMiniState, AcesUpMiniAction, typeof settings> = {
  id:"aces-up-mini", title:"Aces Up Mini", category:"cards",
  players:{ min:1, max:1, multiplayer:false },
  description:"Hunt for Aces. Draw 12 cards; each Ace earns +50 points.",
  howToPlay:`Aces Up Mini is a tiny single-deck card hunter. The game runs for twelve draws — each draw flips one random card from a 52-card deck, and your only job is to spot the Aces. Every Ace you draw scores 50 points; everything else scores zero.

Each draw is independent (the deck reshuffles in spirit each time), so don't worry about counting cards. With four Aces in 52 across 12 draws, you'll average about 1 Ace per game (~50 points), occasionally lucking into 2 or 3 for a much fatter purse. Three or more Aces in 12 draws is a serious feat of fortune.

There is no skill component here — just press Draw, watch the card, and press Next. The fun is in the suspense and that little jolt when the Ace finally shows up. Enjoy the deck's gambler-style randomness, and chase your personal best Ace count!`,
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as AcesUpMiniSettings),
  reducer,isTerminal, hint: (state: AcesUpMiniState): HintTarget | null => (state.phase === "drawing" ? { selector: '[data-testid="hint-target-aces-up-mini-primary"]', pulses: 3 } : null),component:AcesUpMiniGame,
};
