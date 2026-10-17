import json,re,os,sys
os.chdir(os.path.dirname(os.path.abspath(__file__)))
from PIL import Image
D=os.environ.get('AVIX_DATA','/tmp/ext/avix-data')+'/data';A=os.environ.get('AVIX_ASSETS','/tmp/ext/avix')
REPO=os.path.abspath(os.path.join(os.path.dirname(__file__),'..','..'))
en=json.load(open(f'{D}/en/equipments.json'));vi=json.load(open(f'{D}/vi/equipments.json'))
EQ={e['equipmentId']:dict(e,vi=v['name']) for e,v in zip(en,vi)}
byname={e['name'].lower():e['equipmentId'] for e in en}
ALIAS={'glided greaves':'gilded-greaves',"hermes' select":'hermes-select','hermes select':'hermes-select',
 "hercules's madness":'hecules-madness',"hercules' madness":'hecules-madness','spear of longinus':'longinus-spear',
 'blitz blades':'blitz-blade','mother earth cleansing':'mother-earth-cleansing',
 # tên bản Thái (RoV) → đồ tương ứng bản Việt, đối chiếu theo chỉ số/nội tại
 'broken spear':'rankbreaker','firestorm bow':'scorching-wind','soul scroll':'tome-of-the-reaper',
 "ifrit's claw":'devils-handshake',"sorcerer's shoes":'enchanted-kicks','curse of death':'death-curse',
 # đồ trợ thủ đời cũ → nhánh nâng cấp bảo thạch có cùng tác dụng
 'ring of terror':'sup-magic-eye','poseidon emblem':'sup-spout','soul strom badge':'sup-barrier','tidal force cleansing':'sup-cleansing',
 "hyoga's edge":None}
SUP={'sup-magic-eye':('Bảo thạch · Ma Nhãn','Đại Địa hoặc Liệt Hoả Ma Nhãn'),'sup-spout':('Bảo thạch · Hồi Huyết','Đại Địa hoặc Liệt Hoả Hồi Huyết'),
 'sup-barrier':('Bảo thạch · Thần Khiên','Đại Địa hoặc Liệt Hoả Thần Khiên'),'sup-cleansing':('Bảo thạch · Mở Trói','Đại Địa hoặc Liệt Hoả Mở Trói')}
ar_en=json.load(open(f'{D}/en/arcanas.json'));AR={a['arcanaId']:a for a in ar_en}
TH={'red':{'awake':'red_blitz','bloodlust':'red_bloodlust','desolate':'red_nomad','golden body':'red_guardian','onslaught':'red_berserker','rage':'red_savage','rampage':'red_rampage','sage':'red_wise','scepter':'red_sovereign','sword':'red_samurai'},
 'purple':{'assassinate':'purple_assassin','blood magic':'purple_vampire','colossus':'purple_colossus','essence reaver':'purple_reaper','essense reaver':'purple_reaper','feast':'purple_crusader','immortal':'purple_undying','pray':'purple_cleric','protect':'purple_reliever','spirit':'purple_fairy','throne':'purple_tyrant'},
 'green':{'authority':'teal_monarch',"dragon's claw":'teal_dragoon','great wall':'teal_bastion','herculean power':'teal_mythril','holy light':'teal_crusader','magic heart':'teal_darksider','prowess':'teal_paladin','purity':'teal_templar','secret':'teal_hexer','secret incantation':'teal_hexer','stain':'teal_degenerate'}}
ZT={'enlightened':'red_wise','obliterate':'red_samurai','onslaught':'red_berserker','bloodlust':'red_bloodlust','rampage':'red_rampage','indomitable':'red_guardian','violate':'red_nomad','conjure':'red_sovereign','atrocity':'red_savage','blitz':'red_blitz',
 'colossus':'purple_colossus','sap':'purple_cleric','reave':'purple_reaper','tyrant':'purple_tyrant','undying':'purple_undying','feast':'purple_crusader','devour':'purple_vampire','benevolence':'purple_reliever','assassinate':'purple_assassin','guerrilla':'purple_fairy',
 'bastion':'teal_bastion','mythril':'teal_mythril','valiance':'teal_paladin','prowess':'teal_monarch','hex':'teal_hexer','skewer':'teal_dragoon','flurry':'teal_degenerate','focus':'teal_templar','consume':'teal_darksider','crusader':'teal_crusader'}
