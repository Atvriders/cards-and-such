import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { CrewDeepSeaCoopState, CrewDeepSeaCoopAction, CrewDeepSeaCoopSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { CrewDeepSeaCoopGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const crewDeepSeaCoopPlugin: GamePlugin<CrewDeepSeaCoopState, CrewDeepSeaCoopAction, typeof settings> = {
  id: "crew-deep-sea-coop",
  title: "The Crew: Deep Sea Co-op",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Cooperative dice mission inspired by The Crew: Mission Deep Sea — you and an ally race a target.",
  howToPlay: "The Crew: Deep Sea Co-op turns the spirit of Thomas Sing's award-winning trick-taking game into a 10-round solo cooperative dice challenge. You and an AI ally each roll a die per round; you sum the results and chase a shared target by the end of round 10.\n\nEach round you press Play Round, both dice show their values, and the combined total is added to the team score. Press Next Round to continue, or Finish on round 10. If the team total reaches 70 or more, the mission succeeds and you earn a 50-point bonus on top of your raw score.\n\nThere's no individual scoring — everything you achieve is for the team, just like the original card game. The Deep Sea theme references signal-jamming distress modifiers; here we keep things simple, but the cooperative ethos is intact.\n\nStrong rolls early let you coast; weak rolls force tense final rounds. Either way, every round counts equally, and surfacing alive feels great.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as CrewDeepSeaCoopSettings),
  reducer, isTerminal, component: CrewDeepSeaCoopGame,
};
