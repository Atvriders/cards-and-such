import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface GymnasticsQuizSettings { questions: "10" | "20"; }
export interface GymnasticsQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type GymnasticsQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "How many apparatus events do men's artistic gymnastics include?", choices: ["4", "5", "6", "8"], correct: 2 },
  { question: "How many apparatus events do women's artistic gymnastics include?", choices: ["3", "4", "5", "6"], correct: 1 },
  { question: "Which apparatus is unique to men's gymnastics?", choices: ["Balance beam", "Pommel horse", "Uneven bars", "Floor"], correct: 1 },
  { question: "Which apparatus is unique to women's gymnastics?", choices: ["Pommel horse", "Rings", "Uneven bars", "Parallel bars"], correct: 2 },
  { question: "Who scored the first perfect 10 at the Olympics?", choices: ["Olga Korbut", "Mary Lou Retton", "Nadia Comăneci", "Simone Biles"], correct: 2 },
  { question: "In what year did Comăneci score the first perfect 10?", choices: ["1972", "1976", "1980", "1984"], correct: 1 },
  { question: "Which gymnast has the most World Championship medals?", choices: ["Larisa Latynina", "Simone Biles", "Nadia Comăneci", "Svetlana Khorkina"], correct: 1 },
  { question: "What scoring system replaced the 'perfect 10' in artistic gymnastics?", choices: ["Open-ended Code of Points", "20-point system", "Double-blind judging", "Athlete-rated"], correct: 0 },
  { question: "Which event features a 4-meter spring floor?", choices: ["Floor exercise", "Beam", "Vault", "Bars"], correct: 0 },
  { question: "How wide is the balance beam?", choices: ["4 cm", "10 cm", "20 cm", "30 cm"], correct: 1 },
  { question: "How high is a beam from the floor?", choices: ["80 cm", "100 cm", "125 cm", "150 cm"], correct: 2 },
  { question: "Which gymnast is famous for the 'Yurchenko vault'?", choices: ["Olga Korbut", "Natalia Yurchenko", "Lilia Podkopayeva", "Vera Caslavska"], correct: 1 },
  { question: "Rhythmic gymnastics is performed by women using which apparatus?", choices: ["Hoop, ball, ribbon, rope, clubs", "Bars only", "Beam only", "Floor only"], correct: 0 },
  { question: "Trampoline gymnastics became Olympic in?", choices: ["1996", "2000", "2004", "2008"], correct: 1 },
  { question: "Which gymnastics legend is from Romania (1976)?", choices: ["Olga Korbut", "Nadia Comăneci", "Mary Lou Retton", "Cathy Rigby"], correct: 1 },
  { question: "How tall is a horizontal bar above the ground?", choices: ["1.7m", "2.2m", "2.8m", "3.1m"], correct: 2 },
  { question: "Who is the most decorated American gymnast in Olympics?", choices: ["Mary Lou Retton", "Shannon Miller", "Simone Biles", "Nastia Liukin"], correct: 2 },
  { question: "How many gymnasts on a typical Olympic team?", choices: ["3", "4-5", "6", "8"], correct: 1 },
  { question: "What does 'all-around' refer to?", choices: ["Combined score across all apparatus", "Single best event", "Team score", "Floor only"], correct: 0 },
  { question: "Which 1972 Soviet gymnast captivated audiences with the 'Korbut Flip'?", choices: ["Olga Korbut", "Larisa Latynina", "Nellie Kim", "Lyudmila Tourischeva"], correct: 0 }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: GymnasticsQuizSettings): GymnasticsQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: GymnasticsQuizState, action: GymnasticsQuizAction): GymnasticsQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: GymnasticsQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
