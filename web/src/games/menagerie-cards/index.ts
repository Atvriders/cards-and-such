import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { MenagerieCardsState, MenagerieCardsAction, MenagerieCardsSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { MenagerieCardsGame } from "./Game.js";
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const menagerieCardsPlugin: GamePlugin<MenagerieCardsState, MenagerieCardsAction, typeof settings> = {
  id: "menagerie-cards", title: "Menagerie", category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Snap variant: shout on matching ranks; race the CPU to win.",
  howToPlay: "Menagerie is a Snap variant where players adopt animal sounds and \"shout\" them on matching cards. This mini version distills it down to a 10-round shout-race against the CPU.\n\nEach round, two cards are flipped — yours and the CPU's. If they match in rank (a Snap!), you race the CPU to shout first. Otherwise, the higher card wins the round. Aces high, twos low.\n\nScoring: round win (snap-or-high-card) awards 10 points. Tie (rank-match without claim) awards 4 sympathy points. Loss awards zero.\n\nTen rounds total. Expected score is around 45-65 points. Snaps occur about once every 13 cards, so most rounds resolve by simple rank comparison.\n\nThe traditional Menagerie used animal noises (oink, moo, bark, meow) to differentiate players. The novelty was that mishearing or saying the wrong sound disqualified you. This version is silent, but the spirit of the matching-rank surprise remains: the moment two cards align, the round changes character. Fast, light, and a little bit silly.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as MenagerieCardsSettings),
  reducer, isTerminal, hint: (state: MenagerieCardsState): HintTarget | null => (state.phase === "ready" ? { selector: '[data-testid="hint-target-menagerie-cards-primary"]', pulses: 3 } : null), component: MenagerieCardsGame,
};
