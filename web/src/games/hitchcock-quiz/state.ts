import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface HitchcockQuizSettings { questions: "10" | "20" | "30"; }
export interface HitchcockQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type HitchcockQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "What year was Alfred Hitchcock born?", choices: ["1895", "1899", "1903", "1907"], correct: 1 },
  { question: "Where was Hitchcock born?", choices: ["London", "Leytonstone, London", "Manchester", "Liverpool"], correct: 1 },
  { question: "What 1960 film features the famous shower scene?", choices: ["Psycho", "The Birds", "Vertigo", "Rear Window"], correct: 0 },
  { question: "Who plays Norman Bates in 'Psycho'?", choices: ["Anthony Perkins", "Janet Leigh", "Vera Miles", "John Gavin"], correct: 0 },
  { question: "Who composed Psycho's iconic score?", choices: ["Bernard Herrmann", "John Williams", "Henry Mancini", "Maurice Jarre"], correct: 0 },
  { question: "What 1958 film stars James Stewart with acrophobia?", choices: ["Vertigo", "Rear Window", "Rope", "Strangers on a Train"], correct: 0 },
  { question: "Vertigo's leading lady is?", choices: ["Kim Novak", "Grace Kelly", "Tippi Hedren", "Eva Marie Saint"], correct: 0 },
  { question: "What 1954 film features a wheelchair-bound voyeur?", choices: ["Rear Window", "Vertigo", "Dial M for Murder", "The Wrong Man"], correct: 0 },
  { question: "Who stars opposite Stewart in Rear Window?", choices: ["Grace Kelly", "Kim Novak", "Tippi Hedren", "Doris Day"], correct: 0 },
  { question: "What 1959 film stars Cary Grant on the run?", choices: ["North by Northwest", "To Catch a Thief", "Notorious", "Suspicion"], correct: 0 },
  { question: "North by Northwest features a chase by what?", choices: ["A crop-dusting plane", "A truck", "A train", "A speedboat"], correct: 0 },
  { question: "What 1963 horror film featured avian attacks?", choices: ["The Birds", "Marnie", "Frenzy", "Psycho"], correct: 0 },
  { question: "Who stars in The Birds?", choices: ["Tippi Hedren", "Grace Kelly", "Kim Novak", "Vera Miles"], correct: 0 },
  { question: "What 1948 film was shot to appear as a continuous take?", choices: ["Rope", "Lifeboat", "Dial M for Murder", "Strangers on a Train"], correct: 0 },
  { question: "What 1951 thriller features two strangers swapping murders?", choices: ["Strangers on a Train", "The Trouble with Harry", "Stage Fright", "I Confess"], correct: 0 },
  { question: "Hitchcock's nickname?", choices: ["The Master of Suspense", "The British Master", "Sir Alfred", "Hitch"], correct: 0 },
  { question: "Hitchcock made signature what?", choices: ["Cameo appearances in his films", "Always wore a hat", "Cooked", "Painted"], correct: 0 },
  { question: "What 1940 Best Picture winner was directed by Hitchcock?", choices: ["Rebecca", "Suspicion", "Foreign Correspondent", "Spellbound"], correct: 0 },
  { question: "Rebecca is based on a novel by?", choices: ["Daphne du Maurier", "Agatha Christie", "Patricia Highsmith", "Dorothy L. Sayers"], correct: 0 },
  { question: "How many Best Director Oscars did Hitchcock win?", choices: ["Zero", "One", "Two", "Three"], correct: 0 },
  { question: "Who stars as Lisa Fremont in Rear Window?", choices: ["Grace Kelly", "Kim Novak", "Tippi Hedren", "Eva Marie Saint"], correct: 0 },
  { question: "What 1956 musical-suspense film stars Doris Day?", choices: ["The Man Who Knew Too Much", "The Trouble with Harry", "I Confess", "Stage Fright"], correct: 0 },
  { question: "What song does Doris Day famously sing in The Man Who Knew Too Much?", choices: ["Que Sera Sera", "Sentimental Journey", "Tea for Two", "Day After Day"], correct: 0 },
  { question: "Hitchcock's TV series was called?", choices: ["Alfred Hitchcock Presents", "Hitchcock Theater", "Suspense Tonight", "The Master Presents"], correct: 0 },
  { question: "What 1946 film stars Ingrid Bergman as a spy?", choices: ["Notorious", "Spellbound", "Suspicion", "The Paradine Case"], correct: 0 },
  { question: "Hitchcock famously called actors what?", choices: ["Cattle", "Sheep", "Pawns", "Children"], correct: 0 },
  { question: "What was Hitchcock's only color silent? Or rather his last silent?", choices: ["Blackmail (his first sound film)", "The Lodger", "Champagne", "The Manxman"], correct: 0 },
  { question: "What 1972 thriller is set in London with a serial killer?", choices: ["Frenzy", "Topaz", "Torn Curtain", "Family Plot"], correct: 0 },
  { question: "Hitchcock died in what year?", choices: ["1980", "1976", "1985", "1972"], correct: 0 },
  { question: "Hitchcock's last film was?", choices: ["Family Plot (1976)", "Frenzy (1972)", "Topaz (1969)", "Torn Curtain (1966)"], correct: 0 },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: HitchcockQuizSettings): HitchcockQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: HitchcockQuizState, action: HitchcockQuizAction): HitchcockQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: HitchcockQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
