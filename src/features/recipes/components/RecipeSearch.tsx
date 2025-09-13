"use client";
import { useEffect, useMemo, useState } from 'react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { searchRecipesByQuery, randomRecipes } from '../api';
import { useFavorites } from '../favorites';
import { usePantryStore } from '@/features/pantry/store';
import type { Recipe } from '@/lib/types';
import { 
  MagnifyingGlassIcon, 
  HeartIcon, 
  ArrowTopRightOnSquareIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolid } from '@heroicons/react/24/solid';
import Image from 'next/image';

function missingFromPantry(recipe: Recipe, pantryNames: string[]) {
  const set = new Set(pantryNames.map((n) => n.toLowerCase()));
  const missing = recipe.ingredients
    .filter((i) => !set.has(i.name.toLowerCase()))
    .map((i) => i.name);
  return missing;
}

export function RecipeSearch() {
  // Don't create new arrays inside the zustand selector; it changes on every render.
  // Select items and derive pantry names with useMemo to keep references stable.
  const items = usePantryStore((s) => s.items);
  const pantry = useMemo(() => items.map((i) => i.name), [items]);
  const [q, setQ] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<Recipe[]>([]);
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    setLoading(true);
    randomRecipes().then((r) => {
      setResults(r);
      setLoading(false);
    });
  }, []);

  async function onSearch() {
    if (!q.trim()) return;
    setLoading(true);
    setHasSearched(true);
    const r = await searchRecipesByQuery(q);
    setResults(r);
    setLoading(false);
  }

  const decorated = useMemo(
    () =>
      results.map((r) => ({
        ...r,
        missingIngredients: missingFromPantry(r, pantry),
      })),
    [results, pantry],
  );
  const toggleFav = useFavorites((s) => s.toggle);
  const isFav = useFavorites((s) => s.isFav);

  return (
    <div className="space-y-6">
      {/* Search Section */}
      <Card className="bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border-indigo-500/20">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Input 
                id="q" 
                placeholder="Search for recipes (e.g., pasta, chicken, vegetarian)..." 
                value={q} 
                onChange={(e) => setQ(e.target.value)}
                leftIcon={<MagnifyingGlassIcon className="h-5 w-5" />}
                onKeyDown={(e) => e.key === 'Enter' && onSearch()}
              />
            </div>
            <Button 
              onClick={onSearch} 
              disabled={loading || !q.trim()}
              loading={loading}
              size="lg"
              className="sm:w-auto w-full"
            >
              {loading ? 'Searching...' : 'Search Recipes'}
            </Button>
          </div>
          {!hasSearched && (
            <p className="mt-4 text-sm text-gray-400 flex items-center gap-2">
              <SparklesIcon className="h-4 w-4" />
              Showing random recipes to get you started
            </p>
          )}
        </CardContent>
      </Card>

      {/* Results */}
      <div className="space-y-6">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <div className="h-48 bg-gray-700 rounded-t-2xl"></div>
                <CardContent className="p-6">
                  <div className="h-4 bg-gray-700 rounded mb-2"></div>
                  <div className="h-3 bg-gray-700 rounded w-2/3 mb-4"></div>
                  <div className="flex gap-2">
                    <div className="h-6 bg-gray-700 rounded-full w-16"></div>
                    <div className="h-6 bg-gray-700 rounded-full w-20"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : decorated.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {decorated.map((recipe) => (
              <Card key={recipe.id} className="group hover:shadow-xl transition-all duration-300 overflow-hidden">
                {recipe.image && (
                  <div className="relative h-48 overflow-hidden">
                    <Image
                      src={recipe.image}
                      alt={recipe.title}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                      priority={false}
                    />
                    <div className="absolute top-4 right-4">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => toggleFav(recipe)}
                        className="h-8 w-8 p-0 bg-black/50 hover:bg-black/70 backdrop-blur-sm"
                      >
                        {isFav(recipe.id) ? (
                          <HeartSolid className="h-4 w-4 text-red-400" />
                        ) : (
                          <HeartIcon className="h-4 w-4 text-white" />
                        )}
                      </Button>
                    </div>
                  </div>
                )}
                
                <CardContent className="p-6">
                  <div className="mb-4">
                    <h3 className="text-lg font-semibold text-white mb-2 line-clamp-2">
                      {recipe.title}
                    </h3>
                    
                    <div className="flex items-center gap-2 mb-3">
                      {recipe.missingIngredients && recipe.missingIngredients.length > 0 ? (
                        <Badge variant="warning" size="sm">
                          Missing {recipe.missingIngredients.length} ingredients
                        </Badge>
                      ) : (
                        <Badge variant="success" size="sm">
                          All ingredients available
                        </Badge>
                      )}
                    </div>
                    
                    {recipe.missingIngredients && recipe.missingIngredients.length > 0 && (
                      <div className="mb-4">
                        <p className="text-xs text-gray-400 mb-2">Missing ingredients:</p>
                        <div className="flex flex-wrap gap-1">
                          {recipe.missingIngredients.slice(0, 3).map((ingredient, index) => (
                            <Badge key={index} variant="default" size="sm">
                              {ingredient}
                            </Badge>
                          ))}
                          {recipe.missingIngredients.length > 3 && (
                            <Badge variant="default" size="sm">
                              +{recipe.missingIngredients.length - 3} more
                            </Badge>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(recipe.sourceUrl, '_blank')}
                      className="flex items-center gap-2"
                    >
                      <ArrowTopRightOnSquareIcon className="h-4 w-4" />
                      View Recipe
                    </Button>
                    
                    <Button
                      variant={isFav(recipe.id) ? 'primary' : 'secondary'}
                      size="sm"
                      onClick={() => toggleFav(recipe)}
                      className="flex items-center gap-2"
                    >
                      {isFav(recipe.id) ? (
                        <>
                          <HeartSolid className="h-4 w-4" />
                          Favorited
                        </>
                      ) : (
                        <>
                          <HeartIcon className="h-4 w-4" />
                          Save
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : hasSearched ? (
          <Card className="text-center py-12">
            <CardContent>
              <div className="mx-auto w-24 h-24 bg-gray-800 rounded-full flex items-center justify-center mb-4">
                <MagnifyingGlassIcon className="h-12 w-12 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-white mb-2">No recipes found</h3>
              <p className="text-gray-400 mb-6">Try searching with different keywords or browse our random suggestions</p>
              <Button 
                variant="primary" 
                onClick={() => {
                  setQ('');
                  setHasSearched(false);
                  setLoading(true);
                  randomRecipes().then((r) => {
                    setResults(r);
                    setLoading(false);
                  });
                }}
              >
                <SparklesIcon className="h-4 w-4 mr-2" />
                Show Random Recipes
              </Button>
            </CardContent>
          </Card>
        ) : null}
      </div>
    </div>
  );
}
