# Liu Yao Glossary / 六爻术语翻译规范

This document is the single source of truth for translating Chinese divination terminology into English.
It is used by both the UI i18n system and the LLM analysis prompt.

## Translation Principles

1. **Pinyin + English**: Core terms use pinyin romanization alongside an English meaning. Example: "世 (Shì) Subject"
2. **Preserve cultural identity**: Do not over-translate. Terms like "Liu Yao", "Na-Jia", "Yin/Yang" stay in pinyin.
3. **Consistency**: Always use the same English term for the same Chinese concept across UI and LLM output.
4. **Parenthetical Chinese**: In English UI, show Chinese in parentheses for key terms to help bilingual users. Example: "Subject (世)"

---

## Core Concepts / 核心概念

| 中文 | English | Notes |
|------|---------|-------|
| 六爻 | Liu Yao | Subtitle: "Six Lines Divination" |
| 易经 / 周易 | I Ching / Book of Changes | |
| 卦 / 卦象 | Hexagram | |
| 爻 | Line (Yáo) | |
| 本卦 | Primary Hexagram | |
| 变卦 | Transformed Hexagram | |
| 动爻 | Moving Line(s) | |
| 静卦 | Static Hexagram | No moving lines |
| 世爻 | Subject (世) | The Self / Host line |
| 应爻 | Object (应) | The Other / Guest line |
| 用神 | Significator | The key line for the question |
| 上卦 | Upper Trigram | |
| 下卦 | Lower Trigram | |
| 排盘 | Chart | |
| 摇卦 | Cast | The act of tossing coins |
| 起卦 | Divination | The full process |
| 纳甲 | Na-Jia | Branch assignment method |

## Yin-Yang & Lines / 阴阳与爻

| 中文 | English |
|------|---------|
| 阳 | Yang (—) |
| 阴 | Yin (- -) |
| 老阳 | Old Yang (changing) |
| 少阳 | Young Yang (stable) |
| 老阴 | Old Yin (changing) |
| 少阴 | Young Yin (stable) |

## Five Elements / 五行

| 中文 | English |
|------|---------|
| 金 | Metal |
| 木 | Wood |
| 水 | Water |
| 火 | Fire |
| 土 | Earth |
| 相生 | Production cycle |
| 相克 | Destruction cycle |

## Six Relatives / 六亲

| 中文 | English | Meaning |
|------|---------|---------|
| 父母 | Parents | Resources, documents, shelter |
| 兄弟 | Siblings | Peers, competitors, friends |
| 子孙 | Offspring | Ideas, joy, healing, restraint of authority |
| 妻财 | Wealth | Money, spouse (for male querent), possessions |
| 官鬼 | Officer | Authority, career, pressure, husband (for female querent) |

## Six Spirits / 六神

| 中文 | English | Abbreviation | Symbolism |
|------|---------|-------------|-----------|
| 青龙 | Azure Dragon | Dragon | Auspicious, joy, celebration |
| 朱雀 | Vermilion Bird | Bird | Speech, documents, disputes |
| 勾陈 | Hook Snake | Hook | Delay, land, stagnation |
| 螣蛇 | Soaring Snake | Serpent | Surprise, dreams, anxiety |
| 白虎 | White Tiger | Tiger | Danger, illness, authority |
| 玄武 | Black Tortoise | Tortoise | Secrets, theft, deception |

## Calendar & Timing / 历法与时间

| 中文 | English |
|------|---------|
| 天干 | Heavenly Stems |
| 地支 | Earthly Branches |
| 月建 | Month Branch |
| 日辰 | Day Stem-Branch |
| 旬空 | Void (Xún Kōng) |
| 月破 | Month Clash |
| 日破 | Day Clash |
| 进神 | Advancing Spirit |
| 退神 | Retreating Spirit |

## Strength & State / 旺衰

