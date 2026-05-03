import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { DonkeyState, DonkeyAction, DonkeySettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { DonkeyGame } from "./Game.js";
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const donkeyPlugin: GamePlugin<DonkeyState, DonkeyAction, typeof settings> = {
  id: "donkey", title: "Donkey", category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Pass cards rapidly — last to notice a hidden set loses a letter.",
  howToPlay: "Donkey is a fast-paced pass-and-spot card game where each player receives four cards and passes one card to the player on their left. The first player to collect a four-of-a-kind silently places a finger on their nose. Other players, when they notice, must also place a finger on their nose; the last to do so receives a letter — D, then O, N, K, E, Y — and is eliminated when they spell DONKEY. In this simplified one-on-one CPU duel across six rounds, click Play Round to simulate the rapid passing and reaction. Strategy: collect a four-of-a-kind early in the round but mask your facial reaction; watch the CPU for the slightest twitch. The reaction time delta determines round wins. Aim to spell DONKEY against the CPU at least three times across the match. A total above eighty points means you out-watched the CPU consistently.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as DonkeySettings),
  reducer, isTerminal, hint: (state: DonkeyState): HintTarget | null => (state.phase === "ready" ? { selector: '[data-testid="hint-target-donkey-primary"]', pulses: 3 } : null), component: DonkeyGame,
};
