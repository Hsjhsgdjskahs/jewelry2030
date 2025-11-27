
import React, { useState, useContext } from 'react';
import { AppContext } from '../../App';
import { Product, Story } from '../../types';
import ProductForm from './ProductForm';
import AdminProductList from './AdminProductList';
import AdminSummary from './AdminSummary';
import AdminSettings from './AdminSettings';
import OrderManagement from './OrderManagement';
import ReviewManagement from './ReviewManagement';
import MarketingTools from './MarketingTools';
import ImageStudio from './ImageStudio';
import ContentStudio from './ContentStudio';
import { LogOut, LayoutDashboard, Package, Settings, ShoppingCart, MessageSquare, Megaphone, Wand2, PenSquare, Clapperboard, Video, Film, FileSearch, CreditCard } from 'lucide-react';
import { useI18n } from '../../i18n/I18nProvider';
import StoryForm from './StoryForm';
import AdminStoryList from './AdminStoryList';
import VideoStudio from './VideoStudio';
import VideoAnalysisStudio from './VideoAnalysisStudio';
import PaymentSettings from './PaymentSettings';

type AdminTab = 'dashboard' | 'products' | 'orders' | 'reviews' | 'marketing' | 'contentStudio' | 'imageStudio' | 'videoStudio' | 'videoAnalysis' | 'stories' | 'settings' | 'payments';

const AdminDashboard: React.FC = () => {
  const context = useContext(AppContext);
  const { t } = useI18n();
  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');

  const TABS: { id: AdminTab, label: string, icon: React.ElementType }[] = [
      { id: 'dashboard', label: t('adminDashboard.tabs.dashboard'), icon: LayoutDashboard },
      { id: 'products', label: t('adminDashboard.tabs.products'), icon: Package },
      { id: 'orders', label: t('adminDashboard.tabs.orders'), icon: ShoppingCart },
      { id: 'reviews', label: t('adminDashboard.tabs.reviews'), icon: MessageSquare },
      { id: 'marketing', label: t('adminDashboard.tabs.marketing'), icon: Megaphone },
      { id: 'contentStudio', label: t('adminDashboard.tabs.contentStudio'), icon: PenSquare },
      { id: 'imageStudio', label: t('adminDashboard.tabs.imageStudio'), icon: Wand2 },
      { id: 'videoStudio', label: t('adminDashboard.tabs.videoStudio'), icon: Film },
      { id: 'videoAnalysis', label: t('adminDashboard.tabs.videoAnalysis'), icon: FileSearch },
      { id: 'stories', label: t('adminDashboard.tabs.stories'), icon: Clapperboard },
      { id: 'payments', label: t('adminDashboard.tabs.payments'), icon: CreditCard },
      { id: 'settings', label: t('adminDashboard.tabs.settings'), icon: Settings },
  ];

  const renderContent = () => {
      switch (activeTab) {
          case 'dashboard':
              return <AdminSummary setActiveTab={setActiveTab} />;
          case 'products':
              return <ProductManagement />;
          case 'orders':
              return <OrderManagement />;
          case 'reviews':
              return <ReviewManagement />;
          case 'marketing':
              return <MarketingTools />;
          case 'contentStudio':
              return <ContentStudio />;
          case 'imageStudio':
              return <ImageStudio />;
          case 'videoStudio':
              return <VideoStudio />;
          case 'videoAnalysis':
              return <VideoAnalysisStudio />;
          case 'stories':
              return <StoryManagement />;
          case 'payments':
              return <PaymentSettings />;
          case 'settings':
              return <AdminSettings />;
          default:
              return null;
      }
  }

  return (
    <div className="animate-fade-in">
      <div className="flex justify-between items-center mb-6 pb-4 border-b border-stone-200">
        <div>
          <h1 className="text-4xl font-serif text-stone-800">{t('adminDashboard.title')}</h1>
          <p className="text-stone-600">{t('adminDashboard.subtitle')}</p>
        </div>
        <button 
            onClick={context?.logout} 
            className="group flex items-center text-sm font-semibold text-stone-600 hover:text-stone-900 transition-colors duration-200 transform hover:-translate-y-0.5 active:translate-y-0 focus-ring rounded-sm"
        >
            <LogOut size={16} className="me-2"/>
            {t('adminDashboard.logout')}
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        <aside className="md:w-1/4">
            <nav className="flex flex-row md:flex-col gap-2 bg-white p-4 rounded-lg shadow-md border overflow-x-auto md:overflow-visible">
                {TABS.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center w-full text-start p-3 rounded-md text-sm font-medium transition-all duration-200 focus-ring whitespace-nowrap ${
                            activeTab === tab.id 
                            ? 'bg-stone-800 text-white shadow-sm' 
                            : 'text-stone-600 hover:bg-stone-100 hover:text-stone-900 hover:translate-x-1 rtl:hover:-translate-x-1'
                        }`}
                    >
                        <tab.icon size={18} className="me-3" />
                        {tab.label}
                    </button>
                ))}
            </nav>
        </aside>

        <main className="flex-1">
            {renderContent()}
        </main>
      </div>
    </div>
  );
};

const ProductManagement: React.FC = () => {
  const context = useContext(AppContext);
  const { t } = useI18n();
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isFormVisible, setIsFormVisible] = useState(false);

  const handleAddNew = () => {
    setEditingProduct(null);
    setIsFormVisible(true);
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setIsFormVisible(true);
  };

  const handleDelete = (productId: string) => {
    if (window.confirm(t('adminDashboard.deleteConfirm'))) {
      context?.setProducts(prev => prev.filter(p => p.id !== productId));
    }
  };

  const handleFormClose = () => {
    setIsFormVisible(false);
    setEditingProduct(null);
  };

  if (isFormVisible) {
      return <ProductForm product={editingProduct} onFormClose={handleFormClose} />;
  }

  return <AdminProductList onEdit={handleEdit} onDelete={handleDelete} onAddNew={handleAddNew} />;
}

const StoryManagement: React.FC = () => {
    const context = useContext(AppContext);
    const { t } = useI18n();
    const [isFormVisible, setIsFormVisible] = useState(false);
    const [editingStory, setEditingStory] = useState<Story | null>(null);

    const handleAddNew = () => {
        setEditingStory(null);
        setIsFormVisible(true);
    };
    
    const handleEdit = (story: Story) => {
        setEditingStory(story);
        setIsFormVisible(true);
    };

    const handleDelete = (storyId: string) => {
        if (window.confirm(t('storyManagement.deleteConfirm'))) {
            context?.setStories(prev => prev.filter(s => s.id !== storyId));
        }
    };
    
    const handleFormClose = () => {
        setIsFormVisible(false);
        setEditingStory(null);
    };

    if (isFormVisible) {
        return <StoryForm story={editingStory} onFormClose={handleFormClose} />;
    }

    return <AdminStoryList onEdit={handleEdit} onDelete={handleDelete} onAddNew={handleAddNew} />;
}


export default AdminDashboard;
