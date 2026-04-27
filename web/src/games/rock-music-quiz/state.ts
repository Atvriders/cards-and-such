import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface RockMusicQuizSettings { questions: "10" | "20" | "30"; }
export interface RockMusicQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type RockMusicQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "The Beatles formed in which English city?", choices: ["London", "Manchester", "Liverpool", "Birmingham"], correct: 2 },
  { question: "Who was the lead guitarist of Led Zeppelin?", choices: ["Eric Clapton", "Jimmy Page", "Jeff Beck", "Pete Townshend"], correct: 1 },
  { question: "Pink Floyd's 'The Dark Side of the Moon' was released in?", choices: ["1971", "1973", "1975", "1977"], correct: 1 },
  { question: "Mick Jagger fronts which band?", choices: ["The Who", "The Kinks", "The Rolling Stones", "The Beatles"], correct: 2 },
  { question: "Nirvana's lead singer was?", choices: ["Eddie Vedder", "Kurt Cobain", "Chris Cornell", "Layne Staley"], correct: 1 },
  { question: "'Stairway to Heaven' is by?", choices: ["Deep Purple", "Black Sabbath", "Led Zeppelin", "Queen"], correct: 2 },
  { question: "'Bohemian Rhapsody' was released by Queen in?", choices: ["1973", "1975", "1977", "1980"], correct: 1 },
  { question: "U2's lead singer is?", choices: ["The Edge", "Adam Clayton", "Bono", "Larry Mullen Jr."], correct: 2 },
  { question: "Which band released 'Hotel California'?", choices: ["Eagles", "Fleetwood Mac", "Steely Dan", "Doobie Brothers"], correct: 0 },
  { question: "Jimi Hendrix played what instrument?", choices: ["Bass", "Drums", "Guitar", "Keyboards"], correct: 2 },
  { question: "Black Sabbath's original singer was?", choices: ["Ronnie James Dio", "Ozzy Osbourne", "Ian Gillan", "Tony Martin"], correct: 1 },
  { question: "Who wrote 'Like a Rolling Stone'?", choices: ["Neil Young", "Bob Dylan", "Bruce Springsteen", "Joni Mitchell"], correct: 1 },
  { question: "AC/DC formed in which country?", choices: ["UK", "USA", "Australia", "Canada"], correct: 2 },
  { question: "Led Zeppelin's drummer was?", choices: ["Keith Moon", "John Bonham", "Ginger Baker", "Charlie Watts"], correct: 1 },
  { question: "Roger Daltrey is the singer of?", choices: ["The Who", "The Kinks", "Yes", "Genesis"], correct: 0 },
  { question: "'Smells Like Teen Spirit' came out in?", choices: ["1989", "1991", "1993", "1995"], correct: 1 },
  { question: "Pearl Jam is from which city?", choices: ["Los Angeles", "Seattle", "Detroit", "Boston"], correct: 1 },
  { question: "Foo Fighters were founded by?", choices: ["Krist Novoselic", "Dave Grohl", "Pat Smear", "Taylor Hawkins"], correct: 1 },
  { question: "Which band recorded 'Comfortably Numb'?", choices: ["Pink Floyd", "Yes", "Genesis", "Rush"], correct: 0 },
  { question: "'Born to Run' is a 1975 album by?", choices: ["Bob Seger", "Bruce Springsteen", "Tom Petty", "John Mellencamp"], correct: 1 },
  { question: "Guns N' Roses lead singer is?", choices: ["Slash", "Duff McKagan", "Axl Rose", "Izzy Stradlin"], correct: 2 },
  { question: "Which Beatle wrote 'Imagine'?", choices: ["Paul McCartney", "John Lennon", "George Harrison", "Ringo Starr"], correct: 1 },
  { question: "The Doors' singer was?", choices: ["Jim Morrison", "Ray Manzarek", "Robby Krieger", "John Densmore"], correct: 0 },
  { question: "'Sweet Child O' Mine' is by?", choices: ["Mötley Crüe", "Bon Jovi", "Guns N' Roses", "Aerosmith"], correct: 2 },
  { question: "Radiohead's debut album was?", choices: ["Pablo Honey", "The Bends", "OK Computer", "Kid A"], correct: 0 },
  { question: "The Rolling Stones' lead guitarist is?", choices: ["Brian Jones", "Mick Taylor", "Keith Richards", "Ronnie Wood"], correct: 2 },
  { question: "Metallica formed in which year?", choices: ["1979", "1981", "1983", "1985"], correct: 1 },
  { question: "Which Fleetwood Mac album includes 'Go Your Own Way'?", choices: ["Mirage", "Tusk", "Rumours", "Tango in the Night"], correct: 2 },
  { question: "'Welcome to the Jungle' opens which Guns N' Roses album?", choices: ["Use Your Illusion I", "Appetite for Destruction", "Lies", "Chinese Democracy"], correct: 1 },
  { question: "Who is known as 'The King of Rock and Roll'?", choices: ["Chuck Berry", "Little Richard", "Elvis Presley", "Bill Haley"], correct: 2 },
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
