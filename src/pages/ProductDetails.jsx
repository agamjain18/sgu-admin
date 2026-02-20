import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  Edit2, 
  Trash2, 
  Package, 
  Globe, 
  ShieldCheck, 
  Archive, 
  Layers, 
  Info,
  CheckCircle2,
  Clock,
  Star,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { api } from '../api';
import { showToast } from '../components/Toast';

export default function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState('');

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const data = await api.getProduct(id);
        setProduct(data);
        if (data.image) {
          setActiveImage(data.image.split(',')[0]);
        }
      } catch (err) {
        console.error('Error fetching product:', err);
        navigate('/products');
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id, navigate]);

  const handleDelete = async () => {
    if (window.confirm('Delete this product record PERMANENTLY?')) {
      try {
        await api.deleteProduct(id);
        showToast('Product record deleted!');
        navigate('/products');
      } catch (err) {
        showToast('Deletion failed: ' + err.message, 'error');
      }
    }
  };

  if (loading) return <div className="p-20 text-center text-slate-400 font-medium animate-pulse font-serif">Scanning local catalog...</div>;
  if (!product) return null;

  const images = product.image ? product.image.split(',').filter(i => i.trim()) : [];

  return (
    <div className="max-w-7xl mx-auto space-y-10 animate-in fade-in duration-700 pb-20">
      {/* Header Navigation */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/products')}
            className="p-3 bg-white border border-slate-200 rounded-2xl hover:bg-slate-50 transition-all active:scale-90 text-slate-600 shadow-sm"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">
               <Link to="/products" className="hover:text-primary transition-colors">Catalog</Link>
               <ChevronRight size={10} />
               <span>Details</span>
            </div>
            <h1 className="text-3xl font-bold font-serif text-slate-900">
              {product.name}
            </h1>
          </div>
        </div>
        
        <div className="flex gap-3">
          <Link 
            to={`/edit-product/${product.id}`}
            className="flex items-center gap-2 bg-white border border-slate-200 hover:bg-slate-50 px-6 py-3 rounded-2xl font-bold text-sm transition-all active:scale-95 text-slate-700 shadow-sm"
          >
            <Edit2 size={16} />
            <span>Edit Record</span>
          </Link>
          <button 
            onClick={handleDelete}
            className="flex items-center gap-2 bg-red-50 border border-red-100 text-red-600 hover:bg-red-500 hover:text-white px-6 py-3 rounded-2xl font-bold text-sm transition-all active:scale-95 shadow-sm"
          >
            <Trash2 size={16} />
            <span>Delete</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        {/* LEFT: Visual Assets */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white border border-slate-200 rounded-[2.5rem] p-6 shadow-sm relative overflow-hidden">
            <div className="aspect-square rounded-[2rem] overflow-hidden bg-slate-50 border border-slate-100 relative">
              <img 
                src={activeImage || 'https://images.unsplash.com/photo-1506484334402-40f21503f283?q=80&w=800&auto=format&fit=crop'} 
                alt={product.name} 
                className="w-full h-full object-contain mix-blend-multiply animate-in zoom-in-95 duration-500"
              />
            </div>
            {product.is_bestseller && (
              <div className="absolute top-10 right-10 bg-amber-500 text-white px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg flex items-center gap-2">
                <Star size={12} className="fill-white" /> Best Seller
              </div>
            )}
          </div>

          {/* Asset Gallery Strip */}
          <div className="grid grid-cols-5 gap-3">
            {images.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setActiveImage(img)}
                className={`aspect-square rounded-xl overflow-hidden border-2 transition-all ${activeImage === img ? 'border-primary scale-105 shadow-md shadow-primary/10' : 'border-slate-100 opacity-60 hover:opacity-100 hover:border-slate-300'}`}
              >
                <img src={img} className="w-full h-full object-cover" alt="" />
              </button>
            ))}
            {images.length === 0 && (
              <div className="col-span-last aspect-square rounded-xl border border-dashed border-slate-200 flex items-center justify-center text-slate-300">
                No Visuals
              </div>
            )}
          </div>

          <div className="bg-primary/5 border border-primary/10 rounded-3xl p-6 flex items-center justify-between group shadow-inner">
             <div>
               <p className="text-[10px] font-black uppercase tracking-widest text-primary/60 mb-1">System Audit</p>
               <h4 className="font-bold text-sm text-slate-800">Public Product Profile</h4>
             </div>
             <div className="p-3 bg-white border border-slate-100 text-primary rounded-xl shadow-sm">
                <CheckCircle2 size={18} />
             </div>
          </div>
        </div>

        {/* RIGHT: Technical Intelligence */}
        <div className="lg:col-span-7 space-y-8">
          
          <div className="grid grid-cols-2 gap-4">
             <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-1 shadow-sm">
                <p className="text-[10px] font-black uppercase tracking-tighter text-slate-400">Global Origin</p>
                <div className="flex items-center gap-2 text-primary">
                  <Globe size={16} />
                  <span className="font-bold">{product.country_of_origin}</span>
                </div>
             </div>
             <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-1 shadow-sm">
                <p className="text-[10px] font-black uppercase tracking-tighter text-slate-400">Quality Standard</p>
                <div className="flex items-center gap-2 text-blue-600">
                  <ShieldCheck size={16} />
                  <span className="font-bold">{product.quality}</span>
                </div>
             </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-[2rem] p-8 space-y-6 shadow-sm">
            <div className="flex items-center gap-3 border-b border-slate-50 pb-4 text-slate-900 font-bold">
              <Info size={18} className="text-primary" />
              <h3 className="font-bold text-xl font-serif">Market Sentiment</h3>
            </div>
            <p className="text-slate-600 leading-relaxed font-normal italic">
              {product.product_overview || "No overview provided for this ingredient."}
            </p>
          </div>

          <div className="bg-white border border-slate-200 rounded-[2rem] p-8 shadow-sm">
             <div className="flex items-center gap-3 border-b border-slate-50 pb-4 mb-6">
                <Layers size={18} className="text-primary" />
                <h3 className="font-bold text-xl font-serif text-slate-900">Technical Parameters</h3>
             </div>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-10">
                {product.generic_specs ? product.generic_specs.split('\n').map((spec, i) => {
                  const parts = spec.split(':');
                  const key = parts[0];
                  const val = parts.slice(1).join(':');
                  return (
                    <div key={i} className="flex items-center justify-between py-1 border-b border-slate-50 last:border-0">
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{key}</span>
                      <span className="text-sm font-semibold text-slate-700">{val}</span>
                    </div>
                  );
                }) : (
                  <p className="text-slate-400 text-sm py-4 italic">No parameters listed.</p>
                )}
             </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
             <div className="space-y-4">
                <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-400 ml-1">
                  <Archive size={14} /> Logistics
                </div>
                <div className="flex flex-wrap gap-2">
                   {product.packaging ? product.packaging.split(',').map(p => (
                     <span key={p} className="px-3 py-1 bg-slate-50 border border-slate-100 rounded-lg text-[10px] font-bold text-slate-600 shadow-sm">{p.trim()}</span>
                   )) : <span className="text-slate-300 italic text-xs">Unspecified</span>}
                </div>
             </div>
             <div className="space-y-4">
                <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-400 ml-1">
                  <ShieldCheck size={14} /> Compliance
                </div>
                <div className="flex flex-wrap gap-2">
                   {product.certifications ? product.certifications.split(',').map(c => (
                     <span key={c} className="px-3 py-1 bg-emerald-50 border border-emerald-100 text-emerald-600 rounded-lg text-[10px] font-bold flex items-center gap-1.5 shadow-sm">
                       <CheckCircle2 size={10} /> {c.trim()}
                     </span>
                   )) : <span className="text-slate-300 italic text-xs">No records</span>}
                </div>
             </div>
          </div>

        </div>
      </div>
    </div>
  );
}
