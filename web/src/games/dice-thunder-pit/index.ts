import type { GamePlugin, SettingsOf, HintTarget } from "../../platform/game-plugin/types.js";
import type { DiceThunderPitState, DiceThunderPitAction, DiceThunderPitSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { DiceThunderPitGame } from "./Game.js";

const settings = { dummy: { kind:"boolean" as const, label:"Standard rules", default:true } } as const;
type S = SettingsOf<typeof settings>;

export const diceThunderPitPlugin: GamePlugin<DiceThunderPitState, DiceThunderPitAction, typeof settings> = {
  id: "dice-thunder-pit",
  title: "Dice Thunder Pit",
  category: "dice",
  players: { min: 1, max: 1, multiplayer: false },
  description: 'Dice Thunder Pit: race 18 squares against 3 CPUs; first across the line wins.',
  howToPlay: 'Dice Thunder Pit is a real, dice-driven simulation. Dice Thunder Pit: race 18 squares against 3 CPUs; first across the line wins.\\n\\nPress Roll to take your turn. Each round resolves immediately and the running score updates after every roll. Press Next to advance until the match ends.\\n\\nGame state is fully seeded for replay parity, and the log strip shows your most recent rolls.',
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as DiceThunderPitSettings),
  reducer,
  isTerminal,
  hint: (state: DiceThunderPitState): HintTarget | null => {
    if (isTerminal(state)) return null;
    if (state.phase === "rolling") return { selector: '[data-testid="hint-target-dice-thunder-pit-roll"]', pulses: 3 };
    if (state.phase === "rolled") return { selector: '[data-testid="hint-target-dice-thunder-pit-next"]', pulses: 3 };
    return null;
  },
  component: DiceThunderPitGame,
};
