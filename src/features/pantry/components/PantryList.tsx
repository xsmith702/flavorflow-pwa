"use client";
import { usePantryStore } from '../store';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { differenceInDays, isBefore } from 'date-fns';
import type { PantryItem } from '@/lib/types';
import { 
  MinusIcon, 
  PlusIcon, 
  TrashIcon,
  PencilSquareIcon,
  CalendarIcon,
  CubeIcon
} from '@heroicons/react/24/outline';

function Status({ expires_at, quantity, threshold }: { expires_at?: string | null; quantity: number; threshold?: number | null }) {
  const low = threshold != null ? quantity <= threshold : false;
  const expiring = expires_at ? differenceInDays(new Date(expires_at), new Date()) <= 3 : false;
  const expired = expires_at && isBefore(new Date(expires_at), new Date());
  
  if (expired) return <Badge variant="danger">Expired</Badge>;
  if (low) return <Badge variant="warning">Low Stock</Badge>;
  if (expiring) return <Badge variant="expiring">Expiring Soon</Badge>;
  return <Badge variant="success">Good</Badge>;
}

export function PantryList({ 
  viewMode = 'cards',
  onAddFirstItem, 
  onEditItem,
  items: filteredItems
}: { 
  viewMode?: 'cards' | 'rows';
  onAddFirstItem?: () => void; 
  onEditItem?: (id: string) => void;
  items?: PantryItem[];
}) {
  const { items: allItems, removeItem, updateItem } = usePantryStore();
  
  // Use filtered items if provided, otherwise use all items
  const items = filteredItems || allItems;
  
  if (!items.length) {
    return (
      <div className="text-center py-12">
        <div className="mx-auto w-24 h-24 bg-gray-800 rounded-full flex items-center justify-center mb-4">
          <CubeIcon className="h-12 w-12 text-gray-400" />
        </div>
        <h3 className="text-lg font-medium text-white mb-2">Your pantry is empty</h3>
        <p className="text-gray-400 mb-6">Start by adding some ingredients to track your inventory</p>
  <Button variant="primary" size="lg" onClick={onAddFirstItem}
  >
          <PlusIcon className="h-5 w-5 mr-2" />
          Add Your First Item
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {viewMode === 'rows' ? (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-300">Name</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-300">Quantity</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-300">Status</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-300">Expires</th>
                <th className="text-right py-3 px-4 text-sm font-medium text-gray-300">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id} className="border-b border-gray-800 hover:bg-gray-800/50 transition-colors">
                  <td className="py-3 px-4">
                    <span className="text-white font-medium">{item.name}</span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1 bg-gray-800 rounded-lg p-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => updateItem(item.id, { quantity: Math.max(0, item.quantity - 1) })}
                          className="h-8 w-8 p-0 hover:bg-gray-700"
                          title="Decrease quantity"
                        >
                          <MinusIcon className="h-4 w-4" />
                        </Button>
                        <span className="px-2 py-1 text-sm font-medium text-white min-w-[2.5rem] text-center">
                          {item.quantity}
                        </span>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => updateItem(item.id, { quantity: item.quantity + 1 })}
                          className="h-8 w-8 p-0 hover:bg-gray-700"
                          title="Increase quantity"
                        >
                          <PlusIcon className="h-4 w-4" />
                        </Button>
                      </div>
                      {item.unit && <span className="text-xs text-gray-400">{item.unit}</span>}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <Status 
                      expires_at={item.expires_at ?? undefined} 
                      quantity={item.quantity} 
                      threshold={item.low_stock_threshold ?? undefined} 
                    />
                  </td>
                  <td className="py-3 px-4">
                    {item.expires_at ? (
                      <span className="text-xs text-gray-400">
                        {isBefore(new Date(item.expires_at), new Date()) 
                          ? `Expired ${new Date(item.expires_at).toLocaleDateString()}`
                          : new Date(item.expires_at).toLocaleDateString()
                        }
                      </span>
                    ) : (
                      <span className="text-xs text-gray-500">—</span>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2 justify-end">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => onEditItem?.(item.id)}
                        className="h-10 w-10 p-0"
                        title="Edit item"
                      >
                        <PencilSquareIcon className="h-5 w-5" />
                      </Button>
                      <Button
                        size="sm"
                        variant="danger"
                        onClick={() => removeItem(item.id)}
                        className="h-10 w-10 p-0"
                        title="Delete item"
                      >
                        <TrashIcon className="h-5 w-5" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        // Cards view - Grid layout with individual cards
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((item) => (
            <Card key={item.id} className="hover:shadow-lg transition-all duration-200">
              <CardContent className="p-4">
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <h3 className="text-lg font-semibold text-white truncate">
                      {item.name}
                    </h3>
                    <Status 
                      expires_at={item.expires_at ?? undefined} 
                      quantity={item.quantity} 
                      threshold={item.low_stock_threshold ?? undefined} 
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                      <CubeIcon className="h-4 w-4" />
                      <span className="font-medium text-white">{item.quantity}</span>
                      {item.unit && <span>{item.unit}</span>}
                    </div>
                    
                    {item.expires_at && (
                      <div className="flex items-center gap-2 text-sm text-gray-400">
                        <CalendarIcon className="h-4 w-4" />
                        <span>
                          {isBefore(new Date(item.expires_at), new Date()) 
                            ? `Expired ${new Date(item.expires_at).toLocaleDateString()}`
                            : `Expires ${new Date(item.expires_at).toLocaleDateString()}`
                          }
                        </span>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center justify-between pt-2">
                    <div className="flex items-center gap-1 bg-gray-800 rounded-lg p-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => updateItem(item.id, { quantity: Math.max(0, item.quantity - 1) })}
                        className="h-8 w-8 p-0 hover:bg-gray-700"
                        title="Decrease quantity"
                      >
                        <MinusIcon className="h-4 w-4" />
                      </Button>
                      <span className="px-2 py-1 text-sm font-medium text-white min-w-[2rem] text-center">
                        {item.quantity}
                      </span>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => updateItem(item.id, { quantity: item.quantity + 1 })}
                        className="h-8 w-8 p-0 hover:bg-gray-700"
                        title="Increase quantity"
                      >
                        <PlusIcon className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    <div className="flex items-center gap-1">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => onEditItem?.(item.id)}
                        className="h-9 w-9 p-0"
                        title="Edit item"
                      >
                        <PencilSquareIcon className="h-5 w-5" />
                      </Button>
                      <Button
                        size="sm"
                        variant="danger"
                        onClick={() => removeItem(item.id)}
                        className="h-9 w-9 p-0"
                        title="Delete item"
                      >
                        <TrashIcon className="h-5 w-5" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
