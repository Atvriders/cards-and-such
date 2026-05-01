import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { DiceDiscGolfState, DiceDiscGolfAction, DiceDiscGolfSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { DiceDiscGolfGame } from "./Game.js";

const settings = { dummy: { kind:"boolean" as const, label:"Standard rules", default:true } } as const;
type S = SettingsOf<typeof settings>;

export const diceDiscGolfPlugin: GamePlugin<DiceDiscGolfState, DiceDiscGolfAction, typeof settings> = {
  id: "dice-disc-golf",
  title: "Dice Disc Golf",
  category: "dice",
  players: { min: 1, max: 1, multiplayer: false },
  description: 'Disc Golf: 9 holes, score versus par; total strokes is your score (lower is better).',
  howToPlay: 'Dice Disc Golf is a real, dice-driven simulation. Disc Golf: 9 holes, score versus par; total strokes is your score (lower is better).\\n\\nPress Roll to take your turn. Each round resolves immediately and the running score updates after every roll. Press Next to advance until the match ends.\\n\\nGame state is fully seeded for replay parity, and the log strip shows your most recent rolls.',
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as DiceDiscGolfSettings),
  reducer,
  isTerminal,
  component: DiceDiscGolfGame,
};
