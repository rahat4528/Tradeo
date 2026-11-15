'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { api } from '../../../lib/api';
import { formatCurrency } from '../../../lib/utils';
import { ItemDetailModal, MenuItem } from '../../../components/ItemDetailModal';
import {
  Utensils,
  Search,
  Clock,
  MapPin,
  Phone,
  Flame,
  Sparkles,
  ChevronRight,
  Filter,
} from 'lucide-react';

export default function PublicMenuPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const slug = params?.slug as string;
  const table = searchParams?.get('table');

  const [restaurantData, setRestaurantData] = useState<any>(null);
  const [activeMenuIndex, setActiveMenuIndex] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDiet, setSelectedDiet] = useState<string | null>(null);
  const [selectedItemForModal, setSelectedItemForModal] = useState<MenuItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!slug) return;
    setIsLoading(true);
    api
      .getPublicMenu(slug)
      .then((data) => {
        setRestaurantData(data);
      })
      .catch((err) => {
        setError(err.message || 'Menu not found');
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [slug]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="text-center space-y-3">
          <div className="h-12 w-12 rounded-2xl bg-orange-600 text-white flex items-center justify-center mx-auto animate-bounce shadow-lg shadow-orange-500/20">
            <Utensils className="h-6 w-6" />
          </div>
          <p className="text-sm font-semibold text-slate-600">Loading digital menu...</p>
        </div>
      </div>
    );
  }

  if (error || !restaurantData) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm max-w-md w-full text-center space-y-4">
          <div className="h-14 w-14 rounded-full bg-red-50 text-red-600 flex items-center justify-center mx-auto">
            <Utensils className="h-6 w-6" />
          </div>
          <h2 className="text-xl font-bold text-slate-900">Menu Unavailable</h2>
          <p className="text-xs text-slate-500">{error || 'Could not find this digital menu.'}</p>
        </div>
      </div>
    );
  }

  const { restaurant, menus } = restaurantData;
  const currentMenu = menus[activeMenuIndex] || menus[0];

  // Flatten items for active menu
  const allCategories = currentMenu?.categories || [];
  let displayedCategories = allCategories;

  if (selectedCategory !== 'all') {
    displayedCategories = allCategories.filter((c: any) => c.id === selectedCategory);
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* Restaurant Header */}
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-8 pb-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                  {restaurant.name}
                </h1>
                {table && (
                  <span className="px-2.5 py-1 rounded-full bg-orange-100 text-orange-800 text-xs font-bold">
                    Table {table}
                  </span>
                )}
              </div>
              {restaurant.description && (
                <p className="mt-1 text-sm text-slate-600 max-w-xl">{restaurant.description}</p>
              )}

              <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-slate-500">
                {restaurant.address && (
                  <div className="flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5 text-slate-400" />
                    <span>{restaurant.address}</span>
                  </div>
                )}
                {restaurant.phone && (
                  <div className="flex items-center gap-1">
                    <Phone className="h-3.5 w-3.5 text-slate-400" />
                    <span>{restaurant.phone}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Menus switch if restaurant has multiple active menus */}
          {menus.length > 1 && (
            <div className="mt-6 flex items-center gap-2 overflow-x-auto pb-1 border-t pt-4 border-slate-100">
              {menus.map((m: any, idx: number) => (
                <button
                  key={m.id}
                  onClick={() => {
                    setActiveMenuIndex(idx);
                    setSelectedCategory('all');
                  }}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                    activeMenuIndex === idx
                      ? 'bg-slate-900 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {m.name} {!m.isAvailableNow && '(Off-hours)'}
                </button>
              ))}
            </div>
          )}
        </div>
      </header>

      {/* Main menu content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Search & Dietary filter bar */}
        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search dishes, ingredients, or allergens..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-2xl text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>

          {/* Filter badges */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
            <button
              onClick={() => setSelectedDiet(null)}
              className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors ${
                selectedDiet === null
                  ? 'bg-orange-600 text-white'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              All Diets
            </button>
            <button
              onClick={() => setSelectedDiet(selectedDiet === 'veg' ? null : 'veg')}
              className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors ${
                selectedDiet === 'veg'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-white text-emerald-700 border border-emerald-200 hover:bg-emerald-50'
              }`}
            >
              🌱 Vegetarian
            </button>
            <button
              onClick={() => setSelectedDiet(selectedDiet === 'vegan' ? null : 'vegan')}
              className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors ${
                selectedDiet === 'vegan'
                  ? 'bg-green-600 text-white'
                  : 'bg-white text-green-700 border border-green-200 hover:bg-green-50'
              }`}
            >
              🌿 Vegan
            </button>
            <button
              onClick={() => setSelectedDiet(selectedDiet === 'gf' ? null : 'gf')}
              className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors ${
                selectedDiet === 'gf'
                  ? 'bg-amber-600 text-white'
                  : 'bg-white text-amber-700 border border-amber-200 hover:bg-amber-50'
              }`}
            >
              🌾 Gluten-Free
            </button>
            <button
              onClick={() => setSelectedDiet(selectedDiet === 'spicy' ? null : 'spicy')}
              className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors ${
                selectedDiet === 'spicy'
                  ? 'bg-red-600 text-white'
                  : 'bg-white text-red-700 border border-red-200 hover:bg-red-50'
              }`}
            >
              🌶️ Spicy
            </button>
          </div>
        </div>

        {/* Categories Bar */}
        {allCategories.length > 1 && (
          <div className="flex items-center gap-2 overflow-x-auto pb-1 sticky top-2 z-10 bg-slate-50/90 backdrop-blur-sm py-2">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
                selectedCategory === 'all'
                  ? 'bg-orange-600 text-white shadow-sm'
                  : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              All Categories
            </button>
            {allCategories.map((c: any) => (
              <button
                key={c.id}
                onClick={() => setSelectedCategory(c.id)}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
                  selectedCategory === c.id
                    ? 'bg-orange-600 text-white shadow-sm'
                    : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                {c.name}
              </button>
            ))}
          </div>
        )}

        {/* Menu Items Section */}
        {currentMenu?.isAvailableNow === false && (
          <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-2xl flex items-center gap-2.5 text-xs text-amber-800">
            <Clock className="h-4 w-4 text-amber-600 shrink-0" />
            <span>
              This menu is currently outside standard operating hours ({currentMenu.startTime} – {currentMenu.endTime}). You can still browse all selections.
            </span>
          </div>
        )}

        <div className="space-y-8">
          {displayedCategories.map((category: any) => {
            let items = category.items || [];

            // Filter search
            if (searchQuery.trim()) {
              const q = searchQuery.toLowerCase();
              items = items.filter(
                (i: any) =>
                  i.name.toLowerCase().includes(q) ||
                  (i.description && i.description.toLowerCase().includes(q)) ||
                  (i.allergens && i.allergens.toLowerCase().includes(q)),
              );
            }

            // Filter diet
            if (selectedDiet === 'veg') items = items.filter((i: any) => i.isVegetarian);
            if (selectedDiet === 'vegan') items = items.filter((i: any) => i.isVegan);
            if (selectedDiet === 'gf') items = items.filter((i: any) => i.isGlutenFree);
            if (selectedDiet === 'spicy') items = items.filter((i: any) => i.isSpicy);

            if (items.length === 0) return null;

            return (
              <div key={category.id} className="space-y-4">
                <div className="border-b pb-2 border-slate-200">
                  <h3 className="text-xl font-bold text-slate-900">{category.name}</h3>
                  {category.description && (
                    <p className="text-xs text-slate-500 mt-0.5">{category.description}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {items.map((item: any) => (
                    <div
                      key={item.id}
                      onClick={() => setSelectedItemForModal(item)}
                      className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm hover:border-orange-300 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
                    >
                      <div className="flex gap-4">
                        <div className="flex-1 space-y-1.5">
                          <div className="flex items-start justify-between gap-2">
                            <h4 className="font-bold text-slate-900 text-base">{item.name}</h4>
                          </div>

                          {item.description && (
                            <p className="text-xs text-slate-500 line-clamp-2">
                              {item.description}
                            </p>
                          )}

                          <div className="flex flex-wrap gap-1 pt-1">
                            {item.calories && (
                              <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-medium">
                                {item.calories} kcal
                              </span>
                            )}
                            {item.isVegetarian && (
                              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-semibold">
                                Veg
                              </span>
                            )}
                            {item.isVegan && (
                              <span className="text-[10px] px-2 py-0.5 rounded-full bg-green-50 text-green-700 font-semibold">
                                Vegan
                              </span>
                            )}
                            {item.isGlutenFree && (
                              <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 font-semibold">
                                GF
                              </span>
                            )}
                            {item.isSpicy && (
                              <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-50 text-red-700 font-semibold">
                                🌶️
                              </span>
                            )}
                          </div>
                        </div>

                        {item.imageUrl && (
                          <div className="w-20 h-20 rounded-xl overflow-hidden bg-slate-100 shrink-0">
                            <img
                              src={item.imageUrl}
                              alt={item.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}
                      </div>

                      <div className="flex items-center justify-between pt-3 mt-3 border-t border-slate-100">
                        <div className="flex items-baseline gap-1.5">
                          <span className="text-base font-extrabold text-orange-600">
                            {formatCurrency(item.promoPrice ?? item.price, restaurant.currency)}
                          </span>
                          {item.promoPrice && (
                            <span className="text-xs text-slate-400 line-through">
                              {formatCurrency(item.price, restaurant.currency)}
                            </span>
                          )}
                        </div>

                        {!item.isAvailable ? (
                          <span className="text-xs font-semibold px-2 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-200">
                            Sold Out
                          </span>
                        ) : (
                          <span className="text-xs font-semibold text-slate-500 hover:text-orange-600 flex items-center">
                            Customize <ChevronRight className="h-3 w-3 ml-0.5" />
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Item Detail & Customization Modal */}
      <ItemDetailModal
        item={selectedItemForModal}
        currency={restaurant.currency}
        onClose={() => setSelectedItemForModal(null)}
      />
    </div>
  );
}
