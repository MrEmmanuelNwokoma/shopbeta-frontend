import { Link } from 'react-router-dom'
import '../styles/product_card.css'

// Prices can arrive as strings (e.g. "165000.00" from Pydantic Decimals) or numbers.
// Returns null when there is no usable price, so the card never shows a fake ₦0.
const formatNaira = (value) => {
  const n = Number(value)
  if (value == null || value === '' || !Number.isFinite(n) || n <= 0) return null
  return `₦${n.toLocaleString('en-NG')}`
}

function ProductCard({ product }) {
  const imageUrl = product.product_image?.store_product_image_url
  const name = product.display_name || product.model
  const storeCount = product.store_products_count || 0
  const price = formatNaira(product.min_price)

  return (
    <div className="card h-100 border-0 shadow-sm product-card">
      <div className="product-card-thumb">
        {imageUrl ? (
          <img src={imageUrl} alt="" loading="lazy" />
        ) : (
          <i className="ti ti-device-mobile fs-1 text-muted" aria-hidden="true" />
        )}
      </div>

      <div className="card-body d-flex flex-column">
        <div className="small text-muted text-capitalize">{product.brand?.name || 'Brand'}</div>
        <h3 className="h6 fw-semibold text-capitalize mb-1 product-card-name">
          {/* stretched-link makes the whole card clickable and keyboard-focusable */}
          <Link to={`/products/${product.id}/compare`} className="stretched-link product-card-link">
            {name}
          </Link>
        </h3>
        <div className="small text-muted mb-3">
          {storeCount} {storeCount === 1 ? 'store' : 'stores'} compared
        </div>

        <div className="d-flex align-items-center justify-content-between border-top pt-3 mt-auto">
          {price ? (
            <div>
              <div className="product-card-lowest small fw-semibold">
                <i className="ti ti-trending-down me-1" aria-hidden="true" />
                Lowest price
              </div>
              <div className="product-card-price fw-bold fs-5">{price}</div>
            </div>
          ) : (
            <div className="small text-muted">Price not available</div>
          )}
          <Link
            to={`/products/${product.id}/compare`}
            className="btn btn-sm rounded-pill px-3 product-card-compare"
          >
            Compare prices
          </Link>
        </div>
      </div>
    </div>
  )
}

export function ProductSkeletons({ count = 8 }) {
  return Array.from({ length: count }).map((_, i) => (
    <div className="col" key={i}>
      <div className="card h-100 border-0 shadow-sm" aria-hidden="true">
        <div className="product-card-thumb placeholder-glow">
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

export default ProductCard
