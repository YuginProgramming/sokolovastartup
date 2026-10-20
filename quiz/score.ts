import { questions } from "./questions.js";
import { startTypes, typeIds, type StartType, type TypeId } from "./types.js";

export type RankedType = {
  id: TypeId;
  name: string;
  points: number;
};

export type QuizResult = {
  ranked: RankedType[];
  primary: StartType;
  secondary: StartType | null;
  evidenceCount: number;
  reasons: string[];
};

export function scoreQuiz(answers: Record<string, string>): QuizResult {
  const totals = Object.fromEntries(typeIds.map((id) => [id, 0])) as Record<TypeId, number>;

  for (const question of questions) {
    const option = question.options.find((item) => item.id === answers[question.id]);
    if (!option) continue;
    for (const [id, points] of Object.entries(option.points) as [TypeId, number][]) {
      totals[id] += points;
    }
  }

  const ranked = startTypes
    .map((type) => ({ id: type.id, name: type.name, points: totals[type.id] }))
    .sort((a, b) => b.points - a.points);

  const primary = startTypes.find((type) => type.id === ranked[0].id) ?? startTypes[0];
  const secondRank = ranked.find((item) => item.id !== primary.id && item.points > 0);
  const secondary = secondRank
    ? startTypes.find((type) => type.id === secondRank.id) ?? null
    : null;

  const reasons: string[] = [];
  for (const question of questions) {
    const option = question.options.find((item) => item.id === answers[question.id]);
    if (!option) continue;
    if ((option.points[primary.id] ?? 0) > 0) reasons.push(option.why);
  }

  return {
    ranked,
    primary,
    secondary,
    evidenceCount: reasons.length,
    reasons,
  };
}

export function evidencePhrase(count: number, total: number): string {
  if (count === 1) return `Я это вижу по 1 твоему ответу из ${total}.`;
  return `Я это вижу по ${count} твоим ответам из ${total}.`;
}
