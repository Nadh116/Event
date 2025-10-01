import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase, Event } from '../../lib/supabase';
import { Calendar, MapPin, ArrowRight, Loader } from 'lucide-react';
import { format } from 'date-fns';

function formatEventDate(dateString: string) {
  try {
    const date = new Date(dateString);
    return format(date, 'MMMM d, yyyy • h:mm a');
  } catch {
    return dateString;
  }
}

export default function Events() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .gte('date_time', new Date().toISOString())
        .order('date_time', { ascending: true });

      if (error) throw error;
      setEvents(data || []);
    } catch (error) {
      console.error('Error loading events:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading events...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center space-x-2">
              <Calendar className="w-8 h-8 text-blue-600" />
              <span className="text-xl font-bold text-gray-900">EventReg Pro</span>
            </Link>
            <div className="flex items-center space-x-4">
              <Link
                to="/events"
                className="text-blue-600 font-medium"
              >
                Browse Events
              </Link>
              <Link
                to="/admin/login"
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Admin Login
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Upcoming Events</h1>
          <p className="text-xl text-gray-600">
            Discover and register for amazing events happening near you
          </p>
        </div>

        {events.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-16 text-center">
            <Calendar className="w-20 h-20 text-gray-300 mx-auto mb-6" />
            <h3 className="text-2xl font-bold text-gray-900 mb-4">No Upcoming Events</h3>
            <p className="text-gray-600 mb-8">
              Check back soon for new events or create your own!
            </p>
            <Link
              to="/admin/signup"
              className="inline-flex items-center bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Create an Event
            </Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {events.map((event) => (
              <Link
                key={event.id}
                to={`/events/${event.id}`}
                className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all transform hover:-translate-y-1 group"
              >
                <div className="h-48 bg-gradient-to-br from-blue-500 to-indigo-600 relative overflow-hidden">
                  {event.featured_image_url ? (
                    <img
                      src={event.featured_image_url}
                      alt={event.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Calendar className="w-20 h-20 text-white opacity-50" />
                    </div>
                  )}
                </div>

                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors line-clamp-2">
                    {event.title}
                  </h3>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-gray-600">
                      <Calendar className="w-4 h-4 mr-2 flex-shrink-0" />
                      <span className="text-sm">{formatEventDate(event.date_time)}</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <MapPin className="w-4 h-4 mr-2 flex-shrink-0" />
                      <span className="text-sm line-clamp-1">{event.location}</span>
                    </div>
                  </div>

                  <p className="text-gray-600 text-sm line-clamp-2 mb-4">
                    {event.description}
                  </p>

                  <div className="flex items-center text-blue-600 font-medium group-hover:text-blue-700">
                    Learn More
                    <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
