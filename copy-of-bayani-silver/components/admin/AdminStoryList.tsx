import React, { useContext } from 'react';
import { AppContext } from '../../App';
import { Story } from '../../types';
import { Trash2, PlusCircle, Edit } from 'lucide-react';
import { useI18n } from '../../i18n/I18nProvider';

interface AdminStoryListProps {
  onDelete: (storyId: string) => void;
  onEdit: (story: Story) => void;
  onAddNew: () => void;
}

const AdminStoryList: React.FC<AdminStoryListProps> = ({ onDelete, onEdit, onAddNew }) => {
  const context = useContext(AppContext);
  const { t } = useI18n();

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg border border-stone-200 animate-fade-in">
        <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-serif">{t('storyManagement.title')}</h3>
            <button 
                onClick={onAddNew}
                className="inline-flex items-center bg-stone-800 text-white font-bold py-2 px-4 rounded-md text-sm hover:bg-stone-900 transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 active:translate-y-0 active:scale-95"
            >
                <PlusCircle size={16} className="me-2"/>
                {t('storyManagement.addNew')}
            </button>
        </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-stone-200">
          <thead className="bg-stone-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-start text-xs font-medium text-stone-500 uppercase tracking-wider">{t('storyManagement.preview')}</th>
              <th scope="col" className="px-6 py-3 text-start text-xs font-medium text-stone-500 uppercase tracking-wider">{t('storyManagement.titleColumn')}</th>
              <th scope="col" className="px-6 py-3 text-start text-xs font-medium text-stone-500 uppercase tracking-wider">{t('storyManagement.product')}</th>
              <th scope="col" className="relative px-6 py-3">
                <span className="sr-only">{t('storyManagement.actions')}</span>
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-stone-200">
            {context?.stories.map((story) => (
              <tr key={story.id} className="hover:bg-stone-50/50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                    <img src={story.previewImageUrl} alt={story.title} className="h-16 w-10 rounded-md object-cover"/>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-stone-900">{story.title}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-stone-900">{story.productName}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-end text-sm font-medium space-x-4">
                  <button onClick={() => onEdit(story)} className="text-stone-600 hover:text-stone-900 transition-colors" aria-label={`Edit story ${story.title}`}>
                    <Edit size={18} />
                  </button>
                  <button onClick={() => onDelete(story.id)} className="text-red-600 hover:text-red-900 transition-colors" aria-label={`${t('storyManagement.deleteAria')} ${story.title}`}>
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {context?.stories.length === 0 && <p className="text-center text-stone-500 py-8">{t('storyManagement.noStories')}</p>}
    </div>
  );
};

export default AdminStoryList;