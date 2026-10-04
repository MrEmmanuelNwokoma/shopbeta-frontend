import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import TopNav from '../components/top_nav'
import api from '../services/api'
import '../styles/categories.css'

const PLACEHOLDER_IMAGE = '/placeholder-tech.png'

const formatCount = (count) => {
  const n = Number(count) || 0
  return `${n.toLocaleString('en-NG')} ${n === 1 ? 'product' : 'products'}`
}

function CategoryCard({ category }) {
  return (
    <div className="card h-100 border-0 shadow-sm categories-card">
      <div className="categories-card-thumb">
        <img
          src={category.category_image || PLACEHOLDER_IMAGE}
          alt=""
          loading="lazy"
          onError={(e) => {
            e.currentTarget.onerror = null
            e.currentTarget.src = PLACEHOLDER_IMAGE
          }}
        />
      </div>

      <div className="card-body d-flex align-items-center justify-content-between gap-2">
        <div className="min-w-0">
          <h2 className="h6 fw-semibold mb-1">
            {/* stretched-link makes the whole card clickable and keyboard-focusable */}
            <Link to={`/categories/${category.id}`} className="stretched-link categories-card-link">
              {category.name}
            </Link>
          </h2>
          <div className="small text-muted">{formatCount(category.product_count)}</div>
          {category.description && (
            <div className="small text-muted categories-card-desc mt-1">{category.description}</div>
          )}
        </div>
        <i className="ti ti-chevron-right categories-card-chevron" aria-hidden="true" />
      </div>
    </div>
  )
}

function CategorySkeletons() {
  return Array.from({ length: 8 }).map((_, i) => (
    <div className="col" key={i}>
      <div className="card h-100 border-0 shadow-sm" aria-hidden="true">
        <div className="categories-card-thumb placeholder-glow">
          <span className="placeholder w-100 h-100" />
        </div>
        <div className="card-body placeholder-glow">
          <span className="placeholder col-6 mb-2 d-block" />
          <span className="placeholder col-4 d-block" />
        </div>
      </div>
    </div>
  ))
}

function Categories() {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await api.get('/categories/')
        const list = response.data?.data || response.data || []
        setCategories(Array.isArray(list) ? list : [])
      } catch (err) {
        console.error('Failed to fetch categories:', err)
        setError("We couldn't load categories. Check your connection and try again.")
      } finally {
        setLoading(false)
      }
    }

    fetchCategories()
  }, [])

  return (
    <div className="categories-page">
      <TopNav />

      <header className="categories-header">
        <div className="container py-5">
          <h1 className="fw-bold mb-2">Browse by category</h1>
          <p className="mb-0 categories-subtitle">
            Pick a category to compare prices on every product across stores.
          </p>
        </div>
      </header>

      <main className="container py-5">
        {error ? (
          <div className="alert alert-danger" role="alert">{error}</div>
        ) : (
          <div className="row row-cols-2 row-cols-md-3 row-cols-xl-4 g-3 g-md-4">
            {loading ? (
              <CategorySkeletons />
            ) : categories.length === 0 ? (
              <div className="col-12 text-center text-muted py-5">
                No categories yet. Run a scrape to fill the catalogue.
              </div>
            ) : (
              categories.map((cat) => (
                <div className="col" key={cat.id}>
                  <CategoryCard category={cat} />
                </div>
              ))
            )}
          </div>
        )}
      </main>
    </div>
  )
}

export default Categories
