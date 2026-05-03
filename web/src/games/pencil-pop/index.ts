import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { PencilPopState, PencilPopAction, PencilPopSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const PencilPopGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.PencilPopGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const pencilPopPlugin: GamePlugin<PencilPopState, PencilPopAction, typeof settings> = {
  id:"pencil-pop", title:"Pencil Pop", category:"arcade",
  players:{ min:1, max:1, multiplayer:false },
  description:"Click pencils that drift across the page. 30-second clicker.",
  howToPlay:"Pencil Pop is a 30-second office-supply clicker. Pencils drift in 6 lanes; tap each one to score 10 points. Each pencil hangs around for a few ticks before drifting off — miss too many and your final tally suffers.\n\nThe game ticks once per second, spawning fresh pencils. The board can quickly fill with sharpened targets, so practice your hand-eye coordination and aim carefully — every pencil you tap is 10 points closer to a top score.\n\nThere's no skill ceiling: the more pencils you click in 30 seconds, the higher your score. Average runs land near 200-300 points; sharpshooters pushing 500+ are showing real reflex talent. The clock counts down in the top right; when it hits zero, your final score is locked in.\n\nSharpen up and rack up those points!",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as PencilPopSettings),
  reducer,isTerminal,
  hint: (state: PencilPopState): HintTarget | null => {
    if (state.phase === "done") return null;
    if (!state.targets || state.targets.length === 0) return null;
    return { selector: '[data-testid="hint-target-pencil-pop-target"]', pulses: 3 };
  },
  component:PencilPopGame,
};
