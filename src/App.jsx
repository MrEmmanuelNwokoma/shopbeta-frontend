import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/auth/login";
import Register from "./pages/auth/register";
import EmailVerification from "./pages/auth/email_verification";
import Home from './pages/home'
import Categories from './pages/category'
import CategoryDetail from './pages/category_details'
import ProductCompareDetail from './pages/product_compare'
import Favorites from './pages/favorites'
import Profile from './pages/profile'
import PriceAlerts from './pages/price_alerts'
import { getToken } from './services/api'

// The bare address has no page of its own: logged-in users go to Home, everyone else to login
function RootRedirect() {
    return <Navigate to={getToken() ? "/home" : "/login"} replace />;
}

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<RootRedirect />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route
                    path="/email-verification"
                    element={<EmailVerification />}
                />
                <Route path="/categories" element={< Categories/>} />
                <Route path="/categories/:id" element={< CategoryDetail/>} />
                <Route path="/products/:productId/compare" element={<ProductCompareDetail />} />
                <Route path="/home" element={<Home />} />
                <Route path="/favorites" element={<Favorites />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/price-alerts" element={<PriceAlerts />} />
                {/* Any unknown address goes back to the root instead of a blank page */}
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;
