import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { GrabDiceState, GrabDiceAction, GrabDiceSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { GrabDiceGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const grabDicePlugin: GamePlugin<GrabDiceState, GrabDiceAction, typeof settings> = {
  id: "grab-dice",
  title: "Grab Dice",
  category: "dice",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Grab-the-dice contest. Predict whether high die, low die, or both match the pool.",
  howToPlay: "Grab Dice imagines two players reaching for a single dice pair. Two dice roll and you predict the result type: High Grab (the higher die is 5 or 6), Low Grab (the lower die is 1 or 2), or Tie (both dice match).\n\nHigh Grab covers 20 of 36 outcomes (55.5%) and pays 9. Low Grab covers 20 of 36 outcomes (55.5%) and pays 9. (The two overlap when one is high and the other low — both calls win on those rolls.) Tie occurs on 6 of 36 (16.7%) and pays 30. Expected value: High 5.0, Low 5.0, Tie 5.0 — balanced.\n\nThe game runs 12 rounds. There are no rerolls; the seeded RNG dictates each roll. Average expected score lands near 60 points. Calling Tie is the high-variance line — six of 36 means roughly one tie every six rolls — so a streak of Ties can vault the score, while calling the Grabs gives a smoother climb. Grab Dice is the simplest of the simple, perfect for a quick session.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as GrabDiceSettings),
  reducer,
  isTerminal,
  hint: (state) => {
    const phase = (state as any).phase;
    if (phase === "betting") return { selector: '[data-testid="hint-target-grab-dice-predict"]', pulses: 3 };
    if (phase === "bet") return { selector: '[data-testid="hint-target-grab-dice-predict"]', pulses: 3 };
    if (phase === "predict") return { selector: '[data-testid="hint-target-grab-dice-predict"]', pulses: 3 };
    if (phase === "predicting") return { selector: '[data-testid="hint-target-grab-dice-predict"]', pulses: 3 };
    if (phase === "roundOver") return { selector: '[data-testid="hint-target-grab-dice-next"]', pulses: 3 };
    if (phase === "result") return { selector: '[data-testid="hint-target-grab-dice-next"]', pulses: 3 };
    if (phase === "settled") return { selector: '[data-testid="hint-target-grab-dice-next"]', pulses: 3 };
    if (phase === "banked") return { selector: '[data-testid="hint-target-grab-dice-next"]', pulses: 3 };
    if (phase === "done") return { selector: '[data-testid="hint-target-grab-dice-next"]', pulses: 3 };
    if (phase === "farkled") return { selector: '[data-testid="hint-target-grab-dice-next"]', pulses: 3 };
    if (phase === "busted") return { selector: '[data-testid="hint-target-grab-dice-next"]', pulses: 3 };
    return { selector: '[data-testid="hint-target-grab-dice-next"]', pulses: 3 };
  },
  component: GrabDiceGame,
};
