import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { MediaProvider } from './context/MediaContext';
import { SearchProvider } from './context/SearchContext';
import Header from './components/Header';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import Browse from './pages/Browse';
import Player from './pages/Player';
import Login from './pages/Login';
import Upload from './pages/Upload';
import Favorites from './pages/Favorites';
import Live from './pages/Live';
import GoLive from './pages/GoLive';
import WatchLive from './pages/WatchLive';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <MediaProvider>
          <SearchProvider>
            <Router>
              <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
                <Header />
                <main className="flex-1">
                  <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/browse" element={<Browse />} />
                    <Route path="/live" element={<Live />} />
                    <Route path="/live/go" element={<GoLive />} />
                    <Route path="/live/go/:roomId" element={<GoLive />} />
                    <Route path="/live/watch/:roomId" element={<WatchLive />} />
                    <Route path="/player/:type/:id" element={<Player />} />
                    <Route path="/login" element={<Login />} />
                    <Route
                      path="/upload"
                      element={
                        <ProtectedRoute>
                          <Upload />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/favorites"
                      element={
                        <ProtectedRoute>
                          <Favorites />
                        </ProtectedRoute>
                      }
                    />
                  </Routes>
                </main>
                <Footer />
              </div>
            </Router>
          </SearchProvider>
        </MediaProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;

