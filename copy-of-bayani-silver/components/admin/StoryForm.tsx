import React, { useState, useContext, useRef, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { AppContext } from '../../App';
import { Story } from '../../types';
import { X, UploadCloud, Clapperboard } from 'lucide-react';
import { useI18n } from '../../i18n/I18nProvider';

interface StoryFormProps {
  story: Story | null;
  onFormClose: () => void;
}

const StoryForm: React.FC<StoryFormProps> = ({ story, onFormClose }) => {
  const context = useContext(AppContext);
  const { t } = useI18n();
  
  const [title, setTitle] = useState('');
  const [productId, setProductId] = useState<string>('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageBase64, setImageBase64] = useState<string>('');
  const [formError, setFormError] = useState('');
  const [selectedProductImage, setSelectedProductImage] = useState<string | null>(null);

  const imageInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (story) {
        setTitle(story.title);
        setProductId(story.productId);
        setImagePreview(story.imageUrl);
        setImageBase64(story.imageUrl);
    } else {
        // Set default product for new story form
        setProductId(context?.products[0]?.id || '');
    }
  }, [story, context?.products]);

  useEffect(() => {
    const product = context?.products.find(p => p.id === productId);
    if (product && product.imageUrls.length > 0) {
        setSelectedProductImage(product.imageUrls[0]);
    } else {
        setSelectedProductImage(null);
    }
  }, [productId, context?.products]);
  
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const objectUrl = URL.createObjectURL(file);
    setImagePreview(objectUrl);
    setImageBase64(objectUrl);
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !productId || !imageBase64) {
        setFormError(t('storyForm.error'));
        return;
    }
    
    const product = context?.products.find(p => p.id === productId);
    if (!product) return;

    if (story) { // Editing existing story
        const updatedStory: Story = {
            ...story,
            productId,
            title,
            imageUrl: imageBase64,
            previewImageUrl: imageBase64,
            productName: product.name,
        };
        context?.setStories(prev => prev.map(s => s.id === story.id ? updatedStory : s));
    } else { // Creating new story
        const newStory: Story = {
            id: uuidv4(),
            productId: productId,
            imageUrl: imageBase64,
            previewImageUrl: imageBase64,
            title: title,
            productName: product.name,
        };
        context?.setStories(prev => [newStory, ...prev]);
    }
    onFormClose();
  };

  return (
    <div className="bg-white p-8 rounded-lg shadow-lg border border-stone-200 mb-8 animate-fade-in">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-serif flex items-center gap-2">
            <Clapperboard size={20}/> {story ? t('storyForm.editTitle') : t('storyForm.addTitle')}
        </h2>
        <button onClick={onFormClose} className="text-stone-500 hover:text-stone-800 transition-transform hover:scale-110 focus-ring rounded-full p-1" aria-label={t('storyForm.closeAria')}>
            <X size={24} />
        </button>
      </div>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
            <label htmlFor="productId" className="block text-sm font-medium text-stone-700">{t('storyForm.productLabel')}</label>
            <div className="flex items-center gap-4 mt-1">
                <select name="productId" id="productId" value={productId} onChange={e => setProductId(e.target.value)} className="w-full form-input focus-ring form-select">
                    {context?.products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
                {selectedProductImage && (
                    <img src={selectedProductImage} alt="Selected product" className="h-12 w-12 rounded-md object-cover flex-shrink-0" />
                )}
            </div>
        </div>
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-stone-700">{t('storyForm.titleLabel')}</label>
          <input type="text" name="title" id="title" value={title} onChange={e => setTitle(e.target.value)} required className="mt-1 w-full form-input focus-ring" />
        </div>
        
        <div>
            <label className="block text-sm font-medium text-stone-700 mb-2">{t('storyForm.imageLabel')}</label>
            <div className="flex items-center gap-4">
                <button type="button" onClick={() => imageInputRef.current?.click()} className="h-48 w-28 flex-shrink-0 flex flex-col items-center justify-center bg-stone-50 border-2 border-dashed rounded-md hover:bg-stone-100 hover:border-stone-400 transition-colors">
                    <UploadCloud size={24} className="text-stone-500" />
                    <span className="text-xs mt-1 text-stone-600">{t('storyForm.upload')}</span>
                </button>
                 {imagePreview && (
                    <div className="relative group">
                         <img src={imagePreview} alt="Story preview" className="h-48 w-28 rounded-md shadow-sm object-cover" />
                         <button type="button" onClick={() => { setImagePreview(null); setImageBase64(''); if (imageInputRef.current) imageInputRef.current.value = ""; }} className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity focus-ring"><X size={14}/></button>
                    </div>
                )}
            </div>
            <input type="file" ref={imageInputRef} onChange={handleImageUpload} accept="image/*" className="hidden"/>
        </div>

        {formError && <p className="text-red-600 text-sm">{formError}</p>}
        
        <div className="flex justify-end items-center space-x-4 pt-4 border-t border-stone-200">
            <button type="button" onClick={onFormClose} className="py-2 px-6 bg-white text-stone-700 font-bold rounded-md border border-stone-300 hover:bg-stone-50 transition-all shadow-sm transform hover:-translate-y-0.5 active:translate-y-0 focus-ring">
                {t('common.cancel')}
            </button>
            <button type="submit" className="py-2 px-6 bg-stone-800 text-white font-bold rounded-md hover:bg-stone-900 transition-all shadow-sm transform hover:-translate-y-0.5 active:translate-y-0 focus-ring">
                {story ? t('common.saveChanges') : t('storyForm.addStoryButton')}
            </button>
        </div>
      </form>
    </div>
  );
};

export default StoryForm;