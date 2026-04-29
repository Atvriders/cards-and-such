import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { GState, GAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { Scala40RGame } from "./Game.js";
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const scala40RPlugin: GamePlugin<GState, GAction, typeof settings> = {
  id: "scala-40-r", title: "Scala 40", category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Italian rummy requiring a 40-point opening meld.",
  howToPlay: "Scala 40 is the classic Italian rummy game traditionally requiring a forty-point opening meld before you can begin scoring. This simulator approximates the rhythm: each round you receive a nine-card hand and the engine auto-melds the best sets and runs available.\n\nA set is three or more cards of the same rank; a run (scala) is three or more consecutive same-suit cards. Each meld scores twenty base points plus five for every extra card past three. The forty-point opening idea is preserved in spirit by the bonus structure: hands with strong meld clusters reliably clear forty in a single round.\n\nDeadwood — leftover cards — count aces one, face cards ten, others their pip value. Going out (zero deadwood) adds twenty-five-point bonus. Five rounds compose a session; expected totals run sixty to one-eighty. Click 'Auto-score' to evaluate and 'Next' to deal. Scala 40 rewards seeds where face-card sets meet long same-suit runs.",
  settings,
  initialState: (seed: number, _s: S) => initialState(seed, { dummy: false }),
  reducer, isTerminal, component: Scala40RGame,
};
