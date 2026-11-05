import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar.jsx';
import HeroSection from './components/HeroSection.jsx';
import AboutSection from './components/AboutSection.jsx';
import ServicesPricing from './components/ServicesPricing.jsx';
import BarbersSection from './components/BarbersSection.jsx';
import BookingCalendar from './components/BookingCalendar.jsx';
import GalleryLookbook from './components/GalleryLookbook.jsx';
import TestimonialsSection from './components/TestimonialsSection.jsx';
import WorkingHoursContact from './components/WorkingHoursContact.jsx';
import Footer from './components/Footer.jsx';
import Preloader from './components/Preloader.jsx';
import TelegramBotModal from './components/TelegramBotModal.jsx';
import AdminDashboard from './components/admin/AdminDashboard.jsx';

export default function App() {
  const [currentView, setCurrentView] = useState('landing'); // 'landing' | 'admin'
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);
  const [isBotModalOpen, setIsBotModalOpen] = useState(false);

  // App data loaded from backend
  const [services, setServices] = useState([]);
  const [barbers, setBarbers] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [settings, setSettings] = useState(null);

  // Cross-component booking selections
  const [preselectedService, setPreselectedService] = useState(null);
  const [preselectedBarber, setPreselectedBarber] = useState(null);

  useEffect(() => {
    // Fetch initial services, barbers, reviews, settings
    fetch('/api/services')
      .then(r => r.json())
      .then(data => setServices(data))
      .catch(err => console.error('Error fetching services:', err));

    fetch('/api/barbers')
      .then(r => r.json())
      .then(data => setBarbers(data))
      .catch(err => console.error('Error fetching barbers:', err));

    fetch('/api/reviews')
      .then(r => r.json())
      .then(data => setReviews(data))
      .catch(err => console.error('Error fetching reviews:', err));

    fetch('/api/settings')
      .then(r => r.json())
      .then(data => setSettings(data))
      .catch(err => console.error('Error fetching settings:', err));

    // Fallback safety timeout: remove preloader after 2.5s even if YouTube event didn't fire
    const fallbackTimer = setTimeout(() => {
      setIsVideoLoaded(true);
    }, 2500);

    return () => clearTimeout(fallbackTimer);
  }, []);

  const handleSelectServiceFromMenu = (service) => {
    setPreselectedService(service);
  };

  const handleSelectBarberFromGrid = (barber) => {
    setPreselectedBarber(barber);
  };

  return (
    <div className="bg-[#0a0a0c] text-gray-200 min-h-screen selection:bg-[#c5a880] selection:text-[#0a0a0c]">
      
      {/* Preloader with luxury gold & barber shears theme */}
      <Preloader isLoaded={isVideoLoaded} />

      {/* Main Switch: Landing Page or Admin Dashboard */}
      {currentView === 'admin' ? (
        <AdminDashboard onBackToSite={() => setCurrentView('landing')} />
      ) : (
        <>
          {/* Top Bar Navigation */}
          <Navbar
            currentView={currentView}
            onOpenAdmin={() => setCurrentView('admin')}
            onOpenBotModal={() => setIsBotModalOpen(true)}
            onOpenBooking={() => {
              const el = document.getElementById('booking');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
          />

          {/* 1. Hero Section with YouTube Background & Random Video on Reload */}
          <HeroSection
            onVideoLoaded={() => setIsVideoLoaded(true)}
          />

          {/* 2. Philosophy & About Section */}
          <AboutSection />

          {/* 3. Services & Pricing Menu */}
          <ServicesPricing
            services={services}
            onSelectService={handleSelectServiceFromMenu}
          />

          {/* 4. Barbers & Schedule Highlights */}
          <BarbersSection
            barbers={barbers}
            onSelectBarber={handleSelectBarberFromGrid}
          />

          {/* 5. Centerpiece: Modern Interactive Booking Calendar */}
          <BookingCalendar
            services={services}
            barbers={barbers}
            preselectedService={preselectedService}
            preselectedBarber={preselectedBarber}
            onBookingSuccess={(booking) => {
              console.log('New booking saved:', booking);
            }}
          />

          {/* 6. Gallery / Lookbook Showcase */}
          <GalleryLookbook />

          {/* 7. Client Testimonials */}
          <TestimonialsSection reviews={reviews} />

          {/* 8. Working Hours, Location & Real-time open badge */}
          <WorkingHoursContact settings={settings} />

          {/* 9. Footer */}
          <Footer
            onOpenAdmin={() => setCurrentView('admin')}
            onOpenBotModal={() => setIsBotModalOpen(true)}
          />

          {/* Telegram Bot Modal Guide */}
          <TelegramBotModal
            isOpen={isBotModalOpen}
            onClose={() => setIsBotModalOpen(false)}
            botUsername="GravityBarber_bot"
          />
        </>
      )}

    </div>
  );
}
