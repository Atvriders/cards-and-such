import type { GamePlugin, SettingsOf, HintTarget } from "../../platform/game-plugin/types.js";
import type { DiceDeepSeaFishingState, DiceDeepSeaFishingAction, DiceDeepSeaFishingSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { DiceDeepSeaFishingGame } from "./Game.js";

const settings = { dummy: { kind:"boolean" as const, label:"Standard rules", default:true } } as const;
type S = SettingsOf<typeof settings>;

export const diceDeepSeaFishingPlugin: GamePlugin<DiceDeepSeaFishingState, DiceDeepSeaFishingAction, typeof settings> = {
  id: "dice-deep-sea-fishing",
  title: "Dice Deep-Sea Fishing",
  category: "dice",
  players: { min: 1, max: 1, multiplayer: false },
  description: 'Dice Deep-Sea Fishing: cast each round; landed fish score by size and rarity.',
  howToPlay: 'Dice Deep-Sea Fishing is a real, dice-driven simulation. Dice Deep-Sea Fishing: cast each round; landed fish score by size and rarity.\\n\\nPress Roll to take your turn. Each round resolves immediately and the running score updates after every roll. Press Next to advance until the match ends.\\n\\nGame state is fully seeded for replay parity, and the log strip shows your most recent rolls.',
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as DiceDeepSeaFishingSettings),
  reducer,
  isTerminal,
  hint: (state: DiceDeepSeaFishingState): HintTarget | null => {
    if (isTerminal(state)) return null;
    if (state.phase === "rolling") return { selector: '[data-testid="hint-target-dice-deep-sea-fishing-roll"]', pulses: 3 };
    if (state.phase === "rolled") return { selector: '[data-testid="hint-target-dice-deep-sea-fishing-next"]', pulses: 3 };
    return null;
  },
  component: DiceDeepSeaFishingGame,
};
