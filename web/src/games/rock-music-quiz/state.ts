import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface RockMusicQuizSettings { questions: "10" | "20" | "30"; }
export interface RockMusicQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type RockMusicQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "Who is known as the King of Rock and Roll?", choices: ["Elvis Presley","Chuck Berry","Little Richard","Buddy Holly"], correct: 0 },
  { question: "What rock band released Sgt. Pepper's Lonely Hearts Club Band?", choices: ["The Beatles","Rolling Stones","The Who","Led Zeppelin"], correct: 0 },
  { question: "Who was the lead singer of Queen?", choices: ["Freddie Mercury","Brian May","Roger Taylor","John Deacon"], correct: 0 },
  { question: "What guitarist played in Cream and Derek and the Dominos?", choices: ["Eric Clapton","Jimi Hendrix","Jeff Beck","Jimmy Page"], correct: 0 },
  { question: "Who was Led Zeppelin's lead vocalist?", choices: ["Robert Plant","Roger Daltrey","Ian Gillan","Steven Tyler"], correct: 0 },
  { question: "What was Pink Floyd's 1973 landmark album?", choices: ["Dark Side of the Moon","The Wall","Wish You Were Here","Animals"], correct: 0 },
  { question: "Who founded Nirvana?", choices: ["Kurt Cobain","Dave Grohl","Krist Novoselic","Eddie Vedder"], correct: 0 },
  { question: "What's Nirvana's breakthrough album?", choices: ["Nevermind","In Utero","Bleach","MTV Unplugged"], correct: 0 },
  { question: "Who is the Boss?", choices: ["Bruce Springsteen","Bob Seger","Tom Petty","John Mellencamp"], correct: 0 },
  { question: "Whose Purple Rain album launched in 1984?", choices: ["Prince","Michael Jackson","David Bowie","Stevie Wonder"], correct: 0 },
  { question: "Who recorded Bohemian Rhapsody?", choices: ["Queen","Beatles","Rolling Stones","Led Zeppelin"], correct: 0 },
  { question: "What 1969 festival was a peak of counterculture?", choices: ["Woodstock","Glastonbury","Monterey","Altamont"], correct: 0 },
  { question: "Who was the lead singer of Rolling Stones?", choices: ["Mick Jagger","Keith Richards","Brian Jones","Charlie Watts"], correct: 0 },
  { question: "What guitarist died age 27 in 1970?", choices: ["Jimi Hendrix","Janis Joplin","Jim Morrison","All in the 27 Club"], correct: 0 },
  { question: "Who founded The Who?", choices: ["Roger Daltrey, Pete Townshend, John Entwistle, Keith Moon","Roger Daltrey alone","Pete Townshend alone","Keith Moon alone"], correct: 0 },
  { question: "Who recorded Hotel California?", choices: ["Eagles","Fleetwood Mac","Bob Dylan","Steely Dan"], correct: 0 },
  { question: "Whose Stairway to Heaven became a rock classic?", choices: ["Led Zeppelin","Black Sabbath","Deep Purple","Pink Floyd"], correct: 0 },
  { question: "Who was the singer of The Doors?", choices: ["Jim Morrison","Jim Croce","Jim Carroll","Jimmy Page"], correct: 0 },
  { question: "What band released Smells Like Teen Spirit?", choices: ["Nirvana","Pearl Jam","Soundgarden","Alice in Chains"], correct: 0 },
  { question: "Who founded Black Sabbath?", choices: ["Tony Iommi, Geezer Butler, Bill Ward, Ozzy Osbourne","Ozzy alone","Tony Iommi alone","Bill Ward alone"], correct: 0 },
  { question: "Whose 1967 album is Are You Experienced?", choices: ["Jimi Hendrix Experience","Jefferson Airplane","Cream","Doors"], correct: 0 },
  { question: "Who released Born to Run in 1975?", choices: ["Bruce Springsteen","Bob Seger","Tom Petty","Bob Dylan"], correct: 0 },
  { question: "Whose Thriller is the bestselling album?", choices: ["Michael Jackson","Stevie Wonder","Prince","Madonna"], correct: 0 },
  { question: "Who is U2's lead singer?", choices: ["Bono","The Edge","Adam Clayton","Larry Mullen"], correct: 0 },
  { question: "What rock band wrote Sweet Child o Mine?", choices: ["Guns N' Roses","Bon Jovi","Aerosmith","Def Leppard"], correct: 0 },
  { question: "Who founded AC/DC?", choices: ["Malcolm and Angus Young","Bon Scott alone","Brian Johnson","Phil Rudd"], correct: 0 },
  { question: "What's Metallica's bassist who died in 1986?", choices: ["Cliff Burton","Jason Newsted","Robert Trujillo","Lars Ulrich"], correct: 0 },
  { question: "Who's the Rocket Man?", choices: ["Elton John","David Bowie","Phil Collins","Billy Joel"], correct: 0 },
  { question: "Who released Like a Rolling Stone in 1965?", choices: ["Bob Dylan","Joan Baez","Pete Seeger","Donovan"], correct: 0 },
  { question: "What's the most famous Pink Floyd guitarist?", choices: ["David Gilmour","Roger Waters (bass)","Syd Barrett (early)","Both Gilmour and Barrett"], correct: 0 },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: RockMusicQuizSettings): RockMusicQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: RockMusicQuizState, action: RockMusicQuizAction): RockMusicQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: RockMusicQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
