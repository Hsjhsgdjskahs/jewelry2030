
import React, { useContext } from 'react';
import { AppContext } from '../App';
import AdminLogin from '../components/admin/AdminLogin';
import AdminDashboard from '../components/admin/AdminDashboard';
import { useI18n } from '../i18n/I18nProvider';

const AdminPage: React.FC = () => {
  const context = useContext(AppContext);
  const { t } = useI18n();

  if (!context) {
    return <div>{t('admin.loading')}</div>;
  }

  return (
    <div className="container mx-auto px-6 py-20">
      {context.isAuthenticated ? <AdminDashboard /> : <AdminLogin />}
    </div>
  );
};

export default AdminPage;