| 中文 | English |
|------|---------|
| 旺 | Prosperous |
| 相 | Strong |
| 休 | Resting |
| 囚 | Imprisoned |
| 死 | Dead |
| 旺衰 | Strength assessment |
| 偏旺 | Slightly prosperous |
| 偏弱 | Slightly weak |
| 平 | Balanced |

## Eight Trigrams / 八卦

| 中文 | Pinyin | English | Element | Direction |
|------|--------|---------|---------|-----------|
| 乾 | Qián | Heaven | Metal | Northwest |
| 坤 | Kūn | Earth | Earth | Southwest |
| 震 | Zhèn | Thunder | Wood | East |
| 巽 | Xùn | Wind | Wood | Southeast |
| 坎 | Kǎn | Water | Water | North |
| 离 | Lí | Fire | Fire | South |
| 艮 | Gèn | Mountain | Earth | Northeast |
| 兑 | Duì | Lake | Metal | West |

## Eight Palaces / 八宫

| 中文 | English |
|------|---------|
| 八纯卦 | Pure Hexagram (of the palace) |
| 一世卦 | First Transformation |
| 二世卦 | Second Transformation |
| 三世卦 | Third Transformation |
| 四世卦 | Fourth Transformation |
| 五世卦 | Fifth Transformation |
| 游魂卦 | Wandering Soul |
| 归魂卦 | Returning Soul |

## 64 Hexagrams / 六十四卦

Based on Richard Wilhelm's translation (the most widely recognized in English).

| # | 中文 | Pinyin | English |
|---|------|--------|---------|
| 1 | 乾为天 | Qián | The Creative, Heaven |
| 2 | 坤为地 | Kūn | The Receptive, Earth |
| 3 | 水雷屯 | Zhūn | Difficulty at the Beginning |
| 4 | 山水蒙 | Méng | Youthful Folly |
| 5 | 水天需 | Xū | Waiting |
| 6 | 天水讼 | Sòng | Conflict |
| 7 | 地水师 | Shī | The Army |
| 8 | 水地比 | Bǐ | Holding Together |
| 9 | 风天小畜 | Xiǎo Chù | Taming Power of the Small |
| 10 | 天泽履 | Lǚ | Treading |
| 11 | 地天泰 | Tài | Peace |
| 12 | 天地否 | Pǐ | Standstill |
| 13 | 天火同人 | Tóng Rén | Fellowship |
| 14 | 火天大有 | Dà Yǒu | Great Possession |
| 15 | 地山谦 | Qiān | Modesty |
| 16 | 雷地豫 | Yù | Enthusiasm |
| 17 | 泽雷随 | Suí | Following |
| 18 | 山风蛊 | Gǔ | Decay |
| 19 | 地泽临 | Lín | Approach |
| 20 | 风地观 | Guān | Contemplation |
| 21 | 火雷噬嗑 | Shì Hé | Biting Through |
| 22 | 山火贲 | Bì | Grace |
| 23 | 山地剥 | Bō | Splitting Apart |
| 24 | 地雷复 | Fù | Return |
| 25 | 天雷无妄 | Wú Wàng | Innocence |
| 26 | 山天大畜 | Dà Chù | Taming Power of the Great |
| 27 | 山雷颐 | Yí | Nourishment |
| 28 | 泽风大过 | Dà Guò | Great Exceeding |
| 29 | 坎为水 | Kǎn | The Abysmal, Water |
| 30 | 离为火 | Lí | The Clinging, Fire |
| 31 | 泽山咸 | Xián | Influence |
| 32 | 雷风恒 | Héng | Duration |
| 33 | 天山遁 | Dùn | Retreat |
| 34 | 雷天大壮 | Dà Zhuàng | Great Power |
| 35 | 火地晋 | Jìn | Progress |
| 36 | 地火明夷 | Míng Yí | Darkening of the Light |
| 37 | 风火家人 | Jiā Rén | The Family |
| 38 | 火泽睽 | Kuí | Opposition |
| 39 | 水山蹇 | Jiǎn | Obstruction |
| 40 | 雷水解 | Xiè | Deliverance |
| 41 | 山泽损 | Sǔn | Decrease |
| 42 | 风雷益 | Yì | Increase |
| 43 | 泽天夬 | Guài | Breakthrough |
| 44 | 天风姤 | Gòu | Coming to Meet |
| 45 | 泽地萃 | Cuì | Gathering Together |
| 46 | 地风升 | Shēng | Pushing Upward |
| 47 | 泽水困 | Kùn | Oppression |
| 48 | 水风井 | Jǐng | The Well |
| 49 | 泽火革 | Gé | Revolution |
| 50 | 火风鼎 | Dǐng | The Cauldron |
| 51 | 震为雷 | Zhèn | The Arousing, Thunder |
| 52 | 艮为山 | Gèn | Keeping Still, Mountain |
| 53 | 风山渐 | Jiàn | Gradual Progress |
| 54 | 雷泽归妹 | Guī Mèi | The Marrying Maiden |
| 55 | 雷火丰 | Fēng | Abundance |
| 56 | 火山旅 | Lǚ | The Wanderer |
| 57 | 巽为风 | Xùn | The Gentle, Wind |
| 58 | 兑为泽 | Duì | The Joyous, Lake |
| 59 | 风水涣 | Huàn | Dispersion |
| 60 | 水泽节 | Jié | Limitation |
| 61 | 风泽中孚 | Zhōng Fú | Inner Truth |
| 62 | 雷山小过 | Xiǎo Guò | Small Exceeding |
| 63 | 水火既济 | Jì Jì | After Completion |
| 64 | 火水未济 | Wèi Jì | Before Completion |

