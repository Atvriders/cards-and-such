import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { RollingThunderState, RollingThunderAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { RollingThunderDice } from "./RollingThunderDice.js";

export const rollingThunderDicePlugin = {
  id: "rolling-thunder-dice",
  title: "Rolling Thunder",
  category: "dice",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Push-your-luck dice — keep rolling for higher scores but beware two thunder rolls in a row!",
  howToPlay: `Rolling Thunder is a push-your-luck dice game played over six turns. Each turn you start by rolling five dice. Any die showing a 1 is a "thunder die" — it is knocked out and adds nothing to your score. The remaining dice show your current turn total.

You can then choose to keep rolling the surviving dice to add more to your turn total, or bank your points to save them. Rolling is tempting because your score keeps climbing — but danger lurks.

The thunder rule: if you roll thunder (any 1s) two turns in a row, you suffer a Thunder Bust — you lose every single banked point and your score resets to zero. One thunder roll is fine; two consecutive ones is devastating.

After six turns your banked score is your final total. Maximum theoretical scores are very high if thunder never strikes. Tension comes from deciding when to bank and whether one more roll is worth the risk. Bold players often end up busted; cautious ones leave points on the table. Find the balance!`,
  settings: {} as Record<string, never>,
  initialState: (seed: number) => initialState(seed),
  reducer,
  isTerminal,
  component: RollingThunderDice,
} as unknown as GamePlugin;
