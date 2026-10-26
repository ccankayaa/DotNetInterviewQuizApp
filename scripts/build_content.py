#!/usr/bin/env python3
"""Build stable, original bilingual study cards and question bank.

Source cards have five independent technical dimensions. Each dimension becomes
one multiple-choice concept drill. Curated case studies are added separately.
All IDs are stable across builds to preserve anonymous progress.
"""
import collections
import hashlib
import json
from pathlib import Path
from urllib.parse import quote
import re

ROOT=Path(__file__).resolve().parent.parent
RAW=ROOT/'data/raw'
OUT=ROOT/'data/generated'
OUT.mkdir(parents=True,exist_ok=True)

CATEGORIES={
 'core':('Bilgisayar Bilimi','Computer Science','CS Fundamentals','Bilgisayar mühendisliğinin temel zihinsel modelleri','Fundamental mental models of computer engineering','https://en.wikipedia.org/wiki/Computer_science'),
 'algo':('Veri Yapıları ve Algoritmalar','Data Structures & Algorithms','Algorithms','Verimlilik, doğruluk ve algoritma tasarımı','Efficiency, correctness, and algorithm design','https://ocw.mit.edu/courses/6-006-introduction-to-algorithms-spring-2020/'),
 'os':('İşletim Sistemleri','Operating Systems','Systems','Process, thread, bellek ve Linux internals','Processes, threads, memory, and Linux internals','https://pages.cs.wisc.edu/~remzi/OSTEP/'),
 'network':('Ağ ve İnternet Protokolleri','Networking & Internet Protocols','Networks','TCP, DNS, HTTP, TLS ve ağ teşhisi','TCP, DNS, HTTP, TLS, and network diagnostics','https://developer.mozilla.org/en-US/docs/Web/HTTP'),
 'security':('Kriptografi ve Güvenlik','Cryptography & Security','Security','Kriptografi, IAM, uygulama ve API güvenliği','Cryptography, IAM, and application/API security','https://cheatsheetseries.owasp.org/'),
 'runtime':('CLR, IL ve .NET İç Yapısı','CLR, IL & .NET Internals','Runtime','JIT, CIL, GC, reflection ve runtime tasarımı','JIT, CIL, GC, reflection, and runtime design','https://learn.microsoft.com/en-us/dotnet/standard/managed-execution-process'),
 'csharp':('C# Derinlemesine','C# Deep Dive','Language','Dil özellikleri, semantik ve performans','Language features, semantics, and performance','https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/'),
 'aspnet':('ASP.NET Core ve Servis Yönetimi','ASP.NET Core & Hosting','Backend','Program.cs, DI, middleware ve API tasarımı','Program.cs, DI, middleware, and API design','https://learn.microsoft.com/en-us/aspnet/core/fundamentals/'),
 'data':('Veritabanları ve Transaction','Databases & Transactions','Data','SQL, query plan, eşzamanlılık ve finansal tutarlılık','SQL, query plans, concurrency, and financial correctness','https://learn.microsoft.com/en-us/ef/core/'),
 'dist':('Dağıtık Sistemler','Distributed Systems','Distributed','Mesajlaşma, dayanıklılık ve veri tutarlılığı','Messaging, resilience, and consistency','https://learn.microsoft.com/en-us/dotnet/architecture/microservices/'),
 'arch':('OOP, SOLID ve Yazılım Mimarisi','OOP, SOLID & Architecture','Architecture','Nesne yönelimli tasarım ve sistem sınırları','Object-oriented design and system boundaries','https://learn.microsoft.com/en-us/dotnet/architecture/'),
 'concurrency':('Asenkron ve Eşzamanlılık','Concurrency & Async','Concurrency','Task, ThreadPool, memory model ve yarış koşulları','Tasks, ThreadPool, memory models, and races','https://learn.microsoft.com/en-us/dotnet/standard/threading/'),
 'observability':('Gözlemlenebilirlik ve SRE','Observability & SRE','Reliability','Tracing, metrikler ve güvenilirlik hedefleri','Tracing, metrics, and reliability objectives','https://sre.google/sre-book/table-of-contents/'),
 'testing':('Test ve Yazılım Kalitesi','Testing & Software Quality','Quality','Doğrulama, regresyon ve test stratejileri','Verification, regression, and testing strategies','https://learn.microsoft.com/en-us/dotnet/core/testing/'),
 'cloud':('DevOps, Cloud ve Kubernetes','DevOps, Cloud & Kubernetes','Infrastructure','CI/CD, container, dağıtım ve operasyon','CI/CD, containers, deployment, and operations','https://kubernetes.io/docs/concepts/'),
 'frontend':('Web, React ve Erişilebilirlik','Web, React & Accessibility','Web','SEO, tarayıcılar, UX ve performans','SEO, browsers, UX, and performance','https://web.dev/learn/'),
 'ai':('Yapay Zekâ ve LLM Mühendisliği','AI & LLM Engineering','AI','RAG, agent, embedding, değerlendirme ve güvenlik','RAG, agents, embeddings, evaluation, and safety','https://genai.owasp.org/'),
 'leadership':('Senior Engineering ve Liderlik','Senior Engineering & Leadership','Leadership','Mimari karar, ekip, üretim ve kalite sahipliği','Architecture decisions, teams, delivery, and quality ownership','https://sre.google/sre-book/table-of-contents/'),
}

