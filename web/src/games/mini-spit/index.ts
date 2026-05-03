import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { MiniSpitState, MiniSpitAction, MiniSpitSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const MiniSpitGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.MiniSpitGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const miniSpitPlugin: GamePlugin<MiniSpitState, MiniSpitAction, typeof settings> = {
  id:"mini-spit", title:"Mini Spit", category:"cards",
  players:{ min:1, max:1, multiplayer:false },
  description:"Speed placement: tap any card from hand whose rank is one above or below the top card. 5 rounds.",
  howToPlay:`Mini Spit is a quick speed-style card placement game inspired by the classic Spit. Each round, you receive a hand of six cards, plus one center "top" card. Your goal: discard as many hand cards as possible by playing cards whose rank is exactly one above or one below the top card.

Ranks wrap: King connects to Ace, Ace connects to 2. Suits don't matter. When you play a card, it becomes the new top, and you can chain plays as long as each one matches.

Each played card scores 5 points. Click any playable card in your hand — disabled buttons are unplayable. When stuck, press End round.

Five rounds total, 6 cards per round. Maximum theoretical score is 150 (all 30 cards played), but typical runs land around 50-80 due to dead-end hands. Quick pattern recognition is key: scan all six cards every time the top changes. Wraparound is the trickiest!`,
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as MiniSpitSettings),
  reducer,isTerminal,
  hint: (state: MiniSpitState): HintTarget | null => {
    if (isTerminal(state)) return null;
    if (state.phase === "ready" || state.phase === "stalemate") {
      return { selector: '[data-testid="hint-target-mini-spit-primary"]', pulses: 3 };
    }
    return null;
  },
  component:MiniSpitGame,
};
