import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { MonopolyState, MonopolyAction, MonopolySettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { MonopolyMiniGame } from "./Game.js";

const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;

export const monopolyMiniPlugin: GamePlugin<MonopolyState, MonopolyAction, typeof settings> = {
  id: "monopoly-mini",
  title: "Monopoly Mini",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "16-square mini Monopoly board vs CPU. Roll 2d6, buy properties and railroads, collect rent, dodge jail.",
  howToPlay: `Monopoly Mini squeezes the 1935 Hasbro classic onto a tidy 16-square board: 4 corners (GO, Just-Visiting Jail, Free Parking, Go-To-Jail) and 3 spaces on each side. Properties are grouped by color, with two railroads, a Chance, and an Income Tax square mixed in.

How to play:
1. You and the CPU each start on GO with $500.
2. Press Roll Dice to roll 2d6 and advance the sum. Pass GO to collect $200.
3. Land on an unowned property/railroad → Buy or Skip.
4. Land on an opponent's property → pay the rent.
5. Roll doubles → roll again. Three doubles in a row → straight to jail. While jailed, doubles spring you free; otherwise you can pay $50 after 3 failed tries.
6. Land on Income Tax → pay $75. Land on Chance → small fortune (good or bad) drawn from your seed.

The game ends when someone goes bankrupt, or after 30 turns whoever has more cash + property value wins.

Score = (your cash + property value) − (CPU cash + property value) + 500, plus a 500 bonus for outright winning.`,
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as MonopolySettings),
  reducer,
  isTerminal,
  component: MonopolyMiniGame,
};
