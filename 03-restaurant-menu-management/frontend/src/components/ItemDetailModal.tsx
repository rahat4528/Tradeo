'use client';

import React, { useState } from 'react';
import { X, Flame, ShieldAlert, Sparkles } from 'lucide-react';
import { formatCurrency } from '../lib/utils';

interface VariantOption {
  id: string;
  name: string;
  priceDelta: number;
  isDefault: boolean;
}

interface VariantGroup {
  id: string;
  name: string;
  minSelections: number;
  maxSelections: number;
  options: VariantOption[];
}

export interface MenuItem {
  id: string;
  name: string;
  description?: string;
  price: number;
  promoPrice?: number;
  imageUrl?: string;
  isAvailable: boolean;
  calories?: number;
  allergens?: string;
  isVegetarian: boolean;
  isVegan: boolean;
  isGlutenFree: boolean;
  isSpicy: boolean;
  variantGroups?: VariantGroup[];
}

interface ItemDetailModalProps {
  item: MenuItem | null;
  currency: string;
  onClose: () => void;
}

export function ItemDetailModal({ item, currency, onClose }: ItemDetailModalProps) {
  if (!item) return null;

  const basePrice = item.promoPrice ?? item.price;
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    item.variantGroups?.forEach((group) => {
      const defaultOpt = group.options.find((o) => o.isDefault) || group.options[0];
      if (defaultOpt) {
        initial[group.id] = defaultOpt.id;
      }
    });
    return initial;
  });

  const handleSelectOption = (groupId: string, optionId: string) => {
    setSelectedOptions((prev) => ({
      ...prev,
      [groupId]: optionId,
    }));
  };

  // Calculate dynamic total price
  let totalPrice = basePrice;
  if (item.variantGroups) {
    for (const group of item.variantGroups) {
      const selectedId = selectedOptions[group.id];
      if (selectedId) {
        const option = group.options.find((o) => o.id === selectedId);
        if (option) {
          totalPrice += option.priceDelta;
        }
      }
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-100 flex flex-col max-h-[90vh]">
        {item.imageUrl && (
          <div className="relative h-56 w-full bg-slate-100 shrink-0">
            <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
            <button
              onClick={onClose}
              className="absolute top-4 right-4 bg-black/40 hover:bg-black/60 text-white p-2 rounded-full backdrop-blur-md transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        )}

        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          {!item.imageUrl && (
            <div className="flex justify-end">
              <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1 rounded-lg">
                <X className="h-5 w-5" />
              </button>
            </div>
          )}

          <div>
            <div className="flex items-start justify-between gap-4">
              <h2 className="text-2xl font-bold text-slate-900">{item.name}</h2>
              <div className="text-right">
                <div className="text-xl font-bold text-orange-600">
                  {formatCurrency(totalPrice, currency)}
                </div>
                {item.promoPrice && (
                  <div className="text-xs text-slate-400 line-through">
                    {formatCurrency(item.price, currency)}
                  </div>
                )}
              </div>
            </div>

            {item.description && (
              <p className="mt-2 text-sm text-slate-600 leading-relaxed">{item.description}</p>
            )}
          </div>

          {/* Badges / Dietary info */}
          <div className="flex flex-wrap gap-2 pt-1">
            {item.calories && (
              <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 font-medium">
                <Flame className="h-3 w-3 text-orange-500" />
                {item.calories} kcal
              </span>
            )}
            {item.isVegetarian && (
              <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 font-semibold border border-emerald-200">
                Vegetarian
              </span>
            )}
            {item.isVegan && (
              <span className="text-xs px-2.5 py-1 rounded-full bg-green-50 text-green-700 font-semibold border border-green-200">
                Vegan
              </span>
            )}
            {item.isGlutenFree && (
              <span className="text-xs px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 font-semibold border border-amber-200">
                Gluten-Free
              </span>
            )}
            {item.isSpicy && (
              <span className="text-xs px-2.5 py-1 rounded-full bg-red-50 text-red-700 font-semibold border border-red-200">
                Spicy 🌶️
              </span>
            )}
          </div>

          {item.allergens && (
            <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl flex items-start gap-2.5 text-xs text-amber-800">
              <ShieldAlert className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold">Allergen information:</span> {item.allergens}
              </div>
            </div>
          )}

          {/* Variant and Customization Groups */}
          {item.variantGroups && item.variantGroups.length > 0 && (
            <div className="space-y-4 pt-2 border-t border-slate-100">
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide">
                Customizations
              </h3>

              {item.variantGroups.map((group) => (
                <div key={group.id} className="space-y-2">
                  <span className="block text-xs font-semibold text-slate-700">{group.name}</span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {group.options.map((option) => {
                      const isSelected = selectedOptions[group.id] === option.id;
                      return (
                        <button
                          key={option.id}
                          type="button"
                          onClick={() => handleSelectOption(group.id, option.id)}
                          className={`flex items-center justify-between p-3 rounded-xl border text-left transition-all ${
                            isSelected
                              ? 'border-orange-500 bg-orange-50/50 ring-1 ring-orange-500 font-medium'
                              : 'border-slate-200 hover:border-slate-300'
                          }`}
                        >
                          <span className="text-xs text-slate-800">{option.name}</span>
                          {option.priceDelta > 0 && (
                            <span className="text-xs font-semibold text-orange-600">
                              +{formatCurrency(option.priceDelta, currency)}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-500">Total with options</div>
            <div className="text-lg font-bold text-slate-900">
              {formatCurrency(totalPrice, currency)}
            </div>
          </div>
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-orange-600 hover:bg-orange-700 text-white font-semibold text-sm rounded-xl shadow-md shadow-orange-500/20 transition-all"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
