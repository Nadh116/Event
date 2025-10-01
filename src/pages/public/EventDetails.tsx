import { useEffect, useState, FormEvent } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase, Event } from '../../lib/supabase';
import { Calendar, MapPin, Users, ArrowLeft, Loader, CheckCircle } from 'lucide-react';
import { format } from 'date-fns';

function formatEventDate(dateString: string) {
  try {
    const date = new Date(dateString);
    return format(date, 'EEEE, MMMM d, yyyy • h:mm a');
  } catch {
    return dateString;
  }
}

export default function EventDetails() {
  const { id } = useParams<{ id: string }>();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [registered, setRegistered] = useState(false);

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    company: '',
  });

  useEffect(() => {
    loadEvent();
  }, [id]);

  const loadEvent = async () => {
    try {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (error) throw error;
      setEvent(data);
    } catch (error) {
      console.error('Error loading event:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const qrCodeData = `${id}:${Date.now()}:${formData.email}`;

      const { error } = await supabase.from('registrations').insert([
        {
          event_id: id,
          full_name: formData.fullName,
          email: formData.email,
          phone: formData.phone || null,
          company: formData.company || null,
          qr_code_data: qrCodeData,
        },
      ]);

      if (error) throw error;

      await supabase.functions.invoke('send-registration-email', {
        body: {
          email: formData.email,
          fullName: formData.fullName,
          eventTitle: event?.title,
          eventDateTime: event?.date_time,
          eventLocation: event?.location,
          qrCodeData,
        },
      });

      setRegistered(true);
      setFormData({ fullName: '', email: '', phone: '', company: '' });
    } catch (error) {
      console.error('Error registering:', error);
      alert('Failed to register. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading event...</p>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Event Not Found</h2>
          <Link to="/events" className="text-blue-600 hover:text-blue-700">
            Back to Events
          </Link>
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
          </div>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Link
          to="/events"
          className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-8 font-medium"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Events
        </Link>

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="h-80 bg-gradient-to-br from-blue-500 to-indigo-600 relative">
            {event.featured_image_url ? (
              <img
                src={event.featured_image_url}
                alt={event.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <Calendar className="w-32 h-32 text-white opacity-30" />
              </div>
            )}
          </div>

          <div className="p-8 md:p-12">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              {event.title}
            </h1>

            <div className="grid md:grid-cols-2 gap-6 mb-8 pb-8 border-b border-gray-200">
              <div className="flex items-start space-x-3">
                <Calendar className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">Date & Time</p>
                  <p className="text-lg text-gray-900">{formatEventDate(event.date_time)}</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <MapPin className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">Location</p>
                  <p className="text-lg text-gray-900">{event.location}</p>
                </div>
              </div>

              {event.max_attendees && (
                <div className="flex items-start space-x-3">
                  <Users className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-1">Capacity</p>
                    <p className="text-lg text-gray-900">{event.max_attendees} attendees</p>
                  </div>
                </div>
              )}
            </div>

            <div className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">About This Event</h2>
              <p className="text-gray-700 leading-relaxed whitespace-pre-wrap text-lg">
                {event.description}
              </p>
            </div>

            {registered ? (
              <div className="bg-green-50 border-2 border-green-200 rounded-2xl p-8 text-center">
                <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  Registration Successful!
                </h3>
                <p className="text-gray-700 mb-1">
                  Thank you for registering. A confirmation email with your ticket has been sent to your email address.
                </p>
                <p className="text-sm text-gray-600">
                  Please check your inbox (and spam folder) for your QR code ticket.
                </p>
              </div>
            ) : (
              <div className="bg-gray-50 rounded-2xl p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Register for This Event</h2>
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid md:grid-cols-2 gap-5">
                    <div>
                      <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">
                        Full Name *
                      </label>
                      <input
                        id="fullName"
                        type="text"
                        required
                        value={formData.fullName}
                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="John Doe"
                      />
                    </div>

                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                        Email Address *
                      </label>
                      <input
                        id="email"
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="john@example.com"
                      />
                    </div>

                    <div>
                      <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                        Phone Number
                      </label>
                      <input
                        id="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="+1 (555) 123-4567"
                      />
                    </div>

                    <div>
                      <label htmlFor="company" className="block text-sm font-medium text-gray-700 mb-1">
                        Company/Organization
                      </label>
                      <input
                        id="company"
                        type="text"
                        value={formData.company}
                        onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Acme Inc."
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full bg-blue-600 text-white py-3.5 rounded-lg font-semibold text-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {submitting ? 'Registering...' : 'Register Now'}
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
