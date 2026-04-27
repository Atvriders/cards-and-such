import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface BalletQuizSettings { questions: "10" | "20" | "30"; }
export interface BalletQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type BalletQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "Tchaikovsky composed how many great ballet scores?", choices: ["Two", "Three", "Four", "Five"], correct: 1 },
  { question: "'The Nutcracker' premiered in?", choices: ["Paris", "Moscow", "St. Petersburg", "Vienna"], correct: 2 },
  { question: "'Swan Lake' was originally choreographed (1877) by?", choices: ["Petipa", "Reisinger", "Ivanov", "Bournonville"], correct: 1 },
  { question: "'The Rite of Spring' (1913) music is by?", choices: ["Stravinsky", "Debussy", "Ravel", "Satie"], correct: 0 },
  { question: "Marius Petipa was based at which company?", choices: ["Bolshoi", "Mariinsky", "Paris Opera Ballet", "Royal Ballet"], correct: 1 },
  { question: "George Balanchine co-founded which company?", choices: ["NYCB", "ABT", "Royal Ballet", "Joffrey"], correct: 0 },
  { question: "Anna Pavlova is famous for the solo?", choices: ["Dying Swan", "Black Swan", "Swan Princess", "Spectre de la rose"], correct: 0 },
  { question: "Rudolf Nureyev defected from?", choices: ["Czechoslovakia", "Soviet Union", "East Germany", "Hungary"], correct: 1 },
  { question: "Margot Fonteyn was prima at?", choices: ["Royal Ballet", "Bolshoi", "Mariinsky", "ABT"], correct: 0 },
  { question: "Mikhail Baryshnikov defected to?", choices: ["UK", "Canada", "USA", "France"], correct: 1 },
  { question: "'Giselle' was choreographed in 1841 by?", choices: ["Coralli & Perrot", "Petipa", "Bournonville", "Ivanov"], correct: 0 },
  { question: "The Bolshoi Ballet is in which city?", choices: ["St. Petersburg", "Kiev", "Moscow", "Minsk"], correct: 2 },
  { question: "Frederick Ashton was the founder choreographer of?", choices: ["Royal Ballet", "ABT", "Joffrey", "NYCB"], correct: 0 },
  { question: "Kenneth MacMillan choreographed which 'Romeo and Juliet'?", choices: ["1962 Royal Ballet", "1965 Royal Ballet", "1971 ABT", "1977 Bolshoi"], correct: 1 },
  { question: "Jerome Robbins also choreographed which Broadway hit?", choices: ["West Side Story", "Wicked", "Chicago", "Cabaret"], correct: 0 },
  { question: "Pina Bausch is associated with?", choices: ["Tanztheater Wuppertal", "Stuttgart Ballet", "Hamburg Ballet", "Frankfurt Ballet"], correct: 0 },
  { question: "Misty Copeland made history at?", choices: ["NYCB", "ABT", "Royal Ballet", "Bolshoi"], correct: 1 },
  { question: "'La Sylphide' is associated with which choreographer?", choices: ["Petipa", "Bournonville", "Ashton", "Cranko"], correct: 1 },
  { question: "'Don Quixote' as a ballet is most associated with?", choices: ["Petipa", "Balanchine", "Ashton", "MacMillan"], correct: 0 },
  { question: "'Sleeping Beauty' premiered in?", choices: ["1882", "1890", "1895", "1900"], correct: 1 },
  { question: "'The Firebird' (1910) music is by?", choices: ["Debussy", "Ravel", "Stravinsky", "Glazunov"], correct: 2 },
  { question: "Sergei Diaghilev founded?", choices: ["Ballets Russes", "Ballets Suédois", "Joffrey", "Mariinsky"], correct: 0 },
  { question: "Vaslav Nijinsky was famous for?", choices: ["Spectacular jumps", "Slow turns", "Pointe technique", "Tap dance"], correct: 0 },
  { question: "Royal Ballet School is in?", choices: ["Manchester", "London", "Birmingham", "Cardiff"], correct: 1 },
  { question: "Sylvie Guillem was étoile at?", choices: ["NYCB", "Royal Ballet (and POB)", "Bolshoi", "Stuttgart"], correct: 1 },
  { question: "Royal Danish Ballet's signature style is named for?", choices: ["Petipa", "Bournonville", "Ashton", "Cranko"], correct: 1 },
  { question: "'Cinderella' ballet music is by?", choices: ["Tchaikovsky", "Prokofiev", "Glière", "Khachaturian"], correct: 1 },
  { question: "Akram Khan blends which traditions?", choices: ["Kathak and contemporary", "Flamenco and ballet", "Hip hop and tap", "Ballroom and jazz"], correct: 0 },
  { question: "William Forsythe is best known with?", choices: ["Stuttgart and Frankfurt Ballet", "NYCB", "ABT", "Bolshoi"], correct: 0 },
  { question: "John Cranko was the founding choreographer at?", choices: ["Stuttgart Ballet", "Hamburg Ballet", "Royal Danish", "POB"], correct: 0 },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: BalletQuizSettings): BalletQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: BalletQuizState, action: BalletQuizAction): BalletQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: BalletQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
