import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { Link } from "react-router-dom";
import "../styles/search_overlay.css";

// use whatever your other pages use to reach the backend
const API_BASE_URL = import.meta.env.VITE_API_URL;

function formatPrice(amount, currency = "ngn") {
    try {
        return new Intl.NumberFormat("en-NG", {
            style: "currency",
            currency: currency.toUpperCase(),
            maximumFractionDigits: 0,
        }).format(amount);
    } catch {
        return `${currency.toUpperCase()} ${Math.round(amount).toLocaleString()}`;
    }
}

// Reusable: render it wherever you need search and control it with props.
function SearchOverlay({ open, initialTerm = "", onClose }) {
    const [term, setTerm] = useState("");
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const inputRef = useRef(null);

    const q = term.trim();

    // lock page scroll while open (a body class, so it can't clash with other scroll locks)
    useEffect(() => {
        if (!open) return;
        document.body.classList.add("search-open");
        return () => document.body.classList.remove("search-open");
    }, [open]);

    // focus the input when opened, reset everything when closed
    useEffect(() => {
        if (open) {
            setTerm(initialTerm);
            inputRef.current?.focus();
        } else {
            setTerm("");
            setProducts([]);
            setError(null);
            setLoading(false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open]);

    // Escape closes the overlay
    useEffect(() => {
        if (!open) return;
        const onKey = (e) => {
            if (e.key === "Escape") onClose();
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [open, onClose]);

    // search as the user types, waiting 300ms after the last keystroke
    useEffect(() => {
        if (!open) return;

        if (!q) {
            setProducts([]);
            setError(null);
            setLoading(false);
            return;
        }

        const controller = new AbortController();
        setLoading(true);
        setError(null);

        const timer = setTimeout(() => {
            // if your FastAPI route uses `q` instead of `query`, change it here
            fetch(`${API_BASE_URL}/products/search?query=${encodeURIComponent(q)}`, {
                signal: controller.signal,
            })
                .then((res) => {
                    if (!res.ok) throw new Error("Request failed");
                    return res.json();
                })
                .then((json) => {
                    if (!controller.signal.aborted) setProducts(json.data || []);
                })
                .catch((err) => {
                    if (err.name !== "AbortError") {
                        setError("Couldn't load results. Check your connection and try again.");
                    }
                })
                .finally(() => {
                    if (!controller.signal.aborted) setLoading(false);
                });
        }, 300);

        // a newer keystroke cancels the pending request
        return () => {
            clearTimeout(timer);
            controller.abort();
        };
    }, [q, open]);

    if (!open) return null;

    return createPortal(
        <div className="search-overlay" onClick={onClose}>
            <div
                className="search-overlay-panel"
                role="dialog"
                aria-modal="true"
                aria-label="Search products"
                onClick={(e) => e.stopPropagation()}
            >
                <form
                    className="search-overlay-form"
                    role="search"
                    onSubmit={(e) => e.preventDefault()}
                >
                    <i className="ti ti-search" aria-hidden="true" />
                    <input
                        ref={inputRef}
                        type="search"
                        value={term}
                        onChange={(e) => setTerm(e.target.value)}
                        placeholder="Search by brand or model"
                        aria-label="Search products"
                    />
                    <button type="button" className="search-overlay-close" onClick={onClose}>
                        Close
                    </button>
                </form>

                <div className="search-overlay-results" aria-live="polite">
                    {!q && (
                        <p className="search-overlay-status">
                            Type a brand or model, like "galaxy a07".
                        </p>
                    )}

                    {q && loading && <p className="search-overlay-status">Searching...</p>}

                    {error && (
                        <p className="search-overlay-status" role="alert">
                            {error}
                        </p>
                    )}

                    {q && !loading && !error && products.length === 0 && (
                        <p className="search-overlay-status">
                            No products matched. Try a shorter search, like just the model name.
                        </p>
                    )}

                    {q && !loading && !error && products.length > 0 && (
                        <ul className="search-overlay-list">
                            {products.map((p) => {
                                const stores = p.stores || [];
                                const prices = stores.map((s) => s.price);
                                const lowest = prices.length ? Math.min(...prices) : null;
                                const count = p.store_products_count ?? stores.length;

                                return (
                                    <li key={p.id}>
                                        <Link
                                            to={`/products/${p.id}/compare`}
                                            className="search-overlay-item"
                                            onClick={onClose}
                                        >
                                            <div className="search-overlay-thumb">
                                                {p.product_image ? (
                                                    <img
                                                        src={p.product_image.store_product_image_url}
                                                        alt=""
                                                        loading="lazy"
                                                    />
                                                ) : (
                                                    <i className="ti ti-photo" aria-hidden="true" />
                                                )}
                                            </div>

                                            <div className="search-overlay-info">
                                                <span className="search-overlay-name">
                                                    {p.display_name}
                                                </span>
                                                <span className="search-overlay-meta">
                                                    {lowest !== null &&
                                                        `From ${formatPrice(lowest, stores[0]?.currency)} · `}
                                                    {count} store{count === 1 ? "" : "s"}
                                                </span>
                                            </div>
                                        </Link>
                                    </li>
                                );
                            })}
                        </ul>
                    )}
                </div>
            </div>
        </div>,
        document.body
    );
}

export default SearchOverlay;
