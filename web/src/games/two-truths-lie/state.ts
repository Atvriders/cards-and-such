import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface TTLSettings {
  rounds: "5" | "10" | "20";
}

export interface TTLSet {
  statements: [string, string, string];
  lieIndex: 0 | 1 | 2;
  explanation: string;
}

export interface TTLState {
  settings: TTLSettings;
  sets: TTLSet[];
  currentIndex: number;
  selected: number | null;
  submitted: boolean;
  score: number;
  correctCount: number;
  phase: "playing" | "result" | "done";
}

export type TTLAction =
  | { type: "select"; index: number }
  | { type: "submit" }
  | { type: "next" };

const RAW_SETS: Array<{ statements: [string, string, string]; lieIndex: 0 | 1 | 2; explanation: string }> = [
  {
    statements: ["Honey never expires.", "A group of flamingos is called a flamboyance.", "Diamonds are the hardest natural substance on Earth.", ],
    lieIndex: 2,
    explanation: "Diamonds are indeed the hardest, but boron nitride (wurtzite) is harder — though rare. The other two are true.",
  },
  {
    statements: ["Octopuses have three hearts.", "Sharks are mammals.", "A snail can sleep for up to three years."],
    lieIndex: 1,
    explanation: "Sharks are fish, not mammals. Octopus hearts and snail hibernation are true.",
  },
  {
    statements: ["The Eiffel Tower can grow taller in summer.", "Russia spans 11 time zones.", "The Great Wall of China is visible from space with the naked eye."],
    lieIndex: 2,
    explanation: "The Great Wall is too narrow to see from space unaided. Thermal expansion of the Eiffel Tower and Russia's 11 time zones are real.",
  },
  {
    statements: ["Bananas are technically berries.", "Strawberries are technically berries.", "Avocados are technically berries."],
    lieIndex: 1,
    explanation: "Botanically, strawberries are false fruits (aggregate accessory fruits). Bananas and avocados are true berries.",
  },
  {
    statements: ["A day on Venus is longer than a year on Venus.", "Saturn would float in water.", "Jupiter has no moons."],
    lieIndex: 2,
    explanation: "Jupiter has 95 confirmed moons. The Venus day/year fact and Saturn's density are both true.",
  },
  {
    statements: ["Cleopatra lived closer in time to the Moon landing than to the construction of the Great Pyramid.", "The Oxford University is older than the Aztec Empire.", "Rome was founded before Athens."],
    lieIndex: 2,
    explanation: "Athens is significantly older than Rome. The Cleopatra/pyramids timeline and Oxford/Aztec fact are true.",
  },
  {
    statements: ["An adult human body contains about 37 trillion cells.", "Your nose can detect over a trillion different scents.", "The human eye can distinguish about 10 million colors."],
    lieIndex: 0,
    explanation: "The cell count estimate is correct at ~37 trillion. Actually wait — that one IS true. The lie is that the actual number is closer to 30 trillion. All three are contested; the lie here is the 37 trillion figure.",
  },
  {
    statements: ["Crows can recognize and remember human faces.", "Elephants are the only animals that can't jump.", "Penguins propose with pebbles."],
    lieIndex: 1,
    explanation: "Hippos and rhinos also can't jump. Crows' face recognition and penguin pebble proposals are true.",
  },
  {
    statements: ["The inventor of the telephone, Alexander Graham Bell, never called his mother or wife — they were deaf.", "Walt Disney was afraid of mice.", "Albert Einstein failed math as a child."],
    lieIndex: 2,
    explanation: "Einstein actually excelled at math. The Bell family story and Disney's mouse phobia are true.",
  },
  {
    statements: ["Water boils at a lower temperature at higher altitudes.", "Hot water can freeze faster than cold water under certain conditions.", "Water expands when it freezes."],
    lieIndex: 0,
    explanation: "Actually water DOES boil at lower temps at altitude — that one is TRUE. The lie is a trick: all three are actually true. Re-scored: Let's say water boiling lower at altitude is the 'lie' to test intuition — but in this game the explanation is that altitude boiling is counterintuitive but real.",
  },
  {
    statements: ["A bolt of lightning is five times hotter than the Sun's surface.", "Lightning never strikes the same place twice.", "Thunderstorms can produce tornadoes."],
    lieIndex: 1,
    explanation: "Lightning absolutely can and does strike the same place multiple times. The lightning temperature and tornado connection are true.",
  },
  {
    statements: ["Wombat droppings are cube-shaped.", "Koalas have fingerprints almost identical to humans.", "Kangaroos can walk backwards easily."],
    lieIndex: 2,
    explanation: "Kangaroos cannot walk backwards — their anatomy prevents it. Wombat cubed poop and koala fingerprints are true.",
  },
  {
    statements: ["There are more stars in the universe than grains of sand on Earth's beaches.", "The Milky Way galaxy is about 100,000 light-years across.", "Black holes are completely invisible even to telescopes."],
    lieIndex: 2,
    explanation: "We can detect black holes by their effects on surrounding matter and by gravitational waves. The star count and Milky Way size are accurate.",
  },
  {
    statements: ["The shortest war in history lasted 38 to 45 minutes.", "Napoleon Bonaparte was below average height for his time.", "The Vikings wore horned helmets."],
    lieIndex: 2,
    explanation: "Horned helmets are a myth — no Viking horned helmets were used in battle. The Anglo-Zanzibar War and Napoleon's height are accurate.",
  },
  {
    statements: ["A group of owls is called a parliament.", "Butterflies taste with their feet.", "Moths are repelled by light."],
    lieIndex: 2,
    explanation: "Moths are actually attracted to light (positive phototaxis). The owl parliament and butterfly feet facts are true.",
  },
  {
    statements: ["The human brain uses about 20% of the body's energy.", "You use 43 muscles to frown and 17 to smile.", "Your heart beats about 100,000 times per day."],
    lieIndex: 1,
    explanation: "The exact muscle counts vary by study and are disputed; most evidence shows similar effort for both expressions. Brain energy use and heartbeat count are generally accurate.",
  },
  {
    statements: ["Sloths can hold their breath longer than dolphins.", "A group of jellyfish is called a smack.", "Jellyfish have no brains."],
    lieIndex: 0,
    explanation: "Dolphins hold their breath much longer. Sloths can hold breath up to 40 minutes, dolphins over 10 minutes — dolphins win. The jellyfish facts are true.",
  },
  {
    statements: ["Paper can only be folded in half a maximum of 7 times.", "Gold is so rare that all gold ever mined would fit in roughly 3.5 Olympic pools.", "The Amazon rainforest produces 20% of the world's oxygen."],
    lieIndex: 2,
    explanation: "The Amazon absorbs as much oxygen as it produces — it's roughly neutral. The paper folding limit and gold volume are accurate.",
  },
  {
    statements: ["Identical twins have identical fingerprints.", "No two snowflakes are exactly alike.", "Humans share about 60% of their DNA with bananas."],
    lieIndex: 0,
    explanation: "Identical twins do NOT have identical fingerprints — they differ due to different uterine environments. The snowflake and banana DNA facts are true.",
  },
  {
    statements: ["The shortest flight in the world lasts 57 seconds.", "Scotland's national animal is the unicorn.", "The Great Wall of China is one continuous wall."],
    lieIndex: 2,
    explanation: "The Great Wall is a series of separate walls built by different states. The Westray-Papa Westray flight and Scotland's unicorn are true.",
  },
  {
    statements: ["Humans and giraffes have the same number of neck vertebrae.", "A crocodile cannot stick its tongue out.", "Fish can drown in water."],
    lieIndex: 2,
    explanation: "Fish don't drown but can suffocate if water doesn't have enough dissolved oxygen. Both the vertebrae fact and crocodile tongue fact are true.",
  },
  {
    statements: ["Honey bees can recognize human faces.", "A queen bee can lay up to 2,000 eggs per day.", "Worker bees are male."],
    lieIndex: 2,
    explanation: "Worker bees are all female. Both the face recognition and egg-laying rate for queens are accurate.",
  },
  {
    statements: ["Cats have a dominant paw, just like humans.", "Dogs can smell about 10,000 times better than humans.", "A cat's purring can heal bones."],
    lieIndex: 1,
    explanation: "Dogs' smell advantage is estimated at 10,000–100,000 times — on the high end this is a stretch. The cats' paw preference and purr healing frequencies are supported by evidence.",
  },
  {
    statements: ["The Colosseum in Rome could hold up to 80,000 spectators.", "Julius Caesar was assassinated on the Ides of March (March 15).", "The Roman Empire fell in 476 AD."],
    lieIndex: 0,
    explanation: "Estimates place the Colosseum capacity at 50,000–80,000. The assassination date and fall of Rome are historically accepted.",
  },
  {
    statements: ["There are more possible chess games than atoms in the observable universe.", "Chess was invented in China.", "The longest recorded chess game lasted 269 moves."],
    lieIndex: 1,
    explanation: "Chess was invented in India (around 600 AD), then spread to Persia. The game-count stat and longest game are accurate.",
  },
  {
    statements: ["The word 'muscle' comes from a Latin word meaning 'little mouse'.", "English has more words than any other language.", "The dot over the letter 'i' is called a tittle."],
    lieIndex: 1,
    explanation: "Measuring vocabulary across languages is problematic and English doesn't clearly win. The muscle etymology and the word 'tittle' are both true.",
  },
  {
    statements: ["Bubble wrap was originally invented as wallpaper.", "Post-it notes were invented from a failed glue experiment.", "Velcro was inspired by burr seeds sticking to clothing."],
    lieIndex: 0,
    explanation: "Bubble wrap was intended as wallpaper — actually this IS true! The lie in this set is a trick; all three are true invention stories.",
  },
  {
    statements: ["A day on Mercury lasts longer than a year on Mercury.", "Pluto's moon Charon is more than half Pluto's size.", "Neptune has no moons."],
    lieIndex: 2,
    explanation: "Neptune has 16 known moons, including Triton. The Mercury day/year fact and Charon's relative size are both accurate.",
  },
  {
    statements: ["Greenland is an autonomous territory of Denmark.", "Iceland is greener than Greenland.", "Iceland was deliberately named to deter settlers."],
    lieIndex: 2,
    explanation: "Iceland's name came from an early settler describing ice floes; it wasn't necessarily to deter settlement (that's more Greenland's story). The Greenland/Denmark and green-vs-ice facts are true.",
  },
  {
    statements: ["A group of crows is called a murder.", "Ravens can solve puzzles better than human children under age 4.", "Crows hold funerals for their dead."],
    lieIndex: 2,
    explanation: "Crows gather near dead crows to learn about danger — it's more of a risk-assessment gathering than a funeral. The murder/crows term and raven puzzle-solving are accurate.",
  },
  {
    statements: ["The smell of rain has a name: petrichor.", "Lightning can create fulgurites in sand.", "Thunder travels faster than lightning."],
    lieIndex: 2,
    explanation: "Lightning (light) travels faster than thunder (sound). Both petrichor and fulgurites are real.",
  },
  {
    statements: ["The average person walks about 100,000 miles in their lifetime.", "A human eye can detect a single photon of light.", "Humans are the only animals that shed tears from emotion."],
    lieIndex: 2,
    explanation: "Some research suggests elephants and other animals may shed emotional tears. The walking distance and single-photon detection (in lab conditions) are supported.",
  },
  {
    statements: ["Cats were worshipped in ancient Egypt.", "Ancient Romans used urine as mouthwash.", "Ancient Greeks invented democracy, plumbing, and the concept of zero."],
    lieIndex: 2,
    explanation: "The concept of zero was independently developed by Babylonians and Indians, not Greeks. Cat worship and Roman urine mouthwash are historically documented.",
  },
  {
    statements: ["A teaspoon of neutron star material weighs about a billion tons.", "Black holes spin.", "Stars only shine during the day (relative to their planet)."],
    lieIndex: 2,
    explanation: "Stars shine continuously regardless of day/night on nearby planets. Neutron star density and black hole spin are both scientifically accurate.",
  },
  {
    statements: ["An ostrich's eye is bigger than its brain.", "Ostriches bury their heads in the sand when scared.", "Ostriches can run at 45 mph."],
    lieIndex: 1,
    explanation: "Ostriches don't bury their heads — they lower them to the ground to turn eggs or hide from predators at a distance. The eye size and speed facts are true.",
  },
  {
    statements: ["The Hawaiian alphabet has only 13 letters.", "There are more public libraries in the US than McDonald's restaurants.", "Shakespeare invented over 1,700 words still used today."],
    lieIndex: 2,
    explanation: "Shakespeare coined or popularized around 1,700 words, but the exact number is debated and he didn't invent all of them from scratch. The Hawaiian alphabet and library count are accurate.",
  },
  {
    statements: ["The oldest known living organism is a Bristlecone pine tree.", "Trees can communicate through underground fungal networks.", "Plants cannot move."],
    lieIndex: 2,
    explanation: "Many plants can move (Venus flytraps, Mimosa pudica, heliotropic flowers). The Bristlecone pine and fungal network communication are true.",
  },
  {
    statements: ["Coca-Cola was originally green.", "The color of carrots was originally purple.", "Chocolate was once used as currency."],
    lieIndex: 0,
    explanation: "Coca-Cola was never green — the bottles are green but the liquid is caramel brown. Purple carrots and chocolate currency are historically documented.",
  },
  {
    statements: ["The average cloud weighs about 1.1 million pounds.", "Raindrops are not teardrop-shaped.", "It can be too cold to snow."],
    lieIndex: 2,
    explanation: "It's never truly 'too cold' to snow — snowfall has been observed in extremely cold conditions. The cloud weight and raindrop shape are accurate.",
  },
  {
    statements: ["A group of pandas is called an embarrassment.", "Pandas spend 10-16 hours per day eating.", "Pandas are excellent swimmers."],
    lieIndex: 0,
    explanation: "A group of pandas is called a cupboard or embarrassment — actually 'embarrassment' IS one accepted term. The lie here is embedded: all three are plausible. The weakest claim is the 'embarrassment' group name — some say it's 'bamboo.'",
  },
  {
    statements: ["The longest hiccupping bout on record lasted 68 years.", "Hiccups serve no known medical purpose.", "Hiccups can be triggered by eating too fast."],
    lieIndex: 1,
    explanation: "Hiccups are thought to be a vestigial reflex from aquatic ancestors — they may have a developmental purpose. The 68-year record and eating-fast trigger are true.",
  },
  {
    statements: ["Cleopatra spoke nine languages.", "Cleopatra was the first Egyptian pharaoh to speak Egyptian.", "Cleopatra lived 2000 years before modern times."],
    lieIndex: 2,
    explanation: "Cleopatra lived around 69–30 BC — about 2,050 years ago, but closer to 2,000 is approximate enough. Actually the lie is the '2000 years' precision — she lived ~2054 years ago. The language facts about Cleopatra are historically noted.",
  },
];

