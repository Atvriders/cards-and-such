import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { WingspanAsiaRwState, WingspanAsiaRwAction, WingspanAsiaRwSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { WingspanAsiaRwGame } from "./Game.js";
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const wingspanAsiaRwPlugin: GamePlugin<WingspanAsiaRwState, WingspanAsiaRwAction, typeof settings> = {
  id: "wingspan-asia-rw",
  title: "Wingspan: Asia (R&W)",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Asia birds roll-and-write; flock-trigger habitat actions across rolls.",
  howToPlay: "Wingspan: Asia (R&W) is a roll-and-write inspired by the Asia expansion of Wingspan, where Asian birds with flock and duet abilities chain bonus actions when rolled.\n\nEach turn, click Roll to generate a die value (1-6). The lower the value, the smaller the bird; the higher, the larger and rarer. Click any unmarked grid cell to record that bird in your aviary. The cell stores the rolled value. If you don't like the roll, click Skip to discard a turn.\n\nScoring:\n- Each marked cell scores its rolled value (sum of pips).\n- +5 per fully completed row of 4 (a habitat).\n- +5 per fully completed column of 4 (a flock).\n- +10 if you fill the entire 4x4 aviary.\n\nYou have 12 rolls. Aim to fill rows and columns simultaneously to maximize bonuses. A solid run scores 35-65 points; mastering placement nets 70+. Skip cautiously — every skip costs you potential points and shrinks the column completion target. The Asia birds reward variety, so spread your rolls across the grid.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as WingspanAsiaRwSettings),
  reducer,
  isTerminal,
  hint: (state: any) => {
    if ((state as any).phase === "done") return null;
    if ((state as any).phase === "rolling") return { selector: '[data-testid="hint-target-wingspan-asia-rw-roll"]', pulses: 3 };
    return { selector: '[data-testid="hint-target-wingspan-asia-rw-skip"]', pulses: 3 };
  },
  component: WingspanAsiaRwGame,
};
