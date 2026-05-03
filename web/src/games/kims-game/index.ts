import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { KimsGameState, KimsGameAction, KimsGameSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { KimsGameGame } from "./Game.js";
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const kimsGamePlugin: GamePlugin<KimsGameState, KimsGameAction, typeof settings> = {
  id: "kims-game", title: "Kim's Game", category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Memorize the tray of objects, then recall.",
  howToPlay: "Kim's Game is the classic Boy Scout memory drill, digitized. Each of ten rounds opens with a tray of six objects displayed for 3.5 seconds. After the tray hides, you are asked whether a specified object was on the tray — pick 'YES - was in tray' or 'NO - was not in tray' from four candidate phrasings. Two of the four candidates are filler distractors ('Maybe in tray', 'Tray was empty') to keep you reading. Correct answers score ten points each; max 100 across ten rounds. Items are pulled from a 24-symbol pool (keys, coins, fruit, tools, animals) so each tray feels different. After 3.5 seconds passes, you can also click 'Ready' to advance early. Kim's Game training has been used since the early 1900s for observation skills — the digital version preserves the core challenge. Solid players hit 80+; visual-memory aces score 100. Hit Submit and Next; ten rounds takes two minutes total play.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as KimsGameSettings),
  reducer, isTerminal, hint: (state: KimsGameState): HintTarget | null => state.phase === "playing" ? { selector: '[data-testid="hint-target-kims-game-answer-0"]', pulses: 3 } : null, component: KimsGameGame,
};
