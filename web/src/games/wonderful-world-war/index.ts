import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { WonderfulWorldWarState, WonderfulWorldWarAction, WonderfulWorldWarSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { WonderfulWorldWarGame } from "./Game.js";

const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;

export const wonderfulWorldWarPlugin: GamePlugin<WonderfulWorldWarState, WonderfulWorldWarAction, typeof settings> = {
  id: "wonderful-world-war",
  title: "Wonderful World: War or Peace",
  category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Conflict-track draft with co-op shift.",
  howToPlay: "Wonderful World: War or Peace is a homage to the Frederic Guerard expansion that adds a conflict scoring track and a cooperation-vs-competition shift. Each round three cards appear: pick one, the CPU takes the highest of the rest. Across eight rounds you build a tableau. Three of one suit earn +10 (a war milestone); five earn an additional +15 (a peace treaty). Pairs of rank earn +5 (a small skirmish); three-of-a-kind +10 (a major engagement). Raw ranks sum as empire points. Score equals tableau total plus +25 for beating the CPU. Strategy: war-style commits to one suit are powerful but block the peace bonus from diverse picks. Aim for 70-110 with the bonus.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as WonderfulWorldWarSettings),
  reducer,
  isTerminal,
  component: WonderfulWorldWarGame,
};
