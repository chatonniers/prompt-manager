function scorePrompt(prompt, query) {
  const q = query.toLowerCase().trim();
  if (!q) return 1;

  const fields = [
    { value: prompt.title, weight: 10 },
    { value: (prompt.tags || []).join(" "), weight: 8 },
    { value: (prompt.solutions || []).join(" "), weight: 7 },
    { value: prompt.storyFlow || "", weight: 6 },
    { value: prompt.body, weight: 5 },
    { value: (prompt.landscapes || []).join(" "), weight: 3 },
    { value: prompt.notes || "", weight: 2 }
  ];

  return fields.reduce((score, { value, weight }) => {
    const v = (value || "").toLowerCase();
    if (v.includes(q)) score += weight;
    if (v.startsWith(q)) score += weight * 2;
    return score;
  }, 0);
}

function filterAndRank(prompts, query, context, showAll) {
  let pool = prompts;

  if (!showAll && context && context.detected) {
    pool = prompts.filter(p =>
      !p.solutions || p.solutions.length === 0 || p.solutions.includes(context.solution)
    );
  }

  return pool
    .map(p => ({ prompt: p, score: scorePrompt(p, query) }))
    .filter(({ score }) => score > 0)
    .sort((a, b) => {
      if (a.prompt.isFavorite !== b.prompt.isFavorite)
        return a.prompt.isFavorite ? -1 : 1;
      if (context && context.suggestedFlows && context.suggestedFlows.length > 0) {
        const aFlow = context.suggestedFlows.includes(a.prompt.storyFlow) ? 0 : 1;
        const bFlow = context.suggestedFlows.includes(b.prompt.storyFlow) ? 0 : 1;
        if (aFlow !== bFlow) return aFlow - bFlow;
      }
      return b.score - a.score;
    })
    .map(({ prompt }) => prompt);
}
