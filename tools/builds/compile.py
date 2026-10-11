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
json.dump({'B':B,'I':sorted(used_i),'A':sorted(used_a),'T':sorted(used_t)},open('compiled.json','w'),ensure_ascii=False,indent=0)
print(len(B),'heroes;',len(used_i),'items;',len(used_a),'arcana;',len(used_t),'spells')
print('dropped:',{k:b['x'] for k,b in B.items() if 'x' in b})
print('no spell:',[k for k,b in B.items() if not b['s']],' no items:',[k for k,b in B.items() if not b['i']])
