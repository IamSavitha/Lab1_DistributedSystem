import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Traveler pages
import TravelerLogin from './features/traveler/TravelerLogin';
import TravelerSignup from './features/traveler/TravelerSignup';
import TravelerDashboard from './features/traveler/TravelerDashboard';
import TravelerProfile from './features/traveler/TravelerProfile';
import TravelerBookings from './features/traveler/TravelerBookings';
import TravelerFavorites from './features/traveler/TravelerFavorites';
import TravelerHistory from './features/traveler/TravelerHistory';

// Owner pages
import OwnerLogin from './features/owner/OwnerLogin';
import OwnerSignup from './features/owner/OwnerSignup';
import OwnerDashboard from './features/owner/OwnerDashboard';
import OwnerProperties from './features/owner/OwnerProperties';
import OwnerBookings from './features/owner/OwnerBookings';
import OwnerProfile from './features/owner/OwnerProfile';
import OwnerPropertyForm from './features/owner/OwnerPropertyForm';
import OwnerAnalytics from './features/owner/OwnerAnalytics';

// Property page
import PropertyDetails from './features/property/PropertyDetails';

function App() {
  return (
    <Router>
      <Routes>
        {/* Default route */}
        <Route path="/" element={<Navigate to="/traveler/login" />} />

        {/* Traveler routes */}
        <Route path="/traveler/login" element={<TravelerLogin />} />
        <Route path="/traveler/signup" element={<TravelerSignup />} />
        <Route path="/traveler/dashboard" element={<TravelerDashboard />} />
        <Route path="/traveler/profile" element={<TravelerProfile />} />
        <Route path="/traveler/bookings" element={<TravelerBookings />} />
        <Route path="/traveler/favorites" element={<TravelerFavorites />} />
        <Route path="/traveler/history" element={<TravelerHistory />} />

        {/* Owner routes */}
        <Route path="/owner/login" element={<OwnerLogin />} />
        <Route path="/owner/signup" element={<OwnerSignup />} />
        <Route path="/owner/dashboard" element={<OwnerDashboard />} />
        <Route path="/owner/properties" element={<OwnerProperties />} />
        <Route path="/owner/bookings" element={<OwnerBookings />} />
        <Route path="/owner/profile" element={<OwnerProfile />} />
        <Route path="/owner/properties/new" element={<OwnerPropertyForm />} />
        <Route path="/owner/properties/:propertyId/edit" element={<OwnerPropertyForm />} />
        <Route path="/owner/analytics" element={<OwnerAnalytics />} />

        {/* Property details */}
        <Route path="/property/:id" element={<PropertyDetails />} />
      </Routes>
    </Router>
  );
}

export default App;

