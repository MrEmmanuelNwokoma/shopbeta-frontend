import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import "../styles/top_nav.css";

const NAV_ITEMS = [
    { path: "/home", label: "Home", icon: "ti-home" },
    { path: "/search", label: "Search", icon: "ti-search" },
    { path: "/categories", label: "Categories", icon: "ti-category" },
    { path: "/favorites", label: "Favorites", icon: "ti-heart" },
    { path: "/profile", label: "Profile", icon: "ti-user" },
];

function TopNav() {
    const location = useLocation();
    const [open, setOpen] = useState(false);

    useEffect(() => {
        setOpen(false);
    }, [location.pathname]);

    useEffect(() => {
        document.body.style.overflow = open ? "hidden" : "";
        return () => {
            document.body.style.overflow = "";
        };
    }, [open]);

    return (
        <>
            <button
                type="button"
                className="top-nav-toggle"
                aria-label={open ? "Close menu" : "Open menu"}
                aria-expanded={open}
                onClick={() => setOpen((o) => !o)}
            >
                <i className={`ti ${open ? "ti-x" : "ti-menu-2"}`} aria-hidden="true" />
            </button>

            <div
                className={`top-nav-backdrop${open ? " show" : ""}`}
                onClick={() => setOpen(false)}
            />

            <nav className={`top-nav${open ? " open" : ""}`}>
                {NAV_ITEMS.map((item) => {
                    const isActive = location.pathname === item.path;

                    return (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`top-nav-item${isActive ? " active" : ""}`}
                        >
                            <i className={`ti ${item.icon}`} aria-hidden="true" />
                            <span>{item.label}</span>
                        </Link>
                    );
                })}
            </nav>
        </>
    );
}

export default TopNav;