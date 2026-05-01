import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface NewYearQuizSettings { questions: "10" | "20" | "30"; }
export interface NewYearQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type NewYearQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "New Year's Day in the Gregorian calendar?", choices: ["January 1", "January 6", "December 31", "February 1"], correct: 0 },
  { question: "Times Square Ball Drop year started?", choices: ["1907", "1900", "1925", "1950"], correct: 0 },
  { question: "Times Square Ball drops at?", choices: ["Midnight Eastern Time", "Midnight UTC", "Midnight Pacific", "10 PM ET"], correct: 0 },
  { question: "Auld Lang Syne lyrics by?", choices: ["Robert Burns (1788)", "Robert Frost", "Robert Browning", "Walter Scott"], correct: 0 },
  { question: "Who popularized Auld Lang Syne in America?", choices: ["Guy Lombardo (orchestra)", "Bing Crosby", "Frank Sinatra", "Lawrence Welk"], correct: 0 },
  { question: "What does 'Auld Lang Syne' mean?", choices: ["Old long since (times gone by)", "New Year cheer", "Long live", "Best friends"], correct: 0 },
  { question: "Chinese (Lunar) New Year falls?", choices: ["Between January 21 and February 20", "Always January 1", "Always February 14", "Always January 15"], correct: 0 },
  { question: "What is the first month called in some traditions for New Year?", choices: ["January (named after Janus)", "February", "March", "April"], correct: 0 },
  { question: "Who is Janus (Roman god)?", choices: ["God of beginnings, gates, doorways (two-faced)", "God of war", "God of harvest", "God of love"], correct: 0 },
  { question: "Spanish New Year tradition involves?", choices: ["Eating 12 grapes at midnight (one per chime)", "Smashing plates", "Burning effigies", "Throwing buckets"], correct: 0 },
  { question: "Greek/Italian tradition smashes what for New Year?", choices: ["Pomegranates (Greece) / old items thrown out (Italy)", "Plates", "Pots", "Eggs"], correct: 0 },
  { question: "Japanese New Year is called?", choices: ["Shogatsu / Oshogatsu", "Tanabata", "Bon", "Setsubun"], correct: 0 },
  { question: "Hogmanay is?", choices: ["Scottish New Year celebration", "Irish New Year", "Welsh festival", "English custom"], correct: 0 },
  { question: "First-footing is a Hogmanay tradition that?", choices: ["First person across threshold brings luck", "First meal", "First drink", "First song"], correct: 0 },
  { question: "Rose Parade is held on?", choices: ["January 1 (Pasadena)", "December 31", "Christmas Day", "Thanksgiving"], correct: 0 },
  { question: "Rose Bowl game is?", choices: ["A college football bowl held New Year's Day (or near)", "A figure skating event", "An NFL game", "A soccer match"], correct: 0 },
  { question: "Russian Orthodox New Year falls on?", choices: ["January 14 (Old New Year, Julian)", "January 1", "February 1", "December 31"], correct: 0 },
  { question: "Edinburgh's Hogmanay features?", choices: ["Fireworks and street party", "Quiet ceremony", "Boat parade", "Snow festival"], correct: 0 },
  { question: "Sydney is famous for?", choices: ["Harbour Bridge fireworks (one of first major celebrations globally)", "Quiet observance", "Snow displays", "Boat races"], correct: 0 },
  { question: "Happy New Year in French?", choices: ["Bonne année", "Buon anno", "Feliz año", "Frohes Neues"], correct: 0 },
  { question: "Happy New Year in Spanish?", choices: ["Feliz Año Nuevo", "Bonne année", "Buon anno", "Frohes Neues"], correct: 0 },
  { question: "Happy New Year in Mandarin?", choices: ["Xīnnián kuàilè", "Konnichiwa", "Annyeong", "Selamat tahun baru"], correct: 0 },
  { question: "What is a New Year's resolution?", choices: ["A goal/promise made for the new year", "A song", "A toast", "A legal document"], correct: 0 },
  { question: "Most common New Year's resolution?", choices: ["Exercise/get fit", "Travel more", "Read books", "Save more"], correct: 0 },
  { question: "Babylonian New Year (Akitu) was held in?", choices: ["Spring (March/April)", "Summer", "Autumn", "Winter"], correct: 0 },
  { question: "Iranian New Year (Nowruz) falls on?", choices: ["Spring equinox (~March 20-21)", "January 1", "February 1", "March 1"], correct: 0 },
  { question: "Rosh Hashanah (Jewish New Year) is?", choices: ["September/October (Hebrew calendar)", "January 1", "December 31", "Spring"], correct: 0 },
  { question: "Diwali sometimes marks new year for?", choices: ["Hindus (Vikram Samvat in some regions)", "All Hindus", "Buddhists only", "Sikhs only"], correct: 0 },
  { question: "New Year's Eve in pop culture: 'When Harry Met Sally' ends?", choices: ["At a New Year's Eve party", "Christmas", "Wedding", "Easter"], correct: 0 },
  { question: "Most-watched New Year's Eve TV in US?", choices: ["Dick Clark's New Year's Rockin' Eve", "Saturday Night Live", "Tonight Show", "Late Show"], correct: 0 },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: NewYearQuizSettings): NewYearQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: NewYearQuizState, action: NewYearQuizAction): NewYearQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: NewYearQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
