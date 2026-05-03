import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { SushiConveyorState, SushiConveyorAction, SushiConveyorSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { SushiConveyorGame } from "./Game.js";

const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;

export const sushiConveyorPlugin: GamePlugin<SushiConveyorState, SushiConveyorAction, typeof settings> = {
  id: "sushi-conveyor",
  title: "Sushi Conveyor",
  category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Dice-drafting Sushi variant — roll dice into conveyor.",
  howToPlay: "Sushi Conveyor is a dice-drafting sushi distillation across ten turns. You start with $180 cash, no Sushi plates, and no Chef upgrades. Each turn, pick one action: Buy a Plate for $30, Save your cash for 5% interest, Hire a Chef for $50, or Serve a Plate back to the conveyor for $25-45.\n\nAfter your action, every Plate earns $6 in tips and every Chef earns $10 from prep speed. A conveyor flavor event reflects the dice that rolled by. Your final score is net worth — cash plus cost-basis value of plates and chefs. Pick from the conveyor before it moves on; the right combo of nigiri, maki, and dumplings can end the night with the highest tip total. Itadakimasu.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as SushiConveyorSettings),
  reducer,
  isTerminal,
  hint: (state: any) => {
    if (state.phase === "choosing") return { selector: '[data-testid="hint-target-sushi-conveyor-primary"]', pulses: 3 };
    if (state.phase === "resolved") return { selector: '[data-testid="hint-target-sushi-conveyor-next"]', pulses: 3 };
    return null;
  },
  component: SushiConveyorGame,
};
