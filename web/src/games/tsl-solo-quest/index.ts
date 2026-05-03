import type { GamePlugin, SettingsOf, HintTarget } from "../../platform/game-plugin/types.js";
import type { TslSoloQuestState, TslSoloQuestAction, TslSoloQuestSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { TslSoloQuestGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const tslSoloQuestPlugin: GamePlugin<TslSoloQuestState, TslSoloQuestAction, typeof settings> = {
  id: "tsl-solo-quest",
  title: "Thirsty Sword: Solo Quest",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Solo journaling homage; queer sword adventure oracles.",
  howToPlay: "Thirsty Sword: Solo Quest is a solo journaling homage to April Kit Walsh's Thirsty Sword Lesbians solo-supplement style oracles, where queer sword-bearers carve their way through romantic adventure with both their blades and their honesty.\n\nAcross ten quest entries you choose to flirt, to challenge, to comfort, to rescue, to refuse, or to remain. Each entry offers four weighted choices (A-D); your pick assigns a base reward plus 0-20 of mulberry32 variance. The point is not to win — the point is to find out who your sword-bearer is in this scene.\n\nThe original Thirsty Sword Lesbians is a Powered by the Apocalypse multiplayer system with a solo oracle supplement. This solo digital homage compresses the table into a single voice while preserving the romantic-and-dangerous tone of being soft, sharp, and free in the same breath.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as TslSoloQuestSettings),
  reducer, isTerminal, hint: (state: TslSoloQuestState): HintTarget | null => (state.phase === "choose" ? { selector: '[data-testid="hint-target-tsl-solo-quest-primary"]', pulses: 3 } : null), component: TslSoloQuestGame,
};
