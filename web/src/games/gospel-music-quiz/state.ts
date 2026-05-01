import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface GospelMusicQuizSettings { questions: "10" | "20" | "30"; }
export interface GospelMusicQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type GospelMusicQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "What religion is gospel music traditionally associated with?", choices: ["Christianity","Judaism","Islam","Buddhism"], correct: 0 },
  { question: "Where did African American gospel originate?", choices: ["African American churches","Catholic churches","Synagogues","Quaker meetings"], correct: 0 },
  { question: "Who is called the Father of Gospel Music?", choices: ["Thomas A. Dorsey","Mahalia Jackson","James Cleveland","Sam Cooke"], correct: 0 },
  { question: "Who's the Queen of Gospel?", choices: ["Mahalia Jackson","Aretha Franklin (early)","Both","Shirley Caesar"], correct: 2 },
  { question: "What 1932 hymn did Thomas A. Dorsey write?", choices: ["Take My Hand Precious Lord","Amazing Grace","I'll Fly Away","How Great Thou Art"], correct: 0 },
  { question: "What is a Negro spiritual?", choices: ["African American religious folk songs","Gospel choruses","Hymns","Both spirituals and hymns"], correct: 0 },
  { question: "What's call and response in gospel?", choices: ["Vocal pattern between leader and choir","Solo only","Choir only","Instrumental"], correct: 0 },
  { question: "What 1969 album was Aretha Franklin's gospel return?", choices: ["Amazing Grace","Spirit in the Dark","Young Gifted and Black","Hey Now Hey"], correct: 0 },
  { question: "Where was Aretha's Amazing Grace recorded?", choices: ["New Temple Missionary Baptist","Apollo","Carnegie Hall","Madison Square"], correct: 0 },
  { question: "What style is Kirk Franklin associated with?", choices: ["Contemporary gospel","Traditional gospel","Both","Praise & worship"], correct: 2 },
  { question: "What 1995 Kirk Franklin hit?", choices: ["Stomp (1997)","Lean on Me","Why We Sing","Whatcha Lookin 4"], correct: 2 },
  { question: "What instrument is essential in many Black gospel choirs?", choices: ["Hammond B3 organ","Piano","Both","Drums also"], correct: 2 },
  { question: "What is shape note singing?", choices: ["Sacred Harp/Southern hymn tradition","Notation style","Both","Liturgical chant"], correct: 2 },
  { question: "What 1735 hymn was written by John Newton?", choices: ["Amazing Grace (lyrics 1772)","How Great Thou Art","Holy Holy Holy","Just as I Am"], correct: 0 },
  { question: "Who wrote the Amazing Grace lyrics?", choices: ["John Newton","Charles Wesley","Isaac Watts","Fanny Crosby"], correct: 0 },
  { question: "What's a hymnal?", choices: ["Book of hymns","Singer","Composer","Pedal organ"], correct: 0 },
  { question: "What gospel singer transitioned to soul as Sam Cooke?", choices: ["Sam Cooke","Otis Redding","Marvin Gaye","Wilson Pickett"], correct: 0 },
  { question: "What gospel group did Cooke leave for solo career?", choices: ["Soul Stirrers","Mighty Clouds","Dixie Hummingbirds","Pilgrim Travelers"], correct: 0 },
  { question: "Who is CeCe Winans?", choices: ["Contemporary gospel singer","Country","Pop","R&B only"], correct: 0 },
  { question: "Who is BeBe Winans?", choices: ["CeCe's brother, gospel singer","Solo R&B","Producer","Pastor only"], correct: 0 },
  { question: "What 1990s gospel artist was Yolanda Adams?", choices: ["Yes","No","Sometimes","Folk artist"], correct: 0 },
  { question: "What hymn says 'I once was lost but now am found'?", choices: ["Amazing Grace","Just as I Am","How Great Thou Art","I'll Fly Away"], correct: 0 },
  { question: "What's a praise team or worship band?", choices: ["Contemporary church singers/musicians","Just choir","Solo singers","Conductors"], correct: 0 },
  { question: "What 1873 song did Horatio Spafford write after tragedy?", choices: ["It Is Well with My Soul","Be Thou My Vision","Holy Holy Holy","Be Still"], correct: 0 },
  { question: "What gospel choir is at Brooklyn Tabernacle?", choices: ["Brooklyn Tabernacle Choir","Soul Children","Mass Choir","Sounds of Blackness"], correct: 0 },
  { question: "What is a black gospel mass choir?", choices: ["Large gospel choir from a region","Small group","Quartet","Soloists"], correct: 0 },
  { question: "Who's Andrae Crouch?", choices: ["Gospel composer/singer","Pastor only","Producer only","All - he was multi-talented"], correct: 3 },
  { question: "What 1990s film featured uplifting gospel?", choices: ["Sister Act 2","The Color Purple","Both","Joyful Noise"], correct: 2 },
  { question: "What's quartet gospel?", choices: ["Four-part harmony gospel singing","Choir","Solo","Trio"], correct: 0 },
  { question: "What's a gospel ad-lib?", choices: ["Improvised vocal embellishment","Spoken word","Solo break","All of these"], correct: 0 },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: GospelMusicQuizSettings): GospelMusicQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: GospelMusicQuizState, action: GospelMusicQuizAction): GospelMusicQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: GospelMusicQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
