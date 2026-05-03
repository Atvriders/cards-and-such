import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { CinematrixYrState, CinematrixYrAction, CinematrixYrSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const CinematrixYrGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.CinematrixYrGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const cinematrixYrPlugin: GamePlugin<CinematrixYrState, CinematrixYrAction, typeof settings> = {
  id: "cinematrix-yr", title: "Cinematrix Year", category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Match films to their release year.",
  howToPlay: "Cinematrix Year tests film release-year knowledge. Each of fifteen rounds names a movie and asks which year it premiered. Pick from four candidate years, hit Submit, score ten points. Max 150 across all fifteen. The film pool covers Star Wars: A New Hope (1977), Jaws (1975), E.T. (1982), Titanic (1997), The Matrix (1999), Avatar (2009), Inception (2010), The Dark Knight (2008), Frozen (2013), Interstellar (2014), Get Out (2017), Parasite (2019), Forrest Gump (1994), Pulp Fiction (1994), Toy Story (1995), Jurassic Park (1993), Back to the Future (1985), and The Godfather (1972) — major hits across five decades. Distractor years are pulled from the same set, making cross-confusion possible (e.g., 1994 vs 1995). Cinematrix is a fast film-history quiz, less about plot and more about release-date timeline. Solid film buffs hit 130+; casual viewers 80-110. Hit Submit and Next.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as CinematrixYrSettings),
  reducer, isTerminal, hint: (state: CinematrixYrState): HintTarget | null => state.phase === "playing" ? { selector: '[data-testid="hint-target-cinematrix-yr-answer-0"]', pulses: 3 } : null, component: CinematrixYrGame,
};
