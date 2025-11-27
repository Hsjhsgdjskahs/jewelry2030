import React, { useContext } from 'react';
import { AppContext } from '../../App';
import { Product } from '../../types';
import { Edit, Trash2, PlusCircle } from 'lucide-react';
import { useI18n } from '../../i18n/I18nProvider';
import { useCurrency } from '../../hooks/useCurrency';

interface AdminProductListProps {
  onEdit: (product: Product) => void;
  onDelete: (productId: string) => void;
  onAddNew: () => void;
}

const AdminProductList: React.FC<AdminProductListProps> = ({ onEdit, onDelete, onAddNew }) => {
  const context = useContext(AppContext);
  const { t } = useI18n();
  const { formatPrice } = useCurrency();

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg border border-stone-200 animate-fade-in">
        <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-serif">{t('productList.title')}</h3>
            <button 
                onClick={onAddNew}
                className="inline-flex items-center bg-stone-800 text-white font-bold py-2 px-4 rounded-md text-sm hover:bg-stone-900 transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 active:translate-y-0 active:scale-95"
            >
                <PlusCircle size={16} className="me-2"/>
                {t('productList.addNew')}
            </button>
        </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-stone-200">
          <thead className="bg-stone-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-start text-xs font-medium text-stone-500 uppercase tracking-wider">{t('productList.image')}</th>
              <th scope="col" className="px-6 py-3 text-start text-xs font-medium text-stone-500 uppercase tracking-wider">{t('productList.productName')}</th>
              <th scope="col" className="px-6 py-3 text-start text-xs font-medium text-stone-500 uppercase tracking-wider">{t('productList.price')}</th>
              <th scope="col" className="relative px-6 py-3">
                <span className="sr-only">{t('productList.actions')}</span>
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-stone-200">
            {context?.products.map((product) => (
              <tr key={product.id} className="hover:bg-stone-50/50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                    <img src={product.imageUrls[0]} alt={product.name} className="h-12 w-12 rounded-md object-cover"/>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-stone-900">{product.name}</div>
                  <div className="text-sm text-stone-500">{product.category}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-stone-900">{formatPrice(product.price)}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-end text-sm font-medium space-x-4">
                  <button onClick={() => onEdit(product)} className="text-stone-600 hover:text-stone-900 transition-colors" aria-label={`${t('productList.editAria')} ${product.name}`}>
                    <Edit size={18} />
                  </button>
                  <button onClick={() => onDelete(product.id)} className="text-red-600 hover:text-red-900 transition-colors" aria-label={`${t('productList.deleteAria')} ${product.name}`}>
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminProductList;
