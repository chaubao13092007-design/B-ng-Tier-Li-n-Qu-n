"""Tạo assets/skills.js (Bộ chiêu thức trong bảng chi tiết tướng) từ tools/skills/garena.json.

garena.json: { "<slug trang Garena>": [[tên chiêu, link ảnh, tóm tắt], ...] } theo thứ tự trên trang
https://lienquan.garena.vn/hoc-vien/tuong-skin/d/<slug>/ (nội tại trước, chiêu cuối sau cùng).
Tóm tắt là lời diễn đạt lại ngắn gọn, không chép nguyên văn mô tả của Garena; web có link tới trang gốc.
Ảnh chiêu lấy thẳng từ máy chủ Garena (lienquan.garena.vn đã có trong CSP img-src).
Chạy: python3 tools/skills/emit.py"""
import json, os, re, sys
HERE = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.abspath(os.path.join(HERE, '..', '..'))
D = json.load(open(os.path.join(HERE, 'garena.json'), encoding='utf-8'))
UP = 'https://lienquan.garena.vn/wp-content/uploads/'
# slug Garena khác key của web
SPECIAL = {'11596': 'edras', 'flowborn': 'flowborn-ad', 'flowborn-2': 'flowborn-mid'}
out, bad = {}, []
for slug, skills in sorted(D.items()):
    key = SPECIAL.get(slug, re.sub('[^a-z]', '', slug))
    rows = []
    for name, icon, summ in skills:
        if icon and not icon.startswith(UP): bad.append((slug, icon))
        summ = re.sub(r'^(Nội tại|Bị động)\s*[:.]\s*', '', summ.strip())
        if summ and summ[0].islower(): summ = summ[0].upper() + summ[1:]
        name = name.strip()
        if name.isupper(): name = name.title()
        rows.append([name, icon[len(UP):] if icon.startswith(UP) else '', summ])
    out[key] = [slug, rows]
if bad: sys.exit(f'Ảnh ngoài thư mục uploads của Garena: {bad}')
js = ('/* Bộ chiêu thức từng tướng — tạo tự động từ tools/skills/garena.json (python3 tools/skills/emit.py), đừng sửa tay.\n'
      '   SKILLS["<key>"] = [slug trang Học viện Garena, [[tên, ảnh (sau SKU), tóm tắt], …]]; nội tại trước, chiêu cuối sau cùng.\n'
      '   Flowborn có hai key: flowborn-mid, flowborn-ad. Tóm tắt viết lại ngắn gọn, mô tả đầy đủ ở trang Garena. */\n')
js += f'const SKU={json.dumps(UP)};\n'
js += 'const SKILLS={\n' + ',\n'.join(f'  {json.dumps(k)}:' + json.dumps(v, ensure_ascii=False, separators=(',', ':')) for k, v in sorted(out.items())) + '\n};\n'
open(os.path.join(REPO, 'assets', 'skills.js'), 'w', encoding='utf-8').write(js)
print(len(js.encode()), 'bytes', len(out), 'tướng')
