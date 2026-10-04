import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import TopNav from '../components/top_nav'
import api from '../services/api'
import '../styles/home.css'

const CATEGORIES = ['All', 'Smartphones', 'Laptops', 'Audio']

const TRENDING_SEARCHES = [
  { label: 'iPhone 15 Pro', change: '+342%' },
  { label: 'PS5', change: '+218%' },
  { label: 'MacBook M3', change: '+156%' },
]

const formatNaira = (value) =>
  typeof value === 'number' ? `₦${value.toLocaleString('en-NG')}` : 'Price unavailable'

const categoryName = (product) =>
  (typeof product.category === 'string' ? product.category : product.category?.name || '')
    .toLowerCase()

function ProductCard({ product, onOpen }) {
  const imageUrl = product.product_image?.store_product_image_url
  const name = product.display_name || product.model
  const storeCount = product.store_products_count || 0

  return (
    <div className="card h-100 border-0 shadow-sm home-product-card" onClick={onOpen}>
      <div className="home-product-thumb">
        {imageUrl ? (
          <img src={imageUrl} alt={name || 'Product'} loading="lazy" />
        ) : (
          <i className="ti ti-device-mobile fs-1 text-muted" aria-hidden="true" />
        )}
      </div>

      <div className="card-body d-flex flex-column">
        <div className="small text-muted text-capitalize">{product.brand?.name || 'Brand'}</div>
        <h3 className="h6 fw-semibold text-capitalize mb-1">{name}</h3>
        <div className="small text-muted mb-3">
          {storeCount} {storeCount === 1 ? 'store' : 'stores'} compared
        </div>

        <div className="d-flex align-items-center justify-content-between border-top pt-3 mt-auto">
          <div>
            <div className="home-lowest-label small fw-semibold">
              <i className="ti ti-trending-down me-1" aria-hidden="true" />
              Lowest price
            </div>
            <div className="home-price fw-bold fs-5">{formatNaira(product.min_price)}</div>
          </div>
          <button type="button" className="btn home-compare-btn btn-sm rounded-pill px-3">
            Compare prices
          </button>
        </div>
      </div>
    </div>
  )
}

function ProductSkeletons() {
  return Array.from({ length: 8 }).map((_, i) => (
    <div className="col" key={i}>
      <div className="card h-100 border-0 shadow-sm" aria-hidden="true">
        <div className="home-product-thumb placeholder-glow">
          <span className="placeholder w-100 h-100" />
        </div>
        <div className="card-body placeholder-glow">
          <span className="placeholder col-4 mb-2 d-block" />
          <span className="placeholder col-9 mb-2 d-block" />
          <span className="placeholder col-6 d-block" />
        </div>
      </div>
    </div>
  ))
}

function Home() {
  const navigate = useNavigate()

  const [query, setQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState('All')
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await api.get('/products/')
        // Unwraps ProductResponseWrapper: { status, message, data: [...] }
        const list = response.data?.data || response.data || []
        setProducts(Array.isArray(list) ? list : [])
      } catch (err) {
        console.error('Failed to fetch products:', err)
        setError("We couldn't load products. Check your connection and try again.")
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [])

  const visibleProducts = useMemo(() => {
    if (activeCategory === 'All') return products
    return products.filter((p) => categoryName(p) === activeCategory.toLowerCase())
  }, [products, activeCategory])

  const goToSearch = (term) => {
    const trimmed = term.trim()
    if (!trimmed) return
    navigate(`/search?q=${encodeURIComponent(trimmed)}`)
  }

  const handleSearch = (e) => {
    e.preventDefault()
    goToSearch(query)
  }

  return (
    <div className="home-page">
      <TopNav />

      {/* Hero */}
      <section className="home-hero text-center text-white">
        <div className="container">
          <h1 className="home-hero-title fw-bold mb-3">Smart shopping starts here</h1>
          <p className="lead mb-4">
            Search once, compare prices across Nigerian stores, and buy where it costs least.
          </p>

          <form
            className="home-search-form d-flex align-items-center bg-white rounded-pill shadow p-1 mx-auto"
            onSubmit={handleSearch}
            role="search"
          >
            <i className="ti ti-search text-muted ms-3 me-2" aria-hidden="true" />
            <input
              type="search"
              className="form-control border-0 shadow-none bg-transparent"
              placeholder="Search products, e.g. iPhone 15 Pro"
              aria-label="Search products"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <button type="submit" className="btn home-search-btn rounded-pill px-4 text-white">
              Search
            </button>
          </form>

          <div className="d-flex flex-wrap justify-content-center align-items-center gap-2 mt-4">
            <span className="small opacity-75 me-1">Trending:</span>
            {TRENDING_SEARCHES.map(({ label, change }) => (
              <button
                key={label}
                type="button"
                className="btn btn-sm btn-outline-light rounded-pill"
                onClick={() => goToSearch(label)}
              >
                {label} <span className="home-chip-change fw-semibold ms-1">{change}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Products */}
      <main className="container py-5">
        <div className="d-flex flex-wrap gap-2 mb-4" role="group" aria-label="Product categories">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              className={`btn btn-sm rounded-pill px-3 ${
                activeCategory === cat ? 'home-pill-active' : 'btn-outline-secondary'
              }`}
              aria-pressed={activeCategory === cat}
              onClick={() => setActiveCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        <h2 className="h4 fw-semibold mb-3">
          <i className="ti ti-flame home-flame me-1" aria-hidden="true" />
          Trending now
        </h2>

        {error ? (
          <div className="alert alert-danger" role="alert">{error}</div>
        ) : (
          <div className="row row-cols-1 row-cols-sm-2 row-cols-lg-3 row-cols-xl-4 g-4">
            {loading ? (
              <ProductSkeletons />
            ) : visibleProducts.length === 0 ? (
              <div className="col-12 text-center text-muted py-5">
                {activeCategory === 'All'
                  ? 'No products yet. Run a scrape to fill the catalogue.'
                  : `No ${activeCategory.toLowerCase()} found yet.`}
              </div>
            ) : (
              visibleProducts.map((product) => (
                <div className="col" key={product.id}>
                  <ProductCard
                    product={product}
                    onOpen={() => navigate(`/products/${product.id}`)}
                  />
                </div>
              ))
            )}
          </div>
        )}
      </main>
    </div>
  )
}

export default Home
