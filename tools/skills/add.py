"""Gộp kết quả đọc trang Học viện · Tướng của Garena vào garena.json.
Đầu vào (stdin): mỗi dòng "<slug>\t<json {skills:[{name,icon,tom_tat,...}]}>".
Tóm tắt là lời diễn đạt lại ngắn gọn, không chép nguyên văn mô tả của Garena."""
import json,sys,os
P=os.path.join(os.path.dirname(os.path.abspath(__file__)),'garena.json')
D=json.load(open(P)) if os.path.exists(P) else {}
n=0
for line in sys.stdin:
    line=line.strip()
    if not line: continue
    slug,js=line.split('\t',1);o=json.loads(js)
    D[slug]=[[s['name'].strip(),s['icon'].strip(),s['tom_tat'].strip()] for s in o['skills']];n+=1
json.dump(dict(sorted(D.items())),open(P,'w'),ensure_ascii=False,indent=1)
print(n,'added,',len(D),'total')
