import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { JokingHazardCardState, JokingHazardCardAction, JokingHazardCardSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const JokingHazardCardGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.JokingHazardCardGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const jokingHazardCardPlugin: GamePlugin<JokingHazardCardState, JokingHazardCardAction, typeof settings> = {
  id: "joking-hazard-card", title: "Joking Hazard", category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Joking Hazard comic-strip card trivia. Identify panel completion category.",
  howToPlay: "Joking Hazard is a Cyanide & Happiness party card game where players fill the third panel of a three-panel comic strip with a card from their hand. Twelve rounds show a two-panel setup and ask which type of completion would land best (Action, Reaction, Twist, Surreal, etc.) — ten points per correct, 120 max. The game launched on Kickstarter in 2016 to record-breaking funding and was designed by the Cyanide & Happiness webcomic creators. The deck contains 360 cards, all illustrated in the trademark stick-figure style. Adult party-game fans hit 100+; casual quizzers should clear 60-80. Run takes around two minutes. Submit each guess and Next to advance. Joking Hazard is rated M for Adult — 18+ jokes — and pairs well with Cards Against Humanity, What Do You Meme, and Drunk Stoned or Stupid in your party-night rotation. The trivia mode here strips out the adult content to keep things friendly.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as JokingHazardCardSettings),
  reducer, isTerminal, hint: (state: JokingHazardCardState): HintTarget | null => state.phase === "playing" ? { selector: '[data-testid="hint-target-joking-hazard-card-answer-0"]', pulses: 3 } : null, component: JokingHazardCardGame,
};
