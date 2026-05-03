import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { FramedFilmState, FramedFilmAction, FramedFilmSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const FramedFilmGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.FramedFilmGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const framedFilmPlugin: GamePlugin<FramedFilmState, FramedFilmAction, typeof settings> = {
  id: "framed-film", title: "Framed Film", category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Guess the film from a sequence of frame clues.",
  howToPlay: "Framed Film tests cinema knowledge by clue-cluster. Each of fifteen rounds gives you a three-element scene description ('Spaceship, lightsaber, desert planet') and asks which film matches. Pick from four candidates, hit Submit, score ten points if right. Fifteen rounds, max 150 points. The film pool spans Star Wars, Harry Potter, Lord of the Rings, Jurassic Park, Titanic, Back to the Future, James Bond, Rocky, Jaws, Finding Nemo, Toy Story, The Lion King, Frozen, and Yellow Submarine — broadly recognized blockbusters and animations. Framed Film mimics the daily online Framed puzzle where players guess films from sequential frame-stills. This digital version uses textual scene clues instead. Cinema buffs hit 110+; casual viewers 60-90. Hit Submit and Next to advance. Total run takes about two minutes. Perfect scores certify deep film knowledge useful for film-club warm-ups and party trivia rounds.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as FramedFilmSettings),
  reducer, isTerminal, hint: (state: FramedFilmState): HintTarget | null => state.phase === "playing" ? { selector: '[data-testid="hint-target-framed-film-answer-0"]', pulses: 3 } : null, component: FramedFilmGame,
};
