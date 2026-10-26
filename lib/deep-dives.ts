import raw from '@/data/deep-dives.json';
export type DeepDive = { topicId: string; mentalModel: { tr: string; en: string }; checkpoint: { tr: string; en: string }; language: string; code: string };
const diveMap = new Map((raw as DeepDive[]).map(x => [x.topicId, x]));
export function getDeepDive(id: string) { return diveMap.get(id); }
