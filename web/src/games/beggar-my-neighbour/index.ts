import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { BeggarMyNeighbourState, BeggarMyNeighbourAction, BeggarMyNeighbourSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { BeggarMyNeighbourGame } from "./Game.js";
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const beggarMyNeighbourPlugin: GamePlugin<BeggarMyNeighbourState, BeggarMyNeighbourAction, typeof settings> = {
  id: "beggar-my-neighbour", title: "Beggar My Neighbour", category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Capture cards from CPU by flipping face cards (J/Q/K/A).",
  howToPlay: "Beggar My Neighbour is a classic English children's card game where face-card reveals trigger penalty flips. This mini-version models capture as a 10-round flip race: when you flip, you hope for a face card or Ace; if it's higher than the CPU's flip, you capture.\n\nEach round, you and the CPU each flip one card. Higher rank wins the round outright (capture the trick). Aces are highest, then K, Q, J, then 10 down to 2.\n\nScoring: capture awards 10 points. Tie awards 4 consolation points. Loss awards zero.\n\nTen rounds total. Expected score is around 45-65 points. The fun is in the streaks — a trio of high-card flips in a row feels like a real Beggar My Neighbour penalty cascade.\n\nThe full game uses a 4-3-2-1 penalty system on Aces, Kings, Queens, and Jacks where a \"beggar\" forfeits cards for missing a face card. This entry preserves the head-to-head flip spirit without that bookkeeping. Quick, simple, surprisingly tense.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as BeggarMyNeighbourSettings),
  reducer, isTerminal, hint: (state: BeggarMyNeighbourState): HintTarget | null => (state.phase === "ready" ? { selector: '[data-testid="hint-target-beggar-my-neighbour-primary"]', pulses: 3 } : null), component: BeggarMyNeighbourGame,
};
