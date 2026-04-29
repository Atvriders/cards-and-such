import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { PaleoSurvivalState, PaleoSurvivalAction, PaleoSurvivalSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { PaleoSurvivalGame } from "./Game.js";

const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;

export const paleoSurvivalPlugin: GamePlugin<PaleoSurvivalState, PaleoSurvivalAction, typeof settings> = {
  id: "paleo-survival",
  title: "Paleo Survival",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Stone Age cooperative-feel mini: 10 turns of Tools and Tribesmates.",
  howToPlay: "Paleo Survival distills the Stone Age survival cooperative into ten focused turns of resource management. You start with $200 supplies, no Tools, and no Tribesmates. Each turn, pick one action: Craft a Tool for $40, Save supplies for 5% interest, Recruit a Tribesmate for $60, or Sell a Tool back to the tribe for a roughly $30-50 payout. After your action, every Tool earns $8 from improved hunting and every Tribesmate earns $12 from foraging skill. A prehistoric event flavors the turn. Your final score is your net worth — supplies plus the cost-basis value of your tools and tribesmates. Tools yield reliable hunting bonuses but cost upfront, tribesmates amplify the tribe's intake but cost more, and saving is the safe slow path. Aim for a balanced tribe by turn 10 to survive the harsh paleolithic seasons.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as PaleoSurvivalSettings),
  reducer,
  isTerminal,
  component: PaleoSurvivalGame,
};
