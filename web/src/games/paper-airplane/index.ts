import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { PaperAirplaneState, PaperAirplaneAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { PaperAirplane } from "./PaperAirplane.js";

export const paperAirplaneSettings = {} as const;

type PASettingsType = SettingsOf<typeof paperAirplaneSettings>;

export const paperAirplanePlugin: GamePlugin<PaperAirplaneState, PaperAirplaneAction, typeof paperAirplaneSettings> = {
  id: "paper-airplane",
  title: "Paper Airplane Throw",
  category: "arcade",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Launch a paper airplane at the perfect angle to reach the target!",
  howToPlay: `Paper Airplane Throw is a precision launch game played over six rounds. Each round places a target somewhere in the field ahead of you, and your goal is to launch your paper airplane to land as close to that target as possible.

Before each throw, a launch angle indicator sweeps back and forth between 5 and 70 degrees. A low angle sends the airplane zooming fast and low — great for distance but hard to control precisely. A high angle lofts the plane steeply for a shorter flight. The sweet spot for most targets is around 30–50 degrees.

Press Space or click Launch to release the airplane at the current angle. Once airborne, the plane follows a realistic physics arc — gravity pulls it down while forward momentum carries it across the field. Watch its trajectory and remember your angle for next time.

Scoring rewards both distance and accuracy. Every metre of flight earns you base points, with a large accuracy bonus for landing close to the target flag. A direct hit or near miss on the target can earn an extra 40 points on top of distance points.

Tips: The angle gauge sweeps at a predictable speed, so you can time it. Aim to release somewhere in the 35–45 degree range for balanced distance and hangtime. Each round uses a fresh target position, so stay adaptable.`,
  settings: paperAirplaneSettings,
  initialState: (seed: number, _settings: PASettingsType) => initialState(seed),
  reducer,
  isTerminal,
  hint: (s: any) => { const p = (s as any).phase; if (p === "gameover" || p === "done" || p === "ended" || (s as any).gameOver) return null; return { selector: '[data-testid="hint-target-paper-airplane-action"]', pulses: 3 }; },
  component: PaperAirplane,
};
