import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, SettingsOf, HintTarget } from "../../platform/game-plugin/types.js";
import type { CasState, CasAction, CasSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const CasGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.CasGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;

const hint = (state: CasState): HintTarget | null => {
  if (isTerminal(state)) return null;
  if (state.phase === "ready") return { selector: '[data-testid="hint-target-lazy-pineapple-cas-primary"]', pulses: 3 };
  if (state.phase === "scored") return { selector: '[data-testid="hint-target-lazy-pineapple-cas-secondary"]', pulses: 3 };
  return null;
};
export const lazyPineappleCasPlugin: GamePlugin<CasState, CasAction, typeof settings> = {
  id: "lazy-pineapple-cas",
  title: "Lazy Pineapple",
  category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Pineapple variant with discard delayed to showdown.",
  howToPlay: "Lazy Pineapple is a Pineapple Hold'em variant where the third hole card discard happens at showdown rather than after the flop — players keep all three hole cards through every betting round and only commit which two count when the river is dealt. This makes Lazy Pineapple closer to a five-card-best-of-seven game.\n\nIn this single-player adaptation you play twelve rounds against the dealer. Press Play each round to deal three holes plus a five-card community board; the engine picks your best two of three automatically. The five-card hand evaluates against the dealer's hand: stronger pays twelve, equal pays five, weaker pays zero. Press Next after each result.\n\nExpected score across twelve rounds is forty to one hundred. Lazy Pineapple is the most player-friendly of the Pineapple variants since you never lock yourself out of a draw. The variant is popular in casual home games and dealer's-choice rotations. Swing big, hold all three holes to showdown, and let the river decide.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as CasSettings),
  reducer,
  isTerminal,
  hint: hint, component: CasGame,
};
