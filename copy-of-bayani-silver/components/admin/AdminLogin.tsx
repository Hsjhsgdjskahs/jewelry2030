import React, { useState, useContext, useEffect } from 'react';
import { AppContext } from '../../App';
import { Lock, Fingerprint } from 'lucide-react';
import { useI18n } from '../../i18n/I18nProvider';

// Helper functions for WebAuthn
const bufferDecode = (value: string) => Uint8Array.from(atob(value), c => c.charCodeAt(0));
const bufferEncode = (value: ArrayBuffer) => btoa(String.fromCharCode.apply(null, Array.from(new Uint8Array(value))));

const AdminLogin: React.FC = () => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isBiometricAvailable, setIsBiometricAvailable] = useState(false);
  const context = useContext(AppContext);
  const { t } = useI18n();

  useEffect(() => {
    const checkBiometrics = async () => {
      if (window.PublicKeyCredential && await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable()) {
        const credentialId = localStorage.getItem('bayani_webauthn_credentialId');
        if (credentialId) {
          setIsBiometricAvailable(true);
        }
      }
    };
    checkBiometrics();
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'biani123') {
      setError('');
      context?.login();
    } else {
      setError(t('adminLogin.incorrectPassword'));
    }
  };
  
  const handleBiometricLogin = async () => {
    setError('');
    const credentialId = localStorage.getItem('bayani_webauthn_credentialId');
    if (!credentialId) {
      setError(t('adminLogin.noBiometric'));
      return;
    }

    try {
      const options: CredentialRequestOptions = {
        publicKey: {
          challenge: new Uint8Array(32), // Should be from server in real app
          allowCredentials: [{
            type: 'public-key',
            id: bufferDecode(credentialId),
          }],
          userVerification: 'required',
        },
      };

      const assertion = await navigator.credentials.get(options) as PublicKeyCredential;
      // In a real app, you would send the assertion to your server for verification
      console.log('Biometric assertion:', assertion);
      context?.login();
    } catch (err) {
      console.error('Biometric login failed:', err);
      setError(t('adminLogin.biometricFailed'));
    }
  };

  return (
    <div className="max-w-md mx-auto mt-16 bg-white p-8 rounded-lg shadow-xl border border-stone-200">
      <div className="text-center mb-8">
        <div className="inline-block bg-stone-100 p-4 rounded-full mb-4">
          <Lock className="text-stone-600" size={32}/>
        </div>
        <h1 className="text-3xl font-serif text-stone-800">{t('adminLogin.title')}</h1>
        <p className="text-stone-600">{t('adminLogin.subtitle')}</p>
      </div>
      <form onSubmit={handleLogin} className="space-y-6">
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-stone-700">{t('adminLogin.passwordLabel')}</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 block w-full form-input focus-ring"
            required
          />
        </div>
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <button
          type="submit"
          className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm hover:shadow-md text-sm font-medium text-white bg-stone-800 hover:bg-stone-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-stone-500 transition-all duration-300 transform hover:-translate-y-0.5 active:translate-y-0 focus-ring"
        >
          {t('adminLogin.unlockButton')}
        </button>
      </form>
      {isBiometricAvailable && (
        <>
          <div className="my-6 flex items-center">
            <div className="flex-grow border-t border-stone-300"></div>
            <span className="flex-shrink mx-4 text-stone-500 text-sm">{t('adminLogin.or')}</span>
            <div className="flex-grow border-t border-stone-300"></div>
          </div>
          <button
            type="button"
            onClick={handleBiometricLogin}
            className="w-full flex items-center justify-center py-3 px-4 border border-stone-300 rounded-md shadow-sm hover:shadow-md text-sm font-medium text-stone-700 bg-white hover:bg-stone-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-stone-500 transition-all duration-300 transform hover:-translate-y-0.5 active:translate-y-0 focus-ring"
          >
            <Fingerprint size={18} className="me-2 text-stone-500"/>
            {t('adminLogin.biometricButton')}
          </button>
        </>
      )}
    </div>
  );
};

export default AdminLogin;