"use client";

import { useState, useMemo } from 'react';
import { RecipeSearch } from '@/features/recipes/components/RecipeSearch';
import { BookOpenIcon, PlusCircleIcon } from '@heroicons/react/24/outline';
import { useIsClient } from '@/lib/hooks/useIsClient';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { RecipeForm } from '@/features/recipes/components/RecipeForm';
import { useUserRecipes } from '@/features/recipes/userStore';
import type { Recipe } from '@/lib/types';
import { Card, CardContent } from '@/components/ui/Card';
import Image from 'next/image';
import { Badge } from '@/components/ui/Badge';
import { useToast } from '@/components/ui/Toast';

export default function RecipesPage() {
  const isClient = useIsClient();
  const [open, setOpen] = useState(false);
  const { push } = useToast();
  const computeMissing = useUserRecipes((s) => s.computeMissing);
  const recipes = useUserRecipes((s) => s.recipes);
  const yourRecipes = useMemo(() => recipes.map((r) => ({ ...r, missingIngredients: computeMissing(r) })), [recipes, computeMissing]);
  if (!isClient) {
    return <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900" />;
  }
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl">
              <BookOpenIcon className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Recipe Discovery</h1>
              <p className="text-gray-400">Find amazing recipes from your available ingredients</p>
            </div>
            <div className="ml-auto">
              <Button variant="primary" onClick={() => setOpen(true)} className="flex items-center gap-2">
                <PlusCircleIcon className="h-5 w-5" />
                Add Recipe
              </Button>
            </div>
          </div>
        </div>

        {/* Recipe Search */}
        <RecipeSearch />

        {/* Your Recipes */}
        {yourRecipes.length > 0 && (
          <div className="mt-10 space-y-4">
            <h2 className="text-2xl font-semibold text-white">Your Recipes</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {yourRecipes.map((recipe) => (
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
                    </div>
                  )}
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold text-white mb-2 line-clamp-2">{recipe.title}</h3>
                    <div className="flex items-center gap-2 mb-3">
                      {recipe.missingIngredients && recipe.missingIngredients.length > 0 ? (
                        <Badge variant="warning" size="sm">
                          Missing {recipe.missingIngredients.length} ingredients
                        </Badge>
                      ) : (
                        <Badge variant="success" size="sm">All ingredients available</Badge>
                      )}
                    </div>
                    {typeof recipe.cookingTime === 'number' && (
                      <p className="text-sm text-gray-400 mb-2">Cooking time: {recipe.cookingTime} min</p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        <Modal open={open} title="Add Recipe">
          <RecipeForm
            onSaved={(r: Recipe) => {
              setOpen(false);
              push({ type: 'success', message: `Saved recipe: ${r.title}` });
            }}
            onCancel={() => setOpen(false)}
          />
        </Modal>
      </div>
    </div>
  );
}
