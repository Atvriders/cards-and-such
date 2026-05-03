import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { MonetMemoryState, MonetMemoryAction, MonetMemorySettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const MonetMemoryGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.MonetMemoryGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const monetMemoryPlugin: GamePlugin<MonetMemoryState, MonetMemoryAction, typeof settings> = {
  id: "monet-memory", title: "Monet Paintings Memory", category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Match Claude Monet paintings to their year.",
  howToPlay: "Monet Paintings Memory turns the Impressionist canon into a brisk fifteen-round identification quiz. Each prompt names a year and asks which Monet canvas dates from then; pick the correct title from four candidates. The pool spans Garden at Sainte-Adresse (1867), The Magpie (1869), Impression Sunrise (1872), Studio Boat (1874), Woman with a Parasol (1875), Haystacks (1890), Poplars (1891), Rouen Cathedral (1894), Bridge over a Pond of Water Lilies (1899), The Japanese Footbridge (1899), Water Lilies (1906), and San Giorgio Maggiore at Dusk (1908). Correct answers score ten points each, wrongs zero. Maximum total is one hundred fifty points across fifteen rounds. The dating mirrors Monet's actual prolific decades — the Giverny period dominates 1890s through 1900s. Art history fans regularly hit 130+; casual viewers 60-90. Hit Submit to lock and Next to advance; finish all rounds to see your final score and accuracy ratio at session end.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as MonetMemorySettings),
  reducer, isTerminal, hint: (state: MonetMemoryState): HintTarget | null => state.phase === "playing" ? { selector: '[data-testid="hint-target-monet-memory-answer-0"]', pulses: 3 } : null, component: MonetMemoryGame,
};
