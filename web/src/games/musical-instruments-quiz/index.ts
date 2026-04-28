import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { MusicalInstrumentsQuizState, MusicalInstrumentsQuizAction, MusicalInstrumentsQuizSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { MusicalInstrumentsQuizGame } from "./Game.js";
const settings = { questions: { kind:"enum" as const, label:"Questions", options:["10","20","30"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const musicalInstrumentsQuizPlugin: GamePlugin<MusicalInstrumentsQuizState, MusicalInstrumentsQuizAction, typeof settings> = {
  id:"musical-instruments-quiz", title:"Musical Instruments Quiz", category:"board",
  players:{ min:1, max:1, multiplayer:false },
  description:"Identify musical instruments by family, range, and historical use.",
  howToPlay:"Musical Instruments Quiz spans the orchestra and beyond — strings, woodwinds, brass, percussion, keyboard, electronic — and asks you to identify instruments by appearance, family, range, and the music they make. From oboes and bassoons to theremins and harmoniums, you'll meet a wide range of voices.\n\nYou have 15 seconds per question. Each correct answer awards 100 base points plus 10 points for every second remaining on the clock — answer quickly to maximize your score. Wrong answers earn nothing.\n\nTap a choice, then press Submit. Correct answers glow green, wrong ones turn red, and the right answer is always revealed before you continue. Press Next to move on.\n\nChoose 10, 20, or 30 questions in Settings. Whether you're a band kid, an orchestra fan, or a curious listener, this quiz tests how well you really know the band!",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as MusicalInstrumentsQuizSettings),
  reducer,isTerminal,component:MusicalInstrumentsQuizGame,
};
