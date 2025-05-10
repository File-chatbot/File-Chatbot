import { Link } from 'react-router-dom';

const HomePage = () => {
    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-200 via-purple-200 to-pink-200">
            {/* Navigation */}
            <nav className="w-full bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 shadow-lg">
                <div className="container mx-auto px-4">
                    <div className="flex items-center justify-center h-16 relative">
                        <div className="text-center">
                            <h1 className="text-3xl font-bold text-white tracking-wide">
                                Exam Buddy
                            </h1>
                        </div>
                        <div className="absolute right-4 flex space-x-4">
                            <Link
                                to="/login"
                                className="px-4 py-2 text-white hover:text-indigo-100 font-medium transition-colors"
                            >
                                Login
                            </Link>
                            <Link
                                to="/signup"
                                className="px-4 py-2 bg-white text-indigo-600 rounded-lg hover:bg-indigo-50 transition-all shadow-sm font-medium"
                            >
                                Sign Up
                            </Link>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <div className="container mx-auto px-4 py-20 flex flex-col items-center justify-center">
                <div className="text-center max-w-4xl">
                    <h1 className="text-5xl sm:text-6xl md:text-7xl font-extrabold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-8">
                        Your AI Study Companion
                    </h1>
                    <p className="text-xl text-gray-700 mb-12 max-w-3xl mx-auto">
                        Get instant help with your studies, practice questions, and learn at your own pace with our AI-powered learning assistant.
                    </p>
                    <div className="flex justify-center space-x-6">
                        <Link
                            to="/signup"
                            className="px-8 py-4 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white rounded-lg hover:from-indigo-700 hover:to-pink-700 transition-all shadow-lg text-lg font-medium"
                        >
                            Get Started
                        </Link>
                        <Link
                            to="/login"
                            className="px-8 py-4 bg-white text-indigo-600 rounded-lg hover:bg-indigo-50 transition-all text-lg font-medium shadow-lg border border-indigo-200"
                        >
                            Login
                        </Link>
                    </div>
                </div>
            </div>

            {/* Features Section */}
            <div className="w-full py-20 bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100">
                <div className="container mx-auto px-4">
                    <h2 className="text-4xl font-bold text-center bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-16">
                        Our Features
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-10 max-w-6xl mx-auto">
                        <div className="p-8 bg-white rounded-2xl shadow-xl hover:shadow-2xl transition-shadow border-t-4 border-indigo-500">
                            <div className="w-16 h-16 bg-gradient-to-r from-indigo-500 to-indigo-700 rounded-xl flex items-center justify-center mb-6 mx-auto">
                                <span className="text-white font-bold text-xl">SL</span>
                            </div>
                            <h3 className="text-2xl font-semibold mb-4 text-indigo-600 text-center">Smart Learning</h3>
                            <p className="text-gray-600 text-center text-lg">Get personalized help and explanations for any subject or topic.</p>
                        </div>

                        <div className="p-8 bg-white rounded-2xl shadow-xl hover:shadow-2xl transition-shadow border-t-4 border-purple-500">
                            <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-purple-700 rounded-xl flex items-center justify-center mb-6 mx-auto">
                                <span className="text-white font-bold text-xl">PQ</span>
                            </div>
                            <h3 className="text-2xl font-semibold mb-4 text-purple-600 text-center">Practice Questions</h3>
                            <p className="text-gray-600 text-center text-lg">Access a vast library of practice questions and get instant feedback.</p>
                        </div>

                        <div className="p-8 bg-white rounded-2xl shadow-xl hover:shadow-2xl transition-shadow border-t-4 border-pink-500">
                            <div className="w-16 h-16 bg-gradient-to-r from-pink-500 to-pink-700 rounded-xl flex items-center justify-center mb-6 mx-auto">
                                <span className="text-white font-bold text-xl">24/7</span>
                            </div>
                            <h3 className="text-2xl font-semibold mb-4 text-pink-600 text-center">24/7 Support</h3>
                            <p className="text-gray-600 text-center text-lg">Get help anytime, anywhere with our AI-powered assistant.</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <footer className="w-full bg-gradient-to-r from-indigo-700 via-purple-700 to-pink-700 text-white py-8">
                <div className="container mx-auto px-4 text-center">
                    <p className="text-lg">© {new Date().getFullYear()} Exam Buddy. All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
};

export default HomePage;