import type { GamePlugin, SettingsOf, HintTarget } from "../../platform/game-plugin/types.js";
import type { DiceGrandPrixF1State, DiceGrandPrixF1Action, DiceGrandPrixF1Settings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { DiceGrandPrixF1Game } from "./Game.js";

const settings = { dummy: { kind:"boolean" as const, label:"Standard rules", default:true } } as const;
type S = SettingsOf<typeof settings>;

export const diceGrandPrixF1Plugin: GamePlugin<DiceGrandPrixF1State, DiceGrandPrixF1Action, typeof settings> = {
  id: "dice-grand-prix-f1",
  title: "Dice Grand Prix F1",
  category: "dice",
  players: { min: 1, max: 1, multiplayer: false },
  description: 'Dice Grand Prix F1: race 30 squares against 3 CPUs; first across the line wins.',
  howToPlay: 'Dice Grand Prix F1 is a real, dice-driven simulation. Dice Grand Prix F1: race 30 squares against 3 CPUs; first across the line wins.\\n\\nPress Roll to take your turn. Each round resolves immediately and the running score updates after every roll. Press Next to advance until the match ends.\\n\\nGame state is fully seeded for replay parity, and the log strip shows your most recent rolls.',
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as DiceGrandPrixF1Settings),
  reducer,
  isTerminal,
  hint: (state: DiceGrandPrixF1State): HintTarget | null => {
    if (isTerminal(state)) return null;
    if (state.phase === "rolling") return { selector: '[data-testid="hint-target-dice-grand-prix-f1-roll"]', pulses: 3 };
    if (state.phase === "rolled") return { selector: '[data-testid="hint-target-dice-grand-prix-f1-next"]', pulses: 3 };
    return null;
  },
  component: DiceGrandPrixF1Game,
};
