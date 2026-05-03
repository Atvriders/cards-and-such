import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { SpeedSnapState, SpeedSnapAction, SpeedSnapSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { SpeedSnapGame } from "./Game.js";
const settings = { questions: { kind:"enum" as const, label:"Questions", options:["10"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const speedSnapPlugin: GamePlugin<SpeedSnapState, SpeedSnapAction, typeof settings> = {
  id:"speed-snap", title:"Speed Snap", category:"cards",
  players:{ min:1, max:1, multiplayer:false },
  description:"Trivia about Speed Snap, a faster slap-card variant of classic Snap.",
  howToPlay:"Speed Snap Trivia is a ten-question quiz about Speed Snap, a quick-fire variation of the classic children's card game Snap. Two or more players each have a face-down stack and turn cards alternately into a central pile. When the top two cards match by rank — or by rank/suit in stricter variants — the first player to slap and shout 'Snap!' takes the pile. Speed Snap accelerates this with shorter turns or doubled-deck play. Each question tests rules, variations, reaction-time elements, and history of Snap and Speed Snap. Tap an answer and Submit; correct answers earn 100 base points plus 10 per second remaining on the 15-second timer. Wrong answers reveal the correct option. After ten questions your final score is shown. Speed Snap is a heart-pounding family staple — sharp eyes and quick hands win the day.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as SpeedSnapSettings),
  reducer,isTerminal,
  hint: (state: any) => {
    if (state.phase === "result") return { selector: '[data-testid="hint-target-speed-snap-next"]', pulses: 3 };
    if (state.phase === "playing" && state.selected !== null) return { selector: '[data-testid="hint-target-speed-snap-submit"]', pulses: 3 };
    return null;
  },component:SpeedSnapGame,
};
