import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface ComposersRomanticQuizSettings { questions: "10" | "20" | "30"; }
export interface ComposersRomanticQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type ComposersRomanticQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "Chopin was born in?", choices: ["France","Poland","Hungary","Russia"], correct: 1 },
  { question: "The Ring Cycle is by?", choices: ["Verdi","Wagner","Strauss","Puccini"], correct: 1 },
  { question: "Tchaikovsky composed which ballet?", choices: ["Swan Lake","Carmen","Aida","Boris Godunov"], correct: 0 },
  { question: "Brahms wrote how many symphonies?", choices: ["3","4","6","9"], correct: 1 },
  { question: "The 1812 Overture is by?", choices: ["Chopin","Tchaikovsky","Wagner","Liszt"], correct: 1 },
  { question: "Liszt was famous as a virtuoso?", choices: ["Violinist","Pianist","Cellist","Singer"], correct: 1 },
  { question: "Schumann was married to?", choices: ["Clara Wieck","Cosima","Marie","Alma"], correct: 0 },
  { question: "Berlioz composed the?", choices: ["Symphonie Fantastique","Eroica","Pathétique","New World"], correct: 0 },
  { question: "Verdi wrote the opera?", choices: ["La Bohème","Aida","Carmen","Tosca"], correct: 1 },
  { question: "Bizet wrote?", choices: ["Carmen","Aida","La Traviata","Faust"], correct: 0 },
  { question: "Mendelssohn revived which composer's reputation?", choices: ["Mozart","Bach","Haydn","Handel"], correct: 1 },
  { question: "Chopin's primary instrument was?", choices: ["Violin","Piano","Cello","Voice"], correct: 1 },
  { question: "Wagner built his theater at?", choices: ["Vienna","Bayreuth","Berlin","Munich"], correct: 1 },
  { question: "Dvořák's 'New World' Symphony is his?", choices: ["7th","8th","9th","10th"], correct: 2 },
  { question: "Mahler completed how many symphonies?", choices: ["7","9","10","11"], correct: 1 },
  { question: "Bruckner is known for his?", choices: ["Operas","Symphonies","Quartets","Sonatas"], correct: 1 },
  { question: "Schubert wrote how many symphonies?", choices: ["6","8 (incl. Unfinished)","9","12"], correct: 2 },
  { question: "Rossini wrote The Barber of?", choices: ["Vienna","Seville","Florence","Madrid"], correct: 1 },
  { question: "The Hungarian Rhapsody is by?", choices: ["Brahms","Liszt","Bartók","Dvořák"], correct: 1 },
  { question: "Saint-Saëns wrote The Carnival of?", choices: ["Spain","Animals","Italy","Venice"], correct: 1 },
  { question: "Tchaikovsky's Pathétique is his?", choices: ["3rd","5th","6th","7th"], correct: 2 },
  { question: "Schumann is associated with which genre?", choices: ["Lieder","Chant","Atonal","Serial"], correct: 0 },
  { question: "Mussorgsky composed?", choices: ["Pictures at an Exhibition","La Mer","Bolero","Daphnis"], correct: 0 },
  { question: "Smetana composed the cycle?", choices: ["Má vlast","The Planets","Symphonie Espagnole","Romeo & Juliet"], correct: 0 },
  { question: "Rachmaninoff wrote how many piano concertos?", choices: ["2","3","4","5"], correct: 2 },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: ComposersRomanticQuizSettings): ComposersRomanticQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: ComposersRomanticQuizState, action: ComposersRomanticQuizAction): ComposersRomanticQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: ComposersRomanticQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
