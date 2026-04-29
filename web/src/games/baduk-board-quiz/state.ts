import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface BadukBoardQuizSettings { questions: "10"; }
export interface BadukBoardQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type BadukBoardQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "Baduk is the", choices: ["Korean name for Go", "Korean word for chess", "A unique Korean variant", "A Korean dice game"] as [string, string, string, string], correct: 0 },
  { question: "Korean rules differ from Japanese mostly in", choices: ["Scoring conventions and komi", "Piece movements", "Board size", "Ko rules entirely"] as [string, string, string, string], correct: 0 },
  { question: "Korea has produced top Go players such as", choices: ["Lee Changho and Lee Sedol", "Anatoly Karpov", "Magnus Carlsen", "Hou Yifan"] as [string, string, string, string], correct: 0 },
  { question: "Top Korean Go titles include", choices: ["Kuksu and Myungin", "Honinbo (Japan)", "Mingren (China)", "Eternity Cup"] as [string, string, string, string], correct: 0 },
  { question: "Baduk is taught in", choices: ["Many Korean schools and academies", "Only universities", "Only online platforms", "Only kindergartens"] as [string, string, string, string], correct: 0 },
  { question: "The board is", choices: ["Standard 19x19 with star points", "9x9 only", "Random sizes", "Hex-shaped"] as [string, string, string, string], correct: 0 },
  { question: "Korean Baduk uses", choices: ["Area scoring traditionally", "Territory only", "Capture-only counting", "Random scoring"] as [string, string, string, string], correct: 0 },
  { question: "The Hanguk Kiwon governs", choices: ["Korean professional Go (Baduk)", "Korean chess", "Korean shogi", "Korean cards"] as [string, string, string, string], correct: 0 },
  { question: "Baduk culture often celebrates", choices: ["Tigers and dragons in iconography", "Saturn and stars", "Frogs and toads", "Mushrooms only"] as [string, string, string, string], correct: 0 },
  { question: "Korean Baduk is supported online by", choices: ["Tygem, Cyberoria, and global servers", "No platforms", "Cards-only servers", "Mahjong-only sites"] as [string, string, string, string], correct: 0 }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, _settings: BadukBoardQuizSettings): BadukBoardQuizState {
  const rng=mulberry32(seed);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,10);
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: BadukBoardQuizState, action: BadukBoardQuizAction): BadukBoardQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: BadukBoardQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
