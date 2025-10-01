import { Link } from 'react-router-dom';
import { Calendar, Users, CheckCircle, ArrowRight } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      <nav className="border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center space-x-2">
              <Calendar className="w-8 h-8 text-blue-600" />
              <span className="text-xl font-bold text-gray-900">EventReg Pro</span>
            </Link>
            <div className="flex items-center space-x-4">
              <Link
                to="/events"
                className="text-gray-700 hover:text-gray-900 font-medium transition-colors"
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

      <section className="relative bg-gradient-to-br from-blue-600 to-indigo-700 text-white py-24 overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-5"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <h1 className="text-5xl md:text-6xl font-bold leading-tight mb-6">
              Discover Amazing Events Near You
            </h1>
            <p className="text-xl md:text-2xl text-blue-100 mb-10 leading-relaxed">
              From conferences to workshops, concerts to meetups - find and register for events that inspire you.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                to="/events"
                className="inline-flex items-center justify-center bg-white text-blue-600 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-50 transition-all shadow-lg hover:shadow-xl"
              >
                Explore Events
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
              <Link
                to="/admin/signup"
                className="inline-flex items-center justify-center bg-blue-700 text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-blue-800 transition-all border-2 border-blue-500"
              >
                Create Events
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Why Choose EventReg Pro?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              The complete solution for event discovery and seamless registration
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-10">
            <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mb-6">
                <Calendar className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Easy Discovery</h3>
              <p className="text-gray-600 leading-relaxed">
                Browse through a curated list of upcoming events. Filter by date, location, and category to find exactly what you're looking for.
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mb-6">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Quick Registration</h3>
              <p className="text-gray-600 leading-relaxed">
                Register for events in seconds with our streamlined form. Get instant confirmation and your digital ticket via email.
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
              <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mb-6">
                <Users className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">For Organizers</h3>
              <p className="text-gray-600 leading-relaxed">
                Powerful admin dashboard to create events, manage registrations, and check-in attendees with QR codes.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-blue-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold mb-6">Ready to Get Started?</h2>
          <p className="text-xl text-blue-100 mb-10 max-w-2xl mx-auto">
            Browse amazing events or create your own. Join thousands of event-goers and organizers.
          </p>
          <Link
            to="/events"
            className="inline-flex items-center bg-white text-blue-600 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-50 transition-all shadow-lg hover:shadow-xl"
          >
            View All Events
            <ArrowRight className="ml-2 w-5 h-5" />
          </Link>
        </div>
      </section>

      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <Calendar className="w-6 h-6 text-blue-500" />
              <span className="text-white font-semibold">EventReg Pro</span>
            </div>
            <p className="text-sm">
              &copy; 2025 EventReg Pro. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
