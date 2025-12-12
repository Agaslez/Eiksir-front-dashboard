import { useState } from 'react';
import {
  FileText,
  Download,
  Printer,
  Mail,
  Filter,
  Search,
  Calendar,
} from 'lucide-react';
import { trackEvent } from '../../lib/error-monitoring';

const ShoppingLists = () => {
  const [lists] = useState([
    {
      id: 'SL-001',
      reservationId: 'RES-2024-001',
      date: '2024-01-15',
      items: 24,
      status: 'generated',
    },
    {
      id: 'SL-002',
      reservationId: 'RES-2024-002',
      date: '2024-01-20',
      items: 32,
      status: 'pending',
    },
    {
      id: 'SL-003',
      reservationId: 'RES-2024-003',
      date: '2024-01-10',
      items: 18,
      status: 'generated',
    },
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Listy zakupów</h1>
        <p className="text-gray-400 mt-2">
          Generuj i zarządzaj listami zakupów dla rezerwacji
        </p>
      </div>

      <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
        <div className="text-center py-12">
          <FileText className="w-16 h-16 text-gray-500 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">
            Listy zakupów - w budowie
          </h3>
          <p className="text-gray-400 mb-6">
            Ta funkcjonalność jest obecnie w trakcie implementacji. Będzie
            dostępna wkrótce!
          </p>
          <div className="flex justify-center space-x-4">
            <button className="px-4 py-2 bg-gray-700 rounded-lg text-white flex items-center gap-2">
              <Download className="w-4 h-4" />
              PDF Export
            </button>
            <button className="px-4 py-2 bg-gray-700 rounded-lg text-white flex items-center gap-2">
              <Printer className="w-4 h-4" />
              Drukuj
            </button>
            <button className="px-4 py-2 bg-gray-700 rounded-lg text-white flex items-center gap-2">
              <Mail className="w-4 h-4" />
              Wyślij email
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShoppingLists;
