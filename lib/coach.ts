import type { Progress } from './progress';
import { questionIndex, topics, categories } from './content';
import type { Locale } from './content';
export function getCoachRecommendation(progress: Progress, locale: Locale) {
  const now = Date.now();
  const ranked = categories.map(cat => {
    const set = questionIndex.filter(q => q.category === cat.id);
    const answered = set.filter(q => progress.answers[q.id]);
    const correct = answered.filter(q => progress.answers[q.id].lastCorrect);
    const due = answered.filter(q => new Date(progress.answers[q.id].dueAt).getTime() <= now).length;
    const score = (1 - (correct.length / Math.max(1, set.length))) * 0.7 + due / Math.max(1, set.length) * 0.3;
    return { ...cat, score, answered: answered.length, correct: correct.length, due };
  }).sort((a, b) => b.score - a.score);
  const category = ranked[0];
  const topic = topics.find(t => t.category === category.id &&
    questionIndex.some(q => q.topicId === t.id && !progress.answers[q.id])) || topics.find(t => t.category === category.id);
  const reason = locale === 'tr'
    ? (category.answered === 0 ? `${category.title.tr} alanıyla güçlü bir temel oluştur.` : `${category.correct}/${category.answered} doğru · ${category.due} tekrar zamanı gelen soru`)
    : (category.answered === 0 ? `Build your foundation in ${category.title.en}.` : `${category.correct}/${category.answered} correct · ${category.due} questions due for review`);
  return { category, topic, reason };
}
