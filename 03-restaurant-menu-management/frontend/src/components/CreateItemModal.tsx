'use client';

import React, { useState } from 'react';
import { api } from '../lib/api';
import { X, Plus, Trash2 } from 'lucide-react';

interface CreateItemModalProps {
  isOpen: boolean;
  categoryId: string;
  categoryName: string;
  onClose: () => void;
  onSuccess: () => void;
}

interface VariantOption {
  name: string;
  priceDelta: number;
  isDefault: boolean;
}

interface VariantGroup {
  name: string;
  minSelections: number;
  maxSelections: number;
  options: VariantOption[];
}

export function CreateItemModal({
  isOpen,
  categoryId,
  categoryName,
  onClose,
  onSuccess,
}: CreateItemModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [promoPrice, setPromoPrice] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [calories, setCalories] = useState('');
  const [isVegetarian, setIsVegetarian] = useState(false);
  const [isVegan, setIsVegan] = useState(false);
  const [isGlutenFree, setIsGlutenFree] = useState(false);
  const [isSpicy, setIsSpicy] = useState(false);
  const [allergens, setAllergens] = useState('');
  const [variantGroups, setVariantGroups] = useState<VariantGroup[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const addVariantGroup = () => {
    setVariantGroups([
      ...variantGroups,
      {
        name: 'Size / Style',
        minSelections: 1,
        maxSelections: 1,
        options: [
          { name: 'Regular', priceDelta: 0, isDefault: true },
          { name: 'Large', priceDelta: 2.5, isDefault: false },
        ],
      },
    ]);
  };

  const removeVariantGroup = (index: number) => {
    setVariantGroups(variantGroups.filter((_, i) => i !== index));
  };

  const updateVariantGroup = (index: number, field: string, value: any) => {
    const updated = [...variantGroups];
    (updated[index] as any)[field] = value;
    setVariantGroups(updated);
  };

  const addOptionToGroup = (groupIndex: number) => {
    const updated = [...variantGroups];
    updated[groupIndex].options.push({ name: 'New Option', priceDelta: 0, isDefault: false });
    setVariantGroups(updated);
  };

  const removeOption = (groupIndex: number, optIndex: number) => {
    const updated = [...variantGroups];
    updated[groupIndex].options = updated[groupIndex].options.filter((_, i) => i !== optIndex);
    setVariantGroups(updated);
  };

  const updateOption = (groupIndex: number, optIndex: number, field: string, value: any) => {
    const updated = [...variantGroups];
    (updated[groupIndex].options[optIndex] as any)[field] = value;
    setVariantGroups(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Item name is required');
      return;
    }
    const numPrice = parseFloat(price);
    if (isNaN(numPrice) || numPrice < 0) {
      setError('Please provide a valid price');
      return;
    }

    try {
      setIsSubmitting(true);
      setError('');

      await api.createItem({
        categoryId,
        name,
        description: description || undefined,
        price: numPrice,
        promoPrice: promoPrice ? parseFloat(promoPrice) : undefined,
        imageUrl: imageUrl || undefined,
        calories: calories ? parseInt(calories, 10) : undefined,
        isVegetarian,
        isVegan,
        isGlutenFree,
        isSpicy,
        allergens: allergens || undefined,
        variants: variantGroups.length > 0 ? variantGroups : undefined,
      });

      setName('');
      setDescription('');
      setPrice('');
      setPromoPrice('');
      setImageUrl('');
      setCalories('');
      setIsVegetarian(false);
      setIsVegan(false);
      setIsGlutenFree(false);
      setIsSpicy(false);
      setAllergens('');
      setVariantGroups([]);
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to create item');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full my-8 overflow-hidden border border-slate-100 flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Add Dish or Item</h2>
            <p className="text-xs text-slate-500">Adding to category: <span className="font-semibold text-orange-600">{categoryName}</span></p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1 rounded-lg">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
          {error && <div className="p-3 text-sm text-red-600 bg-red-50 rounded-lg">{error}</div>}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Item / Dish Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g., Truffle Tagliatelle, Grilled Wagyu Ribeye"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Description
              </label>
              <textarea
                rows={2}
                placeholder="Detailed description, preparation notes, provenance of ingredients"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3.5 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Base Price *
              </label>
              <input
                type="number"
                step="0.01"
                required
                placeholder="18.50"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full px-3.5 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Promotional Price (optional)
              </label>
              <input
                type="number"
                step="0.01"
                placeholder="15.00"
                value={promoPrice}
                onChange={(e) => setPromoPrice(e.target.value)}
                className="w-full px-3.5 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Image URL
              </label>
              <input
                type="url"
                placeholder="https://images.unsplash.com/..."
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                className="w-full px-3.5 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Calories (kcal)
              </label>
              <input
                type="number"
                placeholder="650"
                value={calories}
                onChange={(e) => setCalories(e.target.value)}
                className="w-full px-3.5 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Allergen Notice
              </label>
              <input
                type="text"
                placeholder="e.g. Milk, Tree nuts, Shellfish"
                value={allergens}
                onChange={(e) => setAllergens(e.target.value)}
                className="w-full px-3.5 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
          </div>

          <div className="pt-2">
            <span className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
              Dietary Tags
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <label className="flex items-center gap-2 p-2 rounded-lg border border-slate-200 cursor-pointer hover:bg-slate-50">
                <input
                  type="checkbox"
                  checked={isVegetarian}
                  onChange={(e) => setIsVegetarian(e.target.checked)}
                  className="rounded text-orange-600 focus:ring-orange-500"
                />
                <span className="text-xs font-medium text-slate-700">Vegetarian</span>
              </label>
              <label className="flex items-center gap-2 p-2 rounded-lg border border-slate-200 cursor-pointer hover:bg-slate-50">
                <input
                  type="checkbox"
                  checked={isVegan}
                  onChange={(e) => setIsVegan(e.target.checked)}
                  className="rounded text-orange-600 focus:ring-orange-500"
                />
                <span className="text-xs font-medium text-slate-700">Vegan</span>
              </label>
              <label className="flex items-center gap-2 p-2 rounded-lg border border-slate-200 cursor-pointer hover:bg-slate-50">
                <input
                  type="checkbox"
                  checked={isGlutenFree}
                  onChange={(e) => setIsGlutenFree(e.target.checked)}
                  className="rounded text-orange-600 focus:ring-orange-500"
                />
                <span className="text-xs font-medium text-slate-700">Gluten-Free</span>
              </label>
              <label className="flex items-center gap-2 p-2 rounded-lg border border-slate-200 cursor-pointer hover:bg-slate-50">
                <input
                  type="checkbox"
                  checked={isSpicy}
                  onChange={(e) => setIsSpicy(e.target.checked)}
                  className="rounded text-orange-600 focus:ring-orange-500"
                />
                <span className="text-xs font-medium text-slate-700">Spicy</span>
              </label>
            </div>
          </div>

          {/* Customization & Variant Groups */}
          <div className="pt-3 border-t border-slate-100">
            <div className="flex items-center justify-between mb-3">
              <div>
                <span className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Variants & Modifiers
                </span>
                <p className="text-xs text-slate-500">Add size choices, crust types, dressings, or toppings</p>
              </div>
              <button
                type="button"
                onClick={addVariantGroup}
                className="flex items-center gap-1 text-xs font-semibold text-orange-600 hover:text-orange-700 bg-orange-50 px-2.5 py-1.5 rounded-lg border border-orange-200"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Add Modifier Group</span>
              </button>
            </div>

            {variantGroups.map((group, gIdx) => (
              <div key={gIdx} className="mb-4 p-4 rounded-xl border border-slate-200 bg-slate-50/70 space-y-3">
                <div className="flex items-center justify-between">
                  <input
                    type="text"
                    value={group.name}
                    onChange={(e) => updateVariantGroup(gIdx, 'name', e.target.value)}
                    placeholder="Group name, e.g. Protein Choice"
                    className="font-medium text-sm text-slate-800 bg-white border border-slate-200 rounded px-2.5 py-1 focus:ring-1 focus:ring-orange-500"
                  />
                  <button
                    type="button"
                    onClick={() => removeVariantGroup(gIdx)}
                    className="text-slate-400 hover:text-red-600 p-1"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                <div className="space-y-2">
                  {group.options.map((opt, oIdx) => (
                    <div key={oIdx} className="flex items-center gap-2">
                      <input
                        type="text"
                        value={opt.name}
                        onChange={(e) => updateOption(gIdx, oIdx, 'name', e.target.value)}
                        placeholder="Option name"
                        className="flex-1 text-xs bg-white border border-slate-200 rounded px-2 py-1"
                      />
                      <div className="flex items-center gap-1">
                        <span className="text-xs text-slate-400">+$</span>
                        <input
                          type="number"
                          step="0.25"
                          value={opt.priceDelta}
                          onChange={(e) =>
                            updateOption(gIdx, oIdx, 'priceDelta', parseFloat(e.target.value) || 0)
                          }
                          className="w-16 text-xs bg-white border border-slate-200 rounded px-2 py-1"
                        />
                      </div>
                      <label className="flex items-center gap-1 text-xs text-slate-600">
                        <input
                          type="checkbox"
                          checked={opt.isDefault}
                          onChange={(e) =>
                            updateOption(gIdx, oIdx, 'isDefault', e.target.checked)
                          }
                          className="rounded text-orange-600"
                        />
                        <span>Default</span>
                      </label>
                      <button
                        type="button"
                        onClick={() => removeOption(gIdx, oIdx)}
                        className="text-slate-400 hover:text-red-500 p-0.5"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => addOptionToGroup(gIdx)}
                    className="text-xs text-orange-600 hover:text-orange-700 font-medium"
                  >
                    + Add option
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 text-sm font-semibold text-white bg-orange-600 hover:bg-orange-700 rounded-lg shadow-sm transition-colors disabled:opacity-50"
            >
              {isSubmitting ? 'Saving...' : 'Add Item'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
