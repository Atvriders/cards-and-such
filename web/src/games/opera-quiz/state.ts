import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface OperaQuizSettings { questions: "10" | "20" | "30"; }
export interface OperaQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type OperaQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "Verdi's 'Aida' premiered in?", choices: ["Paris", "Milan", "Cairo", "Rome"], correct: 2 },
  { question: "'La Bohème' was composed by?", choices: ["Verdi", "Puccini", "Bellini", "Donizetti"], correct: 1 },
  { question: "Wagner's 'Ring' cycle has how many operas?", choices: ["Three", "Four", "Five", "Six"], correct: 1 },
  { question: "Mozart's 'Don Giovanni' premiered in?", choices: ["Vienna", "Salzburg", "Prague", "Berlin"], correct: 2 },
  { question: "Puccini's 'Tosca' is set in?", choices: ["Paris", "Rome", "Vienna", "Naples"], correct: 1 },
  { question: "Bizet's 'Carmen' is set in?", choices: ["Madrid", "Seville", "Granada", "Barcelona"], correct: 1 },
  { question: "The aria 'Nessun dorma' is from?", choices: ["Tosca", "La Bohème", "Turandot", "Madama Butterfly"], correct: 2 },
  { question: "'The Magic Flute' is by?", choices: ["Mozart", "Haydn", "Beethoven", "Salieri"], correct: 0 },
  { question: "'Madama Butterfly' is set in?", choices: ["China", "Japan", "Korea", "Vietnam"], correct: 1 },
  { question: "Maria Callas's voice type was?", choices: ["Mezzo-soprano", "Coloratura soprano", "Lyric soprano", "Dramatic soprano"], correct: 1 },
  { question: "Luciano Pavarotti's voice type was?", choices: ["Baritone", "Tenor", "Countertenor", "Bass"], correct: 1 },
  { question: "'The Three Tenors' included Pavarotti, Domingo, and?", choices: ["Bocelli", "Carreras", "Villazón", "Florez"], correct: 1 },
  { question: "Beethoven's only opera is?", choices: ["Fidelio", "Leonore", "Egmont", "Coriolanus"], correct: 0 },
  { question: "Handel's most famous opera seria is?", choices: ["Giulio Cesare", "Tamerlano", "Rinaldo", "Alcina"], correct: 0 },
  { question: "'Eugene Onegin' is by?", choices: ["Mussorgsky", "Tchaikovsky", "Rimsky-Korsakov", "Borodin"], correct: 1 },
  { question: "'Boris Godunov' is by?", choices: ["Mussorgsky", "Tchaikovsky", "Rimsky-Korsakov", "Stravinsky"], correct: 0 },
  { question: "The Metropolitan Opera House is in?", choices: ["Brooklyn", "Manhattan", "Bronx", "Queens"], correct: 1 },
  { question: "La Scala is located in?", choices: ["Venice", "Milan", "Rome", "Florence"], correct: 1 },
  { question: "Strauss's 'Salome' is based on a play by?", choices: ["Shaw", "Wilde", "Ibsen", "Strindberg"], correct: 1 },
  { question: "'The Barber of Seville' is by?", choices: ["Verdi", "Rossini", "Donizetti", "Bellini"], correct: 1 },
  { question: "'Pagliacci' is by?", choices: ["Mascagni", "Leoncavallo", "Cilea", "Giordano"], correct: 1 },
  { question: "'Cavalleria Rusticana' is by?", choices: ["Mascagni", "Leoncavallo", "Cilea", "Puccini"], correct: 0 },
  { question: "Verdi's late tragedy is?", choices: ["Otello", "Falstaff", "Don Carlos", "Aida"], correct: 0 },
  { question: "Verdi's late comedy is?", choices: ["Otello", "Falstaff", "Don Carlos", "Aida"], correct: 1 },
  { question: "Wagner's home opera house is in?", choices: ["Munich", "Bayreuth", "Dresden", "Vienna"], correct: 1 },
  { question: "Britten's most performed opera is?", choices: ["Peter Grimes", "Billy Budd", "The Turn of the Screw", "A Midsummer Night's Dream"], correct: 0 },
  { question: "Joan Sutherland was famous for which roles?", choices: ["Bel canto", "Wagnerian", "Verismo", "Baroque"], correct: 0 },
  { question: "'Lakmé' (with the 'Flower Duet') is by?", choices: ["Massenet", "Delibes", "Gounod", "Offenbach"], correct: 1 },
  { question: "Gluck reformed which kind of opera?", choices: ["Opera buffa", "Opera seria", "Singspiel", "Operetta"], correct: 1 },
  { question: "Mozart's 'Le nozze di Figaro' libretto is by?", choices: ["Schikaneder", "Da Ponte", "Metastasio", "Boito"], correct: 1 },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: OperaQuizSettings): OperaQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: OperaQuizState, action: OperaQuizAction): OperaQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: OperaQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