FACETS=['mechanism','practice','pitfall','tradeoff','signal']
DIM = {
 'mechanism': (
    'Teknik çalışma prensibi / Kavram','Mechanism / Concept',
    '“{topic}” başlığının temel teknik mekanizmasını en doğru anlatan ifade hangisidir?',
    'Which statement most precisely describes the underlying mechanism of “{topic}”?'),
 'practice': ('Üretim kararı','Production decision',
    '“{topic}” ile ilgili bir production code review yapıyorsun. En doğrudan uygulanabilir yaklaşım hangisidir?',
    'You are reviewing production code related to “{topic}”. Which action is most directly applicable?'),
 'pitfall': ('Yanlış varsayım / Hata','Misconception / Failure',
    '“{topic}” konusunda özellikle kaçınılması gereken yanlış varsayım hangisidir?',
    'Which mistaken assumption should you specifically challenge when dealing with “{topic}”?'),
 'tradeoff': ('Ödünleşim / Mimari karar','Trade-off / Design',
    '“{topic}” için tasarım kararını verirken hangi ödünleşim en doğrudan dikkate alınmalıdır?',
    'Which trade-off is most directly relevant when choosing an approach for “{topic}”?'),
 'signal': ('Teşhis ve gözlemlenebilirlik','Diagnostics / Observability',
    '“{topic}” ile ilgili problemi araştırırken hangi somut sinyal en doğrudan yardımcı olur?',
    'Which concrete signal is most directly useful when investigating “{topic}”?'),
}

def make_slug(text):
    import unicodedata
    text=unicodedata.normalize('NFKD',text.lower())
    text=''.join(x for x in text if not unicodedata.combining(x))
    text=text.replace('ı','i').replace('æ','ae')
    return re.sub('-+','-',re.sub('[^a-z0-9]+','-',text)).strip('-')

def hash_int(text):
    return int(hashlib.sha256(text.encode()).hexdigest()[:12],16)

rows=[]
for p in sorted(RAW.glob('*.txt')):
 for lineno,line in enumerate(p.read_text('utf8').splitlines(),1):
    if not line.strip() or line.startswith('#'): continue
    v=line.split('~')
    if len(v)!=14: raise ValueError(f'{p.name}:{lineno} expected 14 cells, got {len(v)}')
    if not all(v): raise ValueError(f'{p.name}:{lineno} has empty text')
    category,level,title_tr,title_en,*parts=v
    if category not in CATEGORIES: raise ValueError(category)
    key=make_slug(title_en)
    if any(r['id']==key for r in rows): raise ValueError(f'duplicate id {key}')
    facts={k:{'tr':parts[i*2],'en':parts[i*2+1]} for i,k in enumerate(FACETS)}
    rows.append({'id':key,'category':category,'level':level,'title':{'tr':title_tr,'en':title_en},'facts':facts,'source':CATEGORIES[category][5]})

by_cat=collections.defaultdict(list)
for r in rows:by_cat[r['category']].append(r)

