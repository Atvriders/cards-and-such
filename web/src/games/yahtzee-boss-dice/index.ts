import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { YahtzeeBossDiceState, YahtzeeBossDiceAction, YahtzeeBossDiceSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const YahtzeeBossDiceGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.YahtzeeBossDiceGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const yahtzeeBossDicePlugin: GamePlugin<YahtzeeBossDiceState, YahtzeeBossDiceAction, typeof settings> = {
  id: "yahtzee-boss-dice",
  title: "Yahtzee Boss Dice",
  category: "dice",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Yahtzee variant with one 'boss die' that always shows 6 — call your hand bonus.",
  howToPlay: "Yahtzee Boss Dice is a Yahtzee variant where one die in the pool is the powered 'boss die' permanently locked on a 6, while the four other dice roll freely. Across 12 rounds you guess what hand will appear after the roll: Five of a Kind, Four of a Kind, Full House, or Bust. Call before the dice settle. Five of a Kind requires all four free dice to also show 6 — rare but worth +90. Four of a Kind needs three of the free dice to match the boss 6 or any other face four total — pays +45. Full House asks for three matching plus a pair somewhere — pays +30. A wrong call scores zero. Strategy: the boss 6 makes Four of a Kind and Yahtzee easier than vanilla because one die is already fixed. Twelve rounds, top score wins. Average expected output sits around 250 points if you read the probabilities.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as YahtzeeBossDiceSettings),
  reducer,
  isTerminal,
  hint: (state) => {
    const phase = (state as any).phase;
    if (phase === "betting") return { selector: '[data-testid="hint-target-yahtzee-boss-dice-predict"]', pulses: 3 };
    if (phase === "bet") return { selector: '[data-testid="hint-target-yahtzee-boss-dice-predict"]', pulses: 3 };
    if (phase === "predict") return { selector: '[data-testid="hint-target-yahtzee-boss-dice-predict"]', pulses: 3 };
    if (phase === "predicting") return { selector: '[data-testid="hint-target-yahtzee-boss-dice-predict"]', pulses: 3 };
    if (phase === "roundOver") return { selector: '[data-testid="hint-target-yahtzee-boss-dice-next"]', pulses: 3 };
    if (phase === "result") return { selector: '[data-testid="hint-target-yahtzee-boss-dice-next"]', pulses: 3 };
    if (phase === "settled") return { selector: '[data-testid="hint-target-yahtzee-boss-dice-next"]', pulses: 3 };
    if (phase === "banked") return { selector: '[data-testid="hint-target-yahtzee-boss-dice-next"]', pulses: 3 };
    if (phase === "done") return { selector: '[data-testid="hint-target-yahtzee-boss-dice-next"]', pulses: 3 };
    if (phase === "farkled") return { selector: '[data-testid="hint-target-yahtzee-boss-dice-next"]', pulses: 3 };
    if (phase === "busted") return { selector: '[data-testid="hint-target-yahtzee-boss-dice-next"]', pulses: 3 };
    return { selector: '[data-testid="hint-target-yahtzee-boss-dice-next"]', pulses: 3 };
  },
  component: YahtzeeBossDiceGame,
};
