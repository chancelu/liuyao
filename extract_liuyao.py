from pathlib import Path
import pdfplumber
base = Path(r'C:\Users\llc\.openclaw\media\inbound')
out = Path(r'D:\openclaw\workspace\liuyao-source')
out.mkdir(exist_ok=True)
for pdf in sorted(base.glob('*.pdf')):
    if '六爻卷' not in pdf.name and '����' not in pdf.name:
        continue
    try:
        text_parts=[]
        with pdfplumber.open(str(pdf)) as doc:
            for i,page in enumerate(doc.pages,1):
                text = page.extract_text(x_tolerance=1.5, y_tolerance=3) or ''
                text_parts.append(f'\n\n===== PAGE {i} =====\n{text}')
        out_file = out / (pdf.stem + '.txt')
        out_file.write_text(''.join(text_parts), encoding='utf-8')
        print(pdf.name, '->', out_file.name, 'pages', len(text_parts))
    except Exception as e:
        print('ERR', pdf.name, e)
