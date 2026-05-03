import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { KartTournamentState, KartTournamentAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { KartTournamentGame } from "./Game.js";

export const kartTournamentSettings = {
  tracks: {
    kind: "enum" as const,
    label: "Tracks",
    options: ["3", "5"] as const,
    default: "3" as const,
  },
} as const;

type KartTournamentSettingsType = SettingsOf<typeof kartTournamentSettings>;

export const kartTournamentPlugin: GamePlugin<KartTournamentState, KartTournamentAction, typeof kartTournamentSettings> = {
  id: "kart-tournament",
  title: "Kart Tournament",
  category: "arcade",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Race through multiple tracks in a kart championship, collecting items and managing speed.",
  howToPlay: `Race your kart through a series of tracks to win the championship. Compete against four AI opponents across 3 or 5 tracks, earning points for finishing position.

During each race, click Accelerate to boost your speed — but watch out, going faster makes you harder to control. Use Brake if you need to slow down. Collect power-up items during the race that appear randomly. You can carry one item at a time.

Items available: Boost gives you an instant +10 position jump. Star permanently increases your speed by 3. Shell knocks back the nearest racer ahead of you. Banana slows down the nearest racer behind you.

Points are awarded for each race: 1st place earns 10 points, 2nd earns 8, 3rd earns 6, and so on. After each race, click Next Race to continue the tournament. The racer with the most points after all tracks wins the championship.

Strategy: Boost your speed early to build a lead. Save shells for moments when a rival is close ahead. Use bananas when being chased from behind. Consistent top-3 finishes beat occasional wins with many low placements.`,
  settings: kartTournamentSettings,
  initialState: (seed: number, settings: KartTournamentSettingsType) => initialState(seed, settings),
  reducer,
  isTerminal,
  hint: (s: any) => { const p = (s as any).phase; if (p === "gameover" || p === "done" || p === "ended" || (s as any).gameOver) return null; return { selector: '[data-testid="hint-target-kart-tournament-action"]', pulses: 3 }; },
  component: KartTournamentGame,
};