STATVI={'abilityPower':'Công phép','attackDamage':'Công vật lý','physicalPierce':'Xuyên giáp','physicalLifesteal':'Hút máu','criticalRate':'Tỉ lệ chí mạng','criticalDamage':'Sát thương chí mạng','attackSpeed':'Tốc đánh','physicalArmor':'Giáp','maxHp':'Máu tối đa','magicPierce':'Xuyên giáp phép','magicLifesteal':'Hút máu phép','hpRegen':'Hồi máu/5 giây','movementSpeed':'Tốc chạy','magicArmor':'Giáp phép','cooldownReduction':'Giảm hồi chiêu'}
PCT={'physicalLifesteal','criticalRate','criticalDamage','attackSpeed','magicLifesteal','movementSpeed','cooldownReduction'}
tal_en=json.load(open(f'{D}/en/talents.json'));tal_vi=json.load(open(f'{D}/vi/talents.json'))
TAL={t['name'].lower():dict(t,vi=v['name']) for t,v in zip(tal_en,tal_vi)}
TAL['frostbite']=TAL['punish']
SITE={'wukong':'ngokhong','zanis':'trieuvan','riktor':'richter','lu-bu':'lubo','diao-chan':'dieuthuyen','jinnar':'jinna'}
raw=open('raw.txt',encoding='utf-8').read()
B={};used_i=set();used_a=set();used_t=set();warn=[]
for blk in raw.split('## ')[1:]:
    lines=blk.strip().split('\n');slug=lines[0].strip();f={l.split(':',1)[0]:l.split(':',1)[1].strip() for l in lines[1:]}
    key=SITE.get(slug,re.sub('[^a-z]','',slug))
    items=[];dropped=[]
    if f['ITEMS']!='NONE':
        for it in [x.strip() for x in f['ITEMS'].split('|')]:
            k=it.lower();eid=ALIAS[k] if k in ALIAS else byname.get(k)
            if k not in ALIAS and eid is None: warn.append((key,'item?',it));continue
            if eid is None: dropped.append(it);continue
            if eid in items: continue
            items.append(eid);used_i.add(eid)
    runes=[]
    for r in [x.strip() for x in f['RUNES'].split('|')]:
        m=re.match(r'(red|purple|green|zathong)/(.+?)(?: x(\d+))?$',r)
        src,name=m.group(1),m.group(2).lower()
        aid=ZT.get(name) if src=='zathong' else TH[src].get(name)
        if not aid: warn.append((key,'rune?',r));continue
        runes.append(aid);used_a.add(aid)
    cols=[a.split('_')[0] for a in runes];one=all(cols.count(c)==1 for c in cols)
    sp=[]
    if f['SPELL']!='NONE':
        for s in [x.strip() for x in f['SPELL'].split('/')]:
            t=TAL.get(s.lower())
            if not t: warn.append((key,'spell?',s));continue
            if t['talentId'] not in sp: sp.append(t['talentId']);used_t.add(t['talentId'])
    b={'i':items,'r':[[a,10 if one else 0] for a in runes],'s':sp}
    if dropped:b['x']=dropped
    if key=='flowborn': b['only']='ad'
    if slug!=key: b['u']=slug
    B[key]=b
print('warn',warn)
# --- kiểm tra hợp lí: loại sát thương của đồ và ngọc
def dmg(items):
    ad=ap=0
    for i in items:
        s=EQ.get(i,{}).get('stats',{}) if i in EQ else {}
        ad+=s.get('attackDamage',0)+s.get('attackSpeed',0)*2+s.get('criticalRate',0)*2;ap+=s.get('abilityPower',0)
    return 'phys' if ad>ap*0.6 else 'mag' if ap>0 else 'tank'
