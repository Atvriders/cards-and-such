import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { TaiSaiBoState, TaiSaiBoAction, TaiSaiBoSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const TaiSaiBoGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.TaiSaiBoGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const taiSaiBoPlugin: GamePlugin<TaiSaiBoState, TaiSaiBoAction, typeof settings> = {
  id: "tai-sai-bo",
  title: "Tai Sai Bo",
  category: "dice",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Chinese three-dice game; pick a single number 1-6 and bet on its frequency.",
  howToPlay: "Tai Sai Bo (Chinese name for Sic Bo) lets you bet on how many times a single chosen number appears across three dice. Pick a number from 1 to 6 each round, then watch as three dice roll. If your number appears once, you score 12; twice scores 30; three times scores 90. Zero appearances scores nothing.\n\nThe odds: zero appearances = 125/216 (57.9%); one = 75/216 (34.7%); two = 15/216 (6.9%); three = 1/216 (0.46%). The expected value of any pick is about 8.4 — slightly less than the 12-point hit reward but the rare three-of-a-kind boosts the variance dramatically.\n\nFor simplicity this version pre-selects the number 4 each round so all picks are equivalent — you focus on the show, not the strategy. The game runs 12 rounds. Average expected score is near 100 points. Chasing the rare three-of-a-kind delivers a thrilling spike when it hits.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as TaiSaiBoSettings),
  reducer,
  isTerminal,
  hint: (state) => {
    const phase = (state as any).phase;
    if (phase === "rolling") return { selector: '[data-testid="hint-target-tai-sai-bo-roll"]', pulses: 3 };
    if (phase === "rolling-dice") return { selector: '[data-testid="hint-target-tai-sai-bo-roll"]', pulses: 3 };
    if (phase === "preRoll") return { selector: '[data-testid="hint-target-tai-sai-bo-roll"]', pulses: 3 };
    if (phase === "ready") return { selector: '[data-testid="hint-target-tai-sai-bo-roll"]', pulses: 3 };
    if (phase === "playerRoll") return { selector: '[data-testid="hint-target-tai-sai-bo-roll"]', pulses: 3 };
    if (phase === "roll") return { selector: '[data-testid="hint-target-tai-sai-bo-roll"]', pulses: 3 };
    if (phase === "play") return { selector: '[data-testid="hint-target-tai-sai-bo-roll"]', pulses: 3 };
    if (phase === "playing") return { selector: '[data-testid="hint-target-tai-sai-bo-roll"]', pulses: 3 };
    if (phase === "roundOver") return { selector: '[data-testid="hint-target-tai-sai-bo-next"]', pulses: 3 };
    if (phase === "result") return { selector: '[data-testid="hint-target-tai-sai-bo-next"]', pulses: 3 };
    if (phase === "settled") return { selector: '[data-testid="hint-target-tai-sai-bo-next"]', pulses: 3 };
    if (phase === "banked") return { selector: '[data-testid="hint-target-tai-sai-bo-next"]', pulses: 3 };
    if (phase === "done") return { selector: '[data-testid="hint-target-tai-sai-bo-next"]', pulses: 3 };
    if (phase === "farkled") return { selector: '[data-testid="hint-target-tai-sai-bo-next"]', pulses: 3 };
    if (phase === "busted") return { selector: '[data-testid="hint-target-tai-sai-bo-next"]', pulses: 3 };
    return { selector: '[data-testid="hint-target-tai-sai-bo-roll"]', pulses: 3 };
  },
  component: TaiSaiBoGame,
};
