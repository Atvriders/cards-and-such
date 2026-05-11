import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget, SettingsOf } from "../../platform/game-plugin/types.js";
import type { SeaBattleTaflState, SeaBattleTaflAction, SeaBattleTaflSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const SeaBattleTaflGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.SeaBattleTaflGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const seaBattleTaflPlugin: GamePlugin<SeaBattleTaflState, SeaBattleTaflAction, typeof settings> = {
  id: "sea-battle-tafl",
  title: "Sea Battle Tafl",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Viking-age Baltic Tafl variant — placement abstraction.",
  howToPlay: "Sea Battle Tafl is a Baltic Tafl variant with naval theming — pieces represent Viking longships defending or pursuing a flagship king. This 5x5 placement adaptation runs in under a minute. Across 14 turns you and a random CPU alternate placing pieces on empty squares. Click an empty cell. The CPU plays uniformly random. After fourteen moves the player with more pieces wins. Final scoreboard: 100 for a win, 25 for a tie. Like other Tafl games, the historic Sea Battle Tafl was asymmetric: defenders fewer in number but with the king-escape victory, attackers more numerous but needing to capture the king. The naval skin gave the game a Baltic identity distinct from Hnefatafl's Scandinavian roots. The placement reduction preserves the territorial dance — both sides still benefit from controlling the centre and the edges. Sea Battle Tafl boards have been excavated in Latvia and Estonia dating to the 9th century.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as SeaBattleTaflSettings),
  reducer, isTerminal, hint: (state: SeaBattleTaflState): HintTarget | null => ((state.phase === "playing" && state.turn === "P") ? { selector: ".ab-cell:not(.p):not(.c)", pulses: 3 } : null), component: SeaBattleTaflGame,
};
