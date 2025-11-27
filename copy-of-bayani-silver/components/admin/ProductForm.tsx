
import React, { useState, useContext, useEffect, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { AppContext } from '../../App';
import { Product } from '../../types';
import { generateDescription, generateMetaDescription, generateFullProduct, generateDescriptionFromImage, suggestProductNames } from '../../services/geminiService';
import LoadingSpinner from '../LoadingSpinner';
import { Sparkles, X, UploadCloud, Film, Image as ImageIcon, VenetianMask, Box } from 'lucide-react';
import { useI18n } from '../../i18n/I18nProvider';

interface ProductFormProps {
  product: Product | null;
  onFormClose: () => void;
}

const NameSuggestionsModal: React.FC<{
    suggestions: string[];
    onSelect: (name: string) => void;
    onClose: () => void;
}> = ({ suggestions, onSelect, onClose }) => {
    const { t } = useI18n();
    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md" onClick={e => e.stopPropagation()}>
                <h3 className="text-lg font-semibold mb-4">{t('productForm.nameSuggestionsTitle')}</h3>
                <ul className="space-y-2">
                    {suggestions.map((name, i) => (
                        <li key={i}>
                            <button
                                onClick={() => onSelect(name)}
                                className="w-full text-start p-2 rounded-md hover:bg-stone-100 transition-colors"
                            >
                                {name}
                            </button>
                        </li>
                    ))}
                </ul>
                <button onClick={onClose} className="mt-4 w-full text-center text-sm font-bold text-stone-600 py-2 rounded-md hover:bg-stone-100">Close</button>
            </div>
        </div>
    );
};


