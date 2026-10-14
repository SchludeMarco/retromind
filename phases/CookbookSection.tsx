import React, { useState } from 'react';
import { Recipe, RECIPES, recipeDecades, t } from '../lib/recipes';
import { tr } from '../lib/i18n';

// "Omas Kochbuch" in Erkunden (Marco, 2026-10-14): treats from back then as
// recipes (lib/recipes.ts). It looks like a worn recipe book: ribbons for the
// decades (your own first), recipe cards on lined paper, and one recipe open
// with ingredients you can tick off while you cook.

const decadeLabel = (d: string) => tr(`${d}s`, `${d}er`);

const RecipePage: React.FC<{
  recipe: Recipe;
  remembered: boolean;
  onRemember: () => void;
  onBack: () => void;
}> = ({ recipe, remembered, onRemember, onBack }) => {
  const ingredients = t(recipe.ingredients);
  const [have, setHave] = useState<Set<number>>(new Set());
  const toggle = (i: number) =>
    setHave((s) => {
      const next = new Set(s);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });

  return (
    <article className="cookbook-page space-y-6">
      <button onClick={onBack} className="rm-btn rm-btn-secondary">
        <span aria-hidden="true">←</span> {tr('Back to the book', 'Zurück zum Buch')}
      </button>
      <header className="space-y-2">
        <p className="rm-eyebrow">
          {decadeLabel(recipe.decade)} · {t(recipe.serves)} · {t(recipe.time)}
        </p>
        <h3 className="rm-title flex items-center gap-3">
          <span aria-hidden="true">{recipe.icon}</span> {t(recipe.title)}
        </h3>
        <p className="cookbook-story">{t(recipe.story)}</p>
      </header>

      <div className="grid gap-8 md:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
        <section>
          <h4 className="rm-eyebrow mb-3">{tr('You need', 'Du brauchst')}</h4>
          <ul className="space-y-2">
            {ingredients.map((item, i) => (
              <li key={i}>
                <label className={`cookbook-item ${have.has(i) ? 'is-done' : ''}`}>
                  <input type="checkbox" checked={have.has(i)} onChange={() => toggle(i)} />
                  <span>{item}</span>
                </label>
              </li>
            ))}
          </ul>
        </section>
        <section>
          <h4 className="rm-eyebrow mb-3">{tr('How it’s done', 'So geht’s')}</h4>
          <ol className="cookbook-steps">
            {t(recipe.steps).map((step, i) => (
              <li key={i}>{step}</li>
            ))}
          </ol>
        </section>
      </div>

      <aside className="cookbook-tip">
        <span className="rm-eyebrow block mb-1">{tr('Grandma’s tip', 'Omas Tipp')}</span>
        {t(recipe.tip)}
      </aside>

      <div className="flex flex-wrap gap-3">
        <button onClick={onRemember} className="retro-button rm-btn bg-retro-ink text-white">
          {remembered ? tr('✓ In your memory book', '✓ Im Erinnerungsbuch') : tr('+ Remember: who made this for you?', '+ Erinnern: Wer hat das für dich gemacht?')}
        </button>
      </div>
    </article>
  );
};

export const CookbookSection: React.FC<{
  focusDecade: string;
  isAnswered: (id: string) => boolean;
  onRemember: (wordId: string, term: string, knowledge: string, decade: string, fallbackQuestion: string) => void;
  backButton: React.ReactNode;
}> = ({ focusDecade, isAnswered, onRemember, backButton }) => {
  const decades = recipeDecades(focusDecade);
  const [decade, setDecade] = useState(decades[0]);
  const [openId, setOpenId] = useState<string | null>(null);
  const open = RECIPES.find((r) => r.id === openId) ?? null;
  const show = (id: string | null) => {
    setOpenId(id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (open) {
    const id = `recipe-${open.id}`;
    return (
      <div className="space-y-5">
        <RecipePage
          recipe={open}
          remembered={isAnswered(id)}
          onRemember={() => onRemember(id, t(open.title), t(open.story), open.decade, t(open.question))}
          onBack={() => show(null)}
        />
      </div>
    );
  }

  const recipes = RECIPES.filter((r) => r.decade === decade);
  return (
    <div className="space-y-8">
      <header className="space-y-5">
        {backButton}
        <div className="rm-stop-header">
          <p className="rm-eyebrow">{tr('Explore', 'Erkunden')}</p>
          <h2 className="rm-title flex items-center gap-3">
            <span aria-hidden="true">📖</span> {tr('Grandma’s Cookbook', 'Omas Kochbuch')}
          </h2>
          <p className="rm-lead">
            {tr(
              'Treats from back then, the way Grandma made them. Pick a decade, open a recipe and cook along.',
              'Leckereien von damals, so wie Oma sie gemacht hat. Such dir ein Jahrzehnt aus, schlag ein Rezept auf und koch mit.'
            )}
          </p>
        </div>
      </header>

      <div className="cookbook">
        <div className="cookbook-ribbons" role="tablist" aria-label={tr('Decades', 'Jahrzehnte')}>
          {decades.map((d) => (
            <button
              key={d}
              role="tab"
              aria-selected={d === decade}
              onClick={() => setDecade(d)}
              className={`cookbook-ribbon ${d === decade ? 'is-active' : ''}`}
            >
              {decadeLabel(d)}
              {d === focusDecade && <span className="sr-only">{tr(' (your era)', ' (deine Zeit)')}</span>}
              {d === focusDecade && <span aria-hidden="true"> ★</span>}
            </button>
          ))}
        </div>
        <div className="cookbook-paper" role="tabpanel">
          {decade === focusDecade && <p className="rm-eyebrow mb-4">{tr('★ Your era', '★ Deine Zeit')}</p>}
          <div className="grid gap-5 sm:grid-cols-2">
            {recipes.map((r) => (
              <button key={r.id} onClick={() => show(r.id)} className="cookbook-card text-left">
                <span aria-hidden="true" className="text-3xl">{r.icon}</span>
                <span className="cookbook-card-title">{t(r.title)}</span>
                <span className="text-sm text-retro-brown">{t(r.time)}</span>
                {isAnswered(`recipe-${r.id}`) && (
                  <span className="text-sm font-semibold text-retro-green">{tr('✓ In your memory book', '✓ Im Erinnerungsbuch')}</span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
