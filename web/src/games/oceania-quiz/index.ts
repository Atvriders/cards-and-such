import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { OceaniaQuizState, OceaniaQuizAction, OceaniaQuizSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const OceaniaQuizGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.OceaniaQuizGame as unknown as React.ComponentType<unknown> })));
const settings = { questions: { kind:"enum" as const, label:"Questions", options:["10","20","30"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const oceaniaQuizPlugin: GamePlugin<OceaniaQuizState, OceaniaQuizAction, typeof settings> = {
  id:"oceania-quiz", title:"Oceania Quiz", category:"board",
  players:{ min:1, max:1, multiplayer:false },
  description:"Australia, NZ, and the Pacific island nations from Fiji to Palau.",
  howToPlay:`Oceania Quiz spans Australia, New Zealand, Papua New Guinea, and the dozens of island nations scattered across Melanesia, Micronesia, and Polynesia. From the iconic Sydney Opera House to the tiny atolls of Tuvalu, this quiz tests your knowledge of one of the world's most far-flung regions.\n\nQuestions cover capitals (Suva, Apia, Honiara), iconic landforms (Uluru, Aoraki/Mt. Cook, the Great Barrier Reef), and the seas, straits, and rivers that knit it all together.\n\nYou will encounter island nations many people overlook — Nauru (the country with no official capital), Kiribati, Palau, the Marshall Islands. There are also questions on Australia's states, New Zealand's two main islands, and French Polynesia.\n\nEach question has a 15-second timer. Correct answers earn 100 points plus 10 per remaining second. Choose 10, 20, or 30 questions in Settings. G'day, kia ora — let's go!`,
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as OceaniaQuizSettings),
  reducer,isTerminal,
  hint: (state: OceaniaQuizState): HintTarget | null => state.phase === "playing" ? { selector: '[data-testid="hint-target-quiz-answer-0"]', pulses: 3 } : null,
  component:OceaniaQuizGame,
};
