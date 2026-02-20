import { useState, useEffect } from 'react';
import { Search, Edit2, Trash2, Filter, ChevronRight, Package, Box, RefreshCcw, Star, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';
import { api } from '../api';
import { showToast } from '../components/Toast';

export default function ProductList() {
  const [searchTerm, setSearchTerm] = useState('');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const data = await api.getProducts();
      setProducts(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await api.deleteProduct(id);
        setProducts(products.filter(p => p.id !== id));
        showToast('Product deleted successfully!');
      } catch (err) {
        showToast('Failed to delete: ' + err.message, 'error');
      }
    }
  };

  const handleToggleBestSeller = async (product) => {
    try {
      const updatedProduct = { ...product, is_bestseller: !product.is_bestseller };
      await api.updateProduct(product.id, updatedProduct);
      setProducts(products.map(p => p.id === product.id ? updatedProduct : p));
      showToast(updatedProduct.is_bestseller ? 'Added to Best Sellers!' : 'Removed from Best Sellers');
    } catch (err) {
      showToast('Failed to update status: ' + err.message, 'error');
    }
  };


  return (
    <div className="space-y-8 animate-in slide-in-from-bottom duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-2 font-serif text-slate-900">Product Catalog</h1>
          <p className="text-slate-500">Manage and track your global ingredient inventory.</p>
        </div>
        <Link to="/add-product" className="bg-primary hover:bg-primary-hover text-white font-bold px-6 py-3 rounded-xl transition-all shadow-lg hover:-translate-y-1 active:scale-95 flex items-center gap-2">
          <Box size={20} />
          <span>New Product</span>
        </Link>
      </div>

      <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
        <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search products..." 
              className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-12 pr-4 text-sm focus:outline-none focus:border-primary focus:bg-white transition-all text-slate-900"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-3 w-full md:w-auto">
            <button 
              onClick={fetchProducts}
              className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl px-4 py-3 text-sm font-medium transition-colors text-slate-700 shadow-sm"
            >
              <RefreshCcw size={18} className={loading ? 'animate-spin' : ''} />
              <span>Refresh</span>
            </button>
            <button className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl px-4 py-3 text-sm font-medium transition-colors text-slate-700 shadow-sm">
              <Filter size={18} />
              <span>Filter</span>
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="py-20 text-center text-slate-400">Loading products...</div>
          ) : error ? (
            <div className="py-20 text-center text-red-500">Error: {error}</div>
          ) : (
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50/50 text-slate-500 text-xs font-bold uppercase tracking-wider">
                  <th className="px-8 py-4 border-b border-slate-100">Product</th>
                  <th className="px-8 py-4 border-b border-slate-100">SKU / Code</th>
                  <th className="px-8 py-4 border-b border-slate-100">Origin</th>
                  <th className="px-8 py-4 border-b border-slate-100">Category</th>
                  <th className="px-8 py-4 border-b border-slate-100 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {products
                  .filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.category.toLowerCase().includes(searchTerm.toLowerCase()) || p.sku_name.toLowerCase().includes(searchTerm.toLowerCase()))
                  .map((product) => (
                  <tr key={product.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-8 py-5">
                      <Link to={`/product-details/${product.id}`} className="flex items-center gap-4 group/item">
                        <div className="w-12 h-12 rounded-xl overflow-hidden bg-slate-100 flex-shrink-0 border border-slate-200 group-hover/item:border-primary/50 transition-colors">
                          <img src={product.image ? product.image.split(',')[0] : ''} alt={product.name} className="w-full h-full object-cover group-hover/item:scale-110 transition-transform" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-bold text-sm tracking-tight text-slate-900 group-hover/item:text-primary transition-colors">{product.name}</p>
                            <button 
                              onClick={() => handleToggleBestSeller(product)}
                              className={`p-0.5 rounded shadow-sm transition-all ${product.is_bestseller ? 'bg-amber-50 text-amber-500' : 'text-slate-300 opacity-0 group-hover:opacity-100'}`}
                              title={product.is_bestseller ? "Best Seller (Click to remove)" : "Mark as Best Seller"}
                            >
                              <Star size={10} className={product.is_bestseller ? "fill-amber-500" : ""} />
                            </button>
                          </div>
                          <p className="text-xs text-slate-400">#{product.id}</p>
                        </div>
                      </Link>
                    </td>
                    <td className="px-8 py-5">
                      <span className="text-sm font-mono text-slate-500">{product.sku_name}</span>
                    </td>
                    <td className="px-8 py-5">
                      <span className="text-sm text-slate-600">{product.country_of_origin}</span>
                    </td>
                    <td className="px-8 py-5">
                      <span className="text-sm font-medium text-slate-700">{product.category}</span>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Link 
                          to={`/product-details/${product.id}`}
                          className="p-2 hover:bg-slate-100 text-slate-500 hover:text-slate-900 rounded-lg transition-colors" 
                          title="View Details"
                        >
                          <Eye size={16} />
                        </Link>
                        <Link 
                          to={`/edit-product/${product.id}`}
                          className="p-2 hover:bg-primary/10 hover:text-primary text-slate-500 rounded-lg transition-colors" 
                          title="Edit"
                        >
                          <Edit2 size={16} />
                        </Link>
                        <button 
                          onClick={() => handleDelete(product.id)}
                          className="p-2 hover:bg-red-50 hover:text-red-500 text-slate-500 rounded-lg transition-colors" 
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {products.length === 0 && (
                  <tr>
                    <td colSpan="5" className="px-8 py-10 text-center text-slate-400 italic">No products found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>

        <div className="p-6 border-t border-slate-100 flex items-center justify-between bg-slate-50/50">
          <p className="text-sm text-slate-500">Showing {products.length} products</p>
          <div className="flex gap-2">
            <button className="px-4 py-2 text-sm font-medium bg-white border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-30 text-slate-600 shadow-sm" disabled>Previous</button>
            <button className="px-4 py-2 text-sm font-medium bg-white border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-600 shadow-sm">Next</button>
          </div>
        </div>
      </div>
    </div>
  );
}
