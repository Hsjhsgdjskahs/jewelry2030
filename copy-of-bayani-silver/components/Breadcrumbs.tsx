
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';
import { useI18n } from '../i18n/I18nProvider';

const Breadcrumbs: React.FC<{ productName?: string }> = ({ productName }) => {
  const location = useLocation();
  const { t } = useI18n();
  const pathnames = location.pathname.split('/').filter((x) => x);

  return (
    <nav className="flex items-center text-sm text-stone-500 mb-6" aria-label="Breadcrumb">
      <Link to="/" className="hover:text-stone-900 dark:hover:text-stone-300 transition-colors flex items-center">
        <Home size={14} className="me-1"/>
        {t('header.home')}
      </Link>
      {pathnames.map((value, index) => {
        const to = `/${pathnames.slice(0, index + 1).join('/')}`;
        const isLast = index === pathnames.length - 1;
        let label = value;

        // Custom label mapping
        if (value === 'products') label = t('header.shop');
        if (value === 'cart') label = t('header.cart');
        if (value === 'wishlist') label = t('header.wishlist');
        if (value === 'product' && productName) label = productName;
        else if (value === 'product') return null; // Skip 'product' segment in URL if showing name next

        // Capitalize if no translation found or specific product name
        if (label === value) label = label.charAt(0).toUpperCase() + label.slice(1);

        return (
          <React.Fragment key={to}>
            <ChevronRight size={14} className="mx-2 rtl:rotate-180" />
            {isLast ? (
              <span className="font-medium text-stone-800 dark:text-stone-200 truncate max-w-[200px]">{label}</span>
            ) : (
              <Link to={to} className="hover:text-stone-900 dark:hover:text-stone-300 transition-colors">
                {label}
              </Link>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
};

export default Breadcrumbs;
