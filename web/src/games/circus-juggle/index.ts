import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { CircusJuggleState, CircusJuggleAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { CircusJuggle } from "./CircusJuggle.js";

export const circusJuggleSettings = {
  items: {
    kind: "enum" as const,
    label: "Juggle Items",
    options: ["3", "4", "5"] as const,
    default: "3" as const,
  },
} as const;

type CircusJuggleSettingsType = SettingsOf<typeof circusJuggleSettings>;

export const circusJugglePlugin: GamePlugin<CircusJuggleState, CircusJuggleAction, typeof circusJuggleSettings> = {
  id: "circus-juggle",
  title: "Circus Juggle",
  category: "arcade",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Catch juggling items when they are low before they bounce back up.",
  howToPlay: `Circus Juggle is a reaction arcade game set under the big top. You are a circus performer keeping multiple colourful items in the air. Each item bounces up and down continuously on the stage. Your job is to catch them at exactly the right moment — when they are low — and keep your streak alive.

The stage shows your juggling items flying up and down. Each item has a height from 0 (floor) to 10 (ceiling). When an item is at height 2 or below, it glows golden — this is your catch window. Click a glowing item to catch it successfully. Clicking a high item counts as a miss.

Press the Tick button to advance time. Each tick moves all items by their individual speed — some items are slow, others fast. The game lasts 20 ticks. Catch as many items as possible before the show ends.

Scoring: each successful catch earns 30 points. Building a consecutive catch streak earns an extra 20 points per catch in the streak. Each miss deducts 10 points from your total. Score is capped at 1000.

Choose 3, 4, or 5 items for increasing difficulty — more items means more potential catches but also more misses to track. The golden glow is your friend; wait for it before clicking.

Tips: advance ticks quickly if all items are high and uncatchable. Focus on items already at low height first. Building a streak of 5+ catches is the key to a top score.`,
  settings: circusJuggleSettings,
  initialState: (seed: number, settings: CircusJuggleSettingsType) => initialState(seed, settings),
  reducer,
  isTerminal,
  hint: (s: any) => { const p = (s as any).phase; if (p === "gameover" || p === "done" || p === "ended" || (s as any).gameOver) return null; return { selector: '[data-testid="hint-target-circus-juggle-action"]', pulses: 3 }; },
  component: CircusJuggle,
};
