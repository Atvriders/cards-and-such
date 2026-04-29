import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { HalliGalliState, HalliGalliAction, HalliGalliSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { HalliGalliGame } from "./Game.js";
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const halliGalliPlugin: GamePlugin<HalliGalliState, HalliGalliAction, typeof settings> = {
  id: "halli-galli", title: "Halli Galli", category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Tap when exactly five fruits of one kind appear.",
  howToPlay: "Halli Galli is the classic fruit-bell speed-spotting game. Each of twenty rounds shows four fruit hands; tap the one with exactly five fruits of a single kind (Strawberry x5 + Banana x2 wins; Strawberry x4 + Banana x3 doesn't). Hit Submit to lock — correct picks score ten, wrongs zero. Twenty rounds total, max 200 points. In the physical Halli Galli, players literally ring a bell when they spot the five-of-a-kind condition; here, you tap. The hands are pre-generated so exactly one always satisfies the rule, making this a simplified spotting drill rather than a true reflex race. Fast spotters hit 200 in under two minutes. Beginners 130-170. The trick is recognizing 'exactly five' — not four, not six, exactly five — and ignoring the second fruit count. Hit Submit and Next to advance. A perfect score certifies you for actual Halli Galli's bell-ringing chaos in real games.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as HalliGalliSettings),
  reducer, isTerminal, component: HalliGalliGame,
};
