import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { ZwickerState, ZwickerAction, ZwickerSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { ZwickerGame } from "./Game.js";
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const zwickerPlugin: GamePlugin<ZwickerState, ZwickerAction, typeof settings> = {
  id: "zwicker", title: "Zwicker", category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "German Casino-family game: capture rounds against CPU.",
  howToPlay: "Zwicker is a German member of the Casino card-game family with capture rules and a special \"zwick\" double-capture move. This mini-version compresses ten zwicks into a round-by-round high-card race.\n\nEach round, you and the CPU each draw one card. Higher rank wins. Aces are 1 (low) in Zwicker traditionally — but for this mini we treat them as high (13) for consistency with most card games. Suit is irrelevant.\n\nScoring: round win (zwick!) awards 10 points. Tie awards 4 sympathy points. Loss awards zero.\n\nTen rounds total. Expected score: 45-65 points; lucky runs cross 75.\n\nIn real Zwicker, capturing a same-rank table card simultaneously with a hand card creates the eponymous \"zwick\" — a small bonus and the right to lead next. This mini-version keeps the capture-and-lead rhythm without the table-card layout. Quick, strict, North-German feel.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as ZwickerSettings),
  reducer, isTerminal, component: ZwickerGame,
};
