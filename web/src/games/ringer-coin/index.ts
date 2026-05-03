import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { RingerCoinState, RingerCoinAction, RingerCoinSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { RingerCoin } from "./Game.js";

const ringerCoinSettings = {
  tosses: { kind: "enum" as const, label: "Tosses", options: ["5", "10"] as const, default: "5" as const },
} as const;

type RingerCoinSettingsType = SettingsOf<typeof ringerCoinSettings>;

export const ringerCoinPlugin: GamePlugin<RingerCoinState, RingerCoinAction, typeof ringerCoinSettings> = {
  id: "ringer-coin",
  title: "Ringer Coin",
  category: "arcade",
  players: { min: 1, max: 1, multiplayer: false },
  description: "A coin marker circles a ring — toss when it's in the orange zone to score a ringer!",
  howToPlay: `Ringer Coin is a circular timing arcade game. A coin marker travels around a ring at varying speeds. Two orange zones mark the target — toss when the marker lands in an orange zone.

Press TOSS at the right moment. If the marker is perfectly in the orange zone, you score 100 points — a ringer! Near-misses score 40 points. A wide miss scores zero.

The speed of the marker changes with each toss — sometimes slow and easy to time, sometimes quick and requiring sharp reactions. The orange zones are always in the same positions (top and bottom of the ring), so anticipate where the marker will be.

Use Settings to choose 5 or 10 tosses. Maximum score is 500 or 1,000 with all ringers. Can you nail every toss?`,
  settings: ringerCoinSettings,
  initialState: (seed: number, settings: RingerCoinSettingsType) => initialState(seed, settings as RingerCoinSettings),
  reducer,
  isTerminal,
  hint: (s: any) => { const p = (s as any).phase; if (p === "gameover" || p === "done" || p === "ended" || (s as any).gameOver) return null; return { selector: '[data-testid="hint-target-ringer-coin-action"]', pulses: 3 }; },
  component: RingerCoin,
};