APR={'red_wise','red_nomad','red_sovereign','teal_hexer','teal_degenerate','purple_vampire','purple_cleric'}
ADR={'red_samurai','red_berserker','red_bloodlust','red_rampage','red_savage','red_blitz','teal_dragoon','purple_reaper','purple_assassin'}
for k,b in B.items():
    t=dmg(b['i']);rs={a for a,_ in b['r']}
    if t=='phys' and rs&APR or t=='mag' and rs&ADR: print('MISMATCH',k,t,sorted(rs&(APR if t=='phys' else ADR)),b['i'])
# --- build riêng theo đường, nguồn tiếng Việt (vn.txt): khoá "<key>@<đường>"
import unicodedata
def strip(s):
    s=unicodedata.normalize('NFD',s.replace('đ','d').replace('Đ','D'));s=''.join(c for c in s if unicodedata.category(c)!='Mn')
    return re.sub(r'\s*[-/]\s*','-',re.sub(r'\s+',' ',s.lower().strip()))
VIEQ={}
for e,v in zip(en,vi):
    k=strip(v['name'])
    if k in VIEQ and VIEQ[k]!=e['equipmentId']: warn.append(('vi-name clash',k))
    VIEQ[k]=e['equipmentId']
# đồ rừng cấp 2 → món nâng cấp cuối; tên nguồn viết khác tên trong game
VIEQ.update({strip('Đao Truy Kích'):'soulreaver',strip('Rìu Gnoll'):'leviathan',strip('Gươm Hiến Tế'):'lokis-curse',strip('Cung Gió Lốc'):'scorching-wind',
             strip('Quyền Trượng Rhea'):'rheas-blessing',strip('Chùy Băng Sương'):'frost-hammer',strip('Trượng Băng'):'frostys-revenge'})
VIRUNE={'do':{'cong vat ly':'red_samurai','cong vat ly-xuyen giap':'red_berserker','ti le chi mang':'red_savage','ti le chi mang-sat thuong chi mang':'red_rampage',
              'toc danh-ti le chi mang':'red_blitz','toc danh-mau-giap':'red_guardian','cong phep':'red_wise','cong phep-xuyen giap phep':'red_nomad'},
        'tim':{'toc danh-toc chay':'purple_fairy','cong vat ly-toc chay':'purple_assassin','hut mau':'purple_reaper','hut mau phep':'purple_cleric',
               'mau-hoi mau-toc chay':'purple_reliever','cong phep-hut mau phep':'purple_vampire','mau toi da':'purple_colossus'},
        'xanh':{'cong vat ly-xuyen giap':'teal_dragoon','toc danh-xuyen giap phep':'teal_degenerate','cong phep-giam hoi chieu':'teal_hexer',
                'mau toi da-giam hoi chieu':'teal_paladin','giap-giap phep-hoi chieu':'teal_crusader','giam hoi chieu':'teal_templar'}}
VITAL={strip(v['name']):t['talentId'] for t,v in zip(tal_en,tal_vi)}
# Phù hiệu (enchantments) bản Việt: tên → id; nhánh theo categoryId của avix-data
ENC_VI=json.load(open(D+'/vi/enchantments.json'))
VIENC={strip(e['name']):e for e in ENC_VI}
BRANCH={'veda':'thap quang minh','lokheim':'vuc hon mang','afata':'rung nguyen sinh','leagueofhumans':'thanh khoi nguyen'}
used_e=set()
def parse_ench(bid,txt):
    """'Nhánh: a, b, c | Nhánh: d, e' → [id…] (nhánh chính trước). Luật game: nhánh chính đủ cấp I–III,
    2 phù hiệu phụ cấp I/II từ nhánh khác (cùng một nhánh thì một cấp I, một cấp II; khác nhánh thì cấp nào cũng được)."""
    ids=[];groups=[]
    for part in txt.split('|'):
        br,names=part.split(':',1);br=strip(br)
        assert br in BRANCH.values(),(bid,'nhánh lạ',br)
        g=[]
        for n in names.split(','):
            e=VIENC.get(strip(n));assert e,(bid,'phù hiệu lạ',n.strip())
            assert BRANCH[e['categoryId']]==br,(bid,n.strip(),'không thuộc nhánh',br)
            g.append(e)
        groups.append(g)
    main=groups[0];rest=[e for g in groups[1:] for e in g]
    assert sorted(e['level'] for e in main)==[1,2,3],(bid,'nhánh chính phải đủ cấp I, II, III')
    assert len(rest)==2 and all(e['level']<=2 for e in rest),(bid,'cần đúng 2 phù hiệu phụ cấp I hoặc II')
    assert all(e['categoryId']!=main[0]['categoryId'] for e in rest),(bid,'phù hiệu phụ phải khác nhánh chính')
    if rest[0]['categoryId']==rest[1]['categoryId']: assert rest[0]['level']!=rest[1]['level'],(bid,'2 phù hiệu phụ cùng nhánh phải khác cấp')
    out=[e['enchantmentId'] for e in sorted(main,key=lambda e:e['level'])]+[e['enchantmentId'] for e in sorted(rest,key=lambda e:e['level'])]
    used_e.update(out);return out
