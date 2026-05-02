import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { TargetShooterState, TargetShooterAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { TargetShooter } from "./TargetShooter.js";

export const targetShooterSettings = {} as const;

type TSSettingsType = SettingsOf<typeof targetShooterSettings>;

export const targetShooterPlugin: GamePlugin<TargetShooterState, TargetShooterAction, typeof targetShooterSettings> = {
  id: "target-shooter",
  title: "Target Shooter",
  category: "arcade",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Fire at moving targets — hit the bullseye for maximum points!",
  howToPlay: `Target Shooter is a reflex and timing game played over ten rounds. Each round presents a circular target somewhere on the dark range, and your crosshair drifts across the screen in a wavy pattern. Fire when the crosshair overlaps the target to score points.

The crosshair follows a Lissajous figure — a smooth, curved drift path that sweeps horizontally and vertically in a repeating pattern. Watch a full cycle to predict where the crosshair will be before you fire. Firing blindly rarely pays off.

Scoring is based on accuracy: hitting the center of the target earns up to 100 points per round, while a shot near the edge still earns partial credit. Missing the target entirely scores 0 for that round.

Targets get smaller as rounds progress, so early rounds reward building your maximum score while later rounds demand exceptional precision. The target also moves horizontally, adding an extra layer of timing challenge — the crosshair must align with a moving object.

Press Space, F, or click anywhere in the range to fire. You get exactly one shot per round, so make it count.

Tips: Focus on the horizontal alignment first since that is the trickier axis. Let the crosshair drift naturally and resist the urge to fire too early. Center hits multiply your score significantly over edge hits.`,
  settings: targetShooterSettings,
  initialState: (seed: number, _settings: TSSettingsType) => initialState(seed),
  reducer,
  isTerminal,
    hint: (state: TargetShooterState) => {
      if (isTerminal(state)) return null;
      return { selector: '[data-testid="hint-target-target-shooter-action"]', pulses: 3 };
    },
  component: TargetShooter,
};
