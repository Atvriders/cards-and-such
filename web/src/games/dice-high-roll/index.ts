import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { DiceHighRollState, DiceHighRollAction, DiceHighRollSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const DiceHighRollGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.DiceHighRollGame as unknown as React.ComponentType<unknown> })));
const settings = { rounds: { kind:"enum" as const, label:"Rounds", options:["10","20"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const diceHighRollPlugin: GamePlugin<DiceHighRollState, DiceHighRollAction, typeof settings> = {
  id: "dice-high-roll", title: "Dice High Roll", category: "dice",
  players: { min:1, max:1, multiplayer:false },
  description: "Bet that three dice will total 12 or more — harder to hit, but pays double!",
  howToPlay: `Dice High Roll is a high-risk betting game. Each round you wager that three dice will sum to 12 or higher. The catch: this is less likely than low (roughly 38% chance), but if you win, you get double your bet back.

Choose your stake — 5, 10, or 20 coins — then watch the dice roll. Win at 2x for a sum of 12-18, or lose your bet for anything under 12.

Start with 100 coins. The high payout means that even a few wins can keep your stack healthy. Bet small when cold, and push when you feel lucky!`,
  settings,
  initialState: (seed:number, s:S) => initialState(seed, s as DiceHighRollSettings),
  reducer, isTerminal, component: DiceHighRollGame,
  hint: (state: DiceHighRollState): HintTarget | null => {
    if (isTerminal(state)) return null;
    if (state.phase === "betting") return { selector: '[data-testid="hint-target-dicehighroll-bet"]', pulses: 3 };
    if (state.phase === "result") return { selector: '[data-testid="hint-target-dicehighroll-next"]', pulses: 3 };
    return null;
  },
};
