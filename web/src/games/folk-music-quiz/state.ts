import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface FolkMusicQuizSettings { questions: "10" | "20" | "30"; }
export interface FolkMusicQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type FolkMusicQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "Who is often called the king of American folk?", choices: ["Woody Guthrie","Pete Seeger","Bob Dylan","Joan Baez"], correct: 0 },
  { question: "What song did Woody Guthrie famously write?", choices: ["This Land Is Your Land","Blowin in the Wind","If I Had a Hammer","Where Have All the Flowers Gone"], correct: 0 },
  { question: "What folk singer is associated with the civil rights movement?", choices: ["Joan Baez","Pete Seeger","Both","Phil Ochs"], correct: 2 },
  { question: "What 1960s Greenwich Village folk scene gave rise to whom?", choices: ["Bob Dylan","Pete Seeger","Joan Baez","All performed there"], correct: 3 },
  { question: "What's Bob Dylan's birth name?", choices: ["Robert Zimmerman","Bob Dylan","Robert Allen","Allen Ginsberg"], correct: 0 },
  { question: "What 1963 Dylan song became civil rights anthem?", choices: ["Blowin in the Wind","The Times They Are a-Changin","A Hard Rain","All became anthems"], correct: 0 },
  { question: "Who sang If I Had a Hammer?", choices: ["Pete Seeger and Lee Hays wrote it; Peter Paul Mary covered","Just PPM","Just Seeger","Joan Baez"], correct: 0 },
  { question: "What instrument is most iconic in American folk?", choices: ["Acoustic guitar","Banjo","Mandolin","All used"], correct: 3 },
  { question: "What folk trio recorded Blowin in the Wind?", choices: ["Peter, Paul and Mary","Trio Lopez","Kingston Trio","Limeliters"], correct: 0 },
  { question: "Who's known as Lady Folk Singer of the 60s?", choices: ["Joan Baez","Judy Collins","Mary Travers","All female folk icons"], correct: 3 },
  { question: "What 1969 Joni Mitchell album included Big Yellow Taxi?", choices: ["Ladies of the Canyon","Blue","Clouds","Court and Spark"], correct: 0 },
  { question: "What's a folk ballad?", choices: ["Narrative folk song","Slow love song","Both","Lullaby"], correct: 2 },
  { question: "What's Celtic folk music?", choices: ["Music of Ireland, Scotland, Wales, Brittany","Spanish music","Greek music","English only"], correct: 0 },
  { question: "Who's the Chieftains?", choices: ["Irish folk band","Scottish folk","English","Welsh"], correct: 0 },
  { question: "Who was Elizabeth Cotten?", choices: ["Folk singer/guitarist (Freight Train)","Civil rights leader","Banjo player only","Country singer"], correct: 0 },
  { question: "What's bluegrass's relation to folk?", choices: ["Bluegrass developed from folk traditions","Unrelated","Same thing","Bluegrass is older"], correct: 0 },
  { question: "Who's Simon and Garfunkel?", choices: ["Paul Simon and Art Garfunkel","Folk-rock duo","Both","Famous for Sound of Silence"], correct: 1 },
  { question: "What S&G album included Bridge Over Troubled Water?", choices: ["Bridge Over Troubled Water (1970)","Sounds of Silence","Bookends","Parsley Sage"], correct: 0 },
  { question: "Who's Phil Ochs?", choices: ["Protest folk singer (60s)","Politician","Producer","Country singer"], correct: 0 },
  { question: "What 70s folk-influenced singer-songwriter sang Both Sides Now?", choices: ["Joni Mitchell","Carole King","Carly Simon","Linda Ronstadt"], correct: 0 },
  { question: "What's Mumford and Sons style?", choices: ["Folk rock revival","Bluegrass","Indie folk","Both folk rock and indie folk"], correct: 3 },
  { question: "What instrument does a hammered dulcimer have?", choices: ["Strings struck with hammers","Pluck strings","Wind","Percussion only"], correct: 0 },
  { question: "What's Gregorian chant's relation to folk?", choices: ["Liturgical, not folk","Folk","Both","Folk-influenced chant"], correct: 0 },
  { question: "What Texan singer-songwriter wrote Pancho and Lefty?", choices: ["Townes Van Zandt","Willie Nelson","Lyle Lovett","Robert Earl Keen"], correct: 0 },
  { question: "What's a coffeehouse circuit in folk?", choices: ["Venues like Greenwich Village clubs","Cafe music","Both","Bar circuit"], correct: 2 },
  { question: "What 50s revival kicked off?", choices: ["Folk Revival","Country Revival","Blues Revival","All happened"], correct: 0 },
  { question: "Who's Leonard Cohen?", choices: ["Canadian folk poet/singer","American","British","Australian"], correct: 0 },
  { question: "What 1984 Cohen song became standard?", choices: ["Hallelujah","Suzanne","Bird on a Wire","All classics"], correct: 0 },
  { question: "What's filk music?", choices: ["Sci-fi/fantasy folk subculture","Misspelling of folk","Same as folk","Filipino folk"], correct: 0 },
  { question: "What's the Newport Folk Festival famous for?", choices: ["Dylan going electric in 1965","Founding 1959","Both","Annual since 60s"], correct: 2 },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: FolkMusicQuizSettings): FolkMusicQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: FolkMusicQuizState, action: FolkMusicQuizAction): FolkMusicQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: FolkMusicQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
