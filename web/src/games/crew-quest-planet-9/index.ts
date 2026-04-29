import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { CrewQuestPlanet9State, CrewQuestPlanet9Action, CrewQuestPlanet9Settings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { CrewQuestPlanet9Game } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const crewQuestPlanet9Plugin: GamePlugin<CrewQuestPlanet9State, CrewQuestPlanet9Action, typeof settings> = {
  id: "crew-quest-planet-9",
  title: "The Crew: Quest for Planet Nine",
  category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Cooperative trick-taking — complete secret tasks in mission order.",
  howToPlay: "The Crew: Quest for Planet Nine is a cooperative trick-taking distillation. Each round you and your AI ally are given a secret task and must complete it in correct order. The combined dice represent the success chance of the trick — high rolls indicate the planned trick was won, low rolls mean a player misplayed and the mission falters.\n\nPress Play Round to attempt a task. Then press Next Round, or Finish on round 10. Reach 70 points to complete the mission and earn the Planet Nine bonus.\n\nIn the boxed game, players cannot reveal their hands; communication is limited to a single distress signal. This solo adaptation honours that constraint by simulating ally choices through dice. You set the strategy; the dice tell whether your imagined hand actually held the right card. Trust the math.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as CrewQuestPlanet9Settings),
  reducer, isTerminal, component: CrewQuestPlanet9Game,
};
