import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface AshtapadaSettings { questions: "10"; }
export interface AshtapadaState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type AshtapadaAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "Ashtapada is played on what size grid?", choices: ["6x6","8x8","10x10","12x12"], correct: 1 },
  { question: "The word 'ashtapada' literally means?", choices: ["Eight stones","Eight feet / eight legged","Eight cards","Eight kings"], correct: 1 },
  { question: "Ashtapada is regarded as a predecessor of?", choices: ["Mancala","Chess and Pachisi","Backgammon","Tarot"], correct: 1 },
  { question: "Ashtapada is played by how many players?", choices: ["1","2-4","6","8"], correct: 1 },
  { question: "The board has how many marked / special squares (cross-marked)?", choices: ["1","4-12","32","64"], correct: 1 },
  { question: "Movement is determined by?", choices: ["Card draw","Dice or cowries","Voting","Free choice"], correct: 1 },
  { question: "Ashtapada is mentioned in which ancient Indian text?", choices: ["Bhagavad Gita","Ramayana / classical Sanskrit literature","Tao Te Ching","Bible"], correct: 1 },
  { question: "The game dates from at least which century BCE/CE?", choices: ["20th BCE","First few centuries CE","10th century CE","16th century CE"], correct: 1 },
  { question: "The 8x8 board layout most directly inspired which game?", choices: ["Backgammon","Chess (chaturanga)","Mancala","Snakes and Ladders"], correct: 1 },
  { question: "The complexity of Ashtapada is rated as?", choices: ["Heavy","Light","Tournament-tier","AI-only"], correct: 1 }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, _settings: AshtapadaSettings): AshtapadaState {
  const rng=mulberry32(seed);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,10);
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: AshtapadaState, action: AshtapadaAction): AshtapadaState {
  if(state.phase==="done")return state;
  switch(action.type){
    case "select":return state.submitted?state:{...state,selected:action.choice};
    case "submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case "tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case "next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: AshtapadaState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
