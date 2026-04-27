import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface BluesQuizSettings { questions: "10" | "20" | "30"; }
export interface BluesQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type BluesQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "Robert Johnson supposedly sold his soul at?", choices: ["A bridge", "A crossroads", "A river", "A graveyard"], correct: 1 },
  { question: "B.B. King's guitar was named?", choices: ["Trigger", "Lucille", "Black Beauty", "Little Wing"], correct: 1 },
  { question: "Muddy Waters's real name was?", choices: ["McKinley Morganfield", "Riley King", "Chester Burnett", "Sam Maghett"], correct: 0 },
  { question: "Howlin' Wolf's signature song is?", choices: ["Smokestack Lightning", "Hoochie Coochie Man", "Spoonful", "Rollin' Stone"], correct: 0 },
  { question: "Bessie Smith was known as?", choices: ["Empress of the Blues", "Mother of the Blues", "Queen of the Blues", "First Lady of Blues"], correct: 0 },
  { question: "T-Bone Walker pioneered which style?", choices: ["Country blues", "Electric urban blues", "Boogie woogie", "Jump blues"], correct: 1 },
  { question: "John Lee Hooker was famous for songs in?", choices: ["3/4", "12-bar blues", "Boogie shuffles", "Polkas"], correct: 2 },
  { question: "Buddy Guy was a peer/influence on?", choices: ["Eric Clapton", "Jimmy Page", "Jimi Hendrix", "All of the above"], correct: 3 },
  { question: "Chess Records was based in?", choices: ["Memphis", "New Orleans", "Chicago", "Detroit"], correct: 2 },
  { question: "Etta James's signature song is?", choices: ["I'd Rather Go Blind", "At Last", "Tell Mama", "Something's Got a Hold on Me"], correct: 1 },
  { question: "Blind Lemon Jefferson came from?", choices: ["Mississippi", "Texas", "Louisiana", "Tennessee"], correct: 1 },
  { question: "Son House mentored?", choices: ["Robert Johnson", "Charley Patton", "Skip James", "Bukka White"], correct: 0 },
  { question: "The Mississippi Delta blues is associated with?", choices: ["Slide guitar & raw vocals", "Big band brass", "Acoustic 12-string", "String quartets"], correct: 0 },
  { question: "Stevie Ray Vaughan's band was?", choices: ["Double Trouble", "The E Street Band", "The Heartbreakers", "The Killers"], correct: 0 },
  { question: "Eric Clapton's blues group with John Mayall was called?", choices: ["Cream", "The Bluesbreakers", "Derek & the Dominos", "The Yardbirds"], correct: 1 },
  { question: "'Cross Road Blues' is by?", choices: ["Son House", "Robert Johnson", "Skip James", "Charley Patton"], correct: 1 },
  { question: "Big Mama Thornton recorded which song before Elvis?", choices: ["Hound Dog", "All Shook Up", "Heartbreak Hotel", "Blue Suede Shoes"], correct: 0 },
  { question: "Blind Willie Johnson played?", choices: ["Slide guitar", "Piano", "Harmonica", "Mandolin"], correct: 0 },
  { question: "'Hoochie Coochie Man' was written by?", choices: ["Willie Dixon", "Muddy Waters", "Howlin' Wolf", "Sonny Boy Williamson"], correct: 0 },
  { question: "Albert King's signature guitar was a?", choices: ["Stratocaster", "Telecaster", "Flying V", "Les Paul"], correct: 2 },
  { question: "Elmore James is famous for which slide riff?", choices: ["Dust My Broom", "Sky Is Crying", "Done Somebody Wrong", "All of the above"], correct: 3 },
  { question: "The harmonica is sometimes called?", choices: ["The harp", "The reed box", "The mouth piano", "The chromatic"], correct: 0 },
  { question: "Bo Diddley's signature is?", choices: ["The Bo Diddley beat", "Slide guitar", "12-bar shuffle", "Fingerpicked country blues"], correct: 0 },
  { question: "Janis Joplin was hugely inspired by?", choices: ["Bessie Smith", "Etta James", "Memphis Minnie", "All of the above"], correct: 3 },
  { question: "Sister Rosetta Tharpe pioneered?", choices: ["Distorted electric guitar", "Slide guitar", "Boogie piano", "Harmonica solos"], correct: 0 },
  { question: "The 12-bar blues is a chord progression of how many bars?", choices: ["8", "12", "16", "24"], correct: 1 },
  { question: "Memphis Minnie played the?", choices: ["Bass", "Guitar", "Piano", "Harmonica"], correct: 1 },
  { question: "Lightnin' Hopkins's first name was?", choices: ["Sam", "Lonnie", "Otis", "Champion"], correct: 0 },
  { question: "Junior Wells played?", choices: ["Guitar", "Piano", "Drums", "Harmonica"], correct: 3 },
  { question: "The 'Three Kings of Blues Guitar' include?", choices: ["B.B., Albert, Freddie", "B.B., Buddy, Albert", "Albert, Freddie, T-Bone", "B.B., T-Bone, Buddy"], correct: 0 },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: BluesQuizSettings): BluesQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: BluesQuizState, action: BluesQuizAction): BluesQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: BluesQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
