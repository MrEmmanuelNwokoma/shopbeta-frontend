import { useState, useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import TopNav from '../components/top_nav'
import ProductCard, { ProductSkeletons } from '../pages/product_card'
import api from '../services/api'
import '../styles/category_details.css'

function CategoryDetail() {
  const { id } = useParams()

  const [products, setProducts] = useState([])
  const [categoryName, setCategoryName] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!id) return
    let cancelled = false

    const load = async () => {
      setLoading(true)
      setError(null)
      setCategoryName('')

      try {
        const response = await api.get(`/categories/${id}/products`)
        const list = response.data?.data || response.data || []
        if (cancelled) return
        setProducts(Array.isArray(list) ? list : [])

        // The products endpoint may not include the category, so fall back to the categories list
        let name = response.data?.category?.name
        if (!name) {
          try {
            const catRes = await api.get('/categories/')
            const cats = catRes.data?.data || catRes.data || []
            name = Array.isArray(cats)
              ? cats.find((c) => String(c.id) === String(id))?.name
              : ''
          } catch {
            /* the title falls back to a generic label */
          }
        }
        if (!cancelled) setCategoryName(name || '')
      } catch (err) {
        console.error('Failed to fetch category products:', err)
        if (!cancelled) setError("We couldn't load products for this category. Try again in a moment.")
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [id])

  return (
    <div className="category-detail-page">
      <TopNav />

      <header className="category-detail-header">
        <div className="container py-4 py-md-5">
          <Link to="/categories" className="category-detail-back small">
            <i className="ti ti-chevron-left" aria-hidden="true" /> All categories
          </Link>
          <h1 className="fw-bold mt-2 mb-1">{categoryName || 'Products'}</h1>
          {!loading && !error && (
            <p className="mb-0 category-detail-count">
              {products.length.toLocaleString('en-NG')} {products.length === 1 ? 'product' : 'products'}
            </p>
          )}
        </div>
      </header>

      <main className="container py-5">
        {error ? (
          <div className="alert alert-danger" role="alert">{error}</div>
        ) : (
          <div className="row row-cols-1 row-cols-sm-2 row-cols-lg-3 row-cols-xl-4 g-4">
            {loading ? (
              <ProductSkeletons />
            ) : products.length === 0 ? (
              <div className="col-12 text-center text-muted py-5">
                No products in this category yet.
              </div>
            ) : (
              products.map((product) => (
                <div className="col" key={product.id}>
                  <ProductCard product={product} />
                </div>
              ))
            )}
          </div>
        )}
      </main>
    </div>
  )
}

export default CategoryDetail
