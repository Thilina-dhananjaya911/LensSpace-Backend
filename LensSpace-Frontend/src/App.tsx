import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import ExplorePage from './pages/ExplorePage';
import MapPage from './pages/MapPage';
import SpotDetailPage from './pages/SpotDetailPage';
import SpotFormPage from './pages/SpotFormPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import FavoritesPage from './pages/FavoritesPage';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<ExplorePage />} />
        <Route path="map" element={<MapPage />} />
        <Route path="favorites" element={<FavoritesPage />} />
        <Route path="spot/:id" element={<SpotDetailPage />} />
        <Route path="spot/new" element={<SpotFormPage />} />
        <Route path="spot/edit/:id" element={<SpotFormPage />} />
        <Route path="login" element={<LoginPage />} />
        <Route path="signup" element={<SignupPage />} />
      </Route>
    </Routes>
  );
}

export default App;
