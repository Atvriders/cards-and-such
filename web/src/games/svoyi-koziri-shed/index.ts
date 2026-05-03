import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, SettingsOf, HintTarget } from "../../platform/game-plugin/types.js";
import type { SvoyiKoziriShedState, SvoyiKoziriShedAction, SvoyiKoziriShedSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const SvoyiKoziriShedGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.SvoyiKoziriShedGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const svoyiKoziriShedPlugin: GamePlugin<SvoyiKoziriShedState, SvoyiKoziriShedAction, typeof settings> = {
  id: "svoyi-koziri-shed", title: "Svoyi Koziri", category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Russian own-trumps shedding.",
  howToPlay: "Svoyi Koziri ('Own Trumps') is a Russian shedding card game where each player has their own personal trump suit chosen secretly at the start. Players in turn play cards trying to dump them on opponents, who must take them unless they can defend with a higher card of the same suit or with one of their own trumps.\n\nIn this single-player version you face the CPU across six rounds. At the start of each round you secretly pick a trump suit and the CPU does the same. You then take turns attacking each other with cards. The first to empty their hand wins twenty points plus a five-point bonus per CPU card left.\n\nChoosing a trump suit you have many high cards in is the key skill — without strong personal trumps you cannot defend yourself and the CPU dumps cards on you freely. Across six rounds a strong total is around seventy points.\n\nSvoyi Koziri is part of the Durak family of Russian games and is popular in Saint Petersburg and Moscow. Press Play to deal the next round.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as SvoyiKoziriShedSettings),
  reducer, isTerminal, 
  hint: (state: SvoyiKoziriShedState): HintTarget | null => {
    if (state.phase === "done") return null;
    if (state.phase === "ready") return { selector: '[data-testid="hint-target-svoyi-koziri-shed-play"]', pulses: 3 };
    if (state.phase === "scored") return { selector: '[data-testid="hint-target-svoyi-koziri-shed-next"]', pulses: 3 };
    return null;
  },
  component: SvoyiKoziriShedGame,
};
