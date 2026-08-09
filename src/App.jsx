import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/auth/login";
import Register from "./pages/auth/register";
import EmailVerification from "./pages/auth/email_verification";

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
            </Routes>
        </BrowserRouter>
    );
}

export default App;
