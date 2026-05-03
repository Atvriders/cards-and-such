import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { ChineseBjState, ChineseBjAction, ChineseBjSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const ChineseBjGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.ChineseBjGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const chineseBjPlugin: GamePlugin<ChineseBjState, ChineseBjAction, typeof settings> = {
  id: "chinese-bj", title: "Chinese Blackjack", category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Ban Luck variant with special hands and 15-point natural rules.",
  howToPlay: "Chinese Blackjack, known as Ban Luck or Twenty-One in Chinese New Year traditions, has special bonus hands beyond plain blackjack. Two aces score automatically as Ban-Ban (pays the most). Two cards totalling fifteen pays as Free Hand. Five cards totalling under twenty-one pays as Five-Dragon.\n\nEach round you place a one-credit bet, take two cards, and may hit or stand. The dealer hits on sixteen and stands on seventeen, with standard values: 2-10 face, J/Q/K = 10, aces eleven or one.\n\nTwelve rounds are played. A regular win pays twelve points. A two-ace Ban-Ban pays twenty-five points. A Five-Dragon (five cards under twenty-two) pays twenty points. A tie pushes for six points. A loss or bust pays zero.\n\nExpected score is around fifty-five points across twelve rounds; a Ban-Ban or Five-Dragon in the run can push past eighty. The variant rewards going for five-card hands when reasonable — three soft cards under fifteen is enough motivation to keep hitting in this version, unlike standard blackjack.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as ChineseBjSettings),
  hint: (state) => {
    if (state.phase === "scored") return { selector: '[data-testid="hint-target-chinese-bj-next"]', pulses: 3 };
    if (state.phase !== "play") return null;
    const total = state.total;
    if (total < 12) return { selector: '[data-testid="hint-target-chinese-bj-hit"]', pulses: 3 };
    if (total >= 17) return { selector: '[data-testid="hint-target-chinese-bj-stand"]', pulses: 3 };
    return { selector: '[data-testid="hint-target-chinese-bj-hit"]', pulses: 3 };
  },
  reducer, isTerminal, component: ChineseBjGame,
};
