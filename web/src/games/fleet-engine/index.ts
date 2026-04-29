import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { FleetEngineState, FleetEngineAction, FleetEngineSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { FleetEngineGame } from "./Game.js";
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const fleetEnginePlugin: GamePlugin<FleetEngineState, FleetEngineAction, typeof settings> = {
  id: "fleet-engine",
  title: "Fleet: The Dice Game",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Roll dice to fish and launch boats; engine-building in write form.",
  howToPlay: "Fleet: The Dice Game is a roll-and-write fishing-and-shipping game where dice drive engine-building. In this adaptation you build a fishing fleet on a 4x4 grid by rolling a single d6 each turn and assigning the value to a boat cell. Click Roll, then click any empty cell to mark it with the rolled number. You may Skip a roll if no boat fits. Each marked boat scores its dice value as catch. Strategy: chase row and column completions (+5 each) and the +10 full-fleet bonus. The engine-building theme rewards consistency — keep marking high rolls to fund larger boats. Lower rolls can close out partial lines for bonus eligibility. After 12 rolls the season ends. A solid Fleet score is 34-48 points; an exceptional captain reaches 65+. Every voyage starts from a fresh seeded dice sequence to ensure unique fishing trips.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as FleetEngineSettings),
  reducer,
  isTerminal,
  component: FleetEngineGame,
};
