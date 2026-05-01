import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface PrepositionQuizSettings { questions: "8" | "10" | "12"; }
export interface PrepositionQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type PrepositionQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
{
  "question": "She sat ___ the chair.",
  "choices": [
    "on",
    "of",
    "by ago",
    "for since"
  ],
  "correct": 0
},
{
  "question": "The book is ___ the table.",
  "choices": [
    "under",
    "of",
    "since",
    "than"
  ],
  "correct": 0
},
{
  "question": "We arrived ___ noon.",
  "choices": [
    "at",
    "of",
    "since",
    "than"
  ],
  "correct": 0
},
{
  "question": "He walked ___ the park.",
  "choices": [
    "through",
    "of",
    "since",
    "than"
  ],
  "correct": 0
},
{
  "question": "The cat jumped ___ the fence.",
  "choices": [
    "over",
    "of",
    "since",
    "than"
  ],
  "correct": 0
},
{
  "question": "I'll meet you ___ Monday.",
  "choices": [
    "on",
    "of",
    "by under",
    "for among"
  ],
  "correct": 0
},
{
  "question": "She was born ___ July.",
  "choices": [
    "in",
    "at",
    "on",
    "by"
  ],
  "correct": 0
},
{
  "question": "The keys are ___ my pocket.",
  "choices": [
    "in",
    "at",
    "on",
    "by"
  ],
  "correct": 0
},
{
  "question": "He is afraid ___ spiders.",
  "choices": [
    "of",
    "in",
    "at",
    "on"
  ],
  "correct": 0
},
{
  "question": "She is good ___ math.",
  "choices": [
    "at",
    "in",
    "of",
    "on"
  ],
  "correct": 0
},
{
  "question": "I'm interested ___ history.",
  "choices": [
    "in",
    "at",
    "of",
    "on"
  ],
  "correct": 0
},
{
  "question": "The plane flew ___ the clouds.",
  "choices": [
    "above",
    "at",
    "of",
    "since"
  ],
  "correct": 0
},
{
  "question": "The dog ran ___ the house.",
  "choices": [
    "around",
    "at",
    "of",
    "since"
  ],
  "correct": 0
},
{
  "question": "They walked ___ the bridge.",
  "choices": [
    "across",
    "at",
    "of",
    "since"
  ],
  "correct": 0
},
{
  "question": "Put it ___ the box.",
  "choices": [
    "inside",
    "at",
    "of",
    "since"
  ],
  "correct": 0
},
{
  "question": "She lives ___ the river.",
  "choices": [
    "near",
    "at",
    "of",
    "since"
  ],
  "correct": 0
},
{
  "question": "Stand ___ me.",
  "choices": [
    "beside",
    "at",
    "of",
    "since"
  ],
  "correct": 0
},
{
  "question": "He lives ___ Spain.",
  "choices": [
    "in",
    "at",
    "of",
    "since"
  ],
  "correct": 0
},
{
  "question": "Wait ___ the bus stop.",
  "choices": [
    "at",
    "of",
    "since",
    "than"
  ],
  "correct": 0
},
{
  "question": "The gift is ___ you.",
  "choices": [
    "for",
    "at",
    "of",
    "since"
  ],
  "correct": 0
},
{
  "question": "I went ___ the store.",
  "choices": [
    "to",
    "at",
    "of",
    "since"
  ],
  "correct": 0
},
{
  "question": "She came ___ the party.",
  "choices": [
    "to",
    "at",
    "of",
    "since"
  ],
  "correct": 0
},
{
  "question": "We danced ___ the music.",
  "choices": [
    "to",
    "at",
    "of",
    "since"
  ],
  "correct": 0
},
{
  "question": "He hid ___ the door.",
  "choices": [
    "behind",
    "at",
    "of",
    "since"
  ],
  "correct": 0
},
{
  "question": "The lamp is ___ the desk.",
  "choices": [
    "beside",
    "at",
    "of",
    "since"
  ],
  "correct": 0
},
{
  "question": "She's been here ___ Monday.",
  "choices": [
    "since",
    "at",
    "of",
    "than"
  ],
  "correct": 0
},
{
  "question": "I waited ___ two hours.",
  "choices": [
    "for",
    "at",
    "of",
    "since"
  ],
  "correct": 0
},
{
  "question": "He returned ___ midnight.",
  "choices": [
    "at",
    "of",
    "since",
    "than"
  ],
  "correct": 0
},
{
  "question": "The bird flew ___ the window.",
  "choices": [
    "through",
    "at",
    "of",
    "since"
  ],
  "correct": 0
},
{
  "question": "They drove ___ the city.",
  "choices": [
    "into",
    "at",
    "of",
    "since"
  ],
  "correct": 0
}
] as QuizQuestion[];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: PrepositionQuizSettings): PrepositionQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: PrepositionQuizState, action: PrepositionQuizAction): PrepositionQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: PrepositionQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