## Earthly Branches / 十二地支

| 中文 | Pinyin | English | Element |
|------|--------|---------|---------|
| 子 | Zǐ | Rat | Water |
| 丑 | Chǒu | Ox | Earth |
| 寅 | Yín | Tiger | Wood |
| 卯 | Mǎo | Rabbit | Wood |
| 辰 | Chén | Dragon | Earth |
| 巳 | Sì | Snake | Fire |
| 午 | Wǔ | Horse | Fire |
| 未 | Wèi | Goat | Earth |
| 申 | Shēn | Monkey | Metal |
| 酉 | Yǒu | Rooster | Metal |
| 戌 | Xū | Dog | Earth |
| 亥 | Hài | Pig | Water |

## Heavenly Stems / 十天干

| 中文 | Pinyin | Element |
|------|--------|---------|
| 甲 | Jiǎ | Wood (+) |
| 乙 | Yǐ | Wood (-) |
| 丙 | Bǐng | Fire (+) |
| 丁 | Dīng | Fire (-) |
| 戊 | Wù | Earth (+) |
| 己 | Jǐ | Earth (-) |
| 庚 | Gēng | Metal (+) |
| 辛 | Xīn | Metal (-) |
| 壬 | Rén | Water (+) |
| 癸 | Guǐ | Water (-) |

## Question Categories / 问题分类

| 中文 | English |
|------|---------|
| 感情 | Relationships |
| 事业 | Career |
| 财运 | Finance |
| 健康 | Health |
| 学业 | Education |
| 失物 | Lost Items |
| 其他 | Other |

## Time Scopes / 时间范围

| 中文 | English |
|------|---------|
| 近期 | Near term |
| 本月 | This month |
| 今年 | This year |
| 不限 | No limit |

---

## LLM Prompt Usage

When generating English analysis, the LLM should:

1. Reference this glossary for all technical terms
2. Use the format "English (中文)" on first mention, then English only. Example: "The Subject (世) line is in the 4th position..."
3. For hexagram names, use: "English Name (中文名)" — e.g. "Inner Truth (风泽中孚)"
4. For Earthly Branches, use pinyin: "Sì (巳) Fire"
5. Keep Six Spirits and Six Relatives in English with Chinese in parentheses on first mention
6. Never invent new translations — if a term is not in this glossary, keep the Chinese with pinyin
