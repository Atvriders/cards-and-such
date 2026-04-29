import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { weddleNflState, weddleNflAction, weddleNflSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { weddleNflGame } from "./Game.js";
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const weddleNflPlugin: GamePlugin<weddleNflState, weddleNflAction, typeof settings> = {
  id: "weddle-nfl",
  title: "Weddle",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "NFL player guessing — position and conference proximity hints.",
  howToPlay: "Weddle is an NFL player guessing game distilled to fifteen-round multiple-choice format. Each round presents a player profile and asks you to identify the matching player from four options.\n\nThe pool of NFL profile-pair clues includes Quarterback / Patriots / Multiple Super Bowls (Tom Brady), Running Back / Cowboys / Career rushing leader era (Emmitt Smith), Wide Receiver / 49ers / Career receiving leader (Jerry Rice), Defensive End / Giants / Sack record (Lawrence Taylor), and other iconic NFL profile descriptions. Each correct answer scores ten points; max 150.\n\nClick a player, press Submit to lock, then Next to advance. The original Weddle uses position and conference proximity hints over a hidden daily player; this distillation captures the player-recognition aspect without the proximity-feedback loop. NFL fans score 130+; football historians hit perfect 150.\n\nUse it as a quick NFL-knowledge drill or a Sunday-morning warmup.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as weddleNflSettings),
  reducer,
  isTerminal,
  component: weddleNflGame,
};
