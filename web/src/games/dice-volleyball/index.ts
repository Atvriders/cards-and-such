import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { DiceVolleyballState, DiceVolleyballAction, DiceVolleyballSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { DiceVolleyballGame } from "./Game.js";

const settings = { dummy: { kind:"boolean" as const, label:"Standard rules", default:true } } as const;
type S = SettingsOf<typeof settings>;

export const diceVolleyballPlugin: GamePlugin<DiceVolleyballState, DiceVolleyballAction, typeof settings> = {
  id: "dice-volleyball",
  title: "Dice Volleyball",
  category: "dice",
  players: { min: 1, max: 1, multiplayer: false },
  description: 'Dice Volleyball: play rallies to 25; first to target wins the match.',
  howToPlay: 'Dice Volleyball is a real, dice-driven simulation. Dice Volleyball: play rallies to 25; first to target wins the match.\\n\\nPress Roll to take your turn. Each round resolves immediately and the running score updates after every roll. Press Next to advance until the match ends.\\n\\nGame state is fully seeded for replay parity, and the log strip shows your most recent rolls.',
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as DiceVolleyballSettings),
  reducer,
  isTerminal,
  component: DiceVolleyballGame,
};
