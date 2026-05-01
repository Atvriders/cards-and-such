import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface RussianLitQuizSettings { questions: "10" | "20" | "30"; }
export interface RussianLitQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type RussianLitQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "Who wrote 'Crime and Punishment'?", choices: ["Tolstoy","Dostoevsky","Turgenev","Gogol"], correct: 1 },
  { question: "Who wrote 'War and Peace'?", choices: ["Tolstoy","Dostoevsky","Pushkin","Gorky"], correct: 0 },
  { question: "Who wrote 'Anna Karenina'?", choices: ["Dostoevsky","Tolstoy","Pasternak","Chekhov"], correct: 1 },
  { question: "Who wrote 'The Brothers Karamazov'?", choices: ["Tolstoy","Dostoevsky","Turgenev","Gogol"], correct: 1 },
  { question: "Who wrote 'The Idiot'?", choices: ["Tolstoy","Dostoevsky","Turgenev","Pushkin"], correct: 1 },
  { question: "Who wrote 'Notes from Underground'?", choices: ["Gogol","Dostoevsky","Tolstoy","Turgenev"], correct: 1 },
  { question: "Who wrote 'Demons' (also called 'The Possessed')?", choices: ["Tolstoy","Dostoevsky","Gogol","Turgenev"], correct: 1 },
  { question: "Who wrote 'Dead Souls'?", choices: ["Gogol","Tolstoy","Pushkin","Lermontov"], correct: 0 },
  { question: "Who wrote 'The Overcoat'?", choices: ["Pushkin","Gogol","Chekhov","Turgenev"], correct: 1 },
  { question: "Who wrote 'The Nose'?", choices: ["Gogol","Pushkin","Dostoevsky","Bulgakov"], correct: 0 },
  { question: "Who wrote 'Eugene Onegin'?", choices: ["Pushkin","Lermontov","Gogol","Turgenev"], correct: 0 },
  { question: "Who wrote 'A Hero of Our Time'?", choices: ["Pushkin","Lermontov","Gogol","Tolstoy"], correct: 1 },
  { question: "Who wrote 'Fathers and Sons'?", choices: ["Tolstoy","Dostoevsky","Turgenev","Chekhov"], correct: 2 },
  { question: "Bazarov is the protagonist of?", choices: ["Dead Souls","Fathers and Sons","Oblomov","War and Peace"], correct: 1 },
  { question: "Who wrote 'Oblomov'?", choices: ["Goncharov","Turgenev","Dostoevsky","Tolstoy"], correct: 0 },
  { question: "Who wrote 'The Cherry Orchard'?", choices: ["Chekhov","Gorky","Turgenev","Bulgakov"], correct: 0 },
  { question: "Who wrote 'Three Sisters'?", choices: ["Chekhov","Gorky","Turgenev","Tolstoy"], correct: 0 },
  { question: "Who wrote 'Uncle Vanya'?", choices: ["Chekhov","Gorky","Turgenev","Bulgakov"], correct: 0 },
  { question: "Who wrote 'The Seagull'?", choices: ["Chekhov","Gorky","Turgenev","Pushkin"], correct: 0 },
  { question: "Who wrote 'The Master and Margarita'?", choices: ["Bulgakov","Pasternak","Solzhenitsyn","Nabokov"], correct: 0 },
  { question: "Who wrote 'Doctor Zhivago'?", choices: ["Pasternak","Bulgakov","Solzhenitsyn","Sholokhov"], correct: 0 },
  { question: "Who wrote 'One Day in the Life of Ivan Denisovich'?", choices: ["Solzhenitsyn","Pasternak","Bulgakov","Nabokov"], correct: 0 },
  { question: "Who wrote 'The Gulag Archipelago'?", choices: ["Solzhenitsyn","Sholokhov","Pasternak","Babel"], correct: 0 },
  { question: "Who wrote 'And Quiet Flows the Don'?", choices: ["Sholokhov","Solzhenitsyn","Pasternak","Bulgakov"], correct: 0 },
  { question: "Who wrote 'Lolita'?", choices: ["Nabokov","Bulgakov","Pasternak","Solzhenitsyn"], correct: 0 },
  { question: "Who wrote 'Pale Fire'?", choices: ["Nabokov","Bulgakov","Solzhenitsyn","Pasternak"], correct: 0 },
  { question: "Who wrote 'The Lower Depths'?", choices: ["Gorky","Chekhov","Turgenev","Bulgakov"], correct: 0 },
  { question: "Who wrote 'Mother' (1906 novel)?", choices: ["Gorky","Tolstoy","Turgenev","Chekhov"], correct: 0 },
  { question: "Who wrote 'Red Cavalry'?", choices: ["Babel","Bulgakov","Sholokhov","Pasternak"], correct: 0 },
  { question: "Raskolnikov is from?", choices: ["The Idiot","Crime and Punishment","Demons","Dead Souls"], correct: 1 },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: RussianLitQuizSettings): RussianLitQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: RussianLitQuizState, action: RussianLitQuizAction): RussianLitQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: RussianLitQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