qs=[]
for r in rows:
 for i,facet in enumerate(FACETS):
    # Stable, topic-specific distractors, selected from the same technical domain.
    others=[o for o in by_cat[r['category']] if o['id']!=r['id']]
    others.sort(key=lambda o:hash_int(r['id']+'|'+facet+'|'+o['id']))
    if len(others)<3:raise ValueError('insufficient distractors in '+r['category'])
    answer_slot=hash_int('correct|'+r['id']+'|'+facet)%4
    alternatives=[o['facts'][facet] for o in others[:3]]
    options=alternatives[:]
    options.insert(answer_slot,r['facts'][facet])
    qid=f"{r['id']}--{facet}"
    # Difficulty denotes question demand, not inherent complexity of the subject.
    # This gives learners basic recall → contextual judgment → senior diagnosis.
    level={'mechanism':'basic','practice':'intermediate',
           'pitfall':'intermediate','tradeoff':'advanced','signal':'advanced'}[facet]
    desc={loc: DIM[facet][2 if loc=='tr' else 3].format(topic=r['title'][loc]) for loc in ['tr','en']}
    explain={}
    for loc in ['tr','en']:
        f={a:r['facts'][a][loc] for a in FACETS}
        if loc=='tr':
            explain[loc]=f"Mekanizma: {f['mechanism']}\nUygulama: {f['practice']}\nYanılgı: {f['pitfall']}\nMimari karar: {f['tradeoff']}\nKontrol: {f['signal']}"
        else:
            explain[loc]=f"Mechanism: {f['mechanism']}\nPractice: {f['practice']}\nPitfall: {f['pitfall']}\nTrade-off: {f['tradeoff']}\nVerify: {f['signal']}"
    qs.append({'id':qid,'topicId':r['id'],'category':r['category'],'level':level,'type':'concept','facet':facet,
      'title':{'tr':DIM[facet][0],'en':DIM[facet][1]},'prompt':desc,
      'options':{lang:[o[lang] for o in options] for lang in ('tr','en')},
      'correctIndex':answer_slot,'explanation':explain,'takeaway':r['facts']['practice'], 'sources':[r['source']]})

# Curated cases are authored individually, not created by the dimension template.
import importlib.util
spec=importlib.util.spec_from_file_location('cases',ROOT/'scripts/cases.py')
module=importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)
for case in module.CASES:
    assert len(case['options']['tr'])==len(case['options']['en'])==4
    assert 0<=case['correctIndex']<4
    assert case['category'] in CATEGORIES
    assert case['topicId'] in [r['id'] for r in rows],case['topicId']
    case['type']='case'
    case['facet']='scenario'
    case['title']={'tr':'Uygulamalı senaryo','en':'Applied scenario'}
    case.setdefault('sources',[CATEGORIES[case['category']][5]])
    case.setdefault('takeaway',{'tr':'Kararı iş invariantları, maliyet ve hata durumlarıyla gerekçelendir.',
                                'en':'Justify decisions using invariants, costs, and failure modes.'})
    qs.append(case)

assert len({x['id'] for x in qs})==len(qs)
assert len(qs)>=1000,(len(qs),len(rows))
for q in qs:
 for lang in ('tr','en'):
    assert len(q['options'][lang])==4 and len(set(q['options'][lang]))==4,(q['id'],lang)
    for prop in ('prompt','explanation','takeaway'):
        assert q[prop][lang].strip(),(q['id'],prop,lang)

category_list=[{'id':k, 'title':{'tr':v[0],'en':v[1]}, 'short':v[2], 'description':{'tr':v[3],'en':v[4]}, 'source':v[5],
  'topicCount':sum(1 for t in rows if t['category']==k), 'questionCount':sum(1 for q in qs if q['category']==k)} for k,v in CATEGORIES.items()]

question_idx=[{'id':q['id'],'topicId':q['topicId'],'category':q['category'],'level':q['level'],'type':q['type'],'facet':q['facet'],
  'prompt':q['prompt'],'title':q['title']} for q in qs]
for name,data in [('topics.json',rows),('categories.json',category_list),('questions.json',qs),('question-index.json',question_idx)]:
    (OUT/name).write_text(json.dumps(data,ensure_ascii=False,separators=(',',':')),encoding='utf8')

stats={'topics':len(rows),'questions':len(qs),'curatedCases':len(module.CASES),'categories':len(CATEGORIES),
  'perCategory':{c['id']:c['questionCount'] for c in category_list},'languages':['tr','en']}
(OUT/'stats.json').write_text(json.dumps(stats,indent=2,ensure_ascii=False),encoding='utf8')
print(json.dumps(stats,ensure_ascii=False,indent=2))
