import React from 'react';
import { X } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose }) => {
  const { t } = useTranslation();
  
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">{t('help.title')}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <div className="space-y-4">
          <div>
            <h3 className="font-medium text-lg">{t('help.about.title')}</h3>
            <p className="text-gray-600">
              {t('help.about.description')}
            </p>
          </div>
          
          <div>
            <h3 className="font-medium text-lg">{t('help.contact.title')}</h3>
            <p className="text-gray-600">
              {t('help.contact.support')}<br />
              Email: admin@edupal.com<br />
              Phone: +1 (555) 123-4567
            </p>
          </div>
          
          <div>
            <h3 className="font-medium text-lg">{t('help.tips.title')}</h3>
            <ul className="list-disc list-inside text-gray-600">
              <li>{t('help.tips.role')}</li>
              <li>{t('help.tips.language')}</li>
              <li>{t('help.tips.security')}</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};