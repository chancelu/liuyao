export const zhCN = {
  brand: {
    name: '爻镜',
    tagline: '把六爻变成现代、可感知的在线占卦体验。',
  },
  home: {
    heroTitle: '问一件事，起一卦，见一条脉络。',
    heroDescription:
      '在线提问、摇卦、排盘、解读。用现代网页体验，把传统六爻做得更顺滑、更高级、也更容易看懂。',
    primaryCta: '开始起卦',
    secondaryCta: '看看它怎么运作',
    stepsTitle: '三步完成一次完整占卦体验',
    steps: [
      { title: '写下问题', description: '先把你真正想问的事情说清楚，结果会更聚焦。' },
      { title: '完成摇卦', description: '在网页里连续摇六次，系统会自动记录每一爻。' },
      { title: '看排盘与解读', description: '先看排盘，再看结论，白话与专业分析都会给到。' },
    ],
    examplesTitle: '你也可以这样问',
    examples: [
      '这段关系接下来还有机会吗？',
      '最近这次工作机会适不适合继续争取？',
      '这件事短期内会不会有结果？',
      '丢失的东西还有机会找回吗？',
    ],
  },
  ask: {
    title: '你想问什么？',
    description: '问题越具体，结果通常越清楚。',
    questionLabel: '问题',
    questionPlaceholder: '比如：这段关系接下来还有机会吗？',
    categoryLabel: '分类',
    timeScopeLabel: '时间范围',
    backgroundLabel: '背景补充（可选）',
    backgroundPlaceholder: '比如最近发生了什么、当前处在什么阶段。',
    submit: '开始摇卦',
  },
  cast: {
    title: '请专注这件事，然后开始摇卦。',
    subtitle: '连续完成六次，系统会自动生成卦象与排盘。',
    cta: '摇这一爻',
    reset: '重新开始',
    progress: '第 {current} / 6 次',
    completed: '六次已完成，准备生成排盘。',
  },
  processing: {
    title: '正在推演这次卦象',
    steps: ['正在装盘', '正在推演世应与六亲', '正在分析用神与旺衰', '正在生成结果'],
  },
  result: {
    title: '本次结果',
    chartTitle: '排盘总览',
    summaryTitle: '初步结论',
    plainTitle: '白话分析',
    professionalTitle: '专业分析',
    save: '保存这次结果',
    share: '分享结果',
    restart: '重新起卦',
  },
  history: {
    title: '我的卦例',
    empty: '你还没有保存过卦例。',
    cta: '开始第一次起卦',
  },
} as const;

export type Messages = typeof zhCN;
