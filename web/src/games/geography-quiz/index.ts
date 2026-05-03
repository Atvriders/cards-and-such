import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { GeographyQuizState, GeographyQuizAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const GeographyQuizGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.GeographyQuizGame as unknown as React.ComponentType<unknown> })));
export const geographyQuizSettings = {
  difficulty: {
    kind: "enum" as const,
    label: "Difficulty",
    options: ["easy", "medium", "hard"] as const,
    default: "easy" as const,
  },
  rounds: {
    kind: "enum" as const,
    label: "Rounds",
    options: ["10", "20", "30"] as const,
    default: "10" as const,
  },
} as const;

type GeographyQuizSettingsType = SettingsOf<typeof geographyQuizSettings>;

export const geographyQuizPlugin: GamePlugin<GeographyQuizState, GeographyQuizAction, typeof geographyQuizSettings> = {
  id: "geography-quiz",
  title: "Geography Quiz",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Name that capital! Multiple-choice country-to-capital questions drawn from 140+ countries worldwide.",
  howToPlay: `Geography Quiz challenges you to identify national capitals from around the world. Each question names a country — for example "What is the capital of Brazil?" — and presents four multiple-choice answers. Click the one you believe is correct, then press Submit.

After submitting, the correct answer lights up green and any wrong selection turns red. Press Next to move on to the following question.

The Difficulty setting controls which countries are included. Easy covers the 20 most well-known countries (major powers and famous capitals). Medium adds another 40 countries spanning Europe, Asia, Africa, and the Americas. Hard unlocks the full pool of 140+ countries, including smaller nations and capitals that many people find surprising.

Each correct answer earns 10 points. You can play 10, 20, or 30 rounds per session.

Tips: Capitals are not always the largest city — Australia's capital is Canberra, not Sydney or Melbourne. Brazil's capital is Brasília, not Rio de Janeiro or São Paulo. Canada's is Ottawa, not Toronto. South Africa has three capitals: Pretoria (administrative) is the one typically tested. When in doubt, eliminate the most famous city in the country — it is often not the capital.`,
  settings: geographyQuizSettings,
  initialState: (seed: number, settings: GeographyQuizSettingsType) => initialState(seed, settings),
  reducer,
  isTerminal,
  hint: (state: GeographyQuizState): HintTarget | null => state.phase === "playing" ? { selector: '[data-testid="hint-target-quiz-answer-0"]', pulses: 3 } : null,
  component: GeographyQuizGame,
};
