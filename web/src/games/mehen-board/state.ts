import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface MehenBoardSettings { questions: "10"; }
export interface MehenBoardState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type MehenBoardAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "Mehen's board is shaped like?", choices: ['A coiled snake / spiral', 'An 8×8 grid', 'A circle', 'A pyramid'], correct: 0 as 0 | 1 | 2 | 3 },
  { question: 'Mehen comes from which ancient civilization?', choices: ['Ancient Egypt', 'Mesopotamia', 'China', 'India'], correct: 0 as 0 | 1 | 2 | 3 },
  { question: 'Tokens used in Mehen include?', choices: ['Lion-shaped figures and small marbles', 'Pawns and bishops', 'Cards', 'Dice only'], correct: 0 as 0 | 1 | 2 | 3 },
  { question: 'Mehen means?', choices: ["'Coiled one' (referring to a snake)", "'King's race'", "'Lion path'", "'Sun chariot'"], correct: 0 as 0 | 1 | 2 | 3 },
  { question: 'Mehen boards date approximately to?', choices: ['Predynastic Egypt to ~2300 BCE', '1500 BCE', '500 CE', 'Roman era'], correct: 0 as 0 | 1 | 2 | 3 },
  { question: 'Mehen is most commonly classified as?', choices: ['A race game', 'A trick-taking game', 'A solitaire', 'A war game'], correct: 0 as 0 | 1 | 2 | 3 },
  { question: 'Number of players in classic Mehen is estimated as?', choices: ['Up to six', 'Solo', 'Always two', 'Always twelve'], correct: 0 as 0 | 1 | 2 | 3 },
  { question: 'Mehen is named after the Egyptian deity?', choices: ['Mehen, the protective serpent', 'Anubis', 'Ra', 'Thoth'], correct: 0 as 0 | 1 | 2 | 3 },
  { question: 'Movement randomness is thought to use?', choices: ['Throw-sticks', 'Cards', 'Coin flips', 'Tokens'], correct: 0 as 0 | 1 | 2 | 3 },
  { question: 'Mehen is the predecessor of which family?', choices: ['Race games (with Senet, Royal Game of Ur)', 'Chess', 'Solitaire', 'Mancala'], correct: 0 as 0 | 1 | 2 | 3 }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, _settings: MehenBoardSettings): MehenBoardState {
  const rng=mulberry32(seed);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,10);
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: MehenBoardState, action: MehenBoardAction): MehenBoardState {
  if(state.phase==="done")return state;
  switch(action.type){
    case "select":return state.submitted?state:{...state,selected:action.choice};
    case "submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case "tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case "next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: MehenBoardState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
