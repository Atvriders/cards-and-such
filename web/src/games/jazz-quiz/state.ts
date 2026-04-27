import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface JazzQuizSettings { questions: "10" | "20" | "30"; }
export interface JazzQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type JazzQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "Which saxophonist recorded 'A Love Supreme' in 1964?", choices: ["Charlie Parker", "John Coltrane", "Sonny Rollins", "Stan Getz"], correct: 1 },
  { question: "Miles Davis's 'Kind of Blue' was released in what year?", choices: ["1955", "1959", "1962", "1965"], correct: 1 },
  { question: "Duke Ellington led which big band famously?", choices: ["The Cotton Club Orchestra", "His own Orchestra", "The Count Basie Band", "The Glenn Miller Band"], correct: 1 },
  { question: "Bebop emerged in the 1940s primarily in which city?", choices: ["Chicago", "New Orleans", "New York", "Kansas City"], correct: 2 },
  { question: "Which trumpeter is associated with 'West End Blues'?", choices: ["Dizzy Gillespie", "Louis Armstrong", "Miles Davis", "Chet Baker"], correct: 1 },
  { question: "Charlie Parker's nickname was?", choices: ["Bird", "Pres", "Trane", "Diz"], correct: 0 },
  { question: "Thelonious Monk played what instrument?", choices: ["Saxophone", "Piano", "Trumpet", "Bass"], correct: 1 },
  { question: "Fusion jazz famously combines jazz with which genre?", choices: ["Folk", "Rock", "Classical", "Country"], correct: 1 },
  { question: "Which singer is known as 'The First Lady of Song'?", choices: ["Billie Holiday", "Sarah Vaughan", "Ella Fitzgerald", "Nina Simone"], correct: 2 },
  { question: "Dizzy Gillespie was famous for his bent?", choices: ["Saxophone", "Trumpet", "Trombone", "Clarinet"], correct: 1 },
  { question: "The 'Hot Five' was led by?", choices: ["Louis Armstrong", "Jelly Roll Morton", "Sidney Bechet", "King Oliver"], correct: 0 },
  { question: "Cool jazz arose in which decade?", choices: ["1930s", "1940s", "1950s", "1960s"], correct: 2 },
  { question: "Which pianist composed 'Take Five' (lead)?", choices: ["Bill Evans", "Dave Brubeck", "Oscar Peterson", "Herbie Hancock"], correct: 1 },
  { question: "'Take Five' is in what time signature?", choices: ["3/4", "4/4", "5/4", "7/8"], correct: 2 },
  { question: "Hard bop emerged as a reaction to?", choices: ["Swing", "Cool jazz", "Free jazz", "Bebop"], correct: 1 },
  { question: "Sun Ra was known for his?", choices: ["Cool quartets", "Cosmic Arkestra", "Bossa nova", "Smooth jazz"], correct: 1 },
  { question: "Bossa nova originated in which country?", choices: ["Cuba", "Brazil", "Argentina", "Mexico"], correct: 1 },
  { question: "Stan Getz helped popularize bossa nova with the album?", choices: ["Getz/Gilberto", "Focus", "Sweet Rain", "Captain Marvel"], correct: 0 },
  { question: "Wynton Marsalis is most associated with?", choices: ["Saxophone", "Trumpet", "Piano", "Drums"], correct: 1 },
  { question: "Which drummer led 'The Jazz Messengers'?", choices: ["Max Roach", "Art Blakey", "Elvin Jones", "Tony Williams"], correct: 1 },
  { question: "John Coltrane's 'Giant Steps' is famous for its?", choices: ["Slow tempo", "Complex chord changes", "Solo piano", "Tap dancing"], correct: 1 },
  { question: "Which label was founded by Alfred Lion?", choices: ["Verve", "Blue Note", "Impulse!", "Prestige"], correct: 1 },
  { question: "'Birth of the Cool' is associated with?", choices: ["Coltrane", "Davis", "Mingus", "Monk"], correct: 1 },
  { question: "Charles Mingus is known as a?", choices: ["Drummer", "Bassist/Composer", "Pianist", "Saxophonist"], correct: 1 },
  { question: "Free jazz pioneer Ornette Coleman played?", choices: ["Trumpet", "Plastic alto sax", "Vibraphone", "Drums"], correct: 1 },
  { question: "Herbie Hancock's 'Maiden Voyage' was released in?", choices: ["1959", "1965", "1971", "1977"], correct: 1 },
  { question: "Which jazz singer recorded 'Strange Fruit'?", choices: ["Ella Fitzgerald", "Billie Holiday", "Sarah Vaughan", "Carmen McRae"], correct: 1 },
  { question: "Dixieland jazz originated in?", choices: ["Chicago", "New Orleans", "Memphis", "Detroit"], correct: 1 },
  { question: "Swing era peaked in which decade?", choices: ["1920s", "1930s", "1950s", "1960s"], correct: 1 },
  { question: "Which festival is the oldest U.S. jazz festival?", choices: ["Monterey", "Newport", "Montreux", "North Sea"], correct: 1 },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: JazzQuizSettings): JazzQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: JazzQuizState, action: JazzQuizAction): JazzQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: JazzQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
