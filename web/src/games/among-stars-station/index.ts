import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { AmongStarsStationState, AmongStarsStationAction, AmongStarsStationSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { AmongStarsStationGame } from "./Game.js";

const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;

export const amongStarsStationPlugin: GamePlugin<AmongStarsStationState, AmongStarsStationAction, typeof settings> = {
  id: "among-stars-station",
  title: "Among the Stars",
  category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Alien station construction card draft.",
  howToPlay: "Among the Stars is a homage to Vangelis Bagiartakis's drafting and tableau-building game, where players build alien space stations through card placement adjacency bonuses. Each round three cards appear: pick one, the CPU takes the highest of the rest. Across eight rounds you build a tableau. Three of one suit earn +10 (an adjacency cluster); five earn an additional +15 (a station wing). Pairs of rank earn +5 (a docking bay); three-of-a-kind +10 (a hub module). Raw ranks sum as station capacity. Score equals tableau total plus +25 for beating the CPU. Strategy: adjacency-based games reward committing to one suit early to maximize cluster bonuses. Aim for 70-110 with the bonus.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as AmongStarsStationSettings),
  reducer,
  isTerminal,
  component: AmongStarsStationGame,
};
