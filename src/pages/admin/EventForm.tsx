import { useEffect, useState, FormEvent } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { supabase, Event } from '../../lib/supabase';
import { Calendar, ArrowLeft, Loader } from 'lucide-react';

export default function EventForm() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(!!id);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    dateTime: '',
    location: '',
    featuredImageUrl: '',
    maxAttendees: '',
  });

  const isEditing = !!id;

  useEffect(() => {
    if (id) {
      loadEvent();
    }
  }, [id]);

  const loadEvent = async () => {
    try {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('id', id)
        .eq('created_by', user?.id)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        const dateTime = new Date(data.date_time);
        const formattedDateTime = dateTime.toISOString().slice(0, 16);

        setFormData({
          title: data.title,
          description: data.description,
          dateTime: formattedDateTime,
          location: data.location,
          featuredImageUrl: data.featured_image_url || '',
          maxAttendees: data.max_attendees?.toString() || '',
        });
      }
    } catch (error) {
      console.error('Error loading event:', error);
      alert('Failed to load event');
      navigate('/admin');
    } finally {
      setInitialLoading(false);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const eventData = {
        title: formData.title,
        description: formData.description,
        date_time: new Date(formData.dateTime).toISOString(),
        location: formData.location,
        featured_image_url: formData.featuredImageUrl || null,
        max_attendees: formData.maxAttendees ? parseInt(formData.maxAttendees) : null,
        created_by: user?.id,
      };

      if (isEditing) {
        const { error } = await supabase
          .from('events')
          .update(eventData)
          .eq('id', id);

        if (error) throw error;
      } else {
        const { error } = await supabase.from('events').insert([eventData]);
        if (error) throw error;
      }

      navigate('/admin');
    } catch (error) {
      console.error('Error saving event:', error);
      alert('Failed to save event');
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading event...</p>
        </div>
      </div>
    );
  }

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

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Link
          to="/admin"
          className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-8 font-medium"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Link>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">
            {isEditing ? 'Edit Event' : 'Create New Event'}
          </h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                Event Title *
              </label>
              <input
                id="title"
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Annual Tech Conference 2025"
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Description *
              </label>
              <textarea
                id="description"
                required
                rows={6}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Tell attendees about your event..."
              />
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="dateTime" className="block text-sm font-medium text-gray-700 mb-1">
                  Date & Time *
                </label>
                <input
                  id="dateTime"
                  type="datetime-local"
                  required
                  value={formData.dateTime}
                  onChange={(e) => setFormData({ ...formData, dateTime: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
                  Location *
                </label>
                <input
                  id="location"
                  type="text"
                  required
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Convention Center, Building A"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="featuredImageUrl" className="block text-sm font-medium text-gray-700 mb-1">
                  Featured Image URL
                </label>
                <input
                  id="featuredImageUrl"
                  type="url"
                  value={formData.featuredImageUrl}
                  onChange={(e) => setFormData({ ...formData, featuredImageUrl: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="https://example.com/image.jpg"
                />
              </div>

              <div>
                <label htmlFor="maxAttendees" className="block text-sm font-medium text-gray-700 mb-1">
                  Maximum Attendees
                </label>
                <input
                  id="maxAttendees"
                  type="number"
                  min="1"
                  value={formData.maxAttendees}
                  onChange={(e) => setFormData({ ...formData, maxAttendees: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="100"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-4 pt-4">
              <Link
                to="/admin"
                className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Saving...' : isEditing ? 'Update Event' : 'Create Event'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
