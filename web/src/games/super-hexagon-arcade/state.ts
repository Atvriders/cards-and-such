import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface SuperHexagonArcadeSettings { questions: "10"; }
export interface SuperHexagonArcadeState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type SuperHexagonArcadeAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: 'Super Hexagon was designed by?', choices: ['Terry Cavanagh', 'Lima Sky', 'Halfbrick', 'Mojang'], correct: 0 as 0 | 1 | 2 | 3 },
  { question: 'Super Hexagon was released in?', choices: ['2012', '2001', '1985', '2020'], correct: 0 as 0 | 1 | 2 | 3 },
  { question: 'Player controls a tiny what?', choices: ['Triangle', 'Square', 'Circle', 'Pentagon'], correct: 0 as 0 | 1 | 2 | 3 },
  { question: 'The walls in Super Hexagon close in toward?', choices: ['The center', 'The edges', 'The top', 'The bottom'], correct: 0 as 0 | 1 | 2 | 3 },
  { question: 'The player rotates to find?', choices: ['Gaps in the closing walls', 'Coins', 'Cards', 'Tile melds'], correct: 0 as 0 | 1 | 2 | 3 },
  { question: 'Music in Super Hexagon was composed by?', choices: ['Chipzel', 'John Williams', 'Hans Zimmer', 'Daft Punk'], correct: 0 as 0 | 1 | 2 | 3 },
  { question: 'Super Hexagon is famous for?', choices: ['Difficulty and short play sessions', 'Long story mode', 'AAA budget', 'Open-world map'], correct: 0 as 0 | 1 | 2 | 3 },
  { question: 'Game over occurs when?', choices: ['A wall touches the player', 'Time runs out', 'All cards discarded', 'Score reaches 100'], correct: 0 as 0 | 1 | 2 | 3 },
  { question: 'Difficulty levels in Super Hexagon include?', choices: ['Hexagon, Hexagoner, Hexagonest, Hyper-/Hard-named higher tiers', 'Easy/Medium/Hard only', 'No levels', 'Solo/Duet/Party'], correct: 0 as 0 | 1 | 2 | 3 },
  { question: 'Super Hexagon style is best classified as?', choices: ['A rotation-dodging arcade reflex game', 'A solitaire', 'A trick-taking game', 'A Roll-and-Write'], correct: 0 as 0 | 1 | 2 | 3 }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, _settings: SuperHexagonArcadeSettings): SuperHexagonArcadeState {
  const rng=mulberry32(seed);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,10);
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: SuperHexagonArcadeState, action: SuperHexagonArcadeAction): SuperHexagonArcadeState {
  if(state.phase==="done")return state;
  switch(action.type){
    case "select":return state.submitted?state:{...state,selected:action.choice};
    case "submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case "tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case "next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: SuperHexagonArcadeState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
