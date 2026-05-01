import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface SynonymPickSettings { questions: "8" | "10" | "12"; }
export interface SynonymPickState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type SynonymPickAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  {
    "question": "Synonym for HAPPY?",
    "choices": [
      "sad",
      "angry",
      "joyful",
      "tired"
    ],
    "correct": 2
  },
  {
    "question": "Synonym for BIG?",
    "choices": [
      "tiny",
      "huge",
      "calm",
      "silent"
    ],
    "correct": 1
  },
  {
    "question": "Synonym for FAST?",
    "choices": [
      "slow",
      "quick",
      "calm",
      "tired"
    ],
    "correct": 1
  },
  {
    "question": "Synonym for SMART?",
    "choices": [
      "dull",
      "clever",
      "weak",
      "silent"
    ],
    "correct": 1
  },
  {
    "question": "Synonym for COLD?",
    "choices": [
      "chilly",
      "warm",
      "sunny",
      "fast"
    ],
    "correct": 0
  },
  {
    "question": "Synonym for BRAVE?",
    "choices": [
      "scared",
      "cowardly",
      "courageous",
      "weak"
    ],
    "correct": 2
  },
  {
    "question": "Synonym for KIND?",
    "choices": [
      "mean",
      "cruel",
      "generous",
      "harsh"
    ],
    "correct": 2
  },
  {
    "question": "Synonym for ANGRY?",
    "choices": [
      "calm",
      "happy",
      "furious",
      "tired"
    ],
    "correct": 2
  },
  {
    "question": "Synonym for BEAUTIFUL?",
    "choices": [
      "ugly",
      "gorgeous",
      "plain",
      "sour"
    ],
    "correct": 1
  },
  {
    "question": "Synonym for DIFFICULT?",
    "choices": [
      "easy",
      "simple",
      "tough",
      "light"
    ],
    "correct": 2
  },
  {
    "question": "Synonym for SAD?",
    "choices": [
      "cheerful",
      "gloomy",
      "lively",
      "bright"
    ],
    "correct": 1
  },
  {
    "question": "Synonym for SMALL?",
    "choices": [
      "large",
      "tiny",
      "broad",
      "tall"
    ],
    "correct": 1
  },
  {
    "question": "Synonym for STRONG?",
    "choices": [
      "frail",
      "powerful",
      "weak",
      "thin"
    ],
    "correct": 1
  },
  {
    "question": "Synonym for QUIET?",
    "choices": [
      "loud",
      "noisy",
      "silent",
      "busy"
    ],
    "correct": 2
  },
  {
    "question": "Synonym for RICH?",
    "choices": [
      "poor",
      "broke",
      "wealthy",
      "tired"
    ],
    "correct": 2
  },
  {
    "question": "Synonym for TIRED?",
    "choices": [
      "alert",
      "weary",
      "active",
      "fresh"
    ],
    "correct": 1
  },
  {
    "question": "Synonym for FUNNY?",
    "choices": [
      "dull",
      "boring",
      "amusing",
      "serious"
    ],
    "correct": 2
  },
  {
    "question": "Synonym for STRANGE?",
    "choices": [
      "normal",
      "common",
      "odd",
      "plain"
    ],
    "correct": 2
  },
  {
    "question": "Synonym for BEGIN?",
    "choices": [
      "finish",
      "stop",
      "start",
      "end"
    ],
    "correct": 2
  },
  {
    "question": "Synonym for END?",
    "choices": [
      "finish",
      "open",
      "begin",
      "start"
    ],
    "correct": 0
  },
  {
    "question": "Synonym for HELP?",
    "choices": [
      "hinder",
      "block",
      "assist",
      "ignore"
    ],
    "correct": 2
  },
  {
    "question": "Synonym for ANSWER?",
    "choices": [
      "question",
      "reply",
      "ask",
      "doubt"
    ],
    "correct": 1
  },
  {
    "question": "Synonym for SHOUT?",
    "choices": [
      "whisper",
      "yell",
      "mumble",
      "sigh"
    ],
    "correct": 1
  },
  {
    "question": "Synonym for QUICK?",
    "choices": [
      "slow",
      "lazy",
      "rapid",
      "still"
    ],
    "correct": 2
  },
  {
    "question": "Synonym for LARGE?",
    "choices": [
      "tiny",
      "huge",
      "narrow",
      "short"
    ],
    "correct": 1
  },
  {
    "question": "Synonym for HARD (difficult)?",
    "choices": [
      "soft",
      "tough",
      "easy",
      "light"
    ],
    "correct": 1
  },
  {
    "question": "Synonym for OLD?",
    "choices": [
      "new",
      "young",
      "ancient",
      "fresh"
    ],
    "correct": 2
  },
  {
    "question": "Synonym for SHINY?",
    "choices": [
      "dull",
      "gleaming",
      "rough",
      "dim"
    ],
    "correct": 1
  },
  {
    "question": "Synonym for CALM?",
    "choices": [
      "wild",
      "peaceful",
      "tense",
      "loud"
    ],
    "correct": 1
  },
  {
    "question": "Synonym for HONEST?",
    "choices": [
      "lying",
      "fake",
      "truthful",
      "sneaky"
    ],
    "correct": 2
  }
] as QuizQuestion[];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: SynonymPickSettings): SynonymPickState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: SynonymPickState, action: SynonymPickAction): SynonymPickState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: SynonymPickState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
