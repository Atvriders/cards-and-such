import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { KakerlakenPokerState, KakerlakenPokerAction, KakerlakenPokerSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { KakerlakenPokerGame } from "./Game.js";
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const kakerlakenPokerPlugin: GamePlugin<KakerlakenPokerState, KakerlakenPokerAction, typeof settings> = {
  id: "kakerlaken-poker", title: "Cockroach Poker", category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Identify creature pictures.",
  howToPlay: "Cockroach Poker tests creature identification under bluff-pressure. Each of fifteen rounds shows a creature card label and asks which creature it represents. Pick from four candidate names, hit Submit, score ten points. Max 150 points. In the original Cockroach Poker, players bluff each other by claiming a creature card is one thing — receivers guess truth or bluff. This digital version tests the underlying creature-recognition skill — knowing what each card actually depicts. Solid identifiers hit 130+; first-timers 80-110. Hit Submit and Next to advance. Total run is about a minute and a half. Distractor names come from the eleven-creature pool, so all four candidates are plausible critters. A perfect score certifies you ready for live Cockroach Poker bluff-spotting at the table. The game is a quick zoological warm-up before nature-themed card games or a fun children's recognition drill that scales up.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as KakerlakenPokerSettings),
  reducer, isTerminal, component: KakerlakenPokerGame,
};
