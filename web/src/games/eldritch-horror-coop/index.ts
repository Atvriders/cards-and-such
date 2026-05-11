import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, SettingsOf, HintTarget } from "../../platform/game-plugin/types.js";
import type { eldritchHorrorCoopState, eldritchHorrorCoopAction, eldritchHorrorCoopSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const eldritchHorrorCoopGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.eldritchHorrorCoopGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const eldritchHorrorCoopPlugin: GamePlugin<eldritchHorrorCoopState, eldritchHorrorCoopAction, typeof settings> = {
  id: "eldritch-horror-coop",
  title: "Eldritch Horror",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Worldwide Lovecraftian adventure — investigators traverse continents for ten rounds.",
  howToPlay: "Eldritch Horror is a worldwide cooperative Lovecraftian adventure distilled to ten dice rounds. You and your fellow investigator traverse the globe across ten rounds, building investigation score against the cosmic Ancient One.\n\nEach round, press Play Round. Two dice tumble simultaneously and their sum (2-12) joins your investigation score. Press Next Round to advance, Finish on round ten.\n\nThe Ancient One banishment target is 70. Reach it and you save the world with a +50 Cosmic Victory bonus. Miss it and the Ancient One wakes — at which point we're all doomed, but you tried your best.\n\nThe original Eldritch Horror takes investigators across six continents, gathering clues against unique Ancient Ones. This distillation captures the cooperative globe-spanning investigation tension across ten rounds without the world map. Solid investigators score around 70; heroic globe-trotters push 80+; star-crossed runs end at 60.\n\nThe stars are wrong; only your dice are right. Keep rolling.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as eldritchHorrorCoopSettings),
  reducer, isTerminal, hint: (state: eldritchHorrorCoopState): HintTarget | null => ((state.phase === "ready" || state.phase === "rolled") ? { selector: ".coop-btn", pulses: 3 } : null), component: eldritchHorrorCoopGame,
};
