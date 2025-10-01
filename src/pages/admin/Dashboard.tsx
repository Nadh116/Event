import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { supabase, Event } from '../../lib/supabase';
import { Calendar, Users, LogOut, Plus, CreditCard as Edit, Trash2, Eye } from 'lucide-react';
import { format } from 'date-fns';

export default function Dashboard() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [events, setEvents] = useState<Event[]>([]);
  const [stats, setStats] = useState({ totalEvents: 0, upcomingEvents: 0, totalRegistrations: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const { data: eventsData, error: eventsError } = await supabase
        .from('events')
        .select('*')
        .eq('created_by', user?.id)
        .order('date_time', { ascending: true });

      if (eventsError) throw eventsError;

      const { count, error: countError } = await supabase
        .from('registrations')
        .select('*', { count: 'exact', head: true })
        .in('event_id', eventsData?.map(e => e.id) || []);

      if (countError) throw countError;

      const now = new Date().toISOString();
      const upcomingCount = eventsData?.filter(e => e.date_time >= now).length || 0;

      setEvents(eventsData || []);
      setStats({
        totalEvents: eventsData?.length || 0,
        upcomingEvents: upcomingCount,
        totalRegistrations: count || 0,
      });
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/admin/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const handleDelete = async (eventId: string) => {
    if (!confirm('Are you sure you want to delete this event? This will also delete all registrations.')) {
      return;
    }

    try {
      const { error } = await supabase.from('events').delete().eq('id', eventId);
      if (error) throw error;
      loadData();
    } catch (error) {
      console.error('Error deleting event:', error);
      alert('Failed to delete event');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/admin" className="flex items-center space-x-2">
              <Calendar className="w-8 h-8 text-blue-600" />
              <span className="text-xl font-bold text-gray-900">EventReg Pro Admin</span>
            </Link>
            <div className="flex items-center space-x-4">
              <Link
                to="/"
                className="text-gray-700 hover:text-gray-900 font-medium"
              >
                View Public Site
              </Link>
              <button
                onClick={handleSignOut}
                className="flex items-center space-x-2 text-gray-700 hover:text-gray-900"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Dashboard</h1>
          <p className="text-gray-600">Manage your events and track registrations</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-10">
          <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <Calendar className="w-10 h-10 text-blue-600" />
            </div>
            <p className="text-3xl font-bold text-gray-900 mb-1">{stats.totalEvents}</p>
            <p className="text-gray-600">Total Events</p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <Calendar className="w-10 h-10 text-green-600" />
            </div>
            <p className="text-3xl font-bold text-gray-900 mb-1">{stats.upcomingEvents}</p>
            <p className="text-gray-600">Upcoming Events</p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <Users className="w-10 h-10 text-purple-600" />
            </div>
            <p className="text-3xl font-bold text-gray-900 mb-1">{stats.totalRegistrations}</p>
            <p className="text-gray-600">Total Registrations</p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg border border-gray-100">
          <div className="p-6 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-900">Your Events</h2>
            <Link
              to="/admin/events/new"
              className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Create Event</span>
            </Link>
          </div>

          {events.length === 0 ? (
            <div className="p-12 text-center">
              <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">No Events Yet</h3>
              <p className="text-gray-600 mb-6">Create your first event to get started</p>
              <Link
                to="/admin/events/new"
                className="inline-flex items-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Create Event</span>
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Event
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Date & Time
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Location
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {events.map((event) => (
                    <tr key={event.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <p className="font-semibold text-gray-900">{event.title}</p>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {format(new Date(event.date_time), 'MMM d, yyyy • h:mm a')}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {event.location}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex justify-end space-x-2">
                          <Link
                            to={`/admin/events/${event.id}/attendees`}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="View Attendees"
                          >
                            <Eye className="w-4 h-4" />
                          </Link>
                          <Link
                            to={`/admin/events/${event.id}/edit`}
                            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <Edit className="w-4 h-4" />
                          </Link>
                          <button
                            onClick={() => handleDelete(event.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
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
