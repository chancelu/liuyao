from pathlib import Path
src = Path(r'D:\openclaw\workspace\liuyao-source')
for p in list(src.glob('*.txt')):
    name = p.name
    if '9441b1b2' in name or '93026716' in name:
        target = src / ('vol1-' + name.split('---')[-1])
    elif '95fa6e34' in name or '9586ebd4' in name:
        target = src / ('vol2-' + name.split('---')[-1])
    elif '59b7a4ac' in name or 'b24714d1' in name:
        target = src / ('vol3-' + name.split('---')[-1])
    elif 'd147e154' in name:
        target = src / ('vol4-' + name.split('---')[-1])
    else:
        continue
    if not target.exists():
        p.rename(target)
        print('renamed', p.name, '->', target.name)
