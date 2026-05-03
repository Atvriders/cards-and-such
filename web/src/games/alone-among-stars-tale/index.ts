import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, SettingsOf, HintTarget } from "../../platform/game-plugin/types.js";
import type { AloneAmongStarsTaleState, AloneAmongStarsTaleAction, AloneAmongStarsTaleSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const AloneAmongStarsTaleGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.AloneAmongStarsTaleGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const aloneAmongStarsTalePlugin: GamePlugin<AloneAmongStarsTaleState, AloneAmongStarsTaleAction, typeof settings> = {
  id: "alone-among-stars-tale",
  title: "Alone Among the Stars: Tale",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Solo journaling homage — describe an alien world card by card.",
  howToPlay: "Alone Among the Stars: Tale is a solo journaling homage to Takuma Okada's ultra-minimal solo game where a scout describes the strange new worlds they find. The original uses a deck of cards and asks one beautiful question per draw. This version distills it to ten prompts of choice-and-consequence.\n\nEach prompt asks you what you notice, what you do, or what you record. Pick one of four choices A-D; each assigns a base reward plus 0-20 of variance via the seeded oracle. Curious choices may reward more than cautious ones — or vice versa, depending on the seed.\n\nThe original Alone Among the Stars is famous for being a short, peaceful, elegiac experience. This homage preserves the tone with a deliberately soft scoring loop. Walk the surface, take a breath, write a note. There are no monsters. There are no goals. There is only the world.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as AloneAmongStarsTaleSettings),
  reducer, isTerminal, hint: (state: AloneAmongStarsTaleState): HintTarget | null => (state.phase === "choose" ? { selector: '[data-testid="hint-target-alone-among-stars-tale-primary"]', pulses: 3 } : null), component: AloneAmongStarsTaleGame,
};
