import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { useUnreadCount } from "../hooks/notification_hooks";
import SearchOverlay from "./search_overlay";
import "../styles/top_nav.css";

// Search has no path: it opens the search overlay on the current page
const NAV_ITEMS = [
    { path: "/home", label: "Home", icon: "ti-home" },
    { id: "search", action: "search", label: "Search", icon: "ti-search" },
    { path: "/categories", label: "Categories", icon: "ti-category" },
    { path: "/favorites", label: "Favorites", icon: "ti-heart" },
    { path: "/notifications", label: "Notifications", icon: "ti-bell" },
    { path: "/profile", label: "Profile", icon: "ti-user" },
];

function TopNav() {
    const location = useLocation();
    const [open, setOpen] = useState(false);
    const [searchOpen, setSearchOpen] = useState(false);
    const unread = useUnreadCount(location.pathname);

    useEffect(() => {
        setOpen(false);
    }, [location.pathname]);

    useEffect(() => {
        document.body.style.overflow = open ? "hidden" : "";
        return () => {
            document.body.style.overflow = "";
        };
    }, [open]);

    const handleSearchClick = () => {
        setOpen(false); // close the mobile drawer first
        setSearchOpen(true);
    };

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
                {unread > 0 && !open && (
                    <span className="position-absolute top-0 start-100 translate-middle p-1 bg-danger border border-light rounded-circle">
                        <span className="visually-hidden">{unread} unread notifications</span>
                    </span>
                )}
            </button>

            <div
                className={`top-nav-backdrop${open ? " show" : ""}`}
                onClick={() => setOpen(false)}
            />

            <nav className={`top-nav${open ? " open" : ""}`}>
                {NAV_ITEMS.map((item) => {
                    if (item.action === "search") {
                        return (
                            <button
                                key={item.id}
                                type="button"
                                className="top-nav-item"
                                onClick={handleSearchClick}
                            >
                                <i className={`ti ${item.icon}`} aria-hidden="true" />
                                <span>{item.label}</span>
                            </button>
                        );
                    }

                    const isActive = location.pathname === item.path;
                    const showBadge = item.path === "/notifications" && unread > 0;

                    return (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`top-nav-item${isActive ? " active" : ""}`}
                        >
                            <i className={`ti ${item.icon}`} aria-hidden="true" />
                            <span>{item.label}</span>
                            {showBadge && (
                                <span className="badge rounded-pill bg-danger ms-2">
                                    {unread > 99 ? "99+" : unread}
                                    <span className="visually-hidden"> unread</span>
                                </span>
                            )}
                        </Link>
                    );
                })}
            </nav>

            <SearchOverlay
                open={searchOpen}
                initialTerm=""
                onClose={() => setSearchOpen(false)}
            />
        </>
    );
}

export default TopNav;
