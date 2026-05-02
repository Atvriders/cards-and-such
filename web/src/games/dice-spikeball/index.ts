import type { GamePlugin, SettingsOf, HintTarget } from "../../platform/game-plugin/types.js";
import type { DiceSpikeballState, DiceSpikeballAction, DiceSpikeballSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { DiceSpikeballGame } from "./Game.js";

const settings = { dummy: { kind:"boolean" as const, label:"Standard rules", default:true } } as const;
type S = SettingsOf<typeof settings>;

export const diceSpikeballPlugin: GamePlugin<DiceSpikeballState, DiceSpikeballAction, typeof settings> = {
  id: "dice-spikeball",
  title: "Dice Spikeball",
  category: "dice",
  players: { min: 1, max: 1, multiplayer: false },
  description: 'Dice Spikeball: throw to score; bag/ring on board = points; race to 21.',
  howToPlay: 'Dice Spikeball is a real, dice-driven simulation. Dice Spikeball: throw to score; bag/ring on board = points; race to 21.\\n\\nPress Roll to take your turn. Each round resolves immediately and the running score updates after every roll. Press Next to advance until the match ends.\\n\\nGame state is fully seeded for replay parity, and the log strip shows your most recent rolls.',
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as DiceSpikeballSettings),
  reducer,
  isTerminal,
  hint: (state: DiceSpikeballState): HintTarget | null => {
    if (isTerminal(state)) return null;
    if (state.phase === "rolling") return { selector: '[data-testid="hint-target-dice-spikeball-roll"]', pulses: 3 };
    if (state.phase === "rolled") return { selector: '[data-testid="hint-target-dice-spikeball-next"]', pulses: 3 };
    return null;
  },
  component: DiceSpikeballGame,
};
