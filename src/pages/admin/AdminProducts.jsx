import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Pencil, Trash2, RotateCcw, X, Package, Tag, Truck, Star, ListChecks, Images, Ruler, Palette } from 'lucide-react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import api from '../../services/api';

const emptyForm = {
  name: '', brand: '', color: '', description: '', price: '', originalPrice: '', stock: '',
  category: '', imageUrl: '', imageUrls: '', highlights: '', sizes: '', specifications: '',
  rating: '', reviewCount: '', deliveryDays: '',
};

export default function AdminProducts() {
  const queryClient = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const { data: products = [], isLoading: loading } = useQuery({
    queryKey: ['products', 'admin'],
    queryFn: () => api.get('/api/products/admin/all').then((res) => res.data),
    staleTime: 5 * 60 * 1000,
  });

  const refreshProducts = () => queryClient.invalidateQueries({ queryKey: ['products'] });

  const openAdd = () => {
    setEditingId(null);
    setForm(emptyForm);
    setError('');
    setModalOpen(true);
  };

  const openEdit = (p) => {
    setEditingId(p.id);
    setForm({
      name: p.name,
      brand: p.brand || '',
       color: p.color || '',
      description: p.description || '',
      price: p.price,
      originalPrice: p.originalPrice || '',
      stock: p.stock,
      category: p.category,
      color: p.color || '',
      imageUrl: p.imageUrl || '',
      imageUrls: p.imageUrls || '',
      highlights: p.highlights || '',
      sizes: p.sizes || '',
      specifications: p.specifications || '',
      rating: p.rating || '',
      reviewCount: p.reviewCount || '',
      deliveryDays: p.deliveryDays || '',
    });
    setError('');
    setModalOpen(true);
  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    const payload = {
      name: form.name,
      brand: form.brand || null,
       color: form.color || null,
      description: form.description,
      price: parseFloat(form.price),
      originalPrice: form.originalPrice ? parseFloat(form.originalPrice) : null,
      stock: parseInt(form.stock, 10),
      category: form.category,
      color: form.color || null,
      imageUrl: form.imageUrl,
      imageUrls: form.imageUrls || null,
      highlights: form.highlights || null,
      sizes: form.sizes || null,
      specifications: form.specifications || null,
      rating: form.rating ? parseFloat(form.rating) : 0,
      reviewCount: form.reviewCount ? parseInt(form.reviewCount, 10) : 0,
      deliveryDays: form.deliveryDays ? parseInt(form.deliveryDays, 10) : 5,
    };
    try {
      if (editingId) {
        await api.put(`/api/products/${editingId}`, payload);
      } else {
        await api.post('/api/products', payload);
      }
      setModalOpen(false);
      refreshProducts();
    } catch (err) {
      const data = err?.response?.data;
      const msg = typeof data?.message === 'object' ? Object.values(data.message).join(' ') : (data?.message || 'Failed to save product.');
      setError(msg);
    } finally {
      setSaving(false);
    }
  };

  const handleDeactivate = async (id) => {
    if (!window.confirm('Remove this product from the store? It will be hidden from customers but its order history stays intact.')) return;
    await api.delete(`/api/products/${id}`);
    refreshProducts();
  };

  const handleRestore = async (id) => {
    await api.put(`/api/products/${id}/restore`);
    refreshProducts();
  };

  const inputClass = "w-full px-4 py-2.5 rounded-lg border border-stone bg-white focus:outline-none focus:ring-2 focus:ring-verdant/40 focus:border-verdant transition-all text-sm";
  const labelClass = "block text-xs uppercase tracking-widest text-ink/50 mb-2";

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-display text-4xl">Products</h1>
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={openAdd}
          className="flex items-center gap-2 px-4 py-2 bg-verdant hover:bg-verdant-light transition-colors rounded-full text-xs font-sans uppercase tracking-widest text-paper"
        >
          <Plus size={15} strokeWidth={2} /> Add product
        </motion.button>
      </div>

      {loading ? (
        <p className="text-ink/40 font-mono text-sm">Loading...</p>
      ) : (
        <div className="bg-white/60 border border-stone rounded-md overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-stone text-left text-xs uppercase tracking-widest text-ink/40">
                <th className="px-5 py-3">Name</th>
                <th className="px-5 py-3">Brand</th>
                <th className="px-5 py-3">Category</th>
                <th className="px-5 py-3">Price</th>
                <th className="px-5 py-3">Stock</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3 sticky right-0 bg-paper-dim/95 backdrop-blur-sm"></th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id} className={`border-b border-stone/60 last:border-0 ${!p.active ? 'opacity-50' : ''}`}>
                  <td className="px-5 py-3 font-display whitespace-nowrap">{p.name}</td>
                  <td className="px-5 py-3 text-ink/60 whitespace-nowrap">{p.brand || '—'}</td>
                  <td className="px-5 py-3 text-ink/60 whitespace-nowrap">{p.category}</td>
                  <td className="px-5 py-3 font-mono whitespace-nowrap">
                    ₹{p.price.toFixed(2)}
                    {p.originalPrice && p.originalPrice > p.price && (
                      <span className="text-ink/30 line-through ml-1.5">₹{p.originalPrice.toFixed(2)}</span>
                    )}
                  </td>
                  <td className="px-5 py-3 font-mono whitespace-nowrap">{p.stock}</td>
                  <td className="px-5 py-3 whitespace-nowrap">
                    <span className={`text-xs font-mono uppercase tracking-wider px-2.5 py-1 rounded-full ${p.active ? 'text-verdant bg-verdant/10' : 'text-ink/40 bg-stone'}`}>
                      {p.active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-5 py-3 sticky right-0 bg-paper-dim/95 backdrop-blur-sm">
                    <div className="flex items-center gap-2 justify-end whitespace-nowrap">
                      <button
                        onClick={() => openEdit(p)}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-full border border-stone text-xs text-ink/70 hover:border-verdant hover:text-verdant transition-colors"
                      >
                        <Pencil size={13} strokeWidth={1.75} /> Edit
                      </button>
                      {p.active ? (
                        <button
                          onClick={() => handleDeactivate(p.id)}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-full border border-stone text-xs text-ink/70 hover:border-ember hover:text-ember transition-colors"
                        >
                          <Trash2 size={13} strokeWidth={1.75} /> Remove
                        </button>
                      ) : (
                        <button
                          onClick={() => handleRestore(p.id)}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-full border border-stone text-xs text-ink/70 hover:border-verdant hover:text-verdant transition-colors"
                        >
                          <RotateCcw size={13} strokeWidth={1.75} /> Restore
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <AnimatePresence>
        {modalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-ink/50 z-50 flex items-center justify-center px-4 sm:px-6 py-8"
            onClick={() => setModalOpen(false)}
          >
            <motion.form
              initial={{ opacity: 0, scale: 0.95, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 12 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              onClick={(e) => e.stopPropagation()}
              onSubmit={handleSubmit}
              className="bg-paper rounded-md p-6 sm:p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-display text-2xl">{editingId ? 'Edit product' : 'Add product'}</h2>
                <button type="button" onClick={() => setModalOpen(false)} className="text-ink/40 hover:text-ink transition-colors">
                  <X size={20} strokeWidth={1.75} />
                </button>
              </div>

              {error && (
                <div className="text-sm text-ember bg-ember/10 border border-ember/20 rounded-lg px-4 py-3 mb-5">
                  {error}
                </div>
              )}

              <div className="space-y-6">
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <Package size={15} strokeWidth={1.75} className="text-verdant" />
                    <h3 className="text-xs uppercase tracking-widest text-ink/50">Basic information</h3>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="sm:col-span-2">
                      <label className={labelClass}>Product name</label>
                      <input name="name" value={form.name} onChange={handleChange} required className={inputClass} />
                    </div>
                  <div>
                      <label className={labelClass}>Brand</label>
                      <input name="brand" value={form.brand} onChange={handleChange} placeholder="e.g. Nike, Sony" className={inputClass} />
                    </div>
                    <div>
                      <label className={labelClass}>Category</label>
                      <input name="category" value={form.category} onChange={handleChange} required className={inputClass} />
                    </div>
                    <div>
                      <label className={labelClass}>Color</label>
                      <input name="color" value={form.color} onChange={handleChange} placeholder="e.g. Black, Red, Navy" className={inputClass} />
                    </div>
                    <div className="sm:col-span-2">
                      <label className={labelClass}>Description</label>
                      <textarea name="description" value={form.description} onChange={handleChange} rows={3} className={`${inputClass} resize-none`} />
                    </div>
                  </div>
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <Palette size={15} strokeWidth={1.75} className="text-verdant" />
                    <h3 className="text-xs uppercase tracking-widest text-ink/50">Color (used for catalog color filter)</h3>
                  </div>
                  <input
                    name="color"
                    value={form.color}
                    onChange={handleChange}
                    list="color-suggestions"
                    placeholder="e.g. Black, White, Red, Navy"
                    className={inputClass}
                  />
                  <datalist id="color-suggestions">
                    <option value="Black" />
                    <option value="White" />
                    <option value="Red" />
                    <option value="Blue" />
                    <option value="Navy" />
                    <option value="Green" />
                    <option value="Yellow" />
                    <option value="Orange" />
                    <option value="Pink" />
                    <option value="Purple" />
                    <option value="Gray" />
                    <option value="Brown" />
                    <option value="Beige" />
                    <option value="Gold" />
                    <option value="Silver" />
                    <option value="Maroon" />
                    <option value="Teal" />
                    <option value="Multicolor" />
                  </datalist>
                  <p className="text-xs text-ink/40 mt-1.5">Use one of the suggested names so the color swatch shows correctly in the catalog filter — free text also works but won't get a matching swatch color.</p>
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <Images size={15} strokeWidth={1.75} className="text-verdant" />
                    <h3 className="text-xs uppercase tracking-widest text-ink/50">Images</h3>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className={labelClass}>Main image URL</label>
                      <input name="imageUrl" value={form.imageUrl} onChange={handleChange} className={inputClass} />
                    </div>
                    <div>
                      <label className={labelClass}>Additional gallery images (one URL per line)</label>
                      <textarea name="imageUrls" value={form.imageUrls} onChange={handleChange} rows={3} placeholder={'https://...\nhttps://...'} className={`${inputClass} resize-none`} />
                    </div>
                  </div>
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <Tag size={15} strokeWidth={1.75} className="text-verdant" />
                    <h3 className="text-xs uppercase tracking-widest text-ink/50">Pricing & inventory</h3>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className={labelClass}>Selling price</label>
                      <input type="number" step="0.01" name="price" value={form.price} onChange={handleChange} required className={inputClass} />
                    </div>
                    <div>
                      <label className={labelClass}>MRP (optional)</label>
                      <input type="number" step="0.01" name="originalPrice" value={form.originalPrice} onChange={handleChange} placeholder="Original price" className={inputClass} />
                    </div>
                    <div>
                      <label className={labelClass}>Stock</label>
                      <input type="number" name="stock" value={form.stock} onChange={handleChange} required className={inputClass} />
                    </div>
                  </div>
                  {form.price && form.originalPrice && Number(form.originalPrice) > Number(form.price) && (
                    <p className="text-xs text-ember font-mono mt-2">
                      {Math.round(((Number(form.originalPrice) - Number(form.price)) / Number(form.originalPrice)) * 100)}% discount will be shown to customers
                    </p>
                  )}
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <Ruler size={15} strokeWidth={1.75} className="text-verdant" />
                    <h3 className="text-xs uppercase tracking-widest text-ink/50">Sizes (for shoes / clothing — leave blank to skip)</h3>
                  </div>
                  <input name="sizes" value={form.sizes} onChange={handleChange} placeholder="e.g. S, M, L, XL   or   6, 7, 8, 9, 10" className={inputClass} />
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <ListChecks size={15} strokeWidth={1.75} className="text-verdant" />
                    <h3 className="text-xs uppercase tracking-widest text-ink/50">Highlights</h3>
                  </div>
                  <textarea
                    name="highlights"
                    value={form.highlights}
                    onChange={handleChange}
                    rows={4}
                    placeholder={'One highlight per line, e.g.\nBreathable mesh upper\nLightweight cushioning\nMachine washable'}
                    className={`${inputClass} resize-none`}
                  />
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <ListChecks size={15} strokeWidth={1.75} className="text-verdant" />
                    <h3 className="text-xs uppercase tracking-widest text-ink/50">Specifications (for electronics etc. — leave blank to skip)</h3>
                  </div>
                  <textarea
                    name="specifications"
                    value={form.specifications}
                    onChange={handleChange}
                    rows={4}
                    placeholder={'One per line, Key: Value, e.g.\nRAM: 8GB\nStorage: 128GB\nBattery: 5000mAh'}
                    className={`${inputClass} resize-none`}
                  />
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <Star size={15} strokeWidth={1.75} className="text-verdant" />
                    <h3 className="text-xs uppercase tracking-widest text-ink/50">Ratings (seed data, optional)</h3>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={labelClass}>Rating (0–5)</label>
                      <input type="number" step="0.1" min="0" max="5" name="rating" value={form.rating} onChange={handleChange} className={inputClass} />
                    </div>
                    <div>
                      <label className={labelClass}>Review count</label>
                      <input type="number" name="reviewCount" value={form.reviewCount} onChange={handleChange} className={inputClass} />
                    </div>
                  </div>
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <Truck size={15} strokeWidth={1.75} className="text-verdant" />
                    <h3 className="text-xs uppercase tracking-widest text-ink/50">Delivery</h3>
                  </div>
                  <div className="w-1/2 pr-2">
                    <label className={labelClass}>Estimated delivery (days)</label>
                    <input type="number" name="deliveryDays" value={form.deliveryDays} onChange={handleChange} placeholder="5" className={inputClass} />
                  </div>
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={saving}
                className="w-full mt-8 py-3 bg-verdant hover:bg-verdant-light disabled:opacity-60 transition-colors rounded-full text-sm font-sans uppercase tracking-widest text-paper"
              >
                {saving ? 'Saving...' : editingId ? 'Save changes' : 'Add product'}
              </motion.button>
            </motion.form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
