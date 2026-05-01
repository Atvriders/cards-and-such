import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface ConsonantQuizSettings { questions: "8" | "10" | "12"; }
export interface ConsonantQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type ConsonantQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
{
  "question": "CA_ \u2014 fill the consonant for feline.",
  "choices": [
    "B",
    "C",
    "T",
    "S"
  ],
  "correct": 2
},
{
  "question": "DO_ \u2014 fill the consonant for canine.",
  "choices": [
    "G",
    "D",
    "N",
    "M"
  ],
  "correct": 0
},
{
  "question": "_AT \u2014 wears on head.",
  "choices": [
    "B",
    "H",
    "M",
    "R"
  ],
  "correct": 1
},
{
  "question": "PE_ \u2014 writing tool.",
  "choices": [
    "G",
    "N",
    "R",
    "T"
  ],
  "correct": 1
},
{
  "question": "_UN \u2014 bright star.",
  "choices": [
    "B",
    "R",
    "S",
    "T"
  ],
  "correct": 2
},
{
  "question": "MA_ \u2014 folded paper guide.",
  "choices": [
    "N",
    "P",
    "R",
    "T"
  ],
  "correct": 1
},
{
  "question": "BA_ \u2014 used in baseball.",
  "choices": [
    "D",
    "G",
    "N",
    "T"
  ],
  "correct": 3
},
{
  "question": "_OG \u2014 pet that barks.",
  "choices": [
    "B",
    "C",
    "D",
    "F"
  ],
  "correct": 2
},
{
  "question": "FI_H \u2014 swims in water.",
  "choices": [
    "S",
    "T",
    "N",
    "R"
  ],
  "correct": 0
},
{
  "question": "BIR_ \u2014 flies.",
  "choices": [
    "D",
    "G",
    "T",
    "N"
  ],
  "correct": 0
},
{
  "question": "_AND \u2014 opposite of soft (beach).",
  "choices": [
    "B",
    "H",
    "S",
    "M"
  ],
  "correct": 2
},
{
  "question": "BOO_ \u2014 what you read.",
  "choices": [
    "K",
    "T",
    "P",
    "D"
  ],
  "correct": 0
},
{
  "question": "RIN_ \u2014 circle on finger.",
  "choices": [
    "G",
    "D",
    "T",
    "K"
  ],
  "correct": 0
},
{
  "question": "WAL_ \u2014 to stroll.",
  "choices": [
    "K",
    "T",
    "D",
    "P"
  ],
  "correct": 0
},
{
  "question": "_OAT \u2014 sails on water.",
  "choices": [
    "B",
    "C",
    "D",
    "F"
  ],
  "correct": 0
},
{
  "question": "MIL_ \u2014 from a cow.",
  "choices": [
    "K",
    "T",
    "S",
    "D"
  ],
  "correct": 0
},
{
  "question": "CA_E \u2014 sweet baked treat.",
  "choices": [
    "G",
    "K",
    "T",
    "S"
  ],
  "correct": 1
},
{
  "question": "_REE \u2014 large plant.",
  "choices": [
    "B",
    "S",
    "T",
    "P"
  ],
  "correct": 2
},
{
  "question": "LA_E \u2014 body of water.",
  "choices": [
    "G",
    "K",
    "T",
    "S"
  ],
  "correct": 1
},
{
  "question": "_ISH \u2014 what you hope for.",
  "choices": [
    "F",
    "M",
    "W",
    "S"
  ],
  "correct": 2
},
{
  "question": "LION's _OAR \u2014 sound it makes.",
  "choices": [
    "B",
    "C",
    "R",
    "T"
  ],
  "correct": 2
},
{
  "question": "_ED \u2014 color of blood.",
  "choices": [
    "B",
    "R",
    "S",
    "T"
  ],
  "correct": 1
},
{
  "question": "_REEN \u2014 color of grass.",
  "choices": [
    "B",
    "G",
    "P",
    "T"
  ],
  "correct": 1
},
{
  "question": "PIN_ \u2014 soft color.",
  "choices": [
    "G",
    "K",
    "P",
    "T"
  ],
  "correct": 1
},
{
  "question": "_LUE \u2014 sky color.",
  "choices": [
    "B",
    "C",
    "G",
    "P"
  ],
  "correct": 0
},
{
  "question": "_UN \u2014 opposite of moon.",
  "choices": [
    "B",
    "R",
    "S",
    "T"
  ],
  "correct": 2
},
{
  "question": "_OON \u2014 opposite of sun.",
  "choices": [
    "B",
    "M",
    "P",
    "T"
  ],
  "correct": 1
},
{
  "question": "STA_ \u2014 twinkles at night.",
  "choices": [
    "G",
    "M",
    "R",
    "T"
  ],
  "correct": 2
},
{
  "question": "ROC_ \u2014 stone.",
  "choices": [
    "G",
    "K",
    "P",
    "T"
  ],
  "correct": 1
},
{
  "question": "SHI_ \u2014 large boat.",
  "choices": [
    "P",
    "T",
    "D",
    "K"
  ],
  "correct": 0
}
] as QuizQuestion[];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: ConsonantQuizSettings): ConsonantQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: ConsonantQuizState, action: ConsonantQuizAction): ConsonantQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: ConsonantQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
