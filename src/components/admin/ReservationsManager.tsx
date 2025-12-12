import {
  Calendar,
  CheckCircle,
  Clock,
  Download,
  Edit,
  Eye,
  FileText,
  Filter,
  Mail,
  MapPin,
  Package,
  Phone,
  Printer,
  Search,
  Users,
  X,
  XCircle,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { trackEvent } from '../../lib/error-monitoring';

interface Reservation {
  id: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  eventDate: string;
  eventType: 'wesele' | 'firmowe' | 'urodziny' | 'inne';
  guests: number;
  package: string;
  location: string;
  status: 'new' | 'confirmed' | 'preparation' | 'completed' | 'cancelled';
  totalAmount: number;
  depositPaid: boolean;
  notes: string;
  createdAt: string;
  shoppingListGenerated: boolean;
}

const ReservationsManager = () => {
  const [reservations, setReservations] = useState<Reservation[]>([
    {
      id: 'RES-2024-001',
      customerName: 'Anna Nowak',
      customerEmail: 'anna.nowak@example.com',
      customerPhone: '+48 123 456 789',
      eventDate: '2024-06-15',
      eventType: 'wesele',
      guests: 80,
      package: 'PREMIUM',
      location: 'Pałac w Nieborowie, Bełchatów',
      status: 'confirmed',
      totalAmount: 3900,
      depositPaid: true,
      notes: 'Preferują koktajle owocowe, alergia na orzechy',
      createdAt: '2024-01-15',
      shoppingListGenerated: true,
    },
    {
      id: 'RES-2024-002',
      customerName: 'Jan Kowalski',
      customerEmail: 'jan.kowalski@firma.pl',
      customerPhone: '+48 987 654 321',
      eventDate: '2024-07-20',
      eventType: 'firmowe',
      guests: 120,
      package: 'EXCLUSIVE',
      location: 'Hotel Marina, Łódź',
      status: 'new',
      totalAmount: 5200,
      depositPaid: false,
      notes: 'Event integracyjny, potrzebują 2 barmanów',
      createdAt: '2024-01-20',
      shoppingListGenerated: false,
    },
    {
      id: 'RES-2024-003',
      customerName: 'Maria Wiśniewska',
      customerEmail: 'maria.wisniewska@example.com',
      customerPhone: '+48 555 666 777',
      eventDate: '2024-05-10',
      eventType: 'urodziny',
      guests: 40,
      package: 'BASIC',
      location: 'Dom prywatny, Bełchatów',
      status: 'preparation',
      totalAmount: 2900,
      depositPaid: true,
      notes: '40 urodziny, motyw lat 80s',
      createdAt: '2024-01-10',
      shoppingListGenerated: true,
    },
    {
      id: 'RES-2024-004',
      customerName: 'Piotr Zieliński',
      customerEmail: 'piotr.zielinski@example.com',
      customerPhone: '+48 444 333 222',
      eventDate: '2024-08-25',
      eventType: 'inne',
      guests: 25,
      package: 'Family & Seniors',
      location: 'Restauracja Stefano, Bełchatów',
      status: 'completed',
      totalAmount: 2600,
      depositPaid: true,
      notes: 'Rocznica ślubu, preferują wina',
      createdAt: '2024-01-25',
      shoppingListGenerated: true,
    },
    {
      id: 'RES-2024-005',
      customerName: 'Katarzyna Lewandowska',
      customerEmail: 'k.lewandowska@example.com',
      customerPhone: '+48 111 222 333',
      eventDate: '2024-09-05',
      eventType: 'wesele',
      guests: 60,
      package: 'PREMIUM',
      location: 'Dwór w Wolborzu',
      status: 'cancelled',
      totalAmount: 3900,
      depositPaid: false,
      notes: 'Odwołane z przyczyn osobistych',
      createdAt: '2024-02-01',
      shoppingListGenerated: false,
    },
  ]);

  const [filter, setFilter] = useState({
    status: 'all',
    eventType: 'all',
    dateFrom: '',
    dateTo: '',
    search: '',
  });

  const [selectedReservation, setSelectedReservation] =
    useState<Reservation | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');

  useEffect(() => {
    trackEvent('admin_reservations_view');
  }, []);

  const filteredReservations = reservations.filter((res) => {
    if (filter.status !== 'all' && res.status !== filter.status) return false;
    if (filter.eventType !== 'all' && res.eventType !== filter.eventType)
      return false;
    if (filter.dateFrom && new Date(res.eventDate) < new Date(filter.dateFrom))
      return false;
    if (filter.dateTo && new Date(res.eventDate) > new Date(filter.dateTo))
      return false;
    if (filter.search) {
      const searchLower = filter.search.toLowerCase();
      return (
        res.customerName.toLowerCase().includes(searchLower) ||
        res.id.toLowerCase().includes(searchLower) ||
        res.customerEmail.toLowerCase().includes(searchLower) ||
        res.package.toLowerCase().includes(searchLower)
      );
    }
    return true;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new':
        return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
      case 'confirmed':
        return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
      case 'preparation':
        return 'bg-purple-500/20 text-purple-300 border-purple-500/30';
      case 'completed':
        return 'bg-green-500/20 text-green-300 border-green-500/30';
      case 'cancelled':
        return 'bg-red-500/20 text-red-300 border-red-500/30';
      default:
        return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'new':
        return <Clock className="w-4 h-4" />;
      case 'confirmed':
        return <CheckCircle className="w-4 h-4" />;
      case 'preparation':
        return <Package className="w-4 h-4" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4" />;
      case 'cancelled':
        return <XCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case 'wesele':
        return 'bg-pink-500/20 text-pink-300';
      case 'firmowe':
        return 'bg-blue-500/20 text-blue-300';
      case 'urodziny':
        return 'bg-purple-500/20 text-purple-300';
      case 'inne':
        return 'bg-gray-500/20 text-gray-300';
      default:
        return 'bg-gray-500/20 text-gray-300';
    }
  };

  const handleStatusChange = (id: string, newStatus: Reservation['status']) => {
    setReservations((prev) =>
      prev.map((res) => (res.id === id ? { ...res, status: newStatus } : res))
    );
    trackEvent('admin_reservation_status_change', { id, newStatus });
  };

  const handleGenerateShoppingList = (id: string) => {
    trackEvent('admin_generate_shopping_list', { id });
    alert(`Generowanie listy zakupów dla ${id}...`);
  };

  const handleSendConfirmation = (id: string) => {
    trackEvent('admin_send_confirmation', { id });
    alert(`Wysyłanie potwierdzenia dla ${id}...`);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('pl-PL', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const stats = {
    total: reservations.length,
    new: reservations.filter((r) => r.status === 'new').length,
    confirmed: reservations.filter((r) => r.status === 'confirmed').length,
    revenue: reservations.reduce((sum, r) => sum + r.totalAmount, 0),
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">
            Zarządzanie rezerwacjami
          </h1>
          <p className="text-gray-400 mt-2">
            Zarządzaj wszystkimi rezerwacjami i generuj listy zakupów
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-white flex items-center gap-2">
            <Filter className="w-4 h-4" />
            Eksportuj
          </button>
          <button className="px-4 py-2 bg-amber-500 hover:bg-amber-600 rounded-lg text-black font-bold flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Nowa rezerwacja
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
          <div className="text-2xl font-bold text-white">{stats.total}</div>
          <div className="text-gray-400 text-sm">Wszystkie rezerwacje</div>
        </div>
        <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
          <div className="text-2xl font-bold text-yellow-300">{stats.new}</div>
          <div className="text-gray-400 text-sm">Nowe do potwierdzenia</div>
        </div>
        <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
          <div className="text-2xl font-bold text-blue-300">
            {stats.confirmed}
          </div>
          <div className="text-gray-400 text-sm">Potwierdzone</div>
        </div>
        <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
          <div className="text-2xl font-bold text-green-300">
            {stats.revenue.toLocaleString('pl-PL')} zł
          </div>
          <div className="text-gray-400 text-sm">Przychód (łącznie)</div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="md:col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Szukaj po nazwisku, email, ID..."
                className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-amber-500"
                value={filter.search}
                onChange={(e) =>
                  setFilter({ ...filter, search: e.target.value })
                }
              />
            </div>
          </div>
          <div>
            <select
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-amber-500"
              value={filter.status}
              onChange={(e) => setFilter({ ...filter, status: e.target.value })}
            >
              <option value="all">Wszystkie statusy</option>
              <option value="new">Nowe</option>
              <option value="confirmed">Potwierdzone</option>
              <option value="preparation">Przygotowanie</option>
              <option value="completed">Zakończone</option>
              <option value="cancelled">Anulowane</option>
            </select>
          </div>
          <div>
            <select
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-amber-500"
              value={filter.eventType}
              onChange={(e) =>
                setFilter({ ...filter, eventType: e.target.value })
              }
            >
              <option value="all">Wszystkie typy</option>
              <option value="wesele">Wesele</option>
              <option value="firmowe">Firmowe</option>
              <option value="urodziny">Urodziny</option>
              <option value="inne">Inne</option>
            </select>
          </div>
          <div className="flex gap-2">
            <button className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-white">
              <Filter className="w-4 h-4 inline mr-2" />
              Filtruj
            </button>
            <button
              className="px-4 py-2 bg-gray-600 hover:bg-gray-500 rounded-lg text-white"
              onClick={() =>
                setFilter({
                  status: 'all',
                  eventType: 'all',
                  dateFrom: '',
                  dateTo: '',
                  search: '',
                })
              }
            >
              Wyczyść
            </button>
          </div>
        </div>
      </div>

      {/* Reservations Table */}
      <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="text-left py-3 px-6 text-gray-400 font-medium">
                  ID / Klient
                </th>
                <th className="text-left py-3 px-6 text-gray-400 font-medium">
                  Data / Typ
                </th>
                <th className="text-left py-3 px-6 text-gray-400 font-medium">
                  Pakiet / Goście
                </th>
                <th className="text-left py-3 px-6 text-gray-400 font-medium">
                  Status
                </th>
                <th className="text-left py-3 px-6 text-gray-400 font-medium">
                  Kwota
                </th>
                <th className="text-left py-3 px-6 text-gray-400 font-medium">
                  Akcje
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredReservations.map((res) => (
                <tr
                  key={res.id}
                  className="border-b border-gray-700/50 hover:bg-gray-700/30 transition-colors"
                  onClick={() => setSelectedReservation(res)}
                >
                  <td className="py-3 px-6">
                    <div className="font-mono text-amber-300 font-bold">
                      {res.id}
                    </div>
                    <div className="font-medium text-white">
                      {res.customerName}
                    </div>
                    <div className="text-sm text-gray-400">
                      {res.customerEmail}
                    </div>
                  </td>
                  <td className="py-3 px-6">
                    <div className="font-medium text-white">
                      {formatDate(res.eventDate)}
                    </div>
                    <div
                      className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${getEventTypeColor(res.eventType)}`}
                    >
                      {res.eventType === 'wesele' && 'Wesele'}
                      {res.eventType === 'firmowe' && 'Firmowe'}
                      {res.eventType === 'urodziny' && 'Urodziny'}
                      {res.eventType === 'inne' && 'Inne'}
                    </div>
                  </td>
                  <td className="py-3 px-6">
                    <div className="flex items-center gap-2">
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(res.status)}`}
                      >
                        {getStatusIcon(res.status)}
                        <span className="ml-1">
                          {res.status === 'new' && 'Nowa'}
                          {res.status === 'confirmed' && 'Potwierdzona'}
                          {res.status === 'preparation' && 'Przygotowanie'}
                          {res.status === 'completed' && 'Zakończona'}
                          {res.status === 'cancelled' && 'Anulowana'}
                        </span>
                      </span>
                      {res.depositPaid && (
                        <span className="text-xs bg-green-500/20 text-green-300 px-2 py-1 rounded">
                          Zaliczka
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-6">
                    <div className="font-bold text-white">
                      {res.totalAmount.toLocaleString('pl-PL')} zł
                    </div>
                    <div className="text-sm text-gray-400">
                      {res.depositPaid ? 'Zaliczka opłacona' : 'Brak zaliczki'}
                    </div>
                  </td>
                  <td className="py-3 px-6">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleGenerateShoppingList(res.id);
                        }}
                        className={`p-2 rounded-lg ${res.shoppingListGenerated ? 'bg-green-500/20 text-green-300' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
                        title={
                          res.shoppingListGenerated
                            ? 'Lista wygenerowana'
                            : 'Generuj listę'
                        }
                      >
                        <FileText className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSendConfirmation(res.id);
                        }}
                        className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-white"
                        title="Wyślij potwierdzenie"
                      >
                        <Mail className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedReservation(res);
                        }}
                        className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-white"
                        title="Szczegóły"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          // handle edit
                        }}
                        className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-white"
                        title="Edytuj"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Reservation Details Modal */}
      {selectedReservation && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-800 rounded-xl border border-gray-700 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-white">
                    {selectedReservation.id}
                  </h2>
                  <p className="text-gray-400">Szczegóły rezerwacji</p>
                </div>
                <button
                  onClick={() => setSelectedReservation(null)}
                  className="p-2 text-gray-400 hover:text-white"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left Column */}
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-bold text-white mb-4">
                      Dane klienta
                    </h3>
                    <div className="space-y-3">
                      <div className="flex items-center">
                        <Users className="w-5 h-5 text-gray-400 mr-3" />
                        <div>
                          <div className="font-bold text-white">
                            {selectedReservation.customerName}
                          </div>
                          <div className="text-sm text-gray-400">Klient</div>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <Mail className="w-5 h-5 text-gray-400 mr-3" />
                        <div>
                          <div className="font-bold text-white">
                            {selectedReservation.customerEmail}
                          </div>
                          <div className="text-sm text-gray-400">Email</div>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <Phone className="w-5 h-5 text-gray-400 mr-3" />
                        <div>
                          <div className="font-bold text-white">
                            {selectedReservation.customerPhone}
                          </div>
                          <div className="text-sm text-gray-400">Telefon</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-white mb-4">
                      Szczegóły eventu
                    </h3>
                    <div className="space-y-3">
                      <div className="flex items-center">
                        <Calendar className="w-5 h-5 text-gray-400 mr-3" />
                        <div>
                          <div className="font-bold text-white">
                            {formatDate(selectedReservation.eventDate)}
                          </div>
                          <div className="text-sm text-gray-400">
                            Data eventu
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <MapPin className="w-5 h-5 text-gray-400 mr-3" />
                        <div>
                          <div className="font-bold text-white">
                            {selectedReservation.location}
                          </div>
                          <div className="text-sm text-gray-400">
                            Lokalizacja
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-bold text-white mb-4">
                      Finanse
                    </h3>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400">Kwota całkowita:</span>
                        <span className="text-2xl font-bold text-amber-400">
                          {selectedReservation.totalAmount.toLocaleString(
                            'pl-PL'
                          )}{' '}
                          zł
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400">Status płatności:</span>
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-medium ${selectedReservation.depositPaid ? 'bg-green-500/20 text-green-300' : 'bg-yellow-500/20 text-yellow-300'}`}
                        >
                          {selectedReservation.depositPaid
                            ? 'Zaliczka opłacona'
                            : 'Brak zaliczki'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-white mb-4">
                      Notatki
                    </h3>
                    <div className="bg-gray-700/50 rounded-lg p-4">
                      <p className="text-gray-300">
                        {selectedReservation.notes}
                      </p>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-white mb-4">Akcje</h3>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={() =>
                          handleGenerateShoppingList(selectedReservation.id)
                        }
                        className="px-4 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg text-white flex items-center justify-center gap-2"
                      >
                        <FileText className="w-4 h-4" />
                        Lista zakupów
                      </button>
                      <button
                        onClick={() =>
                          handleSendConfirmation(selectedReservation.id)
                        }
                        className="px-4 py-3 bg-amber-500 hover:bg-amber-600 rounded-lg text-black font-bold flex items-center justify-center gap-2"
                      >
                        <Mail className="w-4 h-4" />
                        Wyślij potwierdzenie
                      </button>
                      <button className="px-4 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg text-white flex items-center justify-center gap-2">
                        <Printer className="w-4 h-4" />
                        Drukuj
                      </button>
                      <button className="px-4 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg text-white flex items-center justify-center gap-2">
                        <Download className="w-4 h-4" />
                        PDF
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReservationsManager;
