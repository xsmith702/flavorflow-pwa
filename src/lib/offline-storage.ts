"use client";

import { useState, useEffect } from 'react';

// IndexedDB utilities for offline recipe storage
const DB_NAME = 'FlavorFlowDB';
const DB_VERSION = 1;
const RECIPE_STORE = 'recipes';
const FAVORITES_STORE = 'favorites';

export interface OfflineRecipe {
  id: string;
  title: string;
  image?: string;
  instructions?: string;
  ingredients?: string[];
  category?: string;
  area?: string;
  source?: string;
  video?: string;
  tags?: string[];
  cached_at: number;
}

export interface OfflineFavorite {
  id: string;
  recipe_id: string;
  title: string;
  image?: string;
  source_url?: string;
  cached_at: number;
}

class OfflineStorage {
  private db: IDBDatabase | null = null;

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => {
        reject(new Error('Failed to open IndexedDB'));
      };

      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Create recipes store
        if (!db.objectStoreNames.contains(RECIPE_STORE)) {
          const recipeStore = db.createObjectStore(RECIPE_STORE, { keyPath: 'id' });
          recipeStore.createIndex('title', 'title', { unique: false });
          recipeStore.createIndex('category', 'category', { unique: false });
          recipeStore.createIndex('cached_at', 'cached_at', { unique: false });
        }

        // Create favorites store
        if (!db.objectStoreNames.contains(FAVORITES_STORE)) {
          const favStore = db.createObjectStore(FAVORITES_STORE, { keyPath: 'id' });
          favStore.createIndex('recipe_id', 'recipe_id', { unique: false });
          favStore.createIndex('cached_at', 'cached_at', { unique: false });
        }
      };
    });
  }

  private async ensureDB(): Promise<IDBDatabase> {
    if (!this.db) {
      await this.init();
    }
    if (!this.db) {
      throw new Error('Database not initialized');
    }
    return this.db;
  }

  // Recipe operations
  async saveRecipe(recipe: OfflineRecipe): Promise<void> {
    const db = await this.ensureDB();
    const transaction = db.transaction([RECIPE_STORE], 'readwrite');
    const store = transaction.objectStore(RECIPE_STORE);
    
    return new Promise((resolve, reject) => {
      const request = store.put({ ...recipe, cached_at: Date.now() });
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async getRecipe(id: string): Promise<OfflineRecipe | null> {
    const db = await this.ensureDB();
    const transaction = db.transaction([RECIPE_STORE], 'readonly');
    const store = transaction.objectStore(RECIPE_STORE);
    
    return new Promise((resolve, reject) => {
      const request = store.get(id);
      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  }

  async getAllRecipes(): Promise<OfflineRecipe[]> {
    const db = await this.ensureDB();
    const transaction = db.transaction([RECIPE_STORE], 'readonly');
    const store = transaction.objectStore(RECIPE_STORE);
    
    return new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async searchRecipes(query: string): Promise<OfflineRecipe[]> {
    const recipes = await this.getAllRecipes();
    const lowercaseQuery = query.toLowerCase();
    
    return recipes.filter(recipe => 
      recipe.title.toLowerCase().includes(lowercaseQuery) ||
      recipe.category?.toLowerCase().includes(lowercaseQuery) ||
      recipe.area?.toLowerCase().includes(lowercaseQuery) ||
      recipe.ingredients?.some(ingredient => 
        ingredient.toLowerCase().includes(lowercaseQuery)
      )
    );
  }

  async deleteRecipe(id: string): Promise<void> {
    const db = await this.ensureDB();
    const transaction = db.transaction([RECIPE_STORE], 'readwrite');
    const store = transaction.objectStore(RECIPE_STORE);
    
    return new Promise((resolve, reject) => {
      const request = store.delete(id);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  // Favorites operations
  async saveFavorite(favorite: OfflineFavorite): Promise<void> {
    const db = await this.ensureDB();
    const transaction = db.transaction([FAVORITES_STORE], 'readwrite');
    const store = transaction.objectStore(FAVORITES_STORE);
    
    return new Promise((resolve, reject) => {
      const request = store.put({ ...favorite, cached_at: Date.now() });
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async getFavorites(): Promise<OfflineFavorite[]> {
    const db = await this.ensureDB();
    const transaction = db.transaction([FAVORITES_STORE], 'readonly');
    const store = transaction.objectStore(FAVORITES_STORE);
    
    return new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async deleteFavorite(id: string): Promise<void> {
    const db = await this.ensureDB();
    const transaction = db.transaction([FAVORITES_STORE], 'readwrite');
    const store = transaction.objectStore(FAVORITES_STORE);
    
    return new Promise((resolve, reject) => {
      const request = store.delete(id);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  // Cleanup old cached data (older than 7 days)
  async cleanupOldData(): Promise<void> {
    const sevenDaysAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
    
    const db = await this.ensureDB();
    const transaction = db.transaction([RECIPE_STORE, FAVORITES_STORE], 'readwrite');
    
    // Clean recipes
    const recipeStore = transaction.objectStore(RECIPE_STORE);
    const recipeIndex = recipeStore.index('cached_at');
    const recipeRequest = recipeIndex.openCursor(IDBKeyRange.upperBound(sevenDaysAgo));
    
    recipeRequest.onsuccess = (event) => {
      const cursor = (event.target as IDBRequest).result;
      if (cursor) {
        cursor.delete();
        cursor.continue();
      }
    };

    // Clean favorites (keep these longer - 30 days)
    const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
    const favStore = transaction.objectStore(FAVORITES_STORE);
    const favIndex = favStore.index('cached_at');
    const favRequest = favIndex.openCursor(IDBKeyRange.upperBound(thirtyDaysAgo));
    
    favRequest.onsuccess = (event) => {
      const cursor = (event.target as IDBRequest).result;
      if (cursor) {
        cursor.delete();
        cursor.continue();
      }
    };
  }

  // Get storage usage info
  async getStorageInfo(): Promise<{ recipes: number; favorites: number }> {
    const recipes = await this.getAllRecipes();
    const favorites = await this.getFavorites();
    
    return {
      recipes: recipes.length,
      favorites: favorites.length,
    };
  }
}

// Create singleton instance
export const offlineStorage = new OfflineStorage();

// Hook for React components
export function useOfflineStorage() {
  const initStorage = async () => {
    try {
      await offlineStorage.init();
      console.log('Offline storage initialized');
    } catch (error) {
      console.error('Failed to initialize offline storage:', error);
    }
  };

  return {
    storage: offlineStorage,
    initStorage,
  };
}

// Utility to check if we're online
export function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOnline;
}
