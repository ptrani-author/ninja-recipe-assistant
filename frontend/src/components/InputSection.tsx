import { RecipeFilters } from '@/types';

interface InputSectionProps {
  ingredients: string;
  setIngredients: (ingredients: string) => void;
  filters: RecipeFilters;
  setFilters: (filters: RecipeFilters) => void;
  onGenerate: () => void;
  disabled: boolean;
  rateLimitInfo?: { remaining: number; resetTime: string } | null;
}

export default function InputSection({
  ingredients,
  setIngredients,
  filters,
  setFilters,
  onGenerate,
  disabled,
  rateLimitInfo
}: InputSectionProps) {
  const filterOptions = {
    mealType: ['Frühstück', 'Mittagessen', 'Abendessen', 'Snack', 'Dessert'],
    style: ['Traditionell deutsch', 'Mediterran', 'Asiatisch leicht', 'Tex-Mex light'],
    diet: ['Vegetarisch', 'Low Carb', 'High Protein', 'Laktosefrei'],
    timeAvailable: ['<15 Min', '15–30 Min', '30–45 Min'],
    spiciness: ['mild', 'würzig', 'scharf'],
    budget: ['günstig', 'normal']
  };

  const handleFilterChange = (key: keyof RecipeFilters, value: string) => {
    setFilters({
      ...filters,
      [key]: filters[key] === value ? undefined : value
    });
  };

  return (
    <section className="py-20 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="glass rounded-2xl p-8 md:p-12">
          {/* Main question */}
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-8 text-white">
            Was hast du heute im Kühlschrank?
          </h2>
          
          {/* Rate limit info */}
          {rateLimitInfo && (
            <div className="mb-6 p-4 bg-yellow-400/10 border border-yellow-400/20 rounded-lg">
              <div className="flex items-center justify-center gap-2 text-yellow-400">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-sm">
                  {rateLimitInfo.remaining} Anfragen übrig • Reset: {rateLimitInfo.resetTime}
                </span>
              </div>
            </div>
          )}
          
          {/* Ingredients input */}
          <div className="mb-8">
            <textarea
              value={ingredients}
              onChange={(e) => setIngredients(e.target.value)}
              placeholder="Hähnchenbrust, Paprika, Zwiebel, Sahne …"
              className="w-full h-32 p-4 text-lg bg-gray-800 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:border-yellow-400 focus:outline-none transition-colors resize-none"
              disabled={disabled}
            />
          </div>

          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {/* Meal Type */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Mahlzeit</label>
              <select
                value={filters.mealType || ''}
                onChange={(e) => handleFilterChange('mealType', e.target.value)}
                className="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-yellow-400 focus:outline-none"
                disabled={disabled}
              >
                <option value="">Alle</option>
                {filterOptions.mealType.map(option => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </div>

            {/* Style */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Stil</label>
              <select
                value={filters.style || ''}
                onChange={(e) => handleFilterChange('style', e.target.value)}
                className="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-yellow-400 focus:outline-none"
                disabled={disabled}
              >
                <option value="">Alle</option>
                {filterOptions.style.map(option => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </div>

            {/* Diet */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Ernährungsweise</label>
              <select
                value={filters.diet || ''}
                onChange={(e) => handleFilterChange('diet', e.target.value)}
                className="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-yellow-400 focus:outline-none"
                disabled={disabled}
              >
                <option value="">Alle</option>
                {filterOptions.diet.map(option => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </div>

            {/* Time Available */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Zeit verfügbar</label>
              <select
                value={filters.timeAvailable || ''}
                onChange={(e) => handleFilterChange('timeAvailable', e.target.value)}
                className="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-yellow-400 focus:outline-none"
                disabled={disabled}
              >
                <option value="">Alle</option>
                {filterOptions.timeAvailable.map(option => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </div>

            {/* Spiciness */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Schärfegrad</label>
              <select
                value={filters.spiciness || ''}
                onChange={(e) => handleFilterChange('spiciness', e.target.value)}
                className="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-yellow-400 focus:outline-none"
                disabled={disabled}
              >
                <option value="">Alle</option>
                {filterOptions.spiciness.map(option => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </div>

            {/* Budget */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Budget</label>
              <select
                value={filters.budget || ''}
                onChange={(e) => handleFilterChange('budget', e.target.value)}
                className="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-yellow-400 focus:outline-none"
                disabled={disabled}
              >
                <option value="">Alle</option>
                {filterOptions.budget.map(option => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Generate button */}
          <div className="text-center">
            <button
              onClick={onGenerate}
              disabled={disabled || !ingredients.trim()}
              className="px-12 py-4 text-xl font-semibold text-black btn-primary rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none glow-yellow"
            >
              {disabled ? 'Generiere...' : 'Generieren'}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
} 