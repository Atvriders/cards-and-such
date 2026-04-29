import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { IsleOfCatsState, IsleOfCatsAction, IsleOfCatsSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { IsleOfCatsGame } from "./Game.js";

const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;

export const isleOfCatsPlugin: GamePlugin<IsleOfCatsState, IsleOfCatsAction, typeof settings> = {
  id: "isle-of-cats",
  title: "Isle of Cats",
  category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Boat-filling polyomino cat rescue — lesson and explore cards.",
  howToPlay: "Isle of Cats condenses the boat-filling cat rescue into ten quick turns. You begin with $200 cash, no Cat cards, and no Boat upgrades. Each turn, pick one action: Rescue a Cat for $35, Save your cash for 5% interest, Buy a Boat Upgrade for $55, or Adopt out a Cat for a $25-45 reward.\n\nAfter your action, every Cat earns $7 from sponsor donations and every Boat earns $11 from harbor fees. A whisker-event flavors each turn. Your final score is net worth — cash plus the cost-basis value of your cats and boats. Pack the boat tight using polyomino-style space planning, but balance crowding with steady donations. Save every kitty by turn 10. Meow.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as IsleOfCatsSettings),
  reducer,
  isTerminal,
  component: IsleOfCatsGame,
};
