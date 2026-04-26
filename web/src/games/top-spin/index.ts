import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { TopSpinState, TopSpinAction, TopSpinSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { TopSpinGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const topSpinPlugin: GamePlugin<TopSpinState, TopSpinAction, typeof settings> = {
  id: "top-spin", title: "Top Spin", category: "arcade",
  players: { min:1, max:1, multiplayer:false },
  description: "Set the perfect spin rate to keep the top balanced and spinning longest!",
  howToPlay: `Top Spin is a balance precision game. Each round, set the spin rate of a spinning top using the slider. Too slow and it wobbles and falls; too fast and it flies off balance. The ideal rate sits in a sweet spot.\n\nAdjust the Spin Rate and press Go! Score depends on how precisely you hit the target spin for each round. The target shifts slightly each round to simulate different top sizes and surfaces.\n\n10 rounds per game. Learn from your feedback and converge on the ideal rate to maximize your score!`,
  settings,
  initialState: (seed:number, s:S) => initialState(seed, s as TopSpinSettings),
  reducer, isTerminal, component: TopSpinGame,
};
