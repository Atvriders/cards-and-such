import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface VowelQuizSettings { questions: "8" | "10" | "12"; }
export interface VowelQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type VowelQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
{
  "question": "B_LL \u2014 fill the vowel.",
  "choices": [
    "A",
    "E",
    "I",
    "O"
  ],
  "correct": 1
},
{
  "question": "P_NDA \u2014 what vowel?",
  "choices": [
    "A",
    "E",
    "I",
    "O"
  ],
  "correct": 0
},
{
  "question": "MOO_ \u2014 what vowel?",
  "choices": [
    "A",
    "E",
    "I",
    "O"
  ],
  "correct": 1
},
{
  "question": "GR_ND \u2014 most natural vowel?",
  "choices": [
    "A",
    "I",
    "E",
    "O"
  ],
  "correct": 2
},
{
  "question": "FR_T \u2014 fill the vowel.",
  "choices": [
    "A",
    "E",
    "I",
    "U"
  ],
  "correct": 3
},
{
  "question": "BL_ND \u2014 what vowel?",
  "choices": [
    "A",
    "E",
    "I",
    "O"
  ],
  "correct": 1
},
{
  "question": "TR_ST \u2014 what vowel?",
  "choices": [
    "A",
    "E",
    "I",
    "U"
  ],
  "correct": 3
},
{
  "question": "FL_ME \u2014 fill the vowel.",
  "choices": [
    "A",
    "E",
    "I",
    "O"
  ],
  "correct": 0
},
{
  "question": "S_NG \u2014 fill in.",
  "choices": [
    "A",
    "E",
    "I",
    "O"
  ],
  "correct": 2
},
{
  "question": "L_VE \u2014 what vowel?",
  "choices": [
    "A",
    "E",
    "I",
    "O"
  ],
  "correct": 3
},
{
  "question": "C_T \u2014 fill the vowel.",
  "choices": [
    "A",
    "E",
    "I",
    "O"
  ],
  "correct": 0
},
{
  "question": "D_G \u2014 fill the vowel.",
  "choices": [
    "A",
    "E",
    "I",
    "O"
  ],
  "correct": 3
},
{
  "question": "P_G \u2014 fill the vowel.",
  "choices": [
    "A",
    "E",
    "I",
    "O"
  ],
  "correct": 2
},
{
  "question": "B_G \u2014 what vowel makes 'large'?",
  "choices": [
    "A",
    "E",
    "I",
    "O"
  ],
  "correct": 2
},
{
  "question": "R_N \u2014 to move quickly.",
  "choices": [
    "A",
    "E",
    "I",
    "U"
  ],
  "correct": 3
},
{
  "question": "S_N \u2014 bright star.",
  "choices": [
    "A",
    "E",
    "I",
    "U"
  ],
  "correct": 3
},
{
  "question": "M_N \u2014 adult male.",
  "choices": [
    "A",
    "E",
    "I",
    "O"
  ],
  "correct": 0
},
{
  "question": "H_T \u2014 wear on head.",
  "choices": [
    "A",
    "E",
    "I",
    "U"
  ],
  "correct": 0
},
{
  "question": "J_M \u2014 sweet spread.",
  "choices": [
    "A",
    "E",
    "I",
    "O"
  ],
  "correct": 0
},
{
  "question": "L_G \u2014 tree branch piece.",
  "choices": [
    "A",
    "E",
    "I",
    "O"
  ],
  "correct": 3
},
{
  "question": "N_T \u2014 tied rope.",
  "choices": [
    "A",
    "E",
    "I",
    "O"
  ],
  "correct": 3
},
{
  "question": "P_T \u2014 cooking vessel.",
  "choices": [
    "A",
    "E",
    "I",
    "O"
  ],
  "correct": 3
},
{
  "question": "R_D \u2014 color of fire.",
  "choices": [
    "A",
    "E",
    "I",
    "O"
  ],
  "correct": 1
},
{
  "question": "S_T \u2014 place to rest.",
  "choices": [
    "A",
    "E",
    "I",
    "O"
  ],
  "correct": 1
},
{
  "question": "T_N \u2014 number after nine.",
  "choices": [
    "A",
    "E",
    "I",
    "O"
  ],
  "correct": 1
},
{
  "question": "W_T \u2014 opposite of dry.",
  "choices": [
    "A",
    "E",
    "I",
    "O"
  ],
  "correct": 1
},
{
  "question": "Z_P \u2014 fastener.",
  "choices": [
    "A",
    "E",
    "I",
    "O"
  ],
  "correct": 2
},
{
  "question": "Y_K \u2014 large ox.",
  "choices": [
    "A",
    "E",
    "I",
    "O"
  ],
  "correct": 0
},
{
  "question": "BR_CK \u2014 building block.",
  "choices": [
    "A",
    "E",
    "I",
    "O"
  ],
  "correct": 2
},
{
  "question": "CL_CK \u2014 tells time.",
  "choices": [
    "A",
    "E",
    "I",
    "O"
  ],
  "correct": 3
}
] as QuizQuestion[];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: VowelQuizSettings): VowelQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: VowelQuizState, action: VowelQuizAction): VowelQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: VowelQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
