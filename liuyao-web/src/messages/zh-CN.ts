const _zhCN = {
  brand: {
    name: '雅若',
    tagline: 'Ancient Chinese divination, reimagined.',
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
    categorizedExamples: [
      { category: '感情', items: ['这段关系接下来还有机会吗？', '和TA复合的可能性大不大？', '最近有没有新的感情缘分？'] },
      { category: '事业', items: ['最近这次工作机会适不适合继续争取？', '今年适合跳槽吗？', '创业这件事能不能做起来？'] },
      { category: '财运', items: ['这笔投资能不能获利？', '近期的财运走势如何？'] },
      { category: '健康', items: ['身体上的这个问题严不严重？', '这个治疗方案效果会好吗？'] },
      { category: '学业', items: ['这次考试能考好吗？', '考研上岸的几率大吗？'] },
      { category: '失物', items: ['丢失的东西还有机会找回吗？', '东西大概在什么方位？'] },
    ],
    faq: [
      { q: '六爻是什么？', a: '六爻是中国传统的占卦方法之一，通过摇铜钱六次来得到一组卦象，再结合五行生克、六亲关系等来分析问题。' },
      { q: '需要懂专业术语才能用吗？', a: '不需要。系统会生成白话解读，用通俗的语言解释卦象含义。专业分析区域的术语也有悬浮提示。' },
      { q: '问题有什么要求吗？', a: '尽量问具体的事情，比如"这次面试能通过吗"比"我的未来怎样"更容易得到清晰的结果。' },
      { q: '一次只能问一件事吗？', a: '是的，每次起卦最好只问一件事。问题越聚焦，卦象反映的信息就越清晰。' },
      { q: '结果准不准？', a: '六爻是一种传统的分析框架，结果仅供参考。重要决策请结合实际情况综合判断。' },
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
    summaryTitle: '基础结论',
    plainTitle: '卦象解读',
    professionalTitle: '断卦释义',
    save: '保存这次结果',
    share: '分享结果',
    restart: '重新起卦',
  },
  history: {
    title: '我的卦例',
    empty: '你还没有保存过卦例。',
    cta: '开始第一次起卦',
  },
};

export type Messages = typeof _zhCN;
export const zhCN: Messages = _zhCN;
