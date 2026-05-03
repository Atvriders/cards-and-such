import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, SettingsOf, HintTarget } from "../../platform/game-plugin/types.js";
import type { ExNovoMapmakerState, ExNovoMapmakerAction, ExNovoMapmakerSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const ExNovoMapmakerGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.ExNovoMapmakerGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const exNovoMapmakerPlugin: GamePlugin<ExNovoMapmakerState, ExNovoMapmakerAction, typeof settings> = {
  id: "ex-novo-mapmaker",
  title: "Ex Novo: Mapmaker",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Solo map-making homage; city generation through prompts.",
  howToPlay: "Ex Novo: Mapmaker is a solo journaling homage to Adam Vass and Martin Nerurkar's Ex Novo, a solo map-making and city-generation game where prompts and dice roll a settlement through founders, fortunes, fires, and forgotten quarters.\n\nAcross ten era entries you decide what the town builds, burns, and rebuilds. Each entry offers four weighted choices (A-D); your pick assigns a base reward plus 0-20 of mulberry32 variance.\n\nThe original Ex Novo uses oracle tables, a hex sheet, and incremental sketching. This solo digital homage replaces the sketching with prompt-and-roll while preserving the era-shaping tone of watching a town grow up from a crossroads to a capital — or down from a capital to a name on an old map.\n\nThe town does not need you. But the chronicle does. Keep marking eras even when the population shrinks.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as ExNovoMapmakerSettings),
  reducer, isTerminal, hint: (state: ExNovoMapmakerState): HintTarget | null => (state.phase === "choose" ? { selector: '[data-testid="hint-target-ex-novo-mapmaker-primary"]', pulses: 3 } : null), component: ExNovoMapmakerGame,
};
