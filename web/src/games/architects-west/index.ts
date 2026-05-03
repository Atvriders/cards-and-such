import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, SettingsOf, HintTarget } from "../../platform/game-plugin/types.js";
import type { ArchitectsWestState, ArchitectsWestAction, ArchitectsWestSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const ArchitectsWestGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.ArchitectsWestGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;

export const architectsWestPlugin: GamePlugin<ArchitectsWestState, ArchitectsWestAction, typeof settings> = {
  id: "architects-west",
  title: "Architects of the West Kingdom",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Cathedral-building mini: 10 turns of Stones and Apprentices and shadowy deals.",
  howToPlay: "Architects of the West Kingdom condenses the cathedral-building worker placement classic into ten quick turns. You begin with $200 cash, no Stones, and no Apprentices. Each turn, pick one action: Quarry a Stone for $40, Save your cash for 5% interest, Hire an Apprentice for $60, or Sell a Stone back to the cathedral for a roughly $30-50 payout. After your action, every Stone in your inventory earns $8 from cathedral progress and every Apprentice earns $12 from skilled labor. A medieval kingdom event flavors the turn. Your final score is your net worth — cash plus the cost-basis value of your stones and apprentices. Stones yield reliable cathedral income but tie up capital, apprentices amplify yields but cost more, and saving is slow but safe. Aim for a balanced cathedral build by turn 10 to be hailed as the West Kingdom's master architect.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as ArchitectsWestSettings),
  reducer,
  isTerminal,
  hint: (state: ArchitectsWestState): HintTarget | null => (state.phase === "choosing" ? { selector: '[data-testid="hint-target-architects-west-primary"]', pulses: 3 } : null),
  component: ArchitectsWestGame,
};
