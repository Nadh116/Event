import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { supabase, Event, Registration } from '../../lib/supabase';
import { Calendar, ArrowLeft, Loader, Download, CheckCircle, QrCode, Search } from 'lucide-react';
import { format } from 'date-fns';

export default function Attendees() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [event, setEvent] = useState<Event | null>(null);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    try {
      const { data: eventData, error: eventError } = await supabase
        .from('events')
        .select('*')
        .eq('id', id)
        .eq('created_by', user?.id)
        .maybeSingle();

      if (eventError) throw eventError;

      const { data: registrationsData, error: regError } = await supabase
        .from('registrations')
        .select('*')
        .eq('event_id', id)
        .order('registration_date', { ascending: false });

      if (regError) throw regError;

      setEvent(eventData);
      setRegistrations(registrationsData || []);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckIn = async (registrationId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('registrations')
        .update({ checked_in: !currentStatus })
        .eq('id', registrationId);

      if (error) throw error;
      loadData();
    } catch (error) {
      console.error('Error updating check-in:', error);
      alert('Failed to update check-in status');
    }
  };

  const exportToCSV = () => {
    if (!event || registrations.length === 0) return;

    const headers = ['Name', 'Email', 'Phone', 'Company', 'Registration Date', 'Checked In'];
    const rows = registrations.map((reg) => [
      reg.full_name,
      reg.email,
      reg.phone || '',
      reg.company || '',
      format(new Date(reg.registration_date), 'yyyy-MM-dd HH:mm:ss'),
      reg.checked_in ? 'Yes' : 'No',
    ]);

    const csvContent = [headers, ...rows].map((row) => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${event.title.replace(/\s+/g, '-')}-attendees.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const filteredRegistrations = registrations.filter((reg) =>
    reg.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    reg.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading attendees...</p>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Event Not Found</h2>
          <Link to="/admin" className="text-blue-600 hover:text-blue-700">
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const checkedInCount = registrations.filter((r) => r.checked_in).length;

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/admin" className="flex items-center space-x-2">
              <Calendar className="w-8 h-8 text-blue-600" />
              <span className="text-xl font-bold text-gray-900">EventReg Pro Admin</span>
            </Link>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Link
          to="/admin"
          className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-8 font-medium"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Link>

        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">{event.title}</h1>
          <p className="text-gray-600">
            {format(new Date(event.date_time), 'EEEE, MMMM d, yyyy • h:mm a')} • {event.location}
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <p className="text-3xl font-bold text-gray-900 mb-1">{registrations.length}</p>
            <p className="text-gray-600">Total Registrations</p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-lg">
            <p className="text-3xl font-bold text-green-600 mb-1">{checkedInCount}</p>
            <p className="text-gray-600">Checked In</p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-lg">
            <p className="text-3xl font-bold text-orange-600 mb-1">
              {registrations.length - checkedInCount}
            </p>
            <p className="text-gray-600">Not Checked In</p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg">
          <div className="p-6 border-b border-gray-200">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
              <h2 className="text-2xl font-bold text-gray-900">Attendee List</h2>
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search attendees..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                {registrations.length > 0 && (
                  <button
                    onClick={exportToCSV}
                    className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    <span>Export CSV</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {filteredRegistrations.length === 0 ? (
            <div className="p-12 text-center">
              <QrCode className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                {searchQuery ? 'No matching attendees' : 'No Registrations Yet'}
              </h3>
              <p className="text-gray-600">
                {searchQuery ? 'Try a different search term' : 'Attendees will appear here once they register'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">
                      Name
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">
                      Email
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">
                      Phone
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">
                      Company
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">
                      Registered
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase">
                      Status
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredRegistrations.map((reg) => (
                    <tr key={reg.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <p className="font-semibold text-gray-900">{reg.full_name}</p>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">{reg.email}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{reg.phone || '-'}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{reg.company || '-'}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {format(new Date(reg.registration_date), 'MMM d, yyyy')}
                      </td>
                      <td className="px-6 py-4 text-center">
                        {reg.checked_in ? (
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Checked In
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                            Pending
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button
                          onClick={() => handleCheckIn(reg.id, reg.checked_in)}
                          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                            reg.checked_in
                              ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                              : 'bg-blue-600 text-white hover:bg-blue-700'
                          }`}
                        >
                          {reg.checked_in ? 'Undo Check-in' : 'Check In'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
