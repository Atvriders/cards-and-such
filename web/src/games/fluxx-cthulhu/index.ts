import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { FluxxCthulhuState, FluxxCthulhuAction, FluxxCthulhuSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const FluxxCthulhuGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.FluxxCthulhuGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const fluxxCthulhuPlugin: GamePlugin<FluxxCthulhuState, FluxxCthulhuAction, typeof settings> = {
  id: "fluxx-cthulhu", title: "Cthulhu Fluxx", category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Cthulhu Fluxx variant trivia. Identify cosmic-horror card type from name.",
  howToPlay: "Cthulhu Fluxx tests your knowledge of Looney Labs' Lovecraftian horror Fluxx (2011). Twelve rounds present cards from the Cthulhu Fluxx deck — pick the type (Keeper, Goal, Action, New Rule, Creeper, Ungoal). Ten points per correct answer, 120 max. Cthulhu Fluxx's hallmark is the Ungoal: a card that, if its condition is met, makes every player lose simultaneously. Cosmic-horror fans love this twist. Keepers include Cultist, Investigator, Necronomicon, and Tome. Creepers include Old Ones, Insanity, and Doom. Goals can name 'Madness' (Insanity Creeper attached to a player). The deck mixes academic-occult Cthulhu vocabulary with chaotic Fluxx mechanics, producing the most thematically dark variant in the family. Lovecraft fans nail 100+; casual quizzers should clear 60. Run takes around two minutes. Submit each guess and Next to advance. Cthulhu Fluxx is recommended for anyone who enjoys Arkham Horror or Eldritch Horror but wants their cosmic horror in 30 minutes flat.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as FluxxCthulhuSettings),
  reducer, isTerminal, hint: (state: FluxxCthulhuState): HintTarget | null => state.phase === "playing" ? { selector: '[data-testid="hint-target-fluxx-cthulhu-answer-0"]', pulses: 3 } : null, component: FluxxCthulhuGame,
};
