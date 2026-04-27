import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface GospelMusicQuizSettings { questions: "10" | "20" | "30"; }
export interface GospelMusicQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type GospelMusicQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "Mahalia Jackson is known as?", choices: ["The Queen of Soul", "The Queen of Gospel", "The Mother of the Church", "The First Lady of Song"], correct: 1 },
  { question: "Thomas A. Dorsey is called?", choices: ["The Father of Black Gospel", "The Father of Soul", "The Father of Spirituals", "The Father of Hymnody"], correct: 0 },
  { question: "Sister Rosetta Tharpe is best known for which trait?", choices: ["Operatic vocals", "Rock-and-roll guitar", "Country fiddle", "Banjo picking"], correct: 1 },
  { question: "James Cleveland was associated with?", choices: ["GMWA", "Stax", "Motown", "Atlantic"], correct: 0 },
  { question: "Aretha Franklin's father, C.L. Franklin, was a famous?", choices: ["Pianist", "Preacher", "Songwriter", "Choir director"], correct: 1 },
  { question: "Andraé Crouch wrote which crossover hit?", choices: ["Soon and Very Soon", "We Fall Down", "Total Praise", "Goin' Up Yonder"], correct: 0 },
  { question: "The Clark Sisters' signature is?", choices: ["A close-harmony R&B-influenced sound", "Bluegrass arrangements", "A cappella spirituals", "Heavy metal worship"], correct: 0 },
  { question: "Kirk Franklin's first major group was?", choices: ["Family", "The Nu Nation Project", "God's Property", "One Nation Crew"], correct: 0 },
  { question: "Yolanda Adams's signature album is?", choices: ["Mountain High... Valley Low", "Day by Day", "The Battle Is the Lord's", "What a Wonderful Time"], correct: 0 },
  { question: "Tasha Cobbs Leonard is best known for?", choices: ["Break Every Chain", "Total Praise", "Way Maker", "How Great Is Our God"], correct: 0 },
  { question: "CeCe Winans is part of which famous family?", choices: ["The Hawkins family", "The Winans family", "The Crouch family", "The Caesar family"], correct: 1 },
  { question: "Edwin Hawkins's biggest crossover hit was?", choices: ["Oh Happy Day", "Total Praise", "I Sing Praises", "Power"], correct: 0 },
  { question: "Shirley Caesar is known as?", choices: ["The First Lady of Gospel", "The Mother of Praise", "The Pastor", "The Queen Bee"], correct: 0 },
  { question: "'Total Praise' was composed by?", choices: ["Richard Smallwood", "Andraé Crouch", "Edwin Hawkins", "James Cleveland"], correct: 0 },
  { question: "Marvin Sapp is a former member of?", choices: ["Commissioned", "Take 6", "The Winans", "GMWA"], correct: 0 },
  { question: "Lecrae is most associated with?", choices: ["Christian hip hop", "Country gospel", "Black gospel choirs", "Southern gospel"], correct: 0 },
  { question: "Brooklyn Tabernacle Choir is led by?", choices: ["Carol Cymbala", "Patti LaBelle", "Yolanda Adams", "Tasha Cobbs"], correct: 0 },
  { question: "Donnie McClurkin's biggest album was?", choices: ["Live in London and More", "Donnie McClurkin", "Psalms, Hymns and Spiritual Songs", "We All Are One"], correct: 0 },
  { question: "Tramaine Hawkins won a Grammy for?", choices: ["Live", "All My Best", "The Joy That Floods My Soul", "Determined"], correct: 0 },
  { question: "GMWA stands for?", choices: ["Gospel Music Workshop of America", "Global Music Worship Alliance", "Gospel Mass Worship Association", "Gospel Ministers Worldwide Assembly"], correct: 0 },
  { question: "Bishop Paul S. Morton founded?", choices: ["Full Gospel Baptist Church Fellowship", "GMWA", "Stellar Awards", "Christian Music Council"], correct: 0 },
  { question: "Hezekiah Walker is known for which choir?", choices: ["Love Fellowship Crusade Choir", "Brooklyn Tabernacle", "Mississippi Mass", "Edwin Hawkins Singers"], correct: 0 },
  { question: "Mary Mary is a duo of?", choices: ["Atkins-Campbell sisters", "the Winans sisters", "Caesar siblings", "Hawkins cousins"], correct: 0 },
  { question: "Lauryn Hill's gospel-rooted MTV Unplugged album came out in?", choices: ["2000", "2002", "2004", "2006"], correct: 1 },
  { question: "Smokie Norful's debut album was?", choices: ["I Need You Now", "Nothing Without You", "Live", "Forever"], correct: 0 },
  { question: "Israel Houghton's band is called?", choices: ["New Breed", "Free Indeed", "House of Praise", "Royal Priesthood"], correct: 0 },
  { question: "Maverick City Music is a collective from?", choices: ["Memphis", "Atlanta", "Chicago", "Nashville (multi-state collective)"], correct: 3 },
  { question: "Stellar Awards honor?", choices: ["Gospel music", "R&B", "Christian rock", "K-Love stations"], correct: 0 },
  { question: "BeBe Winans's brother and frequent duet partner is?", choices: ["Marvin", "CeCe", "Carvin", "Daniel"], correct: 1 },
  { question: "Take 6 is famous for what style?", choices: ["A cappella six-part harmony", "Rock band gospel", "Solo piano", "Reggae gospel"], correct: 0 },
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
