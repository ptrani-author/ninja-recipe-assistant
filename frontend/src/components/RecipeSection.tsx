import { Recipe } from '@/types';

interface RecipeSectionProps {
  recipe: Recipe;
  onGenerateNew: () => void;
  onChangeIngredients: () => void;
}

export default function RecipeSection({ recipe, onGenerateNew, onChangeIngredients }: RecipeSectionProps) {
  return (
    <section className="py-20 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="glass rounded-2xl p-8 md:p-12">
          {/* Recipe header */}
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              {recipe.title}
            </h2>
            <div className="flex flex-wrap justify-center gap-6 text-gray-300">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{recipe.totalTime} Min</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <span>{recipe.portions} Portionen</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Ingredients */}
            <div>
              <h3 className="text-2xl font-bold text-white mb-6">Zutaten</h3>
              <ul className="space-y-3">
                {recipe.ingredients.map((ingredient, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-yellow-400 rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-gray-300">{ingredient}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Nutrition */}
            <div>
              <h3 className="text-2xl font-bold text-white mb-6">Nährwerte pro Portion</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-800/50 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-yellow-400">{recipe.nutrition.calories}</div>
                  <div className="text-sm text-gray-400">kcal</div>
                </div>
                <div className="bg-gray-800/50 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-orange-500">{recipe.nutrition.protein}g</div>
                  <div className="text-sm text-gray-400">Protein</div>
                </div>
                <div className="bg-gray-800/50 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-yellow-400">{recipe.nutrition.carbs}g</div>
                  <div className="text-sm text-gray-400">Kohlenhydrate</div>
                </div>
                <div className="bg-gray-800/50 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-orange-500">{recipe.nutrition.fat}g</div>
                  <div className="text-sm text-gray-400">Fett</div>
                </div>
              </div>
            </div>
          </div>

          {/* Instructions */}
          <div className="mt-12">
            <h3 className="text-2xl font-bold text-white mb-6">Zubereitung</h3>
            <div className="space-y-6">
              {recipe.instructions.map((instruction) => (
                <div key={instruction.step} className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 gradient-yellow-orange rounded-full flex items-center justify-center text-black font-bold text-sm">
                    {instruction.step}
                  </div>
                  <div className="flex-1">
                    <p className="text-gray-300 mb-2">{instruction.instruction}</p>
                    {instruction.function && instruction.temperature && instruction.time && 
                     instruction.temperature !== "0" && instruction.time !== "0" && (
                      <div className="flex flex-wrap gap-2 text-sm">
                        <span className="bg-yellow-400/20 text-yellow-400 px-3 py-1 rounded-full">
                          {instruction.function}
                        </span>
                        <span className="bg-orange-500/20 text-orange-500 px-3 py-1 rounded-full">
                          {instruction.temperature}°C
                        </span>
                        <span className="bg-gray-600/50 text-gray-300 px-3 py-1 rounded-full">
                          {instruction.time} Min
                        </span>
                        {instruction.zone && (
                          <span className="bg-yellow-400/20 text-yellow-400 px-3 py-1 rounded-full">
                            Zone {instruction.zone}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Profi Tip */}
          <div className="mt-12 p-6 bg-gradient-to-r from-yellow-400/10 to-orange-500/10 rounded-xl border border-yellow-400/20">
            <h4 className="text-xl font-bold text-white mb-3 flex items-center gap-2">
              <svg className="w-6 h-6 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
              Profi-Tipp
            </h4>
            <p className="text-gray-300">{recipe.profiTip}</p>
          </div>

          {/* Disclaimer */}
          <div className="mt-8 p-4 bg-gray-800/30 rounded-lg">
            <p className="text-sm text-gray-400 text-center">
              Diese Rezeptidee wurde gerade von unserer KI erstellt. Sie soll dich inspirieren! Für 100 % getestete Techniken und Rezepte schau immer in dein Megarezeptbuch.
            </p>
          </div>

          {/* Action buttons */}
          <div className="mt-12 flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={onGenerateNew}
              className="px-8 py-3 text-lg font-semibold text-black btn-primary rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 glow-yellow"
            >
              Neue Idee generieren
            </button>
            <button
              onClick={onChangeIngredients}
              className="px-8 py-3 text-lg font-semibold text-gray-300 border border-gray-600 rounded-full hover:border-yellow-400 hover:text-white transition-all duration-300"
            >
              Zutaten ändern
            </button>
          </div>
        </div>
      </div>
    </section>
  );
} 