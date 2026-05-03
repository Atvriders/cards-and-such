import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { QuestElDoradoState, QuestElDoradoAction, QuestElDoradoSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const QuestElDoradoGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.QuestElDoradoGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const questElDoradoPlugin: GamePlugin<QuestElDoradoState, QuestElDoradoAction, typeof settings> = {
  id:"quest-el-dorado",
  title:"Quest El Dorado",
  category:"cards",
  players:{ min:1, max:1, multiplayer:false },
  description:"Race through jungle terrain card by card.",
  howToPlay:"Quest El Dorado is a 10-round jungle race card game inspired by the deckbuilder. Each round, three Travel cards are drawn from a fantasy expedition deck: Foot (1), Paddle (2), Machete (3), Coin (4), and Compass (6). Sum the values for your round score — these represent the distance you travel that round. 🌴\n\nNo decisions — pure expedition luck. Average rounds score about 9 points. Across 10 rounds expect totals near 80 to 110. A Compass-heavy round (three) scores 18 — a rare jungle leap forward.\n\nPress Draw to advance into the jungle, then Next to continue. Each card shows its travel type and value. Score 100+ to reach the Lost City of Gold first. The compact UI lets you race through the game in less than a minute, capturing the exciting fantasy expedition vibe of the original Spiel des Jahres-nominated favorite.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as QuestElDoradoSettings),
  reducer,
  isTerminal,hint: (state) => isTerminal(state) ? null : ({ selector: '[data-testid="hint-target-quest-el-dorado-primary"]', pulses: 3 }),
  component:QuestElDoradoGame,
};
