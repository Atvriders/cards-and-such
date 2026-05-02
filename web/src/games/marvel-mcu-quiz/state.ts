import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; explanation?: string; }
export interface MarvelMcuQuizSettings { questions: "10" | "20" | "30"; }
export interface MarvelMcuQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type MarvelMcuQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "What was the first MCU film?", choices: ["Iron Man","Incredible Hulk","Thor","Captain America"], correct: 0, explanation: "Iron Man (2008), directed by Jon Favreau, launched the Marvel Cinematic Universe." },
  { question: "In what year was Iron Man released?", choices: ["2008","2010","2007","2009"], correct: 0, explanation: "Iron Man hit theatres on May 2, 2008, kicking off the MCU and Phase One." },
  { question: "Who plays Tony Stark?", choices: ["Robert Downey Jr.","Chris Evans","Chris Hemsworth","Mark Ruffalo"], correct: 0, explanation: "Robert Downey Jr.'s career-resurrecting performance defined the MCU for over a decade." },
  { question: "Who plays Captain America?", choices: ["Chris Evans","Chris Hemsworth","Anthony Mackie","Sebastian Stan"], correct: 0, explanation: "Chris Evans, who'd previously played Human Torch, took up the shield from 2011-2019." },
  { question: "Who plays Thor?", choices: ["Chris Hemsworth","Tom Hiddleston","Chris Evans","Idris Elba"], correct: 0, explanation: "Australian Chris Hemsworth has played Thor since 2011's Thor (dir. Kenneth Branagh)." },
  { question: "Who plays the Hulk?", choices: ["Mark Ruffalo","Edward Norton (one film)","Both played him","Eric Bana"], correct: 2, explanation: "Edward Norton played Bruce Banner in The Incredible Hulk (2008); Mark Ruffalo took over from 2012." },
  { question: "Who plays Black Widow?", choices: ["Scarlett Johansson","Florence Pugh","Olga Kurylenko","Cobie Smulders"], correct: 0, explanation: "Scarlett Johansson played Natasha Romanoff from Iron Man 2 (2010) through Black Widow (2021)." },
  { question: "Who plays Spider-Man in MCU?", choices: ["Tom Holland","Tobey Maguire","Andrew Garfield","All in No Way Home"], correct: 0, explanation: "Tom Holland debuted as Peter Parker in Captain America: Civil War (2016)." },
  { question: "Who plays Doctor Strange?", choices: ["Benedict Cumberbatch","Mads Mikkelsen","Tilda Swinton","Chiwetel Ejiofor"], correct: 0, explanation: "Benedict Cumberbatch debuted as Stephen Strange in Doctor Strange (2016)." },
  { question: "What's Black Panther's home country?", choices: ["Wakanda","Latveria","Genosha","Sokovia"], correct: 0, explanation: "Wakanda is a fictional, technologically advanced African nation rich in vibranium." },
  { question: "Who plays Black Panther?", choices: ["Chadwick Boseman","Letitia Wright","Daniel Kaluuya","Michael B. Jordan"], correct: 0, explanation: "Chadwick Boseman played T'Challa from 2016 until his tragic death from cancer in 2020." },
  { question: "What stones does Thanos seek?", choices: ["Infinity Stones","Soul Stones","Power Stones","Reality Stones"], correct: 0, explanation: "The six Infinity Stones grant control over Space, Mind, Reality, Power, Time, and Soul." },
  { question: "How many Infinity Stones are there?", choices: ["6","5","7","8"], correct: 0, explanation: "There are six Infinity Stones, each tied to a fundamental aspect of existence." },
  { question: "What 2018 film features Thanos's snap?", choices: ["Avengers: Infinity War","Endgame","Civil War","Age of Ultron"], correct: 0, explanation: "Avengers: Infinity War ended with Thanos's snap erasing half of all life in the universe." },
  { question: "Who plays Thanos?", choices: ["Josh Brolin","Mark Ruffalo","Vin Diesel","Cary Elwes"], correct: 0, explanation: "Josh Brolin provided motion-capture and voice for Thanos starting with Guardians (2014) cameo." },
  { question: "What's Thor's hammer called?", choices: ["Mjolnir","Stormbreaker","Both wielded by Thor","Gungnir"], correct: 2, explanation: "Mjolnir is Thor's original hammer; Stormbreaker is the axe forged in Infinity War." },
  { question: "What's Steve Rogers' shield made of (mostly)?", choices: ["Vibranium","Adamantium","Steel","Titanium"], correct: 0, explanation: "Captain America's shield is made primarily of vibranium, the rare Wakandan metal." },
  { question: "What's the second Avengers film (2015)?", choices: ["Age of Ultron","Civil War","Infinity War","Avengers (1)"], correct: 0, explanation: "Avengers: Age of Ultron (2015) introduced Vision, Scarlet Witch, and Quicksilver." },
  { question: "Who plays Loki?", choices: ["Tom Hiddleston","Chris Hemsworth","Idris Elba","Anthony Hopkins"], correct: 0, explanation: "Tom Hiddleston has played Loki from Thor (2011) through his own Disney+ series." },
  { question: "Who plays Iron Man's friend Rhodey?", choices: ["Don Cheadle (and Terrence Howard)","Don Cheadle only","Terrence Howard only","Anthony Mackie"], correct: 0, explanation: "Terrence Howard played Rhodey in Iron Man (2008); Don Cheadle took over from Iron Man 2 onwards." },
  { question: "Who's Star-Lord?", choices: ["Peter Quill (Chris Pratt)","Drax","Rocket","Groot"], correct: 0, explanation: "Peter Quill, played by Chris Pratt, leads the Guardians of the Galaxy and was raised in space." },
  { question: "What film introduced the Guardians of the Galaxy?", choices: ["Guardians of the Galaxy (2014)","Avengers","Vol 2","Infinity War"], correct: 0, explanation: "James Gunn's Guardians of the Galaxy (2014) was a surprise hit that broadened the MCU's tone." },
  { question: "Who plays Gamora?", choices: ["Zoe Saldana","Karen Gillan","Pom Klementieff","Rooney Mara"], correct: 0, explanation: "Zoe Saldana plays the green-skinned assassin and adopted daughter of Thanos." },
  { question: "Who plays Nebula?", choices: ["Karen Gillan","Zoe Saldana","Pom Klementieff","Bryce Dallas Howard"], correct: 0, explanation: "Karen Gillan (Doctor Who's Amy Pond) plays Nebula, Gamora's cybernetic sister." },
  { question: "What's Bucky Barnes' alter ego?", choices: ["Winter Soldier","Falcon","White Wolf","All used"], correct: 3, explanation: "Bucky has been Winter Soldier, White Wolf (Wakanda), and effectively a new Falcon-era ally." },
  { question: "Who plays Bucky?", choices: ["Sebastian Stan","Anthony Mackie","Chris Evans","Daniel Bruhl"], correct: 0, explanation: "Sebastian Stan has played Bucky Barnes / Winter Soldier since The First Avenger (2011)." },
  { question: "What's Vision created from?", choices: ["JARVIS, Mind Stone, vibranium","Just Ultron","Ultron's body","Iron Man"], correct: 0, explanation: "Vision was created from JARVIS's code, vibranium, and the Mind Stone in Age of Ultron." },
  { question: "Who plays Vision?", choices: ["Paul Bettany","James Spader","Don Cheadle","Mark Ruffalo"], correct: 0, explanation: "Paul Bettany voiced JARVIS before becoming Vision in Age of Ultron (2015) and WandaVision." },
  { question: "Who plays Wanda Maximoff (Scarlet Witch)?", choices: ["Elizabeth Olsen","Aaron Taylor-Johnson","Both","Just Olsen plays Wanda"], correct: 0, explanation: "Elizabeth Olsen has played Wanda since Age of Ultron (2015), starring in WandaVision and Multiverse of Madness." },
  { question: "What's the magic word from Doctor Strange's incantations?", choices: ["Various Latin/Sanskrit phrases","Abracadabra","Open Sesame","Hocus Pocus"], correct: 0, explanation: "Strange uses various Latin and Sanskrit phrases drawn from real mystical traditions." },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: MarvelMcuQuizSettings): MarvelMcuQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: MarvelMcuQuizState, action: MarvelMcuQuizAction): MarvelMcuQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: MarvelMcuQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
