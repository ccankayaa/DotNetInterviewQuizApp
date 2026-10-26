#!/usr/bin/env python3
"""Validate the authored bilingual knowledge base and public stable IDs."""
import collections
import json
import re
from pathlib import Path
from urllib.parse import urlparse
root=Path(__file__).resolve().parent.parent
load=lambda path:json.loads((root/path).read_text('utf8'))
questions=load('data/generated/questions.json');topics=load('data/generated/topics.json');categories=load('data/generated/categories.json');index=load('data/generated/question-index.json');stats=load('data/generated/stats.json');dives=load('data/deep-dives.json')
errors=[]
def check(condition,description):
 if not condition:errors.append(description)
check(len(questions)>=1000,'expected at least 1000 questions')
check(len(categories)>=18,'expected >=18 disciplines')
check(len(topics)>=190,'expected >=190 lessons')
check(len({x['id'] for x in questions})==len(questions),'duplicate question ID')
check(len({x['id'] for x in topics})==len(topics),'duplicate topic ID')
check(len(index)==len(questions),'question index out of sync')
check({x['id'] for x in index}=={x['id'] for x in questions},'question index IDs differ')
check(stats['questions']==len(questions),'stats questions wrong')
check(stats['topics']==len(topics),'stats topics wrong')
cat_ids={c['id'] for c in categories};topics_by_id={x['id']:x for x in topics}
for t in topics:
 check(t['category'] in cat_ids,f"{t['id']} missing category")
 check(t['level'] in {'basic','intermediate','advanced'},f"{t['id']} invalid difficulty")
 check(all(t['title'].get(l) for l in ('tr','en')),f"{t['id']} untranslated title")
 check(urlparse(t['source']).scheme=='https',f"{t['id']} invalid source")
 for facet in ['mechanism','practice','pitfall','tradeoff','signal']:
  check(all(t['facts'][facet].get(l) for l in ('tr','en')),f"{t['id']} missing {facet}")
for q in questions:
 check(q['topicId'] in topics_by_id,f"{q['id']} missing topic")
 check(q['category'] in cat_ids,f"{q['id']} missing category")
 check(q['type'] in ['concept','case'],f"{q['id']} invalid type")
 check(q['level'] in {'basic','intermediate','advanced'},f"{q['id']} invalid level")
 check(isinstance(q['correctIndex'],int) and 0<=q['correctIndex']<4,f"{q['id']} invalid key")
 for l in ('tr','en'):
  check(len(q['options'][l])==4,f"{q['id']} {l} options not 4")
  check(len(set(q['options'][l]))==4,f"{q['id']} {l} duplicate options")
  for prop in ('prompt','explanation','takeaway','title'):
   check(bool(q.get(prop,{}).get(l,'')),f"{q['id']} {l} untranslated {prop}")
  check(len(q['explanation'][l])>=70,f"{q['id']} {l} short explanation")
for c in categories:
 check(sum(q['category']==c['id'] for q in questions)==c['questionCount'],f"{c['id']} count incorrect")
 check(sum(t['category']==c['id'] for t in topics)==c['topicCount'],f"{c['id']} topic count incorrect")
case_count=sum(q['type']=='case' for q in questions)
check(case_count==stats['curatedCases'],'curatedCases mismatch')
for d in dives:
 check(d['topicId'] in topics_by_id,f"deep dive {d['topicId']} orphaned")
 check(bool(d['code'].strip()),f"deep dive {d['topicId']} missing sample")
 check(all(d[field][l] for field in ['mentalModel','checkpoint'] for l in ['tr','en']),f"deep dive {d['topicId']} untranslated")
check(len({d['topicId'] for d in dives})==len(dives),'deep dive duplicate topic')
print('Content QA:')
print(f"  Categories: {len(categories)} | Topics: {len(topics)} | Questions: {len(questions)} | Special cases: {case_count} | Deep dives: {len(dives)}")
print(f"  Basic / Intermediate / Advanced: {dict(collections.Counter(q['level'] for q in questions))}")
print(f"  Bilingual populated prompts/explanations/answers: {'yes' if not errors else 'validation errors'}")
if errors:
 for e in errors[:50]:print('ERROR',e)
 raise SystemExit(f'{len(errors)} errors')
print('  PASS')
