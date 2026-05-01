import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface AdverbQuizSettings { questions: "8" | "10" | "12"; }
export interface AdverbQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type AdverbQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
{
  "question": "She ran ___ to catch the bus.",
  "choices": [
    "quickly",
    "quick",
    "quicker",
    "quickness"
  ],
  "correct": 0
},
{
  "question": "He spoke ___.",
  "choices": [
    "softly",
    "soft",
    "softer",
    "softness"
  ],
  "correct": 0
},
{
  "question": "They danced ___.",
  "choices": [
    "gracefully",
    "graceful",
    "grace",
    "graces"
  ],
  "correct": 0
},
{
  "question": "The child laughed ___.",
  "choices": [
    "loudly",
    "loud",
    "louder",
    "loudness"
  ],
  "correct": 0
},
{
  "question": "She sings ___.",
  "choices": [
    "beautifully",
    "beautiful",
    "beauty",
    "beauties"
  ],
  "correct": 0
},
{
  "question": "He works ___.",
  "choices": [
    "hard",
    "hardly",
    "harder",
    "hardness"
  ],
  "correct": 0
},
{
  "question": "I will see you ___.",
  "choices": [
    "tomorrow",
    "tomorrows",
    "tomorrowed",
    "tomorrowing"
  ],
  "correct": 0
},
{
  "question": "She arrived ___.",
  "choices": [
    "late",
    "lately",
    "later",
    "lateness"
  ],
  "correct": 0
},
{
  "question": "He drives ___.",
  "choices": [
    "carefully",
    "careful",
    "care",
    "cares"
  ],
  "correct": 0
},
{
  "question": "They live ___.",
  "choices": [
    "nearby",
    "near",
    "nearer",
    "nearness"
  ],
  "correct": 0
},
{
  "question": "The dog barked ___.",
  "choices": [
    "fiercely",
    "fierce",
    "fiercer",
    "fierceness"
  ],
  "correct": 0
},
{
  "question": "She always smiles ___.",
  "choices": [
    "happily",
    "happy",
    "happier",
    "happiness"
  ],
  "correct": 0
},
{
  "question": "Please come ___.",
  "choices": [
    "here",
    "hers",
    "his",
    "its"
  ],
  "correct": 0
},
{
  "question": "He answered ___.",
  "choices": [
    "correctly",
    "correct",
    "corrects",
    "correction"
  ],
  "correct": 0
},
{
  "question": "She talks too ___.",
  "choices": [
    "much",
    "many",
    "more",
    "most"
  ],
  "correct": 0
},
{
  "question": "I am ___ tired.",
  "choices": [
    "very",
    "much",
    "more",
    "most"
  ],
  "correct": 0
},
{
  "question": "They walked ___ down the street.",
  "choices": [
    "slowly",
    "slow",
    "slower",
    "slowness"
  ],
  "correct": 0
},
{
  "question": "He completely forgot. The adverb is:",
  "choices": [
    "completely",
    "forgot",
    "he",
    "the"
  ],
  "correct": 0
},
{
  "question": "She rarely visits us. The adverb is:",
  "choices": [
    "rarely",
    "visits",
    "she",
    "us"
  ],
  "correct": 0
},
{
  "question": "I will call you ___.",
  "choices": [
    "soon",
    "soonest",
    "sooner",
    "soonness"
  ],
  "correct": 0
},
{
  "question": "He is ___ at home.",
  "choices": [
    "always",
    "all",
    "every",
    "ever"
  ],
  "correct": 0
},
{
  "question": "She left ___.",
  "choices": [
    "yesterday",
    "yesterdays",
    "yesterday's",
    "yester"
  ],
  "correct": 0
},
{
  "question": "They sat ___.",
  "choices": [
    "outside",
    "outsides",
    "outsiding",
    "outsider"
  ],
  "correct": 0
},
{
  "question": "He played ___.",
  "choices": [
    "well",
    "good",
    "best",
    "gooder"
  ],
  "correct": 0
},
{
  "question": "The baby slept ___.",
  "choices": [
    "peacefully",
    "peace",
    "peaceful",
    "peaces"
  ],
  "correct": 0
},
{
  "question": "She speaks English ___.",
  "choices": [
    "fluently",
    "fluent",
    "fluency",
    "fluencies"
  ],
  "correct": 0
},
{
  "question": "He answered the question ___.",
  "choices": [
    "honestly",
    "honest",
    "honesty",
    "honors"
  ],
  "correct": 0
},
{
  "question": "The car stopped ___.",
  "choices": [
    "suddenly",
    "sudden",
    "sudderly",
    "suddens"
  ],
  "correct": 0
},
{
  "question": "She ___ goes to the gym.",
  "choices": [
    "often",
    "oft",
    "oftener",
    "oftenly"
  ],
  "correct": 0
},
{
  "question": "Please speak ___.",
  "choices": [
    "clearly",
    "clear",
    "clearer",
    "clearness"
  ],
  "correct": 0
}
] as QuizQuestion[];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: AdverbQuizSettings): AdverbQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: AdverbQuizState, action: AdverbQuizAction): AdverbQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: AdverbQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
