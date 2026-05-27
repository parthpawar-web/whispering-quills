import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Library from './pages/Library';
import StoryDetails from './pages/StoryDetails';
import CreateStory from './pages/CreateStory';
import MyStories from './pages/MyStories';
import Profile from './pages/Profile';
import AdminDashboard from './pages/AdminDashboard';
import Community from './pages/Community';
import NotFound from './pages/NotFound';

export default function App() {
  return (
    <AuthProvider>
    <BrowserRouter>
      <Routes>
        {/* Auth pages — no footer needed */}
        <Route
          path="/login"
          element={
            <Layout showFooter={false}>
              <Login />
            </Layout>
          }
        />
        <Route
          path="/register"
          element={
            <Layout showFooter={false}>
              <Register />
            </Layout>
          }
        />

        {/* Main pages */}
        <Route
          path="/"
          element={
            <Layout>
              <Home />
            </Layout>
          }
        />
        <Route
          path="/library"
          element={
            <Layout>
              <Library />
            </Layout>
          }
        />
        <Route
          path="/story/:id"
          element={
            <Layout>
              <StoryDetails />
            </Layout>
          }
        />
        <Route
          path="/create"
          element={
            <ProtectedRoute>
              <Layout>
                <CreateStory />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/my-stories"
          element={
            <ProtectedRoute>
              <Layout>
                <MyStories />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Layout>
                <Profile />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/community"
          element={
            <Layout>
              <Community />
            </Layout>
          }
        />
        <Route
          path="/about"
          element={
            <Layout>
              <Community />
            </Layout>
          }
        />
        <Route
          path="/admin"
          element={
            <ProtectedRoute adminOnly={true}>
              <Layout showFooter={false}>
                <AdminDashboard />
              </Layout>
            </ProtectedRoute>
          }
        />

        {/* 404 */}
        <Route
          path="*"
          element={
            <Layout showFooter={false}>
              <NotFound />
            </Layout>
          }
        />
      </Routes>
    </BrowserRouter>
    </AuthProvider>
  );
}
