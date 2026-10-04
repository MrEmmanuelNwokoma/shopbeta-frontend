import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/auth/login";
import Register from "./pages/auth/register";
import EmailVerification from "./pages/auth/email_verification";
import Home from './pages/home'
import Categories from './pages/category'
import CategoryDetail from './pages/category_details'
import ProductCompareDetail from './pages/product_compare'
import Favorites from './pages/favorites'
import Profile from './pages/profile'

function App() {
    return (
        <BrowserRouter>
            <Routes>
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
            </Routes>
        </BrowserRouter>
    );
}

export default App;
