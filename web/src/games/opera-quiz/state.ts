import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface OperaQuizSettings { questions: "10" | "20" | "30"; }
export interface OperaQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type OperaQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "What language is most opera traditionally sung in?", choices: ["Italian","English","French","German"], correct: 0 },
  { question: "Who composed The Magic Flute?", choices: ["Mozart","Verdi","Puccini","Wagner"], correct: 0 },
  { question: "Who composed La Traviata?", choices: ["Verdi","Puccini","Wagner","Bellini"], correct: 0 },
  { question: "Who composed Madama Butterfly?", choices: ["Puccini","Verdi","Donizetti","Bizet"], correct: 0 },
  { question: "Who composed Carmen?", choices: ["Bizet","Gounod","Massenet","Offenbach"], correct: 0 },
  { question: "Who composed The Ring of the Nibelung?", choices: ["Wagner","Strauss","Mahler","Mendelssohn"], correct: 0 },
  { question: "What is an aria?", choices: ["Solo song in opera","Duet","Recitative","Overture"], correct: 0 },
  { question: "What is recitative?", choices: ["Speech-like singing in opera","Aria","Chorus","Overture"], correct: 0 },
  { question: "What is the highest female voice?", choices: ["Soprano","Mezzo-soprano","Contralto","Alto"], correct: 0 },
  { question: "What is the highest male voice (commonly)?", choices: ["Tenor","Baritone","Bass","Countertenor (higher)"], correct: 0 },
  { question: "What opera house is in Milan?", choices: ["La Scala","La Fenice","Royal Opera","San Carlo"], correct: 0 },
  { question: "What opera house is in NYC?", choices: ["Metropolitan Opera","Lincoln Center is its home","Both","La Scala"], correct: 2 },
  { question: "What is bel canto?", choices: ["Italian beautiful singing style","French style","German","Latin term for vocal style"], correct: 0 },
  { question: "Who composed Don Giovanni?", choices: ["Mozart","Beethoven","Rossini","Verdi"], correct: 0 },
  { question: "Who composed The Barber of Seville?", choices: ["Rossini","Mozart","Verdi","Donizetti"], correct: 0 },
  { question: "What aria is from Puccini's Turandot?", choices: ["Nessun dorma","La donna e mobile","Habanera","Voi che sapete"], correct: 0 },
  { question: "Where does La Boheme take place?", choices: ["Paris","Rome","Venice","Vienna"], correct: 0 },
  { question: "What opera includes the Ride of the Valkyries?", choices: ["Die Walkure","Lohengrin","Parsifal","Tristan"], correct: 0 },
  { question: "Who composed Aida?", choices: ["Verdi","Puccini","Wagner","Bizet"], correct: 0 },
  { question: "For what occasion was Aida famously composed?", choices: ["Khedivial Opera House Cairo (1871)","La Scala","Vienna","London"], correct: 0 },
  { question: "What is a leitmotif?", choices: ["Recurring musical theme for a character/idea","Aria","Dance","Chorus"], correct: 0 },
  { question: "Who is closely associated with leitmotif?", choices: ["Wagner","Verdi","Mozart","Puccini"], correct: 0 },
  { question: "What is opera buffa?", choices: ["Comic opera (Italian)","Tragic opera","Lyric","Epic"], correct: 0 },
  { question: "What is opera seria?", choices: ["Serious/heroic Italian opera","Comic","Folk","Religious"], correct: 0 },
  { question: "What's a Wagnerian opera typically called?", choices: ["Music drama","Singspiel","Operetta","Just opera"], correct: 0 },
  { question: "What 19th-century Italian composer wrote Norma?", choices: ["Bellini","Donizetti","Verdi","Rossini"], correct: 0 },
  { question: "Who composed Lucia di Lammermoor?", choices: ["Donizetti","Bellini","Verdi","Rossini"], correct: 0 },
  { question: "What opera features Habanera?", choices: ["Carmen","Aida","Boheme","Tosca"], correct: 0 },
  { question: "Who is the Three Tenors?", choices: ["Pavarotti, Domingo, Carreras","Caruso and 2 others","Pavarotti and Domingo only","Carreras and Domingo"], correct: 0 },
  { question: "What opera includes the aria E lucevan le stelle?", choices: ["Tosca","Boheme","Manon Lescaut","Butterfly"], correct: 0 },
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
