import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface FukushimaQuizSettings { questions: "10" | "20" | "30"; }
export interface FukushimaQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type FukushimaQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  {
    "question": "Year of Fukushima disaster?",
    "choices": [
      "2009",
      "2010",
      "2011",
      "2012"
    ],
    "correct": 2
  },
  {
    "question": "Date?",
    "choices": [
      "March 11",
      "April 11",
      "September 11",
      "November 11"
    ],
    "correct": 0
  },
  {
    "question": "Triggering event?",
    "choices": [
      "Bomb",
      "Earthquake & tsunami",
      "Volcanic eruption",
      "Flood"
    ],
    "correct": 1
  },
  {
    "question": "Earthquake magnitude?",
    "choices": [
      "7.0",
      "8.0",
      "9.0",
      "10.0"
    ],
    "correct": 2
  },
  {
    "question": "Plant operator?",
    "choices": [
      "JAEA",
      "TEPCO",
      "KEPCO",
      "JANSI"
    ],
    "correct": 1
  },
  {
    "question": "How many reactors melted down?",
    "choices": [
      "1",
      "2",
      "3",
      "6"
    ],
    "correct": 2
  },
  {
    "question": "INES rating?",
    "choices": [
      "5",
      "6",
      "7",
      "8"
    ],
    "correct": 2
  },
  {
    "question": "Comparison to Chernobyl on INES?",
    "choices": [
      "Lower",
      "Equal (level 7)",
      "Higher",
      "Not rated"
    ],
    "correct": 1
  },
  {
    "question": "Country?",
    "choices": [
      "China",
      "Japan",
      "South Korea",
      "Taiwan"
    ],
    "correct": 1
  },
  {
    "question": "Plant on which coast of Honshu?",
    "choices": [
      "West",
      "East/Pacific",
      "South",
      "North"
    ],
    "correct": 1
  },
  {
    "question": "Initial evacuation zone radius?",
    "choices": [
      "5 km",
      "10 km",
      "20 km",
      "50 km"
    ],
    "correct": 2
  },
  {
    "question": "Tsunami height at the plant?",
    "choices": [
      "~1 m",
      "~5 m",
      "~14 m",
      "~30 m"
    ],
    "correct": 2
  },
  {
    "question": "Sea wall designed for what wave height?",
    "choices": [
      "~1 m",
      "~5.7 m",
      "~14 m",
      "~30 m"
    ],
    "correct": 1
  },
  {
    "question": "Total Tohoku earthquake/tsunami deaths?",
    "choices": [
      "~2,000",
      "~6,000",
      "~16,000+",
      "~60,000"
    ],
    "correct": 2
  },
  {
    "question": "Direct radiation deaths from accident?",
    "choices": [
      "0",
      "100",
      "1000",
      "10,000"
    ],
    "correct": 0
  },
  {
    "question": "Cleanup expected to last?",
    "choices": [
      "1 year",
      "10 years",
      "30-40 years",
      "100+ years"
    ],
    "correct": 2
  },
  {
    "question": "Water released into Pacific in 2023?",
    "choices": [
      "Untreated",
      "Tritium-treated",
      "Contaminated",
      "Frozen"
    ],
    "correct": 1
  },
  {
    "question": "PM at the time?",
    "choices": [
      "Naoto Kan",
      "Shinzo Abe",
      "Yukio Hatoyama",
      "Yoshihiko Noda"
    ],
    "correct": 0
  },
  {
    "question": "Backup generators failed because?",
    "choices": [
      "No diesel",
      "Tsunami flooded them",
      "Earthquake destroyed",
      "Sabotage"
    ],
    "correct": 1
  },
  {
    "question": "Daiichi means?",
    "choices": [
      "Number One",
      "Big",
      "Sea",
      "North"
    ],
    "correct": 0
  },
  {
    "question": "In what year did the Fukushima disaster occur?",
    "choices": [
      "2009",
      "2010",
      "2011",
      "2012"
    ],
    "correct": 2
  },
  {
    "question": "On what date did the earthquake strike?",
    "choices": [
      "March 11",
      "March 21",
      "April 11",
      "February 11"
    ],
    "correct": 0
  },
  {
    "question": "Magnitude of the Tohoku earthquake?",
    "choices": [
      "7.9",
      "8.4",
      "8.9",
      "9.1"
    ],
    "correct": 3
  },
  {
    "question": "What triggered the reactor meltdowns?",
    "choices": [
      "Earthquake only",
      "Tsunami",
      "Sabotage",
      "Fire"
    ],
    "correct": 1
  },
  {
    "question": "Which company operated the plant?",
    "choices": [
      "TEPCO",
      "KEPCO",
      "JAPC",
      "Chubu Electric"
    ],
    "correct": 0
  },
  {
    "question": "How many reactors melted down?",
    "choices": [
      "1",
      "2",
      "3",
      "6"
    ],
    "correct": 2
  },
  {
    "question": "What type of reactors were they?",
    "choices": [
      "PWR",
      "BWR",
      "RBMK",
      "CANDU"
    ],
    "correct": 1
  },
  {
    "question": "Approximate height of the tsunami at the plant?",
    "choices": [
      "~5 m",
      "~10 m",
      "~14 m",
      "~25 m"
    ],
    "correct": 2
  },
  {
    "question": "Prime Minister of Japan during the disaster?",
    "choices": [
      "Abe",
      "Kan",
      "Noda",
      "Hatoyama"
    ],
    "correct": 1
  },
  {
    "question": "INES rating assigned to the accident?",
    "choices": [
      "5",
      "6",
      "7",
      "4"
    ],
    "correct": 2
  }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: FukushimaQuizSettings): FukushimaQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: FukushimaQuizState, action: FukushimaQuizAction): FukushimaQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: FukushimaQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
