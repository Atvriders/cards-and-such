import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface NyoutBoardSettings { questions: "10"; }
export interface NyoutBoardState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type NyoutBoardAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: 'Nyout/Yut is a traditional game from?', choices: ['Korea', 'Japan', 'Vietnam', 'China'], correct: 0 as 0 | 1 | 2 | 3 },
  { question: "Nyout's board outline is?", choices: ['Cross-shaped with shortcuts through the center', 'Square 8×8', 'Circular', 'Spiral'], correct: 0 as 0 | 1 | 2 | 3 },
  { question: 'Players move tokens by throwing?', choices: ['Four yut sticks', 'Six-sided dice', 'Coins', 'Cards'], correct: 0 as 0 | 1 | 2 | 3 },
  { question: 'Each yut stick has?', choices: ['A flat side and a curved side', 'Two flat sides', 'Two curved sides', 'Numbered faces'], correct: 0 as 0 | 1 | 2 | 3 },
  { question: 'If all four yut sticks land curved-up, the move is?', choices: ['Mo (5 spaces)', 'Do (1 space)', 'Yut (4 spaces)', 'Gae (2 spaces)'], correct: 0 as 0 | 1 | 2 | 3 },
  { question: 'If only one curved side faces up, the move is?', choices: ['Do (1 space)', 'Mo (5)', 'Yut (4)', 'Gae (2)'], correct: 0 as 0 | 1 | 2 | 3 },
  { question: 'Each player typically has how many tokens?', choices: ['Four tokens', 'One token', 'Six tokens', 'Twelve tokens'], correct: 0 as 0 | 1 | 2 | 3 },
  { question: 'Nyout/Yut is most popular at?', choices: ['Lunar New Year (Seollal)', 'Christmas', 'Easter', 'Summer solstice'], correct: 0 as 0 | 1 | 2 | 3 },
  { question: 'Nyout is classified as?', choices: ['A race game', 'A trick-taking game', 'A solitaire', 'A war game'], correct: 0 as 0 | 1 | 2 | 3 },
  { question: "Tokens that land on opponent's tokens?", choices: ['Send the opponent back to start', 'Are captured', 'Are doubled', 'Switch teams'], correct: 0 as 0 | 1 | 2 | 3 }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, _settings: NyoutBoardSettings): NyoutBoardState {
  const rng=mulberry32(seed);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,10);
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: NyoutBoardState, action: NyoutBoardAction): NyoutBoardState {
  if(state.phase==="done")return state;
  switch(action.type){
    case "select":return state.submitted?state:{...state,selected:action.choice};
    case "submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case "tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case "next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: NyoutBoardState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
