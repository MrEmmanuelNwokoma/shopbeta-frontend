import { Link, useLocation } from "react-router-dom";
import "../styles/top_nav.css"

const NAV_ITEMS = [
    { path: "/home", label: "Home", icon: "ti-home" },
    { path: "/search", label: "Search", icon: "ti-search" },
    { path: "/categories", label: "Categories", icon: "ti-category" },
    { path: "/favorites", label: "Favorites", icon: "ti-heart" },
    { path: "/profile", label: "Profile", icon: "ti-user" },
];

function TopNav() {
    const location = useLocation();

    return (
        <nav className="top-nav">
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
    );
}

export default TopNav;
