import { Link } from "react-router-dom";

export default function Home() {
  return (
    <main>
      <section className="container py-4 py-lg-5">
        <div className="home-hero p-4 p-lg-5">
          <div className="row align-items-center g-5">
            <div className="col-lg-6">
              <span className="home-badge">
                ✦ A little happiness in every bite
              </span>

              <h1 className="home-title mt-4">
                Fresh flavours.
                <br />
                <span>Happy moments.</span>
              </h1>

              <p className="text-secondary fs-5 mt-4 mb-4">
                Discover your favourite meals, choose something
                delicious and order in just a few simple steps.
              </p>

              <div className="d-flex flex-wrap gap-3">
                <Link
                  to="/foods"
                  className="btn btn-success btn-lg px-4"
                >
                  Explore Our Menu →
                </Link>

                <Link
                  to="/cart"
                  className="btn btn-outline-success btn-lg px-4"
                >
                  View Cart
                </Link>
              </div>

              <div className="d-flex flex-wrap gap-4 mt-4 small text-secondary">
                <span>✦ Fresh ingredients</span>
                <span>✦ Prepared with care</span>
              </div>
            </div>

            <div className="col-lg-6">
              <div className="home-photo-wrapper">
                <img
                  className="home-photo"
                  src="https://images.unsplash.com/photo-1513104890138-7c749659a591?w=1200&auto=format&fit=crop"
                  alt="Freshly baked pizza with delicious toppings"
                  fetchPriority="high"
                />

                <div className="home-photo-caption">
                  <span className="small">MADE FOR YOUR CRAVINGS</span>
                  <h2 className="h5 mt-2 mb-0">
                    Your next favourite bite.
                  </h2>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="container pb-5">
        <div className="text-center mb-4">
          <p className="home-eyebrow mb-2">SIMPLE AND DELICIOUS</p>
          <h2 className="fw-bold">Your meal, in three easy steps</h2>
        </div>

        <div className="row g-4">
          <div className="col-md-4">
            <div className="home-step h-100">
              <span className="home-step-number">01</span>
              <h3 className="h5 fw-bold mt-3">Find your favourite</h3>
              <p className="text-secondary mb-0">
                Browse the menu and explore available dishes.
              </p>
            </div>
          </div>

          <div className="col-md-4">
            <div className="home-step h-100">
              <span className="home-step-number">02</span>
              <h3 className="h5 fw-bold mt-3">Make it yours</h3>
              <p className="text-secondary mb-0">
                Add meals to your cart and choose your quantities.
              </p>
            </div>
          </div>

          <div className="col-md-4">
            <div className="home-step h-100">
              <span className="home-step-number">03</span>
              <h3 className="h5 fw-bold mt-3">Place your order</h3>
              <p className="text-secondary mb-0">
                Confirm your details and check your order status.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="container pb-5">
        <div className="home-menu-banner p-4 p-md-5 d-flex flex-wrap align-items-center justify-content-between gap-4">
          <div>
            <h2 className="fw-bold mb-2">What are you craving today?</h2>
            <p className="mb-0">
              Something cheesy, something crispy, something delicious.
            </p>
          </div>

          <Link to="/foods" className="btn btn-light btn-lg px-4">
            Browse Menu →
          </Link>
        </div>
      </section>
    </main>
  );
}