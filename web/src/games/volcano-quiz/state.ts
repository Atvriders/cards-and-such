import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface VolcanoQuizSettings { questions: "10" | "20"; }
export interface VolcanoQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type VolcanoQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  {
    "question": "Mount Vesuvius famously destroyed which city in 79 AD?",
    "choices": [
      "Rome",
      "Pompeii",
      "Athens",
      "Naples"
    ],
    "correct": 1
  },
  {
    "question": "Krakatoa is in which country?",
    "choices": [
      "Philippines",
      "Indonesia",
      "Japan",
      "Papua New Guinea"
    ],
    "correct": 1
  },
  {
    "question": "Mount St. Helens erupted famously in?",
    "choices": [
      "1971",
      "1980",
      "1991",
      "2001"
    ],
    "correct": 1
  },
  {
    "question": "Which is the largest active volcano on Earth?",
    "choices": [
      "Vesuvius",
      "Mount Etna",
      "Mauna Loa",
      "Krakatoa"
    ],
    "correct": 2
  },
  {
    "question": "Mauna Loa is on which island?",
    "choices": [
      "Oahu",
      "Maui",
      "Hawaii (Big Island)",
      "Kauai"
    ],
    "correct": 2
  },
  {
    "question": "Mount Etna is on which island?",
    "choices": [
      "Sardinia",
      "Sicily",
      "Crete",
      "Cyprus"
    ],
    "correct": 1
  },
  {
    "question": "What is the name of the volcanic ring around the Pacific?",
    "choices": [
      "Ring of Fire",
      "Volcanic Belt",
      "Pacific Arc",
      "Tectonic Loop"
    ],
    "correct": 0
  },
  {
    "question": "The 1815 eruption of Mount Tambora caused?",
    "choices": [
      "The Year Without a Summer",
      "The Great Plague",
      "The Dust Bowl",
      "The Black Death"
    ],
    "correct": 0
  },
  {
    "question": "Mount Fuji is in which country?",
    "choices": [
      "China",
      "Japan",
      "South Korea",
      "Taiwan"
    ],
    "correct": 1
  },
  {
    "question": "What kind of rock cools from volcanic lava?",
    "choices": [
      "Sedimentary",
      "Igneous",
      "Metamorphic",
      "Limestone"
    ],
    "correct": 1
  },
  {
    "question": "Yellowstone sits atop a?",
    "choices": [
      "Subduction zone",
      "Supervolcano caldera",
      "Sinkhole",
      "Glacial valley"
    ],
    "correct": 1
  },
  {
    "question": "What unit measures volcanic explosivity?",
    "choices": [
      "Richter Scale",
      "VEI",
      "Mercalli Scale",
      "Beaufort Scale"
    ],
    "correct": 1
  },
  {
    "question": "Mount Pinatubo erupted famously in which country?",
    "choices": [
      "Indonesia",
      "Philippines",
      "Japan",
      "Vietnam"
    ],
    "correct": 1
  },
  {
    "question": "Which Icelandic volcano grounded European flights in 2010?",
    "choices": [
      "Hekla",
      "Eyjafjallaj\u00f6kull",
      "Katla",
      "B\u00e1r\u00f0arbunga"
    ],
    "correct": 1
  },
  {
    "question": "Which volcano is featured in 'Dante's Peak' (1997)?",
    "choices": [
      "Krakatoa",
      "Vesuvius",
      "Fictional",
      "Mount St. Helens"
    ],
    "correct": 2
  },
  {
    "question": "Lava temperature typically ranges from?",
    "choices": [
      "100-300\u00b0C",
      "700-1200\u00b0C",
      "2000-3000\u00b0C",
      "5000-6000\u00b0C"
    ],
    "correct": 1
  },
  {
    "question": "The Stromboli volcano is part of which country?",
    "choices": [
      "Italy",
      "Greece",
      "Croatia",
      "Spain"
    ],
    "correct": 0
  },
  {
    "question": "Mount Kilimanjaro is technically a?",
    "choices": [
      "Active volcano",
      "Dormant volcano",
      "Extinct volcano",
      "Not a volcano"
    ],
    "correct": 1
  },
  {
    "question": "Mount Erebus is on which continent?",
    "choices": [
      "South America",
      "Asia",
      "Antarctica",
      "Africa"
    ],
    "correct": 2
  },
  {
    "question": "The 'caldera' of a volcano is?",
    "choices": [
      "The peak",
      "The lava channel",
      "A large depression",
      "The vent"
    ],
    "correct": 2
  },
  {
    "question": "Which type of volcano is built by repeated lava flows and ash?",
    "choices": [
      "Shield",
      "Stratovolcano",
      "Cinder cone",
      "Lava dome"
    ],
    "correct": 1
  },
  {
    "question": "Pyroclastic flows are mostly composed of?",
    "choices": [
      "Cool water",
      "Hot gas and rock",
      "Pure lava",
      "Volcanic mud"
    ],
    "correct": 1
  }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: VolcanoQuizSettings): VolcanoQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: VolcanoQuizState, action: VolcanoQuizAction): VolcanoQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: VolcanoQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
