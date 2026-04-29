import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { CrewDistressSignalState, CrewDistressSignalAction, CrewDistressSignalSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { CrewDistressSignalGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const crewDistressSignalPlugin: GamePlugin<CrewDistressSignalState, CrewDistressSignalAction, typeof settings> = {
  id: "crew-distress-signal",
  title: "The Crew: Distress Signal",
  category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Cooperative trick-taking with distress flares replacing communication.",
  howToPlay: "The Crew: Distress Signal is a cooperative trick-taking variant where communication is reduced to a single distress flare per game. You and your AI ally must complete tasks across ten rounds. Combined dice represent successful tricks won in the right order. Hit 70 to complete the mission and earn the Signal Bonus.\n\nPress Play Round to play a trick. Then press Next Round, or Finish on round 10.\n\nIn the box, the distress flare lets one player reveal a single card to the team — a precious resource. This distillation honours the constraint by giving you fewer dice swings to work with. Your AI ally plays smart, but they can't read your mind. The Bonus rewards perfect mission completion. Fire the flare wisely. Roll the dice.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as CrewDistressSignalSettings),
  reducer, isTerminal, component: CrewDistressSignalGame,
};
