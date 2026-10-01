import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer
      className="mt-auto pt-5 pb-3 text-white"
      style={{ backgroundColor: "#174b3b" }}
    >
      <div className="container">
        <div className="row g-4 pb-4">
          <div className="col-md-6">
            <Link
              to="/"
              className="text-decoration-none text-white fs-3 fw-bold"
            >
              Little
              <span style={{ color: "#ffb38d" }}>Table.</span>
            </Link>

            <p
              className="mt-3 mb-0"
              style={{ color: "#d4e4da", maxWidth: "360px" }}
            >
              Fresh flavours, favourite meals and simple ordering.
              Find something delicious for your next happy moment.
            </p>
          </div>

          <div className="col-6 col-md-3">
            <h2 className="h6 fw-bold mb-3">Explore</h2>

            <ul className="list-unstyled d-grid gap-2 mb-0">
              <li>
                <Link
                  to="/"
                  className="text-white text-decoration-none"
                >
                  Home
                </Link>
              </li>

              <li>
                <Link
                  to="/foods"
                  className="text-white text-decoration-none"
                >
                  Our Menu
                </Link>
              </li>

              <li>
                <Link
                  to="/cart"
                  className="text-white text-decoration-none"
                >
                  Your Cart
                </Link>
              </li>
            </ul>
          </div>

          <div className="col-6 col-md-3">
            <h2 className="h6 fw-bold mb-3">A better meal</h2>

            <p className="small mb-2" style={{ color: "#d4e4da" }}>
              Fresh ingredients
            </p>

            <p className="small mb-2" style={{ color: "#d4e4da" }}>
              Prepared with care
            </p>

            <p className="small mb-0" style={{ color: "#d4e4da" }}>
              Made for your cravings
            </p>
          </div>
        </div>

        <div
          className="border-top pt-3 d-flex flex-wrap justify-content-between gap-2 small"
          style={{ borderColor: "#ffffff30", color: "#d4e4da" }}
        >
          <span>
            © {new Date().getFullYear()} Little Table.
          </span>

          <span>Good food. Happy moments.</span>
        </div>
      </div>
    </footer>
  );
}