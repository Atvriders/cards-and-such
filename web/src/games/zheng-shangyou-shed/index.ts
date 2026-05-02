import type { GamePlugin, SettingsOf, HintTarget } from "../../platform/game-plugin/types.js";
import type { ZhengShangyouShedState, ZhengShangyouShedAction, ZhengShangyouShedSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { ZhengShangyouShedGame } from "./Game.js";
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const zhengShangyouShedPlugin: GamePlugin<ZhengShangyouShedState, ZhengShangyouShedAction, typeof settings> = {
  id: "zheng-shangyou-shed", title: "Zheng Shangyou", category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Chinese climbing shedding game.",
  howToPlay: "Zheng Shangyou ('Run Up') is the Chinese climbing shedding ancestor of Big Two and Tien Len. Players race to empty their hands by playing higher combinations than the previous play.\n\nIn this single-player adaptation you face a CPU opponent in a six-round race. Each round both sides start with thirteen cards and take turns trying to beat the last play with a stronger single, pair, triple, or run. If neither can beat the standing play the trick clears and a new lead is taken.\n\nYou win the round by being first to play your last card. Each round won is worth twenty points plus a five-point bonus per card still left in the CPU hand. Lose the round and you score zero, but continue building toward a strong total.\n\nClimbing tactics matter — saving your two of hearts (the highest single in this deck) for a moment of need can flip a tight race. A strong total across six rounds is around eighty points; sweeping all six is rare.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as ZhengShangyouShedSettings),
  reducer, isTerminal, 
  hint: (state: ZhengShangyouShedState): HintTarget | null => {
    if (state.phase === "done") return null;
    if (state.phase === "ready") return { selector: '[data-testid="hint-target-zheng-shangyou-shed-play"]', pulses: 3 };
    if (state.phase === "scored") return { selector: '[data-testid="hint-target-zheng-shangyou-shed-next"]', pulses: 3 };
    return null;
  },
  component: ZhengShangyouShedGame,
};
