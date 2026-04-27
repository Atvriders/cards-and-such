import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { VolcanoQuizState, VolcanoQuizAction, VolcanoQuizSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { VolcanoQuizGame } from "./Game.js";
const settings = { questions: { kind:"enum" as const, label:"Questions", options:["10","20"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const volcanoQuizPlugin: GamePlugin<VolcanoQuizState, VolcanoQuizAction, typeof settings> = {
  id:"volcano-quiz", title:"Volcano Quiz", category:"board",
  players:{ min:1, max:1, multiplayer:false },
  description:"Test your knowledge of the world's famous volcanoes. 10 or 20 questions.",
  howToPlay:"Volcano Quiz tests how well you know the world's most explosive geology. Questions cover historical eruptions (Vesuvius, Krakatoa, Mount St. Helens, Pinatubo), iconic peaks (Fuji, Etna, Kilimanjaro), and geological concepts (calderas, pyroclastic flows, the Volcanic Explosivity Index).\n\nYou have 15 seconds per question. Each correct answer awards 100 base points plus 10 points for every second remaining on the clock \u2014 answer quickly to maximize your score. Wrong answers earn nothing.\n\nYou'll learn that Mauna Loa is the largest active volcano on Earth, that Vesuvius destroyed Pompeii in 79 AD, and that Tambora's 1815 eruption caused the \"Year Without a Summer\" globally. The 2010 Eyjafjallaj\u00f6kull eruption in Iceland grounded European air travel for days. Yellowstone sits atop a supervolcano caldera that has erupted catastrophically three times in the past 2.1 million years.\n\nChoose 10 or 20 questions in Settings. Whether you're a volcanologist or just a magma enthusiast, this quiz will see how well you know the planet's hot spots!",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as VolcanoQuizSettings),
  reducer,isTerminal,component:VolcanoQuizGame,
};
