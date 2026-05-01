import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface ReggaeQuizSettings { questions: "10" | "20" | "30"; }
export interface ReggaeQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type ReggaeQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "Where did reggae music originate?", choices: ["Jamaica","Cuba","Trinidad","Bahamas"], correct: 0 },
  { question: "In what decade did reggae develop?", choices: ["1960s","1950s","1970s","1980s"], correct: 0 },
  { question: "Who is the King of Reggae?", choices: ["Bob Marley","Peter Tosh","Bunny Wailer","Jimmy Cliff"], correct: 0 },
  { question: "What was Bob Marley's band?", choices: ["The Wailers","The Tigers","The Skatalites","The Heptones"], correct: 0 },
  { question: "What 1973 album launched the Wailers?", choices: ["Catch a Fire","Burnin","Natty Dread","Exodus"], correct: 0 },
  { question: "What 1977 Bob Marley album includes Jamming?", choices: ["Exodus","Kaya","Survival","Uprising"], correct: 0 },
  { question: "What religion is closely associated with reggae?", choices: ["Rastafarianism","Christianity","Hinduism","Islam"], correct: 0 },
  { question: "Who do Rastafarians revere as a divine figure?", choices: ["Haile Selassie I","Marcus Garvey (prophet)","Jah generally","All revered"], correct: 0 },
  { question: "What sacred herb is associated with Rasta culture?", choices: ["Cannabis (ganja)","Coffee","Tobacco","All"], correct: 0 },
  { question: "What nation is the spiritual homeland of Rastas?", choices: ["Ethiopia","Israel","Egypt","Kenya"], correct: 0 },
  { question: "What 1972 film featured reggae and Jimmy Cliff?", choices: ["The Harder They Come","Rockers","Marley","Reggae"], correct: 0 },
  { question: "What is dub music?", choices: ["Reggae remix subgenre","Hip-hop","Funk","Soul"], correct: 0 },
  { question: "Who's a famous dub producer?", choices: ["King Tubby","Lee Scratch Perry","Both","Mad Professor too"], correct: 2 },
  { question: "What's ska?", choices: ["Predecessor to reggae","Dance music","Both","Caribbean genre"], correct: 2 },
  { question: "What's rocksteady?", choices: ["Slowed-down ska, predecessor of reggae","Reggae fusion","Type of dub","Calypso"], correct: 0 },
  { question: "What instrument provides the off-beat 'skank' in reggae?", choices: ["Guitar (rhythm)","Drums","Bass","Keyboard"], correct: 0 },
  { question: "What 1977 song does Bob Marley sing about peace?", choices: ["One Love","Three Little Birds","Redemption Song","No Woman No Cry"], correct: 0 },
  { question: "What 1980 Marley song is acoustic and reflective?", choices: ["Redemption Song","One Love","No Woman No Cry","Buffalo Soldier"], correct: 0 },
  { question: "Who is Peter Tosh?", choices: ["Wailer co-founder, solo artist","Producer","Drummer","Bassist"], correct: 0 },
  { question: "What disease did Bob Marley die from?", choices: ["Cancer (acral lentiginous melanoma)","Heart attack","Pneumonia","Stroke"], correct: 0 },
  { question: "In what year did Bob Marley die?", choices: ["1981","1979","1983","1985"], correct: 0 },
  { question: "What style is Shaggy known for?", choices: ["Reggae fusion / dancehall","Pure roots reggae","Dub","Ska"], correct: 0 },
  { question: "What's dancehall?", choices: ["Subgenre of reggae from late 70s","Dance style","Both","Different genre entirely"], correct: 2 },
  { question: "What 90s reggae fusion artist was UB40?", choices: ["British reggae band","Jamaican","American","Australian"], correct: 0 },
  { question: "What's a riddim?", choices: ["Instrumental beat in reggae/dancehall","Type of song","Both","Drum solo"], correct: 2 },
  { question: "What's Trenchtown?", choices: ["Kingston neighborhood, Marley's home","Capital","Beach","Studio"], correct: 0 },
  { question: "What 70s Marley song talks about the slum?", choices: ["Trenchtown Rock","No Woman No Cry","Rebel Music","All have themes"], correct: 0 },
  { question: "What instrument is the bass in reggae?", choices: ["Electric bass with deep tone","Acoustic upright","Both","Synth bass"], correct: 0 },
  { question: "What's a sound system in Jamaican music?", choices: ["Mobile DJ rig","Speaker system","Both","Studio gear"], correct: 2 },
  { question: "What 1962 Jamaican event sparked music nationalism?", choices: ["Independence","Hurricane","Trade pact","Olympics"], correct: 0 },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: ReggaeQuizSettings): ReggaeQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: ReggaeQuizState, action: ReggaeQuizAction): ReggaeQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: ReggaeQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
