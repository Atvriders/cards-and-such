import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { SushiGoConveyorState, SushiGoConveyorAction, SushiGoConveyorSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { SushiGoConveyorGame } from "./Game.js";

const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;

export const sushiGoConveyorPlugin: GamePlugin<SushiGoConveyorState, SushiGoConveyorAction, typeof settings> = {
  id: "sushi-go-conveyor",
  title: "Sushi Go Conveyor",
  category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Conveyor-belt card draft. Collect sushi combos for points.",
  howToPlay: "Sushi Go Conveyor is a card-drafting game inspired by the Sushi Go conveyor-belt mechanic. Each round, three cards appear: pick one and your CPU opponent takes the highest-value remaining. Across eight rounds, both players build tableaux from suns, moons, stars, and leaves (the four sushi types). Sets of three of the same suit earn +10 bonus; five of the same suit earn an additional +15. Pairs of the same rank earn +5; three-of-a-kind earns +10. Beyond suit and rank bonuses, raw rank totals are summed too. Score equals your tableau total, plus a +25 bonus if you beat the CPU. Strategy: focus suits early, take the same suit twice to lock in a +10 bonus, even if rank values are lower than alternatives. Watch the CPU's pile too: when they're close to a +10 themselves, deny them by taking their suit. Aim for 60-100 with the bonus.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as SushiGoConveyorSettings),
  reducer,
  isTerminal,
  component: SushiGoConveyorGame,
};
