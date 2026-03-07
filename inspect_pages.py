from pathlib import Path
import re
files = {
'vol3': Path(r'D:\openclaw\workspace\liuyao-source\vol3-59b7a4ac-a2cc-4d93-a49a-22a3f1f9271a.txt'),
'vol4': Path(r'D:\openclaw\workspace\liuyao-source\vol4-d147e154-0f62-40e4-a07f-81739564b430.txt'),
'vol2': Path(r'D:\openclaw\workspace\liuyao-source\vol2-95fa6e34-2669-443f-abb2-45ea6a44933d.txt'),
}
for key, path in files.items():
    text = path.read_text(encoding='utf-8')
    pages = re.split(r'\n===== PAGE (\d+) =====\n', text)
    # pages: ['', num, content, num, content...]
    d = {int(pages[i]): pages[i+1] for i in range(1, len(pages), 2)}
    wanted = {
        'vol3':[17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,35,38,39],
        'vol4':[7,8,9,10,11,12,13,14,15,16,24,25,26],
        'vol2':[8,9,10,11,12,13,14,15,16,17,18,91,92]
    }[key]
    print('\n###', key)
    for n in wanted:
        c = d.get(n)
        if c:
            print(f'\n--- PAGE {n} ---\n{c[:2200]}\n')
