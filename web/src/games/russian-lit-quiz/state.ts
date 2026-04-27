import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface RussianLitQuizSettings { questions: "10" | "20" | "30"; }
export interface RussianLitQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type RussianLitQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "Who wrote 'Crime and Punishment'?", choices: ["Tolstoy","Dostoevsky","Turgenev","Gogol"], correct: 1 },
  { question: "Who wrote 'War and Peace'?", choices: ["Tolstoy","Dostoevsky","Pushkin","Pasternak"], correct: 0 },
  { question: "Who wrote 'Anna Karenina'?", choices: ["Tolstoy","Dostoevsky","Chekhov","Bulgakov"], correct: 0 },
  { question: "Who wrote 'The Brothers Karamazov'?", choices: ["Tolstoy","Dostoevsky","Pushkin","Turgenev"], correct: 1 },
  { question: "Who wrote 'The Idiot'?", choices: ["Tolstoy","Dostoevsky","Turgenev","Gogol"], correct: 1 },
  { question: "Who wrote 'Notes from Underground'?", choices: ["Tolstoy","Dostoevsky","Chekhov","Lermontov"], correct: 1 },
  { question: "Who wrote 'Demons' (The Possessed)?", choices: ["Tolstoy","Dostoevsky","Turgenev","Gogol"], correct: 1 },
  { question: "Raskolnikov is the protagonist of?", choices: ["The Idiot","Crime and Punishment","Demons","The Brothers Karamazov"], correct: 1 },
  { question: "Pierre Bezukhov appears in?", choices: ["War and Peace","Anna Karenina","The Idiot","Fathers and Sons"], correct: 0 },
  { question: "Who wrote 'Fathers and Sons'?", choices: ["Tolstoy","Dostoevsky","Turgenev","Gogol"], correct: 2 },
  { question: "Who wrote 'A Hero of Our Time'?", choices: ["Pushkin","Lermontov","Gogol","Tolstoy"], correct: 1 },
  { question: "Who wrote 'Eugene Onegin'?", choices: ["Pushkin","Lermontov","Gogol","Turgenev"], correct: 0 },
  { question: "Eugene Onegin is what kind of work?", choices: ["Play","Novel in verse","Short story","Memoir"], correct: 1 },
  { question: "Who wrote 'Dead Souls'?", choices: ["Pushkin","Lermontov","Gogol","Turgenev"], correct: 2 },
  { question: "Who wrote 'The Overcoat'?", choices: ["Pushkin","Gogol","Turgenev","Chekhov"], correct: 1 },
  { question: "Who wrote 'The Cherry Orchard' (play)?", choices: ["Chekhov","Gogol","Gorky","Bulgakov"], correct: 0 },
  { question: "Who wrote 'Three Sisters' (play)?", choices: ["Chekhov","Gorky","Bulgakov","Tolstoy"], correct: 0 },
  { question: "Who wrote 'Uncle Vanya'?", choices: ["Gogol","Chekhov","Tolstoy","Gorky"], correct: 1 },
  { question: "Who wrote 'The Seagull' (play)?", choices: ["Chekhov","Gogol","Pushkin","Bulgakov"], correct: 0 },
  { question: "Who wrote 'Doctor Zhivago'?", choices: ["Pasternak","Solzhenitsyn","Sholokhov","Bulgakov"], correct: 0 },
  { question: "Who wrote 'One Day in the Life of Ivan Denisovich'?", choices: ["Solzhenitsyn","Pasternak","Bulgakov","Sholokhov"], correct: 0 },
  { question: "Who wrote 'The Gulag Archipelago'?", choices: ["Solzhenitsyn","Pasternak","Akhmatova","Brodsky"], correct: 0 },
  { question: "Who wrote 'The Master and Margarita'?", choices: ["Bulgakov","Pasternak","Sholokhov","Nabokov"], correct: 0 },
  { question: "Who wrote 'Heart of a Dog'?", choices: ["Bulgakov","Gogol","Chekhov","Pasternak"], correct: 0 },
  { question: "Who wrote 'And Quiet Flows the Don'?", choices: ["Sholokhov","Pasternak","Solzhenitsyn","Gorky"], correct: 0 },
  { question: "Who wrote 'Mother' (proletarian novel)?", choices: ["Gorky","Sholokhov","Mayakovsky","Pasternak"], correct: 0 },
  { question: "Who wrote 'Lolita' (in English)?", choices: ["Nabokov","Bulgakov","Solzhenitsyn","Pasternak"], correct: 0 },
  { question: "Nabokov's English novel about chess?", choices: ["Pnin","The Defense","Pale Fire","Ada"], correct: 1 },
  { question: "Akhmatova was a famous?", choices: ["Novelist","Poet","Playwright","Critic"], correct: 1 },
  { question: "Pushkin died in?", choices: ["A duel","Battle","Illness","Old age"], correct: 0 },
  { question: "Who wrote 'A Hero of Our Time' protagonist Pechorin?", choices: ["Pushkin","Lermontov","Gogol","Tolstoy"], correct: 1 },
  { question: "Tolstoy's 'The Death of Ivan Ilyich' is a?", choices: ["Novella","Play","Epic","Letter"], correct: 0 },
  { question: "Who wrote 'Hadji Murat'?", choices: ["Tolstoy","Dostoevsky","Pushkin","Lermontov"], correct: 0 },
  { question: "Who wrote 'White Nights' (story)?", choices: ["Dostoevsky","Tolstoy","Chekhov","Pushkin"], correct: 0 },
  { question: "Who wrote 'The Captain's Daughter'?", choices: ["Pushkin","Lermontov","Gogol","Tolstoy"], correct: 0 },
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
