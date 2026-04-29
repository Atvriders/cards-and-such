import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { SushiGoPartyMenuState, SushiGoPartyMenuAction, SushiGoPartyMenuSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { SushiGoPartyMenuGame } from "./Game.js";

const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;

export const sushiGoPartyMenuPlugin: GamePlugin<SushiGoPartyMenuState, SushiGoPartyMenuAction, typeof settings> = {
  id: "sushi-go-party-menu",
  title: "Sushi Go Party: Menu",
  category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Expanded conveyor card draft with menu selection.",
  howToPlay: "Sushi Go Party: Menu is a homage to the Sushi Go Party expansion of Phil Walker-Harding's conveyor-belt drafting game, where the menu of card types is selected from a pool before play. Each round three cards appear: pick one, the CPU takes the highest of the rest. Across eight rounds you build a tableau of suns, moons, stars, and leaves. Sets of three of one suit earn +10 bonus; five of one suit earn an additional +15 bonus. Pairs of the same rank earn +5; three-of-a-kind +10. Raw rank totals are summed too. Score equals tableau total plus a +25 bonus for beating the CPU. The Party menu's larger card pool is represented by aggressive bonus stacking for committing to a single suit early. Aim for 70-110 with the bonus.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as SushiGoPartyMenuSettings),
  reducer,
  isTerminal,
  component: SushiGoPartyMenuGame,
};
