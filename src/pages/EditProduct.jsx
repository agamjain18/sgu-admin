import { useState, useEffect } from 'react';
import { Save, X, Image as ImageIcon, Upload, Info, Loader2, ClipboardList, Settings, CheckCircle2, Star, Plus, Trash2, GripVertical, ChevronRight, ArrowLeft } from 'lucide-react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { api } from '../api';
import { showToast } from '../components/Toast';

export default function EditProduct() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [countries, setCountries] = useState([]);
  const [countrySearch, setCountrySearch] = useState('');
  const [showCountrySuggestions, setShowCountrySuggestions] = useState(false);
  const [imageList, setImageList] = useState([]);
  const [imageUrlInput, setImageUrlInput] = useState('');
  const [uploading, setUploading] = useState(false);
  const [specs, setSpecs] = useState([{ id: 'default-1', name: '', value: '' }]);

  const handleSpecChange = (index, field, value) => {
    const newSpecs = [...specs];
    newSpecs[index][field] = value;
    setSpecs(newSpecs);
  };

  const addSpec = () => setSpecs([...specs, { id: Date.now().toString(), name: '', value: '' }]);
  const removeSpec = (index) => setSpecs(specs.filter((_, i) => i !== index));

  const handleDragEnd = (result) => {
    if (!result.destination) return;
    const items = Array.from(specs);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    setSpecs(items);
  };

  const [formData, setFormData] = useState({
    name: '',
    sku_name: '',
    country_of_origin: '',
    quality: '',
    product_overview: '',
    generic_specs: '',
    applications: '',
    packaging: '',
    certifications: '',
    category: 'Food Ingredients',
    image: '',
    is_bestseller: false,
  });

  const handleAddImageUrl = () => {
    if (imageUrlInput && imageList.length < 5) {
      setImageList(prev => [...prev, imageUrlInput]);
      setImageUrlInput('');
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || imageList.length >= 5) return;
    
    setUploading(true);
    try {
      const data = await api.uploadImage(file);
      setImageList(prev => [...prev, data.url]);
    } catch (err) {
      showToast('Upload failed: ' + err.message, 'error');
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveImage = (index) => {
    setImageList(prev => prev.filter((_, i) => i !== index));
  };

  const categories = [
    'Food Ingredients',
    'Nutritional',
    'Beverage',
    'Dairy',
    'Bakery',
    'Confectionery',
    'Stabilizers & Emulsifiers'
  ];

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const product = await api.getProduct(id);
        setFormData({
          name: product.name,
          sku_name: product.sku_name || '',
          country_of_origin: product.country_of_origin || '',
          quality: product.quality || '',
          product_overview: product.product_overview || '',
          generic_specs: product.generic_specs || '',
          applications: product.applications || '',
          packaging: product.packaging || '',
          certifications: product.certifications || '',
          category: product.category || '',
          image: product.image || '',
          is_bestseller: product.is_bestseller || false,
        });
        
        if (product.image) {
          setImageList(product.image.split(',').filter(img => img.trim()));
        }

        if (product.generic_specs) {
          const parsedSpecs = product.generic_specs.split('\n').map((line, i) => {
            const [name, ...valueParts] = line.split(':');
            return { 
              id: `init-${i}-${Date.now()}`, 
              name: name?.trim() || '', 
              value: valueParts.join(':')?.trim() || '' 
            };
          }).filter(s => s.name || s.value);
          setSpecs(parsedSpecs.length > 0 ? parsedSpecs : [{ id: 'default-1', name: '', value: '' }]);
        }
      } catch (err) {
        showToast('Error fetching product: ' + err.message, 'error');
        navigate('/products');
      } finally {
        setFetching(false);
      }
    };
    fetchProduct();
  }, [id, navigate]);

  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const data = await api.getCountries();
        setCountries(data.map(c => c.name));
      } catch (err) {
        console.error('Error fetching countries:', err);
      }
    };
    fetchCountries();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name === 'country_of_origin') {
      setCountrySearch(value.split(',').pop().trim());
      setShowCountrySuggestions(true);
    }
    setFormData(prev => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? checked : value 
    }));
  };

  const commonCertifications = [
    'FSSAI', 'ISO 9001', 'ISO 22000', 'HACCP', 'HALAL', 'KOSHER', 'MSME', 'DPIIT'
  ];

  const commonQualityGrades = [
    'Premium Food Grade', 'Industrial Grade', 'Pharma Grade', 'USP Grade', 'FCC Grade'
  ];

  const commonPackagingOptions = [
    '25kg Paper Bags', '50kg HDPE Bags', 'Jumbo Bags (1MT)', 'Liquid Drums', 'Cartons'
  ];

  const handleToggle = (field, value) => {
    setFormData(prev => {
      const currentValues = prev[field] ? prev[field].split(',').map(v => v.trim()).filter(v => v !== '') : [];
      let newValues;
      if (currentValues.includes(value)) {
        newValues = currentValues.filter(v => v !== value);
      } else {
        newValues = [...currentValues, value];
      }
      return { ...prev, [field]: newValues.join(', ') };
    });
  };

  const handleCertToggle = (cert) => handleToggle('certifications', cert);
  const handleQualityToggle = (grade) => handleToggle('quality', grade);
  const handlePackagingToggle = (pkg) => handleToggle('packaging', pkg);
  const handleCountryToggle = (country) => {
    handleToggle('country_of_origin', country);
    setCountrySearch('');
    setShowCountrySuggestions(false);
  };

  const handleSelectSuggestion = (suggestion) => {
    setFormData(prev => {
      const parts = prev.country_of_origin.split(',').map(p => p.trim()).filter(p => p !== '');
      if (parts.length > 0 && suggestion.toLowerCase().startsWith(parts[parts.length - 1].toLowerCase())) {
        parts.pop();
      }
      if (!parts.includes(suggestion)) {
        parts.push(suggestion);
      }
      return { ...prev, country_of_origin: parts.join(', ') };
    });
    setCountrySearch('');
    setShowCountrySuggestions(false);
  };

  const handleCategoryToggle = (cat) => {
    setFormData(prev => {
      const currentCats = prev.category ? prev.category.split(',').map(c => c.trim()).filter(c => c !== '') : [];
      let newCats;
      if (currentCats.includes(cat)) {
        newCats = currentCats.filter(c => c !== cat);
      } else {
        newCats = [...currentCats, cat];
      }
      return { ...prev, category: newCats.join(', ') };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const productData = {
        ...formData,
        image: imageList.join(','),
        generic_specs: specs.filter(s => s.name && s.value).map(s => `${s.name}: ${s.value}`).join('\n'),
        status: 'Active'
      };

      await api.updateProduct(id, productData);
      showToast('Product updated successfully!');
      navigate('/products');
    } catch (err) {
      showToast('Error updating product: ' + err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return <div className="p-20 text-center text-slate-400 font-medium animate-pulse font-serif">Syncing master record...</div>;

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in zoom-in duration-500 pb-20">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
           <button onClick={() => navigate('/products')} className="p-3 bg-white border border-slate-200 rounded-2xl hover:bg-slate-50 transition-all shadow-sm">
              <ArrowLeft size={20} className="text-slate-600" />
           </button>
           <div>
              <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">
                 <span>Edit Record</span>
                 <ChevronRight size={10} />
                 <span className="text-primary font-mono">{formData.sku_name}</span>
              </div>
              <h1 className="text-3xl font-bold font-serif text-slate-900">Update Product</h1>
           </div>
        </div>
        <div className="flex gap-4">
          <button 
            type="button"
            onClick={() => navigate('/products')}
            className="px-6 py-3 rounded-2xl border border-slate-200 hover:bg-slate-50 transition-all font-semibold text-sm active:scale-95 text-slate-600"
          >
            Cancel
          </button>
          <button 
            form="product-form"
            disabled={loading}
            className="bg-primary hover:bg-primary-hover text-white px-8 py-3 rounded-2xl transition-all shadow-lg shadow-primary/20 font-bold text-sm flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
          >
            {loading ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
            <span>{loading ? 'Saving...' : 'Update Record'}</span>
          </button>
        </div>
      </div>

      <form id="product-form" onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          
          <div className="bg-white border border-slate-200 rounded-[2rem] p-10 space-y-8 shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 pb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                  <Info size={22} />
                </div>
                <h2 className="text-2xl font-bold font-serif text-slate-900">Product Identification</h2>
              </div>
              
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, is_bestseller: !prev.is_bestseller }))}
                className="flex items-center gap-3 cursor-pointer group/toggle select-none"
              >
                <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${formData.is_bestseller ? 'bg-amber-500 border-amber-500' : 'border-slate-200 group-hover/toggle:border-amber-500/50'}`}>
                  <Star size={14} className={`transition-all ${formData.is_bestseller ? 'text-white fill-white scale-110' : 'text-slate-300 scale-0'}`} />
                </div>
                <span className={`text-sm font-bold uppercase tracking-wider transition-colors ${formData.is_bestseller ? 'text-amber-600' : 'text-slate-400'}`}>
                  Best Seller
                </span>
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-3 ml-1">Product Title</label>
                <input 
                  type="text" 
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 text-base focus:outline-none focus:border-primary focus:bg-white transition-all text-slate-900"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-3 ml-1">SKU Identifier</label>
                <input 
                  type="text" 
                  name="sku_name"
                  value={formData.sku_name}
                  onChange={handleChange}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 text-base focus:outline-none focus:border-primary focus:bg-white transition-all text-slate-900"
                  required
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-3 ml-1">Industry Categories</label>
                <div className="flex flex-wrap gap-3">
                  {categories.map(cat => {
                    const isActive = formData.category.split(',').map(c => c.trim()).includes(cat);
                    return (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => handleCategoryToggle(cat)}
                        className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all border ${
                          isActive 
                            ? 'bg-primary/10 border-primary text-primary shadow-sm' 
                            : 'bg-slate-50 border-slate-200 text-slate-500 hover:border-slate-300'
                        }`}
                      >
                        {cat}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-3 ml-1">Origin Country</label>
                <div className="relative group/input">
                  <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within/input:text-primary transition-colors">
                    <Settings size={18} className="rotate-45" />
                  </div>
                  <input 
                    type="text" 
                    name="country_of_origin"
                    value={formData.country_of_origin}
                    onChange={handleChange}
                    onFocus={() => setShowCountrySuggestions(true)}
                    onBlur={() => setTimeout(() => setShowCountrySuggestions(false), 200)}
                    placeholder="Search countries..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-14 pr-6 py-4 text-base focus:outline-none focus:border-primary focus:bg-white transition-all text-slate-900"
                  />
                  
                  {showCountrySuggestions && (
                    <div className="absolute z-50 w-full mt-2 bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-2xl max-h-64 overflow-y-auto animate-in fade-in slide-in-from-top-2 duration-200">
                      <div className="p-2 border-b border-slate-50 bg-slate-50">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-3">Master List</span>
                      </div>
                      
                      {(() => {
                        const filtered = countries.filter(c => {
                          const searchPart = countrySearch.toLowerCase().trim();
                          if (!searchPart) return false;
                          return c.toLowerCase().includes(searchPart) && 
                                 !formData.country_of_origin.split(',').map(v => v.trim()).includes(c);
                        });

                        if (filtered.length === 0 && countrySearch) {
                          return <div className="p-5 text-center text-slate-400 text-sm italic">No matches found</div>;
                        }

                        return filtered.map(suggestion => (
                          <button
                            key={suggestion}
                            type="button"
                            onClick={() => handleSelectSuggestion(suggestion)}
                            className="w-full text-left px-5 py-4 text-sm hover:bg-slate-50 hover:text-primary transition-all border-b border-slate-50 flex items-center justify-between"
                          >
                            <span className="font-semibold">{suggestion}</span>
                            <Plus size={16} />
                          </button>
                        ));
                      })()}
                    </div>
                  )}
                </div>
                
                {formData.country_of_origin && (
                  <div className="flex flex-wrap gap-2 mt-4 ml-1">
                    {formData.country_of_origin.split(',').map(c => c.trim()).filter(c => c).map(selected => (
                      <span key={selected} className="px-3 py-1 bg-primary/5 border border-primary/20 text-primary rounded-lg text-[10px] font-bold uppercase tracking-wider flex items-center gap-2">
                        {selected}
                        <button type="button" onClick={() => handleCountryToggle(selected)} className="hover:text-red-500 transition-colors">
                          <X size={10} />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-3 ml-1">Quality Grade</label>
                <div className="flex flex-wrap gap-3">
                  {commonQualityGrades.map(grade => {
                    const isActive = formData.quality.split(',').map(g => g.trim()).includes(grade);
                    return (
                      <button
                        key={grade}
                        type="button"
                        onClick={() => handleQualityToggle(grade)}
                        className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all border ${
                          isActive 
                            ? 'bg-blue-50 border-blue-200 text-blue-600 shadow-sm' 
                            : 'bg-slate-50 border-slate-200 text-slate-500 hover:border-slate-300'
                        }`}
                      >
                        {grade}
                      </button>
                    );
                  })}
                </div>
                <input 
                  type="text" 
                  name="quality"
                  value={formData.quality}
                  onChange={handleChange}
                  placeholder="Others..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs mt-4 focus:outline-none focus:border-primary focus:bg-white transition-all text-slate-900"
                />
              </div>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-[2rem] p-10 space-y-8 shadow-sm">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-6">
              <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
                <ClipboardList size={22} />
              </div>
              <h2 className="text-2xl font-bold font-serif text-slate-900">Technical Intelligence</h2>
            </div>
            
            <div className="space-y-8">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-3 ml-1">Product Overview</label>
                <textarea 
                  name="product_overview"
                  value={formData.product_overview}
                  onChange={handleChange}
                  rows={4}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 text-base focus:outline-none focus:border-primary focus:bg-white transition-all resize-none text-slate-900"
                  required
                ></textarea>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-6 flex items-center justify-between ml-1">
                  <span>Generic Specifications</span>
                  <button 
                    type="button" 
                    onClick={addSpec}
                    className="flex items-center gap-1.5 text-[10px] bg-primary/10 text-primary px-3 py-1.5 rounded-lg hover:bg-primary/20 transition-all font-bold"
                  >
                    <Plus size={12} /> Add Property
                  </button>
                </label>
                
                <div className="space-y-3">
                  <DragDropContext onDragEnd={handleDragEnd}>
                    <Droppable droppableId="specs">
                      {(provided) => (
                        <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-3">
                          {specs.map((spec, index) => (
                            <Draggable key={spec.id} draggableId={spec.id} index={index}>
                              {(provided) => (
                                <div 
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  className="flex gap-3 items-center group animate-in slide-in-from-left duration-300" 
                                >
                                  <div {...provided.dragHandleProps} className="p-3 text-slate-300 hover:text-primary transition-colors cursor-grab active:cursor-grabbing">
                                    <GripVertical size={20} />
                                  </div>

                                  <div className="flex-1 grid grid-cols-2 gap-3 p-4 bg-slate-50 border border-slate-200 rounded-2xl group-hover:border-slate-300 transition-all">
                                    <input 
                                      type="text" 
                                      placeholder="pH, Purity, etc." 
                                      value={spec.name}
                                      onChange={(e) => handleSpecChange(index, 'name', e.target.value)}
                                      className="bg-transparent text-sm font-bold text-primary focus:outline-none placeholder:text-slate-300"
                                    />
                                    <input 
                                      type="text" 
                                      placeholder="Value" 
                                      value={spec.value}
                                      onChange={(e) => handleSpecChange(index, 'value', e.target.value)}
                                      className="bg-transparent text-sm text-slate-600 focus:outline-none placeholder:text-slate-300"
                                    />
                                  </div>

                                  <button 
                                    type="button" 
                                    onClick={() => removeSpec(index)}
                                    className="p-3 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                                  >
                                    <Trash2 size={18} />
                                  </button>
                                </div>
                              )}
                            </Draggable>
                          ))}
                          {provided.placeholder}
                        </div>
                      )}
                    </Droppable>
                  </DragDropContext>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-[2rem] p-8 space-y-8 shadow-sm">
             <div className="flex items-center gap-3 border-b border-slate-50 pb-4">
              <div className="w-9 h-9 bg-purple-50 rounded-xl flex items-center justify-center text-purple-600">
                <Settings size={20} />
              </div>
              <h2 className="text-xl font-bold font-serif text-slate-900">Applications</h2>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1">Market Uses</label>
                <input 
                  type="text" 
                  name="applications"
                  value={formData.applications}
                  onChange={handleChange}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3.5 text-sm focus:outline-none focus:border-purple-400 focus:bg-white transition-all text-slate-900"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1">Packaging Range</label>
                <div className="grid grid-cols-2 gap-2 mt-3 mb-4">
                  {commonPackagingOptions.map(pkg => {
                    const isActive = formData.packaging.split(',').map(p => p.trim()).includes(pkg);
                    return (
                      <button
                        key={pkg}
                        type="button"
                        onClick={() => handlePackagingToggle(pkg)}
                        className={`text-left px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
                          isActive 
                            ? 'bg-purple-50 border-purple-200 text-purple-600 shadow-sm' 
                            : 'bg-slate-50 border-slate-200 text-slate-500 hover:border-slate-300'
                        }`}
                      >
                        {pkg}
                      </button>
                    );
                  })}
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1">Compliance</label>
                <div className="grid grid-cols-2 gap-2 mt-3">
                  {commonCertifications.map(cert => {
                    const isActive = formData.certifications.split(',').map(c => c.trim()).includes(cert);
                    return (
                      <button
                        key={cert}
                        type="button"
                        onClick={() => handleCertToggle(cert)}
                        className={`text-left px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
                          isActive 
                        ? 'bg-primary/5 border-primary text-primary shadow-sm' 
                        : 'bg-slate-50 border-slate-200 text-slate-500 hover:border-slate-300'
                        }`}
                      >
                        {cert}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-[2rem] p-8 space-y-8 shadow-sm">
            <div className="flex items-center gap-3 border-b border-slate-50 pb-4">
              <div className="w-9 h-9 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600">
                <ImageIcon size={20} />
              </div>
              <h2 className="text-xl font-bold font-serif text-slate-900">Gallery ({imageList.length}/5)</h2>
            </div>
            
            <div className="space-y-6">
              <div className="space-y-3">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Image Link</label>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    value={imageUrlInput}
                    onChange={(e) => setImageUrlInput(e.target.value)}
                    placeholder="https://..."
                    className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-emerald-400 focus:bg-white transition-all text-slate-900"
                    disabled={imageList.length >= 5}
                  />
                  <button
                    type="button"
                    onClick={handleAddImageUrl}
                    className="bg-emerald-50 hover:bg-emerald-100 text-emerald-600 p-3 rounded-xl transition-all shadow-sm"
                  >
                    <Plus size={20} />
                  </button>
                </div>
              </div>

              <label className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-3xl cursor-pointer transition-all ${imageList.length >= 5 ? 'border-slate-100 opacity-50' : 'border-slate-200 hover:bg-slate-50 hover:border-emerald-300'}`}>
                <div className="flex flex-col items-center justify-center">
                  {uploading ? <Loader2 size={24} className="animate-spin text-emerald-500" /> : <Upload size={24} className="text-slate-400 mb-2" />}
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">{uploading ? 'Processing' : 'Browse Files'}</p>
                </div>
                <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} disabled={imageList.length >= 5 || uploading} />
              </label>

              <div className="grid grid-cols-2 gap-4 pt-4">
                {imageList.map((url, index) => (
                  <div key={index} className={`relative aspect-square rounded-2xl overflow-hidden border group ${index === 0 ? 'border-primary' : 'border-slate-200'}`}>
                    <img src={url} alt="Preview" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                    <button type="button" onClick={() => handleRemoveImage(index)} className="absolute inset-0 bg-red-500/80 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                      <Trash2 size={20} />
                    </button>
                    {index === 0 && <div className="absolute top-2 left-2 px-2 py-0.5 bg-primary text-white text-[8px] font-black uppercase rounded shadow-sm">Main</div>}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
