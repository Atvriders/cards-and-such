import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { MugginsState, MugginsAction, MugginsSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { MugginsGame } from "./Game.js";
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
const hint = (state: MugginsState): HintTarget | null => {
  if (isTerminal(state)) return null;
  if (state.phase === "ready") return { selector: '[data-testid="hint-target-muggins-primary"]', pulses: 3 };
  if (state.phase === "result") return { selector: '[data-testid="hint-target-muggins-secondary"]', pulses: 3 };
  return null;
};

export const mugginsPlugin: GamePlugin<MugginsState, MugginsAction, typeof settings> = {
  id: "muggins", title: "Muggins", category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Cribbage with Muggins rule: opponents steal points if you miss.",
  howToPlay: "Muggins is a punishing Cribbage variant where opponents may \"muggins\" — steal — points you fail to claim from your hand. This mini-version models that as a higher-payout cut game with a stiff loss penalty.\n\nEach round, you and the CPU each cut one card. Higher rank wins. Aces are 1, Kings are 13.\n\nScoring: cut win pegs 10 points. Tie pegs 4 sympathy points. Loss pegs zero — and traditionally in real Muggins, you'd also forfeit any unclaimed score, but this version keeps loss simple at zero pegs.\n\nNine rounds total. Expected score is around 40-65 points; lucky runs reach 75+. The lower cap reflects how Muggins plays a little tighter than vanilla cribbage because of the steal-rule pressure.\n\nThis entry recreates the spirit of Muggins — pay attention or pay the price — by giving slightly steeper \"you have to win\" pressure each round, even though there's no actual point-claiming to remember. A relaxed nod to a strict variant.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as MugginsSettings),
  reducer, isTerminal, hint: hint, component: MugginsGame,
};
