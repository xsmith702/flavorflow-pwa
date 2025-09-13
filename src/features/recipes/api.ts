import type { Recipe } from '@/lib/types';

type Meal = {
  idMeal: string;
  strMeal: string;
  strMealThumb?: string;
  strSource?: string;
  strYoutube?: string;
  [k: `strIngredient${number}`]: string | undefined;
};

const BASE = process.env.NEXT_PUBLIC_RECIPE_API_BASE || 'https://www.themealdb.com/api/json/v1/1';

function normalize(meal: Meal): Recipe {
  const ingredients: { name: string }[] = [];
  for (let i = 1; i <= 20; i++) {
    const name = meal[`strIngredient${i}`];
    if (name) ingredients.push({ name: name.toLowerCase() });
  }
  return {
    id: meal.idMeal,
    title: meal.strMeal,
    image: meal.strMealThumb,
    sourceUrl: meal.strSource || meal.strYoutube,
    ingredients,
  };
}

export async function searchRecipesByQuery(q: string): Promise<Recipe[]> {
  const res = await fetch(`${BASE}/search.php?s=${encodeURIComponent(q)}`);
  if (!res.ok) return [];
  const data = await res.json();
  return (data.meals || []).map(normalize);
}

export async function randomRecipes(): Promise<Recipe[]> {
  const res = await fetch(`${BASE}/random.php`);
  if (!res.ok) return [];
  const data = await res.json();
  return (data.meals || []).map(normalize);
}
