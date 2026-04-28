import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface EasternFrontQuizSettings { questions: "10" | "20" | "30"; }
export interface EasternFrontQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type EasternFrontQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  {
    "question": "Operation Barbarossa year?",
    "choices": [
      "1939",
      "1940",
      "1941",
      "1942"
    ],
    "correct": 2
  },
  {
    "question": "Battle of Stalingrad ended?",
    "choices": [
      "1942",
      "1943",
      "1944",
      "1945"
    ],
    "correct": 1
  },
  {
    "question": "Largest tank battle was at?",
    "choices": [
      "Stalingrad",
      "Kursk",
      "Berlin",
      "Leningrad"
    ],
    "correct": 1
  },
  {
    "question": "Soviet Premier during the war?",
    "choices": [
      "Lenin",
      "Stalin",
      "Trotsky",
      "Khrushchev"
    ],
    "correct": 1
  },
  {
    "question": "Berlin fell in?",
    "choices": [
      "April 1945",
      "May 1945",
      "June 1945",
      "July 1945"
    ],
    "correct": 0
  },
  {
    "question": "Leningrad siege lasted approximately?",
    "choices": [
      "100 days",
      "500 days",
      "900 days",
      "1500 days"
    ],
    "correct": 2
  },
  {
    "question": "Who commanded German Army Group South?",
    "choices": [
      "Rundstedt",
      "Bock",
      "Manstein",
      "Guderian"
    ],
    "correct": 0
  },
  {
    "question": "Who led the Red Army to Berlin?",
    "choices": [
      "Rokossovsky",
      "Konev",
      "Zhukov",
      "Vatutin"
    ],
    "correct": 2
  },
  {
    "question": "Battle of Kursk year?",
    "choices": [
      "1941",
      "1942",
      "1943",
      "1944"
    ],
    "correct": 2
  },
  {
    "question": "The pact between Hitler and Stalin?",
    "choices": [
      "Versailles",
      "Munich",
      "Molotov-Ribbentrop",
      "Locarno"
    ],
    "correct": 2
  },
  {
    "question": "German 6th Army surrendered at?",
    "choices": [
      "Kursk",
      "Stalingrad",
      "Moscow",
      "Kiev"
    ],
    "correct": 1
  },
  {
    "question": "Soviet Union's WWII abbreviation?",
    "choices": [
      "USSR",
      "Russia",
      "CCCP",
      "All of these"
    ],
    "correct": 3
  }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: EasternFrontQuizSettings): EasternFrontQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: EasternFrontQuizState, action: EasternFrontQuizAction): EasternFrontQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: EasternFrontQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