LANEK={'top','jg','mid','ad','sp'}
for blk in open('vn.txt',encoding='utf-8').read().split('\n## ')[1:]:
    lines=[l for l in blk.strip().split('\n') if l.strip() and not l.startswith('#')];bid=lines[0].strip()
    key,lane=bid.split('@');assert lane in LANEK,bid
    f={l.split(':',1)[0]:l.split(':',1)[1].strip() for l in lines[1:]}
    items=[]
    for it in f['ITEMS'].split('|'):
        eid=VIEQ.get(strip(it))
        if not eid: warn.append((bid,'item?',it.strip()));continue
        if eid not in items: items.append(eid);used_i.add(eid)
    runes=[]
    for r in f['RUNES'].split('|'):
        m=re.match(r'\s*(\S+)\s+(.+?)\s+x(\d+)\s*$',r);col=strip(m.group(1));aid=VIRUNE[col].get(strip(m.group(2)))
        if not aid: warn.append((bid,'rune?',r.strip()));continue
        runes.append([aid,int(m.group(3))]);used_a.add(aid)
    for c in ('red','purple','teal'): assert sum(n for a,n in runes if a.startswith(c))==10,(bid,c,'phải đủ 10 viên')
    sp=[];own=[]
    for s in f['SPELL'].split(' / '):
        mark=s.strip().endswith('*');t=VITAL.get(strip(s.strip().rstrip('*')))
        if not t: warn.append((bid,'spell?',s));continue
        sp.append(t);used_t.add(t)
        if mark: own.append(t)
    b={'i':items,'r':runes,'s':sp,'l':f['SRC']}
    if own: b['o']=own
    if f.get('ENCH'): b['e']=parse_ench(bid,f['ENCH'])
    if f.get('ENCH_SRC'): b['el']=f['ENCH_SRC']
    if f.get('NOTE'):b['n']=f['NOTE']
    # luật game: đồ rừng chỉ mua được khi mang Trừng Trị; đi đường thì không mang đồ rừng
    jg=[i for i in items if EQ[i]['categoryId']=='jungling']
    if lane=='jg': assert jg and sp==['punish'],(bid,'rừng phải có đồ rừng + Trừng Trị')
    else: assert not jg and ('punish' not in sp or 'punish' in own),(bid,'đi đường không có đồ rừng; Trừng Trị chỉ khi chủ web thêm (*)')
    if lane=='sp' and not any(EQ[i]['categoryId']=='support' for i in items): warn.append((bid,'trợ thủ thiếu đồ trợ thủ'))
    assert bid not in B,(bid,'trùng')
    B[bid]=b
print('vn builds:',sum('@' in k for k in B),'warn',warn[-10:])
json.dump({'B':B,'I':sorted(used_i),'A':sorted(used_a),'T':sorted(used_t),'E':sorted(used_e)},open('compiled.json','w'),ensure_ascii=False,indent=0)
print(len(B),'heroes;',len(used_i),'items;',len(used_a),'arcana;',len(used_t),'spells;',len(used_e),'phù hiệu')
print('thiếu phù hiệu:',[k for k,b in B.items() if '@' in k and not b.get('e')])
print('dropped:',{k:b['x'] for k,b in B.items() if 'x' in b})
print('no spell:',[k for k,b in B.items() if not b['s']],' no items:',[k for k,b in B.items() if not b['i']])
