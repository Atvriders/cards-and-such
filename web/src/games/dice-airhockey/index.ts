import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { DiceAirhockeyState, DiceAirhockeyAction, DiceAirhockeySettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { DiceAirhockeyGame } from "./Game.js";

const settings = { dummy: { kind:"boolean" as const, label:"Standard rules", default:true } } as const;
type S = SettingsOf<typeof settings>;

export const diceAirhockeyPlugin: GamePlugin<DiceAirhockeyState, DiceAirhockeyAction, typeof settings> = {
  id: "dice-airhockey",
  title: "Dice Air Hockey",
  category: "dice",
  players: { min: 1, max: 1, multiplayer: false },
  description: 'Dice Air Hockey: play rallies to 7; first to target wins the match.',
  howToPlay: 'Dice Air Hockey is a real, dice-driven simulation. Dice Air Hockey: play rallies to 7; first to target wins the match.\\n\\nPress Roll to take your turn. Each round resolves immediately and the running score updates after every roll. Press Next to advance until the match ends.\\n\\nGame state is fully seeded for replay parity, and the log strip shows your most recent rolls.',
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as DiceAirhockeySettings),
  reducer,
  isTerminal,
  component: DiceAirhockeyGame,
};
