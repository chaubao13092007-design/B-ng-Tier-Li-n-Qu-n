import json,os,re
os.chdir(os.path.dirname(os.path.abspath(__file__)))
from PIL import Image
D=os.environ.get('AVIX_DATA','/tmp/ext/avix-data')+'/data';A=os.environ.get('AVIX_ASSETS','/tmp/ext/avix');REPO=os.path.abspath(os.path.join(os.path.dirname(__file__),'..','..'))
C=json.load(open('compiled.json'))
en=json.load(open(f'{D}/en/equipments.json'));vi=json.load(open(f'{D}/vi/equipments.json'))
EQ={e['equipmentId']:dict(e,vi=v['name']) for e,v in zip(en,vi)}
FIXVI={'frostys-revenge':'Trượng Băng'}
SUP={'sup-magic-eye':('Bảo Thạch · Ma Nhãn','Ma Nhãn'),'sup-spout':('Bảo Thạch · Hồi Huyết','Hồi Huyết'),'sup-barrier':('Bảo Thạch · Thần Khiên','Thần Khiên'),'sup-cleansing':('Bảo Thạch · Mở Trói','Mở Trói')}
CAT={'attack':'atk','magic':'mag','defense':'def','movement':'boot','jungling':'jg','support':'sup'}
AR={a['arcanaId']:a for a in json.load(open(f'{D}/en/arcanas.json'))}
STATVI={'abilityPower':'Công phép','attackDamage':'Công vật lý','physicalPierce':'Xuyên giáp','physicalLifesteal':'Hút máu','criticalRate':'Tỉ lệ chí mạng','criticalDamage':'Sát thương chí mạng','attackSpeed':'Tốc đánh','physicalArmor':'Giáp','maxHp':'Máu tối đa','magicPierce':'Xuyên giáp phép','magicLifesteal':'Hút máu phép','hpRegen':'Hồi máu/5 giây','movementSpeed':'Tốc chạy','magicArmor':'Giáp phép','cooldownReduction':'Giảm hồi chiêu'}
PCT={'physicalLifesteal','criticalRate','criticalDamage','attackSpeed','magicLifesteal','movementSpeed','cooldownReduction'}
tal_en=json.load(open(f'{D}/en/talents.json'));tal_vi=json.load(open(f'{D}/vi/talents.json'))
TAL={t['talentId']:dict(t,vi=v['name'],desc=v['description']) for t,v in zip(tal_en,tal_vi)}
os.makedirs(f'{REPO}/b',exist_ok=True)
def icon(src,dst,size=72):
    im=Image.open(src).convert('RGBA');im.thumbnail((size,size),Image.LANCZOS)
    if im.size!=(size,size):
        c=Image.new('RGBA',(size,size),(0,0,0,0));c.paste(im,((size-im.size[0])//2,(size-im.size[1])//2));im=c
    im.save(dst,'WEBP',quality=72,method=6)
ITEM={}
for i in C['I']:
    if i.startswith('sup-'):
        ITEM[i]=[SUP[i][0],'sup','gem'];continue
    e=EQ[i];ITEM[i]=[FIXVI.get(i,e['vi']),CAT[e['categoryId']],i,e['name']]
    icon(f"{A}/{e['asset']}",f'{REPO}/b/i-{i}.webp')
icon(f'{A}/equipments/G101_EG_ElementalGem.webp',f'{REPO}/b/i-gem.webp')
ARC={}
for a in C['A']:
    s=AR[a]['stats'];txt=' · '.join(f"{STATVI[k]} +{v}{'%' if k in PCT else ''}" for k,v in s.items())
    ARC[a]=[a.split('_')[0],txt];icon(f"{A}/{AR[a]['asset']}",f'{REPO}/b/a-{a}.webp',64)
SP={}
for t in C['T']+['punish','flicker']:
    SP[t]=[TAL[t]['vi'],TAL[t]['desc']];icon(f"{A}/{TAL[t]['asset']}",f'{REPO}/b/t-{t}.webp',64)
B=C['B']
# Ngọc đỏ Zephys trong nguồn là ngọc phép, không hợp build vật lý → ẩn, ghi chú
B['zephys']['r']=[r for r in B['zephys']['r'] if r[0]!='red_nomad'];B['zephys']['n']='Nguồn ghi ngọc đỏ loại công phép, không hợp với build vật lý này nên đã ẩn.'
for k in ('allain','kilgroth'):B[k]['n']="Nguồn có thêm Hyoga's Edge, món này không còn ở bản Việt Nam nên đã bỏ."
B['natalya']['n']='Nguồn ghi Quả Cầu Băng Sương hai lần, ở đây chỉ giữ một.'
js='/* Build tham khảo cho từng tướng — tạo tự động, đừng sửa tay.\n   Nguồn build: ROV META (rovmeta.com/heroes, bản 1.64, cập nhật 10/10/2026) — dữ liệu đấu chuyên nghiệp và rank cao server Thái.\n   Tên đồ, ngọc, phép bổ trợ bản Việt và ảnh: AoV-IndeX (avix-data, avix-assets). Ảnh trong thư mục b/. */\n'
js+='const BUILD_META={src:"ROV META",url:"https://rovmeta.com/heroes",patch:"1.64",date:"10/10/2026"};\n'
js+='const BITEM='+json.dumps(ITEM,ensure_ascii=False,separators=(',',':'))+';\n'
js+='const BARC='+json.dumps(ARC,ensure_ascii=False,separators=(',',':'))+';\n'
js+='const BSPELL='+json.dumps(SP,ensure_ascii=False,separators=(',',':'))+';\n'
js+='const BUILDS={\n'+',\n'.join(f'  {json.dumps(k)}:'+json.dumps(v,ensure_ascii=False,separators=(",",":")) for k,v in sorted(B.items()))+'\n};\n'
open(f'{REPO}/assets/builds.js','w',encoding='utf-8').write(js)
print(len(js),'bytes', len(os.listdir(f'{REPO}/b')),'icons')
