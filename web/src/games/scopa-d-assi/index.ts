import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { ScopaDAssiState, ScopaDAssiAction, ScopaDAssiSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { ScopaDAssiGame } from "./Game.js";
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
const hint = (state: ScopaDAssiState): HintTarget | null => (state.phase === "ready" ? { selector: ".dm-btn", pulses: 3 } : null);

export const scopaDAssiPlugin: GamePlugin<ScopaDAssiState, ScopaDAssiAction, typeof settings> = {
  id: "scopa-d-assi", title: "Scopa d'Assi", category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Scopa variant with Ace bonus: ace-cards score extra.",
  howToPlay: "Scopa d'Assi (Scopa of Aces) is an Italian Scopa variant where Aces have special sweeping power — playing an Ace captures all the table cards. This mini-version honors that with an Ace bonus in the per-round scoring.\n\nEach round, you and the CPU each draw one card. Higher rank wins. Aces are highest (rank 13). Suit doesn't matter.\n\nScoring: round win awards 13 points (the prime Ace number). Tie awards 4 sympathy points. Loss awards zero. Bonus: if your card happened to be an Ace, you get +5 extra points regardless of the round result.\n\nNine rounds total. Expected score: 50-75 points; lucky Ace-heavy hands cross 90.\n\nIn real Scopa d'Assi, the Ace's power makes timing critical — playing it too early wastes its sweeping force, too late and the table is empty. This mini reflects the Ace-power with a flat bonus. Quick and rewarding when the deck cooperates.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as ScopaDAssiSettings),
  reducer, isTerminal, hint, component: ScopaDAssiGame,
};
