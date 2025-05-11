import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Toaster } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import HomePage from './pages/HomePage';
import SignIn from './components/SignIn';
import Signup from './components/Signup';
import Chat from './components/Chat';
import History from './pages/History';
import './App.css';

// Protected Route component with loading animation
const ProtectedRoute = ({ children }) => {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div className="app-container">
                <div className="loading-spinner">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                </div>
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/login" />;
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="content-wrapper"
        >
            {children}
        </motion.div>
    );
};

const AppRoutes = () => {
    return (
        <AnimatePresence mode="wait">
            <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/login" element={<SignIn />} />
                <Route path="/signup" element={<Signup />} />
                <Route
                    path="/chat"
                    element={
                        <ProtectedRoute>
                            <Chat />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/history"
                    element={
                        <ProtectedRoute>
                            <History />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/chat/:chatId"
                    element={
                        <ProtectedRoute>
                            <Chat />
                        </ProtectedRoute>
                    }
                />
            </Routes>
        </AnimatePresence>
    );
};

const App = () => {
    return (
        <AuthProvider>
        <Router>
                    <Toaster
                    position="top-right"
                        toastOptions={{
                            duration: 3000,
                            style: {
                            background: '#363636',
                            color: '#fff',
                            },
                            success: {
                            duration: 3000,
                            theme: {
                                primary: '#4aed88',
                                },
                            },
                            error: {
                            duration: 3000,
                            theme: {
                                primary: '#ff4b4b',
                                },
                            },
                        }}
                    />
                <AppRoutes />
            </Router>
            </AuthProvider>
    );
};

export default App;
