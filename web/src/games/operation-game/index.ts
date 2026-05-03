import type { GamePlugin, SettingsOf , HintTarget} from "../../platform/game-plugin/types.js";
import type { OperationState, OperationAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { OperationGame } from "./Game.js";

export const operationSettings = {
  difficulty: {
    kind: "enum" as const,
    label: "Difficulty",
    options: ["easy", "normal", "hard"] as const,
    default: "normal" as const,
  },
} as const;

type OperationSettingsType = SettingsOf<typeof operationSettings>;

export const operationGamePlugin: GamePlugin<OperationState, OperationAction, typeof operationSettings> = {
  id: "operation-game",
  title: "Operation",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Tap each operation target before time runs out. Steady hands score big!",
  howToPlay: `Operation is a classic skill-timing game. You are the surgeon and must successfully complete 10 operations in a row, one for each silly ailment on the patient.

When the operation is shown, click "Operate!" to begin. A timer starts immediately. You must click the "TAP!" button as quickly as possible while still being within the allowed time window — each operation has a different difficulty based on the body part and its value.

If you tap within the time window, the operation is a success and you earn points. The faster you tap, the more points you score (up to the full value of that operation). If you take too long, you miss the operation and score zero for it — steady hands are key!

After each result (success or miss), click "Next" to move to the next operation until all 10 are done. Your total score is tallied at the end.

Three difficulty levels are available: Easy gives you 40% more time per operation; Normal uses standard windows; Hard cuts the windows by 40% — very challenging! Operations range from 50 to 100 points each.

Score as high as possible across all 10 operations!`,
  settings: operationSettings,
  initialState: (seed: number, settings: OperationSettingsType) => initialState(seed, settings),
  reducer,
  isTerminal,
  hint: (): HintTarget | null => (typeof document !== "undefined" && document.querySelector(".op-game")) ? { selector: ".op-game", pulses: 3 } : null,
  component: OperationGame,
};
