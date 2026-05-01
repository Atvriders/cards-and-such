import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface ColdWarSpiesQuizSettings { questions: "10" | "20"; }
export interface ColdWarSpiesQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type ColdWarSpiesQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  {"question": "Which British spy ring leaked atomic secrets to the USSR?", "choices": ["Cambridge Five", "Oxford Four", "London Three", "Manchester Six"], "correct": 0},
  {"question": "Who was 'the third man' of the Cambridge Five?", "choices": ["Kim Philby", "Guy Burgess", "Donald Maclean", "Anthony Blunt"], "correct": 0},
  {"question": "Which Cambridge spy was the Queen's art adviser?", "choices": ["Anthony Blunt", "John Cairncross", "Kim Philby", "Guy Burgess"], "correct": 0},
  {"question": "German atomic spy who passed Manhattan Project secrets?", "choices": ["Klaus Fuchs", "Bruno Pontecorvo", "Allan Nunn May", "Theodore Hall"], "correct": 0},
  {"question": "Couple executed in 1953 for atomic espionage?", "choices": ["Hiss", "Rosenbergs", "Coplons", "Sobells"], "correct": 1},
  {"question": "Soviet defector to U.S., 1985, returned to USSR?", "choices": ["Yurchenko", "Gordievsky", "Penkovsky", "Polyakov"], "correct": 0},
  {"question": "KGB Colonel exfiltrated by MI6, 1985?", "choices": ["Gordievsky", "Penkovsky", "Kuzichkin", "Levchenko"], "correct": 0},
  {"question": "GRU colonel who informed West during Cuban Missile Crisis?", "choices": ["Penkovsky", "Polyakov", "Tolkachev", "Sheymov"], "correct": 0},
  {"question": "CIA mole who betrayed many U.S. assets, 1994?", "choices": ["Ames", "Hanssen", "Howard", "Nicholson"], "correct": 0},
  {"question": "FBI agent unmasked as Soviet/Russian spy in 2001?", "choices": ["Hanssen", "Ames", "Pitts", "Trofimoff"], "correct": 0},
  {"question": "Soviet illegals network exposed in U.S. in 2010?", "choices": ["Ghost Stories", "Farewell", "Venona", "Mongoose"], "correct": 0},
  {"question": "Codename of joint US/UK signals decryption project?", "choices": ["Venona", "Ultra", "Magic", "Bourbon"], "correct": 0},
  {"question": "U-2 pilot shot down over USSR in 1960?", "choices": ["Gary Powers", "Rudolf Abel", "George Blake", "Greville Wynne"], "correct": 0},
  {"question": "Famous spy swap bridge in Berlin?", "choices": ["Glienicke", "Oberbaum", "Bornholmer", "Friedrichstrasse"], "correct": 0},
  {"question": "Soviet illegal exchanged for Powers?", "choices": ["Rudolf Abel", "Konon Molody", "George Blake", "Vladimir Kryuchkov"], "correct": 0},
  {"question": "MI6 officer who escaped Wormwood Scrubs after spying for USSR?", "choices": ["George Blake", "Kim Philby", "Guy Burgess", "John Vassall"], "correct": 0},
  {"question": "Stasi was the secret police of which country?", "choices": ["East Germany", "Poland", "Czechoslovakia", "Hungary"], "correct": 0},
  {"question": "KGB chairman who became Soviet leader in 1982?", "choices": ["Andropov", "Chernenko", "Brezhnev", "Gromyko"], "correct": 0},
  {"question": "CIA Berlin tunnel intercepted what?", "choices": ["Soviet phone lines", "Letters", "Microwaves", "Couriers"], "correct": 0},
  {"question": "Which mole revealed the Berlin tunnel to the KGB?", "choices": ["George Blake", "Kim Philby", "Aldrich Ames", "Oleg Penkovsky"], "correct": 0},
  {"question": "Bulgarian dissident killed by ricin umbrella in 1978?", "choices": ["Markov", "Kostov", "Trifonov", "Dimitrov"], "correct": 0},
  {"question": "Which CIA officer suspected mole in James Angleton's hunt?", "choices": ["Yuri Nosenko", "Anatoly Golitsyn", "Yuri Loginov", "Oleg Lyalin"], "correct": 0},
  {"question": "Defector who claimed deep KGB penetration of CIA?", "choices": ["Golitsyn", "Nosenko", "Polyakov", "Yurchenko"], "correct": 0},
  {"question": "Kim Philby fled to USSR in?", "choices": ["1963", "1951", "1971", "1956"], "correct": 0},
  {"question": "Burgess and Maclean defected in?", "choices": ["1951", "1955", "1961", "1949"], "correct": 0},
  {"question": "Walker family spied for whom?", "choices": ["USSR", "China", "E. Germany", "N. Korea"], "correct": 0},
  {"question": "Israeli spy caught at U.S. Naval Intelligence?", "choices": ["Pollard", "Vanunu", "Kuperwasser", "Eitan"], "correct": 0},
  {"question": "KGB illegal nicknamed 'Lonsdale' in UK?", "choices": ["Konon Molody", "Rudolf Abel", "Vladimir Petrov", "Ruth Werner"], "correct": 0},
  {"question": "Which KGB defector wrote 'KGB: The Inside Story'?", "choices": ["Gordievsky", "Mitrokhin", "Kalugin", "Suvorov"], "correct": 0},
  {"question": "Vasili Mitrokhin smuggled what to MI6?", "choices": ["KGB archive notes", "Gold", "Films", "Plans"], "correct": 0}
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: ColdWarSpiesQuizSettings): ColdWarSpiesQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questionsArr=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions:questionsArr,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: ColdWarSpiesQuizState, action: ColdWarSpiesQuizAction): ColdWarSpiesQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: ColdWarSpiesQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
