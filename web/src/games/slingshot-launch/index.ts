import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { SlingshotLaunchState, SlingshotLaunchAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { SlingshotLaunch } from "./SlingshotLaunch.js";

export const slingshotLaunchSettings = {} as const;

type SLSettingsType = SettingsOf<typeof slingshotLaunchSettings>;

export const slingshotLaunchPlugin: GamePlugin<SlingshotLaunchState, SlingshotLaunchAction, typeof slingshotLaunchSettings> = {
  id: "slingshot-launch",
  title: "Slingshot Launch",
  category: "arcade",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Pull back the slingshot, aim by angle and power, and hit the targets!",
  howToPlay: `Slingshot Launch is a two-variable precision game spread across five rounds. Each round gives you three shots to score as many points as possible by hitting circular targets placed across the field.

Before each shot, two oscillating indicators control your launch: the angle indicator sweeps between 10 and 80 degrees (low angle = flat fast trajectory, high angle = steep arcing shot), and the power bar pulses between weak and full pull. Both indicators change simultaneously, so you must time your release to align both variables at once.

Press Space or click Release to fire the projectile. It follows a physics arc — fast and flat at low angles, slow and high at steep angles — and must intersect one of the three targets to score. Targets vary in size and point value: the small target at the top is worth 100 points, the medium one 50 points, and the large one near the bottom is 25 points.

You get three shots per round across five rounds for a maximum of 1,500 points if you hit the top target every time. Missing a shot costs one of your three attempts but doesn't end the game.

Tips: Start with medium angle (40–50°) and medium power for the mid-value target. Once you've calibrated your feel, aim for the top target by using a higher angle and more power. Watch the angle indicator complete a full sweep before releasing to understand its speed.`,
  settings: slingshotLaunchSettings,
  initialState: (seed: number, _settings: SLSettingsType) => initialState(seed),
  reducer,
  isTerminal,
    hint: (state: SlingshotLaunchState) => {
      if (state.phase === "gameover") return null;
      return { selector: '[data-testid="hint-target-slingshot-launch-action"]', pulses: 3 };
    },
  component: SlingshotLaunch,
};
