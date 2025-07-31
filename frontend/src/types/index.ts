export interface RecipeFilters {
  mealType?: 'Frühstück' | 'Mittagessen' | 'Abendessen' | 'Snack' | 'Dessert';
  style?: 'Traditionell deutsch' | 'Mediterran' | 'Asiatisch leicht' | 'Tex-Mex light';
  diet?: 'Vegetarisch' | 'Low Carb' | 'High Protein' | 'Laktosefrei';
  timeAvailable?: '<15 Min' | '15–30 Min' | '30–45 Min';
  spiciness?: 'mild' | 'würzig' | 'scharf';
  budget?: 'günstig' | 'normal';
}

export interface RecipeInstruction {
  step: number;
  instruction: string;
  function?: 'Air Fry' | 'Max Crisp' | 'Roast' | 'Bake' | 'Reheat' | 'Dehydrate';
  temperature?: string;
  time?: string;
  zone?: '1' | '2' | 'beide';
}

export interface Nutrition {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export interface Recipe {
  title: string;
  portions: number;
  totalTime: string;
  ingredients: string[];
  instructions: RecipeInstruction[];
  profiTip: string;
  nutrition: Nutrition;
}

export interface ApiResponse {
  success?: boolean;
  error?: string;
  recipe?: Recipe;
} 