"use client";
import { ItemForm } from '@/features/pantry/components/ItemForm';
import { PantryList } from '@/features/pantry/components/PantryList';
import { useState, useMemo } from 'react';
import { useIsClient } from '@/lib/hooks/useIsClient';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { usePantryStore } from '@/features/pantry/store';
import { pushPantry } from '@/features/pantry/sync';
import { useCategoryStore } from '@/features/categories/store';
import { Modal } from '@/components/ui/Modal';
import { useToast } from '@/components/ui/Toast';
import { 
  ArchiveBoxIcon, 
  PlusIcon, 
  CloudArrowUpIcon,
  ChartBarIcon,
  ExclamationTriangleIcon,
  Squares2X2Icon,
  ListBulletIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  XMarkIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';

export default function PantryPage() {
  const isClient = useIsClient();
  const [notice, setNotice] = useState<string | null>(null);
  const [dupOpen, setDupOpen] = useState(false);
  const [quickOpen, setQuickOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'cards' | 'rows'>('cards');
  
  // Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'low-stock' | 'in-stock'>('all');
  const [expiryFilter, setExpiryFilter] = useState<'all' | 'expiring' | 'expired'>('all');
  
  const toast = useToast((s) => s.push);
  const items = usePantryStore((s) => s.items);
  const categories = useCategoryStore((s) => s.categories);
  // IMPORTANT: don't call functions inside the zustand selector; it returns a new array each render and causes an infinite re-render loop.
  // Instead, select the function reference and invoke it outside the selector so the selected value is stable.
  const lowStockIds = usePantryStore((s) => s.lowStockIds);
  const itemsAll = usePantryStore((s) => s.items);
  const [editOpen, setEditOpen] = useState(false);
  const [editItem, setEditItem] = useState<import('@/lib/types').PantryItem | null>(null);

  async function onSync() {
    const res = await pushPantry(items);
    setNotice(res.ok ? `Synced ${res.count} items.` : 'Sync failed.');
  }

  const stats = {
    total: items.length,
    lowStock: lowStockIds().length,
    expiring: items.filter(item => {
      if (!item.expires_at) return false;
      const now = Date.now();
      const exp = new Date(item.expires_at).getTime();
      const daysUntilExpiry = Math.ceil((exp - now) / (1000 * 60 * 60 * 24));
      return daysUntilExpiry <= 3 && daysUntilExpiry >= 0;
    }).length,
    expired: items.filter(item => {
      if (!item.expires_at) return false;
      const now = Date.now();
      const exp = new Date(item.expires_at).getTime();
      return exp < now; // Already expired
    }).length,
  };

  // Filter items based on active filters
  const filteredItems = useMemo(() => {
    let filtered = items;

    // Search filter
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(item => {
        // Find category name for this item
        const category = categories.find(cat => cat.id === item.category_id);
        const categoryName = category ? category.name : 'Uncategorized';
        
        return item.name.toLowerCase().includes(search) ||
               categoryName.toLowerCase().includes(search);
      });
    }

    // Category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(item => {
        const category = categories.find(cat => cat.id === item.category_id);
        const categoryName = category ? category.name : 'Uncategorized';
        return categoryName === selectedCategory;
      });
    }

    // Status filter
    if (statusFilter !== 'all') {
      const lowStockItemIds = lowStockIds();
      if (statusFilter === 'low-stock') {
        filtered = filtered.filter(item => lowStockItemIds.includes(item.id));
      } else if (statusFilter === 'in-stock') {
        filtered = filtered.filter(item => !lowStockItemIds.includes(item.id));
      }
    }

    // Expiry filter
    if (expiryFilter !== 'all') {
      if (expiryFilter === 'expiring') {
        filtered = filtered.filter(item => {
          if (!item.expires_at) return false;
          const now = Date.now();
          const exp = new Date(item.expires_at).getTime();
          const daysUntilExpiry = Math.ceil((exp - now) / (1000 * 60 * 60 * 24));
          return daysUntilExpiry <= 3 && daysUntilExpiry >= 0;
        });
      } else if (expiryFilter === 'expired') {
        filtered = filtered.filter(item => {
          if (!item.expires_at) return false;
          const now = Date.now();
          const exp = new Date(item.expires_at).getTime();
          return exp < now;
        });
      }
    }

    return filtered;
  }, [items, searchTerm, selectedCategory, statusFilter, expiryFilter, lowStockIds, categories]);

  // Update stats to reflect filtered items
  const filteredStats = {
    total: filteredItems.length,
    lowStock: filteredItems.filter(item => lowStockIds().includes(item.id)).length,
    expiring: filteredItems.filter(item => {
      if (!item.expires_at) return false;
      const now = Date.now();
      const exp = new Date(item.expires_at).getTime();
      const daysUntilExpiry = Math.ceil((exp - now) / (1000 * 60 * 60 * 24));
      return daysUntilExpiry <= 3 && daysUntilExpiry >= 0;
    }).length,
    expired: filteredItems.filter(item => {
      if (!item.expires_at) return false;
      const now = Date.now();
      const exp = new Date(item.expires_at).getTime();
      return exp < now;
    }).length,
  };

  // Check if any filters are active
  const hasActiveFilters = searchTerm || selectedCategory !== 'all' || statusFilter !== 'all' || expiryFilter !== 'all';

  // Category options for filter dropdown
  const categoryOptions = [
    { value: 'all', label: 'All Categories' },
    ...categories.map(cat => ({ value: cat.name, label: cat.name })),
    { value: 'Uncategorized', label: 'Uncategorized' }
  ];

  if (!isClient) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900" />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl">
                <ArchiveBoxIcon className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">Smart Pantry</h1>
                <p className="text-gray-400">Manage your ingredients intelligently</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="flex items-center bg-gray-800 rounded-lg p-1">
                <Button
                  onClick={() => setViewMode('cards')}
                  variant={viewMode === 'cards' ? 'primary' : 'ghost'}
                  size="sm"
                  className="h-10 w-10 p-0"
                >
                  <Squares2X2Icon className="h-5 w-5" />
                </Button>
                <Button
                  onClick={() => setViewMode('rows')}
                  variant={viewMode === 'rows' ? 'primary' : 'ghost'}
                  size="sm"
                  className="h-10 w-10 p-0"
                >
                  <ListBulletIcon className="h-5 w-5" />
                </Button>
              </div>
              <Button
                onClick={onSync}
                variant="outline"
                size="sm"
                className="hidden sm:flex"
              >
                <CloudArrowUpIcon className="h-4 w-4 mr-2" />
                Sync
              </Button>
              <Button
                onClick={() => setQuickOpen(true)}
                variant="primary"
                size="sm"
              >
                <PlusIcon className="h-4 w-4 mr-2" />
                Add Item
              </Button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border-blue-500/20">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-blue-300 font-medium">Total Items</p>
                    <p className="text-2xl font-bold text-white">{hasActiveFilters ? filteredStats.total : stats.total}</p>
                    {hasActiveFilters && <p className="text-xs text-blue-400">of {stats.total} total</p>}
                  </div>
                  <ArchiveBoxIcon className="h-8 w-8 text-blue-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-yellow-500/10 to-yellow-600/5 border-yellow-500/20">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-yellow-300 font-medium">Low Stock</p>
                    <p className="text-2xl font-bold text-white">{hasActiveFilters ? filteredStats.lowStock : stats.lowStock}</p>
                    {hasActiveFilters && <p className="text-xs text-yellow-400">of {stats.lowStock} total</p>}
                  </div>
                  <ExclamationTriangleIcon className="h-8 w-8 text-yellow-400" />
                </div>
              </CardContent>
            </Card>

            <div 
              className="cursor-pointer" 
              onClick={() => {
                setExpiryFilter('expiring');
                setSearchTerm('');
                setSelectedCategory('all');
                setStatusFilter('all');
              }}
            >
              <Card className="bg-gradient-to-br from-orange-500/10 to-orange-600/5 border-orange-500/20 hover:bg-orange-500/15 transition-all duration-200">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-orange-300 font-medium">Expiring Soon</p>
                      <p className="text-2xl font-bold text-white">{hasActiveFilters ? filteredStats.expiring : stats.expiring}</p>
                      {hasActiveFilters && <p className="text-xs text-orange-400">of {stats.expiring} total</p>}
                    </div>
                    <ChartBarIcon className="h-8 w-8 text-orange-400" />
                  </div>
                </CardContent>
              </Card>
            </div>

            <div 
              className="cursor-pointer" 
              onClick={() => {
                setExpiryFilter('expired');
                setSearchTerm('');
                setSelectedCategory('all');
                setStatusFilter('all');
              }}
            >
              <Card className="bg-gradient-to-br from-red-500/10 to-red-600/5 border-red-500/20 hover:bg-red-500/15 transition-all duration-200">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-red-300 font-medium">Expired</p>
                      <p className="text-2xl font-bold text-white">{hasActiveFilters ? filteredStats.expired : stats.expired}</p>
                      {hasActiveFilters && <p className="text-xs text-red-400">of {stats.expired} total</p>}
                    </div>
                    <XCircleIcon className="h-8 w-8 text-red-400" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {notice && (
            <div className="mb-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
              <p className="text-blue-300 text-sm" role="status">{notice}</p>
            </div>
          )}

          {/* Filter Controls */}
          <Card className="mb-6">
            <CardContent className="p-4">
              <div className="flex items-center gap-4 flex-wrap">
                <div className="flex items-center gap-2">
                  <FunnelIcon className="h-5 w-5 text-gray-400" />
                  <span className="text-sm font-medium text-white">Filters:</span>
                </div>
                
                {/* Search Input */}
                <div className="relative flex-1 min-w-[200px] max-w-[300px]">
                  <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="Search items..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>

                {/* Category Filter */}
                <div className="min-w-[180px]">
                  <Select
                    id="category-filter"
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    options={categoryOptions}
                  />
                </div>

                {/* Status Filter */}
                <div className="flex items-center gap-3">
                  <Button
                    onClick={() => setStatusFilter('all')}
                    variant={statusFilter === 'all' ? 'primary' : 'ghost'}
                    size="md"
                    className="h-10 px-6 text-sm font-medium"
                  >
                    All
                  </Button>
                  <Button
                    onClick={() => setStatusFilter('low-stock')}
                    variant={statusFilter === 'low-stock' ? 'primary' : 'ghost'}
                    size="md"
                    className="h-10 px-6 text-sm font-medium"
                  >
                    Low Stock
                  </Button>
                  <Button
                    onClick={() => setStatusFilter('in-stock')}
                    variant={statusFilter === 'in-stock' ? 'primary' : 'ghost'}
                    size="md"
                    className="h-10 px-6 text-sm font-medium"
                  >
                    In Stock
                  </Button>
                </div>

                {/* Clear Filters */}
                {hasActiveFilters && (
                  <Button
                    onClick={() => {
                      setSearchTerm('');
                      setSelectedCategory('all');
                      setStatusFilter('all');
                      setExpiryFilter('all');
                    }}
                    variant="ghost"
                    size="sm"
                    className="text-gray-400 hover:text-white"
                  >
                    <XMarkIcon className="h-4 w-4 mr-1" />
                    Clear
                  </Button>
                )}
              </div>

              {/* Active Filters Summary */}
              {hasActiveFilters && (
                <div className="mt-3 pt-3 border-t border-gray-700">
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <span>Showing {filteredItems.length} of {items.length} items</span>
                    {searchTerm && <span>• Search: &ldquo;{searchTerm}&rdquo;</span>}
                    {selectedCategory !== 'all' && <span>• Category: {selectedCategory}</span>}
                    {statusFilter !== 'all' && <span>• Status: {statusFilter === 'low-stock' ? 'Low Stock' : 'In Stock'}</span>}
                    {expiryFilter !== 'all' && <span>• Expiry: {expiryFilter === 'expiring' ? 'Expiring Soon' : 'Expired'}</span>}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

  {/* Add Item now handled exclusively via modal below */}

        {/* Pantry List */}
        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold text-white">Your Pantry Items</h2>
            <p className="text-gray-400 text-sm">Manage your ingredients and track their status</p>
          </CardHeader>
          <CardContent>
            <PantryList 
              viewMode={viewMode}
              items={filteredItems}
              onAddFirstItem={() => setQuickOpen(true)}
              onEditItem={(id) => {
                const target = itemsAll.find((i) => i.id === id) ?? null;
                setEditItem(target);
                setEditOpen(true);
              }}
            />
          </CardContent>
        </Card>

        {/* Modals */}
        <Modal open={dupOpen} title="Duplicate Item Detected">
          <div className="space-y-4">
            <p className="text-gray-300">
              You added an item with the same name. You can merge quantities or keep both items.
            </p>
            <div className="flex gap-3 justify-end">
              <Button variant="outline" onClick={() => setDupOpen(false)}>
                Keep Both
              </Button>
              <Button variant="primary" onClick={() => setDupOpen(false)}>
                Merge Quantities
              </Button>
            </div>
          </div>
        </Modal>

        <Modal open={quickOpen} title="Add Item">
          <ItemForm 
            categories={categories} 
            onCreated={() => {
              setQuickOpen(false);
              toast({ type: 'success', message: 'Item added successfully!' });
            }}
            onCancel={() => setQuickOpen(false)}
          />
        </Modal>

        {/* Edit modal */}
        <Modal open={editOpen} title="Edit Item">
          <ItemForm
            categories={categories}
            initial={editItem ?? undefined}
            mode="edit"
            onSaved={() => {
              setEditOpen(false);
              toast({ type: 'success', message: 'Item updated.' });
            }}
            onCancel={() => setEditOpen(false)}
          />
        </Modal>
      </div>

      {/* Floating Action Button for Mobile */}
      <button
        aria-label="Quick add item"
        className="md:hidden fixed bottom-20 right-4 h-14 w-14 rounded-full bg-gradient-to-br from-orange-500 to-red-500 text-white shadow-xl shadow-orange-500/30 active:translate-y-px transition-transform duration-200 hover:scale-105"
        onClick={() => setQuickOpen(true)}
      >
        <PlusIcon className="h-6 w-6 mx-auto" />
      </button>
    </div>
  );
}
