import type { Messages } from './zh-CN';

export const en: Messages = {
  brand: {
    name: 'Yarrow',
    tagline: 'Ancient Chinese divination, reimagined.',
  },
  home: {
    heroTitle: 'Ask one question. Cast one hexagram. See one thread of fate.',
    heroDescription:
      'Ask, cast, chart, interpret. A modern web experience that makes traditional Liu Yao divination smoother, more refined, and easier to understand.',
    primaryCta: 'Start Divination',
    secondaryCta: 'How it works',
    stepsTitle: 'Three steps to a complete divination',
    steps: [
      { title: 'Write your question', description: 'Be specific about what you truly want to ask — the clearer the question, the sharper the reading.' },
      { title: 'Cast the coins', description: 'Toss three coins six times on screen. The system records each line automatically.' },
      { title: 'Read the chart & analysis', description: 'See the hexagram chart first, then the plain-language and professional interpretations.' },
    ],
    examplesTitle: 'You could ask something like',
    examples: [
      'Is there still a chance for this relationship?',
      'Should I keep pursuing this job opportunity?',
      'Will this matter resolve in the near term?',
      'Is there a chance of finding what I lost?',
    ],
    categorizedExamples: [
      { category: 'Relationships', items: ['Is there still a chance for this relationship?', 'How likely is a reconciliation?', 'Will a new romantic connection appear soon?'] },
      { category: 'Career', items: ['Should I keep pursuing this job opportunity?', 'Is this a good year to change jobs?', 'Can this business venture take off?'] },
      { category: 'Finance', items: ['Will this investment be profitable?', 'What does my financial outlook look like?'] },
      { category: 'Health', items: ['Is this health issue serious?', 'Will this treatment plan work well?'] },
      { category: 'Education', items: ['Will I do well on this exam?', 'What are my chances of getting into grad school?'] },
      { category: 'Lost Items', items: ['Is there a chance of finding what I lost?', 'In which direction might it be?'] },
    ],
    faq: [
      { q: 'What is Liu Yao?', a: 'Liu Yao is a traditional Chinese divination method. You toss three coins six times to generate a hexagram, then analyze it using the Five Elements, Six Relatives, and other classical frameworks.' },
      { q: 'Do I need to know the jargon?', a: 'Not at all. The system generates a plain-language reading. Technical terms in the professional section come with tooltips.' },
      { q: 'Any rules for the question?', a: 'Be specific. "Will I pass this interview?" yields a much clearer reading than "What does my future look like?"' },
      { q: 'One question at a time?', a: 'Yes. Each divination should focus on a single matter. The more focused the question, the clearer the hexagram reflects.' },
      { q: 'How accurate is it?', a: 'Liu Yao is a traditional analytical framework — results are for reference only. For important decisions, always combine with real-world judgment.' },
    ],
  },
  ask: {
    title: 'What would you like to ask?',
    description: 'The more specific your question, the clearer the result.',
    questionLabel: 'Question',
    questionPlaceholder: 'e.g. Is there still a chance for this relationship?',
    categoryLabel: 'Category',
    timeScopeLabel: 'Time scope',
    backgroundLabel: 'Background (optional)',
    backgroundPlaceholder: 'e.g. What happened recently, or what stage you are at.',
    submit: 'Start casting',
  },
  cast: {
    title: 'Focus on your question, then begin casting.',
    subtitle: 'Complete six tosses. The system will generate the hexagram and chart automatically.',
    cta: 'Cast this line',
    reset: 'Start over',
    progress: 'Toss {current} / 6',
    completed: 'All six lines cast. Preparing the chart.',
  },
  processing: {
    title: 'Interpreting your hexagram',
    steps: ['Building the chart…', 'Analyzing structure…', 'Reading moving lines…', 'Generating report…'],
  },
  result: {
    title: 'Your Reading',
    chartTitle: 'Hexagram Chart',
    summaryTitle: 'Summary',
    plainTitle: 'Plain Reading',
    professionalTitle: 'Professional Analysis',
    save: 'Save this reading',
    share: 'Share',
    restart: 'Cast again',
  },
  history: {
    title: 'My Readings',
    empty: 'You haven\'t saved any readings yet.',
    cta: 'Start your first divination',
  },
} as const;
