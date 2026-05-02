import type { GamePlugin, SettingsOf, HintTarget } from "../../platform/game-plugin/types.js";
import type { PersianWarShedState, PersianWarShedAction, PersianWarShedSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { PersianWarShedGame } from "./Game.js";
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const persianWarShedPlugin: GamePlugin<PersianWarShedState, PersianWarShedAction, typeof settings> = {
  id: "persian-war-shed", title: "Persian War", category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "War variant with three-card wars.",
  howToPlay: "Persian War is a War variant where ties trigger a three-card showdown rather than the classic four-card war. Players place two cards face down, the third face up, and the higher third card wins all the cards on the table.\n\nIn this single-player version you face the CPU across six rounds. Each round both players start with twenty-six cards and the simulation runs a full deck cycle. The side holding more cards at exhaustion wins twenty points plus a five-point card-margin bonus.\n\nThe shorter War sequence makes Persian War faster than classic War, and ties resolve quickly. The game is still mostly luck but the smaller war cost means streaks last longer; a player ahead tends to stay ahead.\n\nPersian War is popular in Iranian families and in the Persian-speaking diaspora as a children's first card game. Sometimes called 'Persian Battles' or 'Three-Card War' in English. A strong total across six rounds is sixty to ninety. Press Play to begin the next battle.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as PersianWarShedSettings),
  reducer, isTerminal, 
  hint: (state: PersianWarShedState): HintTarget | null => {
    if (state.phase === "done") return null;
    if (state.phase === "ready") return { selector: '[data-testid="hint-target-persian-war-shed-play"]', pulses: 3 };
    if (state.phase === "scored") return { selector: '[data-testid="hint-target-persian-war-shed-next"]', pulses: 3 };
    return null;
  },
  component: PersianWarShedGame,
};
