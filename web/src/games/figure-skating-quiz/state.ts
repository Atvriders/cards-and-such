import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface FigureSkatingQuizSettings { questions: "10" | "20"; }
export interface FigureSkatingQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type FigureSkatingQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "How many disciplines are in Olympic figure skating?", choices: ["2", "3", "4", "5"], correct: 2 },
  { question: "Which is NOT an Olympic figure skating discipline?", choices: ["Singles", "Pairs", "Synchronized", "Ice dance"], correct: 2 },
  { question: "What jump did Surya Bonaly perform that's now banned?", choices: ["Backflip", "Quad axel", "Side spin", "Triple lutz"], correct: 0 },
  { question: "How many revolutions in a 'triple axel'?", choices: ["3", "3.5", "4", "4.5"], correct: 1 },
  { question: "Which jump is named after a Norwegian skater?", choices: ["Lutz", "Axel", "Salchow", "Loop"], correct: 1 },
  { question: "Who first landed a quadruple jump in competition?", choices: ["Brian Boitano", "Kurt Browning", "Yuzuru Hanyu", "Elvis Stojko"], correct: 1 },
  { question: "Which Japanese skater dominated 2014-2018 Olympics?", choices: ["Yuzuru Hanyu", "Daisuke Takahashi", "Shoma Uno", "Takeshi Honda"], correct: 0 },
  { question: "Who won 1994 Olympic gold amid the Tonya Harding scandal?", choices: ["Nancy Kerrigan", "Oksana Baiul", "Surya Bonaly", "Chen Lu"], correct: 1 },
  { question: "Which skating element is a fast spin on one foot?", choices: ["Camel spin", "Sit spin", "Layback", "All of these"], correct: 3 },
  { question: "Which Russian pair won 1984 Olympic gold?", choices: ["Rodnina/Zaitsev", "Valova/Vasiliev", "Gordeeva/Grinkov", "Berezhnaya/Sikharulidze"], correct: 1 },
  { question: "Which skater first landed a quad lutz?", choices: ["Brandon Mroz", "Yuzuru Hanyu", "Boyang Jin", "Nathan Chen"], correct: 0 },
  { question: "Ice dance differs from pairs in what way?", choices: ["No throws or overhead lifts", "No music", "Different rink", "Different blades"], correct: 0 },
  { question: "Who won three consecutive Olympic golds in pairs?", choices: ["Irina Rodnina", "Tara Lipinski", "Sonja Henie", "Katarina Witt"], correct: 0 },
  { question: "Which Norwegian skater won three Olympic golds (1928, 1932, 1936)?", choices: ["Sonja Henie", "Carolina Kostner", "Mao Asada", "Michelle Kwan"], correct: 0 },
  { question: "What is 'GOE' in figure skating scoring?", choices: ["Grade of Execution", "General Overall Effect", "Group of Experts", "Gold-Olympic Edge"], correct: 0 },
  { question: "Which compulsory item replaced figures in the early 1990s?", choices: ["Removed; now skating only", "Added pairs lifts", "Mandated quad jumps", "Eliminated music"], correct: 0 },
  { question: "How long is a typical men's free skate program?", choices: ["2 minutes", "3.5 minutes", "4 minutes", "5 minutes"], correct: 2 },
  { question: "Which medal did Tonya Harding win in 1994?", choices: ["Gold", "Silver", "Bronze", "None - 8th place"], correct: 3 },
  { question: "What is a 'death spiral'?", choices: ["A pairs element with skater horizontal", "Solo spin", "Dance step", "Footwork sequence"], correct: 0 },
  { question: "Who is known as 'Yu-na Queen'?", choices: ["Kim Yuna", "Mao Asada", "Carolina Kostner", "Yulia Lipnitskaya"], correct: 0 }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: FigureSkatingQuizSettings): FigureSkatingQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: FigureSkatingQuizState, action: FigureSkatingQuizAction): FigureSkatingQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: FigureSkatingQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
