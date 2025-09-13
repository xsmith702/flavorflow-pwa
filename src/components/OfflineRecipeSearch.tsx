"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { useOfflineStorage, useOnlineStatus, type OfflineRecipe } from '@/lib/offline-storage';
import { searchRecipesByQuery } from '@/features/recipes/api';
import type { Recipe } from '@/lib/types';
import { 
  MagnifyingGlassIcon, 
  WifiIcon,
  ExclamationTriangleIcon,
  CloudIcon
} from '@heroicons/react/24/outline';
import Image from 'next/image';

interface OfflineRecipeSearchProps {
  onRecipeSelect?: (recipe: Recipe | OfflineRecipe) => void;
}

export function OfflineRecipeSearch({ onRecipeSelect }: OfflineRecipeSearchProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<(Recipe | OfflineRecipe)[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchMode, setSearchMode] = useState<'online' | 'offline'>('online');
  const { storage, initStorage } = useOfflineStorage();
  const isOnline = useOnlineStatus();

  useEffect(() => {
    initStorage();
  }, [initStorage]);

  useEffect(() => {
    // Auto-switch to offline mode when disconnected
    if (!isOnline && searchMode === 'online') {
      setSearchMode('offline');
    }
  }, [isOnline, searchMode]);

  const handleSearch = async () => {
    if (!query.trim()) return;
    
    setLoading(true);
    try {
      if (searchMode === 'online' && isOnline) {
        // Online search
        const onlineResults = await searchRecipesByQuery(query);
        setResults(onlineResults);
        
        // Cache results for offline use
        for (const recipe of onlineResults) {
          try {
            await storage.saveRecipe({
              id: recipe.id,
              title: recipe.title,
              image: recipe.image,
              instructions: '', // Recipe type doesn't have instructions
              ingredients: recipe.ingredients?.map((ing: { name: string }) => ing.name) || [],
              category: '', // Recipe type doesn't have category
              area: '', // Recipe type doesn't have area
              source: recipe.sourceUrl,
              video: '', // Recipe type doesn't have video
              tags: [], // Recipe type doesn't have tags
              cached_at: Date.now(),
            });
          } catch (error) {
            console.warn('Failed to cache recipe:', error);
          }
        }
      } else {
        // Offline search
        const offlineResults = await storage.searchRecipes(query);
        setResults(offlineResults);
      }
    } catch (error) {
      console.error('Search failed:', error);
      // Fallback to offline search if online search fails
      if (searchMode === 'online') {
        try {
          const offlineResults = await storage.searchRecipes(query);
          setResults(offlineResults);
          setSearchMode('offline');
        } catch (offlineError) {
          console.error('Offline search also failed:', offlineError);
          setResults([]);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const loadCachedRecipes = async () => {
    try {
      const cachedRecipes = await storage.getAllRecipes();
      setResults(cachedRecipes);
    } catch (error) {
      console.error('Failed to load cached recipes:', error);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const toggleSearchMode = () => {
    setSearchMode(searchMode === 'online' ? 'offline' : 'online');
    setResults([]);
  };

  return (
    <div className="space-y-4">
      {/* Search Controls */}
      <div className="space-y-3">
        <div className="flex space-x-2">
          <div className="flex-1">
            <Input
              type="text"
              placeholder={`Search recipes ${searchMode === 'offline' ? '(offline)' : '(online)'}...`}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyPress={handleKeyPress}
              className="w-full"
            />
          </div>
          <Button
            onClick={handleSearch}
            disabled={loading || !query.trim()}
            className="px-4"
          >
            {loading ? (
              <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
            ) : (
              <MagnifyingGlassIcon className="h-4 w-4" />
            )}
          </Button>
        </div>

        {/* Status Bar */}
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center space-x-2">
            {isOnline ? (
              <div className="flex items-center space-x-1 text-green-600">
                <WifiIcon className="h-4 w-4" />
                <span>Online</span>
              </div>
            ) : (
              <div className="flex items-center space-x-1 text-orange-600">
                <ExclamationTriangleIcon className="h-4 w-4" />
                <span>Offline</span>
              </div>
            )}
            
            <Badge variant={searchMode === 'online' ? 'default' : 'info'}>
              {searchMode === 'online' ? 'Online Search' : 'Offline Search'}
            </Badge>
          </div>

          <div className="flex space-x-2">
            {isOnline && (
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleSearchMode}
                className="text-xs"
              >
                {searchMode === 'online' ? (
                  <>
                    <CloudIcon className="h-3 w-3 mr-1" />
                    Search Offline
                  </>
                ) : (
                  <>
                    <WifiIcon className="h-3 w-3 mr-1" />
                    Search Online
                  </>
                )}
              </Button>
            )}
            
            <Button
              variant="ghost"
              size="sm"
              onClick={loadCachedRecipes}
              className="text-xs"
            >
              <CloudIcon className="h-3 w-3 mr-1" />
              View Cached ({results.length})
            </Button>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {results.map((recipe) => (
          <div
            key={recipe.id}
            className="cursor-pointer"
            onClick={() => onRecipeSelect?.(recipe)}
          >
            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
              <div className="space-y-3">
                {/* Recipe Image */}
                <div className="relative aspect-video rounded-lg overflow-hidden bg-gray-100">
                  {recipe.image ? (
                    <Image
                      src={recipe.image}
                      alt={recipe.title}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      No Image
                    </div>
                  )}
                </div>

                {/* Recipe Info */}
                <div>
                  <h3 className="font-semibold text-sm line-clamp-2 mb-2">
                    {recipe.title}
                  </h3>
                  
                  <div className="flex flex-wrap gap-1 mb-2">
                    {'category' in recipe && recipe.category && (
                      <Badge variant="info" className="text-xs">
                        {recipe.category}
                      </Badge>
                    )}
                    {'area' in recipe && recipe.area && (
                      <Badge variant="default" className="text-xs">
                        {recipe.area}
                      </Badge>
                    )}
                    {'cached_at' in recipe && (
                      <Badge variant="success" className="text-xs">
                        Cached
                      </Badge>
                    )}
                  </div>

                  {/* Ingredients Preview */}
                  {'ingredients' in recipe && recipe.ingredients && (
                    <div className="text-xs text-gray-500">
                      {recipe.ingredients.slice(0, 3).join(', ')}
                      {recipe.ingredients.length > 3 && '...'}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        ))}
      </div>

      {/* Empty State */}
      {results.length === 0 && !loading && (
        <div className="text-center py-12 text-gray-500">
          <MagnifyingGlassIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>
            {query 
              ? `No recipes found for "${query}"`
              : 'Search for recipes or view cached ones'
            }
          </p>
          {!isOnline && (
            <p className="text-sm mt-2">
              You&apos;re offline. Showing cached recipes only.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
