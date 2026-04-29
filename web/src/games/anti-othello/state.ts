import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface AntiOthelloSettings { questions: "10"; }
export interface AntiOthelloState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type AntiOthelloAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "Anti-Othello win condition", choices: ["Fewest discs of your color when board fills wins", "Most discs", "First flip wins", "Capture the king"], correct: 0 },
  { question: "Board and basic placement rules are", choices: ["Identical to standard Othello", "Different size", "On a hex grid", "With dice"], correct: 0 },
  { question: "Strategically, you want to", choices: ["Force opponent to flip your discs", "Avoid all flipping", "Refuse to move", "Always take corners"], correct: 0 },
  { question: "Corners in Anti-Othello are", choices: ["Often dangerous — they let you build large stable groups (bad here)", "Always good", "Worthless", "Removed"], correct: 0 },
  { question: "Mobility (move count) becomes", choices: ["Reversed in importance — denying it can be bad", "Always desirable", "Irrelevant", "Always low"], correct: 0 },
  { question: "Compared with normal Othello, the metagame is", choices: ["Inverted — strong moves become weak", "Identical", "Random", "Slower only"], correct: 0 },
  { question: "You may pass when", choices: ["You have no legal move", "You want to skip", "Always", "Never"], correct: 0 },
  { question: "A typical key motif is", choices: ["Manipulating parity to ensure opponent ends with most discs", "Rushing to fill corners", "Capturing the king", "Promoting pawns"], correct: 0 },
  { question: "Anti-Othello is part of the", choices: ["Misère family of games", "Chess family", "Card family", "Mancala family"], correct: 0 },
  { question: "Best skill to develop", choices: ["Counting parity and opponent's forced moves", "Memorizing openings", "Throwing dice", "Flipping fast"], correct: 0 },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, _settings: AntiOthelloSettings): AntiOthelloState {
  const rng=mulberry32(seed);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,10);
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: AntiOthelloState, action: AntiOthelloAction): AntiOthelloState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: AntiOthelloState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
