import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface FranceCultureQuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface FranceCultureQuizSettings { questions: "10" | "20"; }
export interface FranceCultureQuizState { questions: FranceCultureQuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type FranceCultureQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: FranceCultureQuizQuestion[] = [
  { question: "What is the capital of France?", choices: ["Lyon","Paris","Marseille","Toulouse"], correct: 1 },
  { question: "Who painted the Mona Lisa?", choices: ["Monet","Raphael","Da Vinci","Vermeer"], correct: 2 },
  { question: "The Eiffel Tower was completed in?", choices: ["1875","1889","1900","1912"], correct: 1 },
  { question: "Which French king was beheaded in 1793?", choices: ["Louis XIV","Louis XV","Louis XVI","Henri IV"], correct: 2 },
  { question: "Bordeaux is famous for?", choices: ["Wine","Cheese","Bread","Champagne"], correct: 0 },
  { question: "The Louvre is in?", choices: ["Versailles","Paris","Lyon","Nice"], correct: 1 },
  { question: "Croissants are which kind of pastry?", choices: ["Choux","Puff/laminated","Shortcrust","Brioche"], correct: 1 },
  { question: "Napoleon was exiled to which island first?", choices: ["Saint Helena","Corsica","Elba","Sardinia"], correct: 2 },
  { question: "Which is a French automobile brand?", choices: ["Fiat","Renault","Volvo","Skoda"], correct: 1 },
  { question: "The Tour de France is what kind of race?", choices: ["Foot race","Cycling","Motorbike","Horse"], correct: 1 },
  { question: "Impressionism originated in which country?", choices: ["Italy","France","Netherlands","Germany"], correct: 1 },
  { question: "Which is a French cheese?", choices: ["Gouda","Brie","Parmesan","Manchego"], correct: 1 },
  { question: "The Bastille was stormed in?", choices: ["1789","1799","1812","1830"], correct: 0 },
  { question: "What is the French national motto?", choices: ["Veni Vidi Vici","Liberté Égalité Fraternité","Honi soit qui mal y pense","Pacta sunt servanda"], correct: 1 },
  { question: "Which river runs through Paris?", choices: ["Rhine","Loire","Seine","Rhône"], correct: 2 },
  { question: "Coco Chanel revolutionized?", choices: ["Cooking","Fashion","Architecture","Cinema"], correct: 1 },
  { question: "Mont Saint-Michel is famous as a?", choices: ["Vineyard","Tidal island abbey","Castle","Theater"], correct: 1 },
  { question: "Charles de Gaulle was a?", choices: ["Painter","General/President","Composer","Chemist"], correct: 1 },
  { question: "Which is a French TGV?", choices: ["Plane","Boat","High-speed train","Bus"], correct: 2 },
  { question: "Versailles was built primarily by?", choices: ["Louis XIV","Louis XVI","Henri IV","Francis I"], correct: 0 },
  { question: "Which pastry is filled with cream?", choices: ["Macaron","Éclair","Tarte Tatin","Galette"], correct: 1 },
  { question: "The French language belongs to which family?", choices: ["Germanic","Romance","Celtic","Slavic"], correct: 1 },
  { question: "Joan of Arc was burned at the stake in?", choices: ["1212","1431","1492","1515"], correct: 1 },
  { question: "Which artist cut off his ear?", choices: ["Renoir","Cezanne","Van Gogh","Monet"], correct: 2 },
  { question: "Champagne can only be made in?", choices: ["Anywhere","Champagne region of France","France","Europe"], correct: 1 }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: FranceCultureQuizSettings): FranceCultureQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: FranceCultureQuizState, action: FranceCultureQuizAction): FranceCultureQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: FranceCultureQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
