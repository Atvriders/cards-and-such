import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { PeaceCardsState, PeaceCardsAction, PeaceCardsSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { PeaceCardsGame } from "./Game.js";
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const peaceCardsPlugin: GamePlugin<PeaceCardsState, PeaceCardsAction, typeof settings> = {
  id: "peace-cards", title: "Peace (Cards)", category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "War variant: ties share points instead of triggering a battle.",
  howToPlay: "Peace is a kid-friendly War variant: when both cards tie, the players share the pile in peace rather than fighting a multi-card \"war.\" This mini version reflects that with a generous tie payout.\n\nEach round, you and the CPU each draw one card from a freshly shuffled 52-card deck. Higher rank wins. Suits don't matter — the only number that counts is the face value: 2 (low) through Ace (high).\n\nScoring: round win awards 8 points. Tie awards 6 points (almost as good as a win — the shared peace dividend). Loss awards zero.\n\nTwelve rounds total. Expected score is 55-75 points; the inflated tie payout makes Peace a much more forgiving variant than War. Lucky-ish games hit 90.\n\nThe high tie value is the whole point: Peace teaches young players that not every disagreement needs a battle. Some can just be cooperatively solved. A gentle and quick alternative to standard War, no warfare required.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as PeaceCardsSettings),
  reducer, isTerminal, component: PeaceCardsGame,
};