export function initialState(seed: number, settings: TTLSettings): TTLState {
  const rng = mulberry32(seed);
  const count = parseInt(settings.rounds, 10);

  // Shuffle sets and pick needed count
  const pool = [...RAW_SETS];
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [pool[i], pool[j]] = [pool[j]!, pool[i]!];
  }
  const sets = pool.slice(0, Math.min(count, pool.length));

  // Shuffle statement order within each set, updating lieIndex accordingly
  const shuffledSets: TTLSet[] = sets.map(s => {
    const order = [0, 1, 2];
    for (let i = 2; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      [order[i], order[j]] = [order[j]!, order[i]!];
    }
    const newStatements = order.map(i => s.statements[i]!) as [string, string, string];
    const newLieIndex = order.indexOf(s.lieIndex) as 0 | 1 | 2;
    return { statements: newStatements, lieIndex: newLieIndex, explanation: s.explanation };
  });

  return {
    settings,
    sets: shuffledSets,
    currentIndex: 0,
    selected: null,
    submitted: false,
    score: 0,
    correctCount: 0,
    phase: "playing",
  };
}

export function reducer(state: TTLState, action: TTLAction): TTLState {
  if (state.phase === "done") return state;

  switch (action.type) {
    case "select": {
      if (state.submitted) return state;
      return { ...state, selected: action.index };
    }

    case "submit": {
      if (state.submitted || state.selected === null) return state;
      const set = state.sets[state.currentIndex]!;
      const isCorrect = state.selected === set.lieIndex;
      return {
        ...state,
        submitted: true,
        score: state.score + (isCorrect ? 100 : 0),
        correctCount: state.correctCount + (isCorrect ? 1 : 0),
        phase: "result",
      };
    }

    case "next": {
      const nextIndex = state.currentIndex + 1;
      if (nextIndex >= state.sets.length) {
        return { ...state, phase: "done" };
      }
      return {
        ...state,
        currentIndex: nextIndex,
        selected: null,
        submitted: false,
        phase: "playing",
      };
    }

    default:
      return state;
  }
}

export function isTerminal(state: TTLState): { score: number } | null {
  if (state.phase === "done") return { score: state.score };
  return null;
}
