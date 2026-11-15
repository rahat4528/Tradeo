'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../lib/auth';
import { api } from '../lib/api';
import { Navbar } from '../components/Navbar';
import { CreateMenuModal } from '../components/CreateMenuModal';
import { CreateItemModal } from '../components/CreateItemModal';
import { QrModal } from '../components/QrModal';
import { formatCurrency } from '../lib/utils';
import {
  Plus,
  PlusCircle,
  Eye,
  EyeOff,
  Trash2,
  Edit2,
  Clock,
  Sparkles,
  ToggleLeft,
  ToggleRight,
  UtensilsCrossed,
  FolderPlus,
  QrCode,
} from 'lucide-react';

export default function DashboardPage() {
  const router = useRouter();
  const { user, restaurant, isLoading: isAuthLoading } = useAuth();

  const [menus, setMenus] = useState<any[]>([]);
  const [selectedMenuId, setSelectedMenuId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Modals state
  const [isMenuModalOpen, setIsMenuModalOpen] = useState(false);
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [activeCategoryForNewItem, setActiveCategoryForNewItem] = useState<{ id: string; name: string } | null>(null);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [showAddCategoryInput, setShowAddCategoryInput] = useState(false);

  useEffect(() => {
    if (!isAuthLoading && !user) {
      router.push('/login');
    }
  }, [user, isAuthLoading, router]);

  const loadMenus = async () => {
    try {
      setIsLoading(true);
      const data = await api.getMenus();
      setMenus(data);
      if (data.length > 0 && !selectedMenuId) {
        setSelectedMenuId(data[0].id);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      loadMenus();
    }
  }, [user]);

  const activeMenu = menus.find((m) => m.id === selectedMenuId) || menus[0] || null;

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim() || !activeMenu) return;

    try {
      await api.createCategory({
        menuId: activeMenu.id,
        name: newCategoryName.trim(),
      });
      setNewCategoryName('');
      setShowAddCategoryInput(false);
      await loadMenus();
    } catch (err: any) {
      alert(err.message || 'Failed to create category');
    }
  };

  const handleToggleItemAvailability = async (itemId: string) => {
    try {
      await api.toggleAvailability(itemId);
      await loadMenus();
    } catch (err: any) {
      alert(err.message || 'Failed to toggle availability');
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    if (!confirm('Are you sure you want to delete this dish?')) return;
    try {
      await api.deleteItem(itemId);
      await loadMenus();
    } catch (err: any) {
      alert(err.message || 'Failed to delete dish');
    }
  };

  const handleDeleteCategory = async (catId: string) => {
    if (!confirm('Delete this category and all its items?')) return;
    try {
      await api.deleteCategory(catId);
      await loadMenus();
    } catch (err: any) {
      alert(err.message || 'Failed to delete category');
    }
  };

  const handleDeleteMenu = async (menuId: string) => {
    if (!confirm('Are you sure you want to delete this menu?')) return;
    try {
      await api.deleteMenu(menuId);
      setSelectedMenuId(null);
      await loadMenus();
    } catch (err: any) {
      alert(err.message || 'Failed to delete menu');
    }
  };

  if (isAuthLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-sm font-semibold text-slate-500 animate-pulse">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar onOpenQr={() => setIsQrModalOpen(true)} />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-6">
        {/* Header section with KPIs and Quick Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Menu & Catalog Manager</h1>
            <p className="text-sm text-slate-500">
              Configure food offerings, live operating schedules, modifiers, and QR codes
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsMenuModalOpen(true)}
              className="flex items-center gap-1.5 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-sm font-semibold shadow-sm transition-colors"
            >
              <Plus className="h-4 w-4" />
              <span>New Menu</span>
            </button>
            <button
              onClick={() => setIsQrModalOpen(true)}
              className="flex items-center gap-1.5 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-sm font-semibold transition-colors"
            >
              <QrCode className="h-4 w-4" />
              <span>QR Code</span>
            </button>
          </div>
        </div>

        {/* Menu Tabs */}
        {menus.length > 0 ? (
          <div className="space-y-6">
            <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-200">
              {menus.map((m) => {
                const isSelected = (activeMenu && activeMenu.id === m.id);
                return (
                  <button
                    key={m.id}
                    onClick={() => setSelectedMenuId(m.id)}
                    className={`px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition-all flex items-center gap-2 ${
                      isSelected
                        ? 'bg-orange-600 text-white shadow-sm'
                        : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                    }`}
                  >
                    <span>{m.name}</span>
                    {!m.isPublished && (
                      <span className="text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-black/20 text-white font-bold">
                        Draft
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Active Menu Detail & Categories */}
            {activeMenu && (
              <div className="space-y-6">
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-3">
                      <h2 className="text-xl font-bold text-slate-900">{activeMenu.name}</h2>
                      <span
                        className={`text-xs px-2.5 py-0.5 rounded-full font-semibold ${
                          activeMenu.isPublished
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}
                      >
                        {activeMenu.isPublished ? 'Published' : 'Hidden'}
                      </span>
                    </div>
                    {activeMenu.description && (
                      <p className="text-xs text-slate-500">{activeMenu.description}</p>
                    )}
                    {(activeMenu.startTime || activeMenu.endTime) && (
                      <div className="flex items-center gap-1.5 text-xs text-slate-600 font-medium pt-1">
                        <Clock className="h-3.5 w-3.5 text-orange-600" />
                        <span>
                          Hours: {activeMenu.startTime || '00:00'} – {activeMenu.endTime || '23:59'}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setShowAddCategoryInput(true)}
                      className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                    >
                      <FolderPlus className="h-3.5 w-3.5" />
                      <span>Add Category</span>
                    </button>
                    <button
                      onClick={() => handleDeleteMenu(activeMenu.id)}
                      className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg transition-colors"
                      title="Delete menu"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Inline Add Category Bar */}
                {showAddCategoryInput && (
                  <form
                    onSubmit={handleCreateCategory}
                    className="flex items-center gap-2 bg-white p-3 rounded-xl border border-orange-200 shadow-sm"
                  >
                    <input
                      type="text"
                      placeholder="Category name (e.g., Starters, Wood-fired Pizza, Cocktails)"
                      value={newCategoryName}
                      onChange={(e) => setNewCategoryName(e.target.value)}
                      autoFocus
                      className="flex-1 text-sm px-3 py-1.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                    <button
                      type="submit"
                      className="px-4 py-1.5 bg-orange-600 hover:bg-orange-700 text-white text-xs font-semibold rounded-lg shadow-sm"
                    >
                      Save Category
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowAddCategoryInput(false)}
                      className="px-3 py-1.5 text-xs font-medium text-slate-500 hover:text-slate-700"
                    >
                      Cancel
                    </button>
                  </form>
                )}

                {/* Categories & Dishes Grid */}
                <div className="space-y-8">
                  {activeMenu.categories && activeMenu.categories.length > 0 ? (
                    activeMenu.categories.map((category: any) => (
                      <div key={category.id} className="space-y-4">
                        <div className="flex items-center justify-between border-b pb-2 border-slate-200">
                          <div>
                            <h3 className="text-lg font-bold text-slate-900">{category.name}</h3>
                            {category.description && (
                              <p className="text-xs text-slate-500">{category.description}</p>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => {
                                setActiveCategoryForNewItem({ id: category.id, name: category.name });
                                setIsItemModalOpen(true);
                              }}
                              className="flex items-center gap-1 px-3 py-1 bg-orange-50 text-orange-700 hover:bg-orange-100 border border-orange-200 rounded-lg text-xs font-semibold transition-colors"
                            >
                              <Plus className="h-3.5 w-3.5" />
                              <span>Add Dish</span>
                            </button>
                            <button
                              onClick={() => handleDeleteCategory(category.id)}
                              className="p-1 text-slate-400 hover:text-red-500"
                              title="Delete category"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* Items in Category */}
                        {category.items && category.items.length > 0 ? (
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {category.items.map((item: any) => (
                              <div
                                key={item.id}
                                className={`bg-white rounded-2xl border p-4 shadow-sm flex flex-col justify-between transition-all ${
                                  item.isAvailable
                                    ? 'border-slate-200'
                                    : 'border-slate-200/60 bg-slate-50/70 opacity-75'
                                }`}
                              >
                                <div className="space-y-2">
                                  <div className="flex items-start justify-between gap-3">
                                    <h4 className="font-bold text-slate-900 text-sm">{item.name}</h4>
                                    <div className="text-right shrink-0">
                                      <div className="font-bold text-sm text-orange-600">
                                        {formatCurrency(item.promoPrice ?? item.price, restaurant?.currency)}
                                      </div>
                                      {item.promoPrice && (
                                        <div className="text-xs text-slate-400 line-through">
                                          {formatCurrency(item.price, restaurant?.currency)}
                                        </div>
                                      )}
                                    </div>
                                  </div>

                                  {item.description && (
                                    <p className="text-xs text-slate-500 line-clamp-2">
                                      {item.description}
                                    </p>
                                  )}

                                  <div className="flex flex-wrap gap-1 pt-1">
                                    {item.isVegetarian && (
                                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700">
                                        Veg
                                      </span>
                                    )}
                                    {item.isVegan && (
                                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-green-50 text-green-700">
                                        Vegan
                                      </span>
                                    )}
                                    {item.isGlutenFree && (
                                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700">
                                        GF
                                      </span>
                                    )}
                                    {item.isSpicy && (
                                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-red-50 text-red-700">
                                        Spicy
                                      </span>
                                    )}
                                  </div>
                                </div>

                                <div className="flex items-center justify-between pt-4 mt-3 border-t border-slate-100">
                                  <button
                                    onClick={() => handleToggleItemAvailability(item.id)}
                                    className={`flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-lg transition-colors ${
                                      item.isAvailable
                                        ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                                        : 'bg-rose-50 text-rose-700 hover:bg-rose-100'
                                    }`}
                                  >
                                    {item.isAvailable ? (
                                      <>
                                        <Eye className="h-3.5 w-3.5" />
                                        <span>Available (In Stock)</span>
                                      </>
                                    ) : (
                                      <>
                                        <EyeOff className="h-3.5 w-3.5" />
                                        <span>86'd (Sold Out)</span>
                                      </>
                                    )}
                                  </button>

                                  <button
                                    onClick={() => handleDeleteItem(item.id)}
                                    className="p-1 text-slate-400 hover:text-red-500 transition-colors"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="bg-slate-50 border border-dashed border-slate-200 rounded-xl p-6 text-center">
                            <p className="text-xs text-slate-500 mb-2">No dishes in this category yet</p>
                            <button
                              onClick={() => {
                                setActiveCategoryForNewItem({ id: category.id, name: category.name });
                                setIsItemModalOpen(true);
                              }}
                              className="text-xs font-semibold text-orange-600 hover:text-orange-700"
                            >
                              + Add first item
                            </button>
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center space-y-3">
                      <FolderPlus className="h-10 w-10 text-slate-400 mx-auto" />
                      <h3 className="text-base font-bold text-slate-800">No categories created</h3>
                      <p className="text-xs text-slate-500 max-w-sm mx-auto">
                        Organize your dishes into categories like Appetizers, Mains, Drinks, or Desserts.
                      </p>
                      <button
                        onClick={() => setShowAddCategoryInput(true)}
                        className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-xs font-semibold shadow-sm"
                      >
                        Create First Category
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-4">
            <UtensilsCrossed className="h-12 w-12 text-orange-600 mx-auto" />
            <h3 className="text-xl font-bold text-slate-900">Start Your Digital Menu</h3>
            <p className="text-sm text-slate-500 max-w-md mx-auto">
              Create your first menu (e.g., All Day Dining, Weekend Brunch) and publish it for customer mobile orders and table-side QR codes.
            </p>
            <button
              onClick={() => setIsMenuModalOpen(true)}
              className="px-5 py-2.5 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-sm font-semibold shadow-md shadow-orange-500/20"
            >
              Create First Menu
            </button>
          </div>
        )}
      </main>

      {/* Modals */}
      <CreateMenuModal
        isOpen={isMenuModalOpen}
        onClose={() => setIsMenuModalOpen(false)}
        onSuccess={loadMenus}
      />

      {activeCategoryForNewItem && (
        <CreateItemModal
          isOpen={isItemModalOpen}
          categoryId={activeCategoryForNewItem.id}
          categoryName={activeCategoryForNewItem.name}
          onClose={() => {
            setIsItemModalOpen(false);
            setActiveCategoryForNewItem(null);
          }}
          onSuccess={loadMenus}
        />
      )}

      {restaurant && (
        <QrModal
          isOpen={isQrModalOpen}
          slug={restaurant.slug}
          restaurantName={restaurant.name}
          onClose={() => setIsQrModalOpen(false)}
        />
      )}
    </div>
  );
}