const ProductForm: React.FC<ProductFormProps> = ({ product, onFormClose }) => {
  const context = useContext(AppContext);
  const { t } = useI18n();
  
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);

  const [formData, setFormData] = useState<Omit<Product, 'id'>>({
    name: '', price: 0, description: '', 
    imageUrls: [], videoUrl: '', modelUrl: '', category: 'Tableware',
    metaDescription: '', isEngravable: false,
  });

  const [isGenerating, setIsGenerating] = useState(false);
  const [isGeneratingFromImage, setIsGeneratingFromImage] = useState(false);
  const [descError, setDescError] = useState('');
  const [isGeneratingMeta, setIsGeneratingMeta] = useState(false);
  const [metaError, setMetaError] = useState('');
  const [formError, setFormError] = useState('');
  const [isGeneratingFull, setIsGeneratingFull] = useState(false);
  
  const [isNameModalOpen, setIsNameModalOpen] = useState(false);
  const [nameSuggestions, setNameSuggestions] = useState<string[]>([]);
  const [isSuggestingNames, setIsSuggestingNames] = useState(false);
  const [nameSuggestionError, setNameSuggestionError] = useState('');


  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (product) {
      setFormData({ ...product, videoUrl: product.videoUrl || '', modelUrl: product.modelUrl || '' });
      setImagePreviews(product.imageUrls);
      setVideoPreview(product.videoUrl || null);
    } else {
        const newId = uuidv4();
        setFormData({
            name: '', price: 0, description: '', 
            imageUrls: [], videoUrl: '', modelUrl: '',
            category: 'Tableware', metaDescription: '', isEngravable: false,
        });
        setImagePreviews([]);
        setVideoPreview(null);
    }
  }, [product]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const isCheckbox = type === 'checkbox';
    setFormData(prev => ({ 
      ...prev, 
      [name]: isCheckbox ? (e.target as HTMLInputElement).checked : (name === 'price' ? parseFloat(value) : value) 
    }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    // FIX: The `file` argument in `map` was inferred as `unknown`, which is not assignable
    // to the `Blob` or `MediaSource` parameter required by `URL.createObjectURL`.
    // Casting `file` to `File` resolves this TypeScript type error.
    const newImageUrls = files.map(file => URL.createObjectURL(file as File));
    setImagePreviews(prev => [...prev, ...newImageUrls]);
    setFormData(prev => ({ ...prev, imageUrls: [...prev.imageUrls, ...newImageUrls]}));
  };
  
  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const videoUrl = URL.createObjectURL(file);
    setVideoPreview(videoUrl);
    setFormData(prev => ({ ...prev, videoUrl }));
  };
  
  const removeImage = (index: number) => {
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
    setFormData(prev => ({ ...prev, imageUrls: prev.imageUrls.filter((_, i) => i !== index) }));
  };

  const removeVideo = () => {
    setVideoPreview(null);
    setFormData(prev => ({ ...prev, videoUrl: ''}));
  };

  const handleGenerateFullProduct = async () => {
    if (!formData.name) {
        setFormError(t('productForm.errors.nameRequiredForGenerate'));
        return;
    }
    setFormError('');
    setIsGeneratingFull(true);
    try {
        const productConcept = formData.name;
        const details = await generateFullProduct(productConcept);
        setFormData(prev => ({
            ...prev,
            name: details.name || prev.name,
            price: details.price || 0,
            description: details.description || '',
            category: details.category || 'Other',
            metaDescription: details.metaDescription || '',
        }));
    } catch (error) {
        setFormError(t('productForm.errors.generateFailed'));
    } finally {
        setIsGeneratingFull(false);
    }
  };

  const handleGenerateDescription = async () => {
    if (!formData.name || !formData.category) {
      setDescError(t('productForm.errors.descRequiredForGenerate'));
      return;
    }
    setDescError('');
    setIsGenerating(true);
    try {
      const description = await generateDescription(formData.name, formData.category);
      setFormData(prev => ({ ...prev, description }));
    } catch (error) {
      setDescError(t('productForm.errors.generateDescFailed'));
    } finally {
      setIsGenerating(false);
    }
  };

   const handleGenerateDescFromImage = async () => {
    if (formData.imageUrls.length === 0) {
      setDescError(t('productForm.errors.imageRequiredForGenerate'));
      return;
    }
    setDescError('');
    setIsGeneratingFromImage(true);
    try {
        const response = await fetch(formData.imageUrls[0]);
        const blob = await response.blob();
        const reader = new FileReader();
        reader.readAsDataURL(blob);
        reader.onloadend = async () => {
            const base64Data = (reader.result as string).split(',')[1];
            const mimeType = blob.type;
            const description = await generateDescriptionFromImage(base64Data, mimeType);
            setFormData(prev => ({ ...prev, description }));
        };
    } catch (error) {
      setDescError(t('productForm.errors.generateDescFromImageFailed'));
    } finally {
      setIsGeneratingFromImage(false);
    }
  };
  
   const handleGenerateMetaDescription = async () => {
    if (!formData.name || !formData.description) {
      setMetaError(t('productForm.errors.metaRequiredForGenerate'));
      return;
    }
    setMetaError('');
    setIsGeneratingMeta(true);
    try {
      const metaDescription = await generateMetaDescription(formData.name, formData.description);
      setFormData(prev => ({ ...prev, metaDescription }));
    } catch (error) {
      setMetaError(t('productForm.errors.generateMetaFailed'));
    } finally {
      setIsGeneratingMeta(false);
    }
  };

  const handleSuggestNames = async () => {
      if (!formData.description) {
          setNameSuggestionError(t('productForm.errors.descRequiredForName'));
          return;
      }
      setNameSuggestionError('');
      setIsSuggestingNames(true);
      try {
          const names = await suggestProductNames(formData.description);
          setNameSuggestions(names);
          setIsNameModalOpen(true);
      } catch (err) {
          setNameSuggestionError(t('productForm.nameSuggestionsError'));
      } finally {
          setIsSuggestingNames(false);
      }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.imageUrls.length === 0) {
        setFormError(t('productForm.errors.oneImageRequired'));
        return;
    }
    if (product) {
      context?.setProducts(prev => prev.map(p => p.id === product.id ? { ...formData, id: product.id } : p));
    } else {
      context?.setProducts(prev => [{ ...formData, id: uuidv4() }, ...prev]);
    }
    onFormClose();
  };

  return (
    <>
    {isNameModalOpen && (
        <NameSuggestionsModal
            suggestions={nameSuggestions}
            onClose={() => setIsNameModalOpen(false)}
            onSelect={name => {
                setFormData(prev => ({ ...prev, name }));
                setIsNameModalOpen(false);
            }}
        />
    )}
    <div className="bg-white dark:bg-stone-800 p-8 rounded-lg shadow-lg border border-stone-200 dark:border-stone-700 mb-8 animate-fade-in">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-serif">{product ? t('productForm.editTitle') : t('productForm.addTitle')}</h2>
        <button onClick={onFormClose} className="text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200 transition-transform hover:scale-110 active:scale-95 focus-ring rounded-full p-1" aria-label={t('productForm.closeAria')}>
            <X size={24} />
        </button>
      </div>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-stone-700 dark:text-stone-300">{t('productForm.nameLabel')}</label>
          <div className="flex items-center gap-2">
            <input type="text" name="name" id="name" value={formData.name} onChange={handleChange} required className="mt-1 w-full form-input focus-ring" />
            <button type="button" onClick={handleGenerateFullProduct} disabled={isGeneratingFull || !formData.name} title={t('productForm.generateDetailsTooltip')} className="mt-1 group flex items-center p-2 bg-stone-100 dark:bg-stone-700 hover:bg-stone-200 dark:hover:bg-stone-600 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus-ring">
              {isGeneratingFull ? <LoadingSpinner size="sm" /> : <Sparkles size={18} className="text-yellow-500/80 group-hover:text-yellow-500 transition-colors" />}
            </button>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="price" className="block text-sm font-medium text-stone-700 dark:text-stone-300">{t('productForm.priceLabel')}</label>
              <input type="number" name="price" id="price" value={formData.price} onChange={handleChange} required className="mt-1 w-full form-input focus-ring" step="0.01"/>
            </div>
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-stone-700 dark:text-stone-300">{t('productForm.categoryLabel')}</label>
               <select name="category" id="category" value={formData.category} onChange={handleChange} className="mt-1 w-full form-input focus-ring">
                <option>Tableware</option><option>Jewelry</option><option>Decor</option><option>Other</option>
              </select>
            </div>
        </div>
        <div>
          <div className="flex justify-between items-center">
            <label htmlFor="description" className="block text-sm font-medium text-stone-700 dark:text-stone-300">{t('productForm.descriptionLabel')}</label>
             <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleGenerateDescFromImage}
                  disabled={isGeneratingFromImage || formData.imageUrls.length === 0}
                  title={t('productForm.generateDescriptionFromImageTooltip')}
                  className="group flex items-center text-xs font-semibold text-stone-600 dark:text-stone-300 hover:text-[--color-gold-dark] transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus-ring rounded-sm p-1"
                >
                  {isGeneratingFromImage ? <LoadingSpinner size="sm" /> : <ImageIcon size={14} className="me-1 text-sky-500/80 group-hover:text-sky-500 transition-colors" />}
                  {t('productForm.generateFromImageButton')}
                </button>
                <button
                  type="button"
                  onClick={handleGenerateDescription}
                  disabled={isGenerating || !formData.name}
                  title={t('productForm.generateDescriptionTooltip')}
                  className="group flex items-center text-xs font-semibold text-stone-600 dark:text-stone-300 hover:text-[--color-gold-dark] transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus-ring rounded-sm p-1"
                >
                  {isGenerating ? <LoadingSpinner size="sm" /> : <Sparkles size={14} className="me-1 text-yellow-500/80 group-hover:text-yellow-500 transition-colors" />}
                  {t('productForm.generateButton')}
                </button>
             </div>
          </div>
          <textarea name="description" id="description" value={formData.description} onChange={handleChange} rows={4} required className="mt-1 w-full form-input focus-ring" />
          {descError && <p className="text-red-500 text-xs mt-1">{descError}</p>}
          <div className="mt-2 text-end">
             <button
                type="button"
                onClick={handleSuggestNames}
                disabled={isSuggestingNames || !formData.description}
                className="group flex items-center text-xs font-semibold text-indigo-600 hover:text-indigo-800 disabled:opacity-50 disabled:cursor-not-allowed"
             >
                {isSuggestingNames ? <LoadingSpinner size="sm" /> : <VenetianMask size={14} className="me-1" />}
                {t('productForm.suggestNames')}
             </button>
             {nameSuggestionError && <p className="text-red-500 text-xs mt-1 text-end">{nameSuggestionError}</p>}
          </div>
        </div>
        <div>
          <div className="flex justify-between items-center">
            <label htmlFor="metaDescription" className="block text-sm font-medium text-stone-700 dark:text-stone-300">{t('productForm.metaDescriptionLabel')}</label>
            <button
              type="button"
              onClick={handleGenerateMetaDescription}
              disabled={isGeneratingMeta || !formData.description || !formData.name}
              title={t('productForm.generateMetaTooltip')}
              className="group flex items-center text-xs font-semibold text-stone-600 dark:text-stone-300 hover:text-[--color-gold-dark] transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus-ring rounded-sm p-1"
            >
              {isGeneratingMeta ? <LoadingSpinner size="sm" /> : <Sparkles size={14} className="me-1 text-yellow-500/80 group-hover:text-yellow-500 transition-colors" />}
              {t('productForm.generateButton')}
            </button>
          </div>
          <textarea name="metaDescription" id="metaDescription" value={formData.metaDescription} onChange={handleChange} rows={2} maxLength={160} className="mt-1 w-full form-input focus-ring" />
          {metaError && <p className="text-red-500 text-xs mt-1">{metaError}</p>}
        </div>
        
        {/* File Uploads */}
        <div>
            <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-2">{t('productForm.imagesLabel')}</label>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                {imagePreviews.map((src, index) => (
                    <div key={index} className="relative group aspect-square">
                        <img src={src} alt={`Preview ${index}`} className="w-full h-full object-cover rounded-md shadow-sm" />
                        <button type="button" onClick={() => removeImage(index)} className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity focus-ring"><X size={14}/></button>
                    </div>
                ))}
                <button type="button" onClick={() => imageInputRef.current?.click()} className="aspect-square flex flex-col items-center justify-center bg-stone-50 dark:bg-stone-700/50 border-2 border-dashed rounded-md hover:bg-stone-100 dark:hover:bg-stone-700 hover:border-stone-400 dark:hover:border-stone-500 transition-colors">
                    <UploadCloud size={24} className="text-stone-500 dark:text-stone-400" />
                    <span className="text-xs mt-1 text-stone-600 dark:text-stone-300">{t('productForm.upload')}</span>
                </button>
            </div>
            <input type="file" ref={imageInputRef} onChange={handleImageUpload} multiple accept="image/*" className="hidden"/>
        </div>
        
        <div>
            <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-2">{t('productForm.videoLabel')}</label>
            {videoPreview ? (
                <div className="relative group w-40">
                    <video src={videoPreview} className="w-full h-auto rounded-md shadow-sm" muted loop playsInline/>
                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"><Film size={32} className="text-white"/></div>
                    <button type="button" onClick={removeVideo} className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity focus-ring"><X size={14}/></button>
                </div>
            ) : (
                <button type="button" onClick={() => videoInputRef.current?.click()} className="w-40 h-24 flex flex-col items-center justify-center bg-stone-50 dark:bg-stone-700/50 border-2 border-dashed rounded-md hover:bg-stone-100 dark:hover:bg-stone-700 hover:border-stone-400 dark:hover:border-stone-500 transition-colors">
                    <Film size={24} className="text-stone-500 dark:text-stone-400" />
                    <span className="text-xs mt-1 text-stone-600 dark:text-stone-300">{t('productForm.uploadVideo')}</span>
                </button>
            )}
            <input type="file" ref={videoInputRef} onChange={handleVideoUpload} accept="video/*" className="hidden"/>
        </div>

        <div>
            <label htmlFor="modelUrl" className="block text-sm font-medium text-stone-700 dark:text-stone-300">3D Model URL (.glb / .gltf)</label>
            <div className="flex items-center gap-2">
                <input type="text" name="modelUrl" id="modelUrl" value={formData.modelUrl} onChange={handleChange} className="mt-1 w-full form-input focus-ring" placeholder="https://.../model.glb" />
                <Box size={24} className="text-stone-400" />
            </div>
        </div>

        {formError && <p className="text-red-600 text-sm">{formError}</p>}
        
        <div>
            <label className="flex items-center">
                <input type="checkbox" name="isEngravable" checked={formData.isEngravable} onChange={handleChange} className="h-4 w-4 rounded border-stone-300 dark:border-stone-600 text-[--color-gold-dark] focus:ring-[--color-gold-dark]/50 bg-transparent dark:bg-stone-800" />
                <span className="ms-2 text-sm text-stone-700 dark:text-stone-300">{t('productForm.engravableLabel')}</span>
            </label>
        </div>
        <div className="flex justify-end items-center space-x-4 pt-4 border-t border-stone-200 dark:border-stone-700">
            <button type="button" onClick={onFormClose} className="py-2 px-6 bg-white dark:bg-stone-700 text-stone-700 dark:text-stone-200 font-bold rounded-md border border-stone-300 dark:border-stone-600 hover:bg-stone-50 dark:hover:bg-stone-600 transition-all duration-300 shadow-sm transform hover:-translate-y-0.5 active:translate-y-0 active:scale-95 focus-ring">
                {t('common.cancel')}
            </button>
            <button type="submit" className="py-2 px-6 bg-stone-800 text-white font-bold rounded-md hover:bg-stone-900 transition-all duration-300 shadow-sm transform hover:-translate-y-0.5 active:translate-y-0 active:scale-95 focus-ring">
                {product ? t('common.saveChanges') : t('productForm.addProductButton')}
            </button>
        </div>
      </form>
    </div>
    </>
  );
};

export default ProductForm;
