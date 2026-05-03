import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { FluxxOriginalMiniState, FluxxOriginalMiniAction, FluxxOriginalMiniSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const FluxxOriginalMiniGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.FluxxOriginalMiniGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const fluxxOriginalMiniPlugin: GamePlugin<FluxxOriginalMiniState, FluxxOriginalMiniAction, typeof settings> = {
  id: "fluxx-original-mini", title: "Fluxx Original Mini", category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Trivia mini for Fluxx original deck. Identify card type from card name.",
  howToPlay: "Fluxx Original Mini is a quick-fire trivia about the original 1997 Fluxx deck by Looney Labs. Each of twelve rounds shows you a card name from the original Fluxx and asks which category (Action, New Rule, Keeper, Goal, or Creeper) it belongs to. Ten points per correct answer, 120 max. The original Fluxx popularised the 'rules shift mid-game' mechanic that anchors the entire Fluxx family. Cards like Cookies, Milk, Brain, Love and Toast are Keepers; Goals like 'Milk and Cookies' or 'Bread and Chocolate' tie them together. New Rules like 'Hand Limit 2' or 'Draw 4' alter play dynamically. Frequent Fluxx players will hit 110+; first-timers can still pass 60 by reading card names and inferring. Two minutes start to finish. Submit each pick and Next. A friendly invitation to dive into the original game and discover why Fluxx remains one of the most-played casual card games of the past three decades.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as FluxxOriginalMiniSettings),
  reducer, isTerminal, hint: (state: FluxxOriginalMiniState): HintTarget | null => state.phase === "playing" ? { selector: '[data-testid="hint-target-fluxx-original-mini-answer-0"]', pulses: 3 } : null, component: FluxxOriginalMiniGame,
};
