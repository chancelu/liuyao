from pathlib import Path
import re
src = Path(r'D:\openclaw\workspace\liuyao-source')
keywords = ['纳甲','世应','六神','六亲','旬空','月建','日辰','动爻','变爻','河图','洛书','八卦','六十四卦','用神','原神','忌神','仇神','伏神','飞神','进神','退神','主辅用神','用神双现']
for file in sorted(src.glob('vol*.txt')):
    print('\n###', file.name)
    text = file.read_text(encoding='utf-8', errors='ignore').splitlines()
    for kw in keywords:
        hits=[]
        for i,line in enumerate(text):
            if kw in line:
                hits.append((i+1,line.strip()))
            if len(hits)>=3:
                break
        if hits:
            print(f'[{kw}]')
            for ln,content in hits:
                print(f'{ln}: {content[:120]}')
