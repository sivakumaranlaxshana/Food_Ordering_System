import { useEffect, useState } from "react";

import api from "../services/api.js";
import FoodCard from "../components/FoodCard.jsx";

export default function Foods() {
  const [foods, setFoods] = useState([]);
  const [categories, setCategories] = useState([]);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [sorting, setSorting] = useState("name:asc");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadMenu() {
      setLoading(true);
      setError("");

      const [sort, order] = sorting.split(":");

      try {
        const [foodResponse, categoryResponse] = await Promise.all([
          api.get("/foods/", {
            params: {
              page,
              limit: 8,
              search: search || undefined,
              category_id: category || undefined,
              sort,
              order,
              is_available: true,
            },
          }),
          api.get("/categories/"),
        ]);

        if (!active) return;

        setFoods(foodResponse.data.items);
        setTotal(foodResponse.data.total);
        setTotalPages(foodResponse.data.total_pages);
        setCategories(categoryResponse.data);
      } catch {
        if (active) {
          setError("Could not load the menu. Check that FastAPI is running.");
          setFoods([]);
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    loadMenu();

    return () => {
      active = false;
    };
  }, [page, search, category, sorting]);

  return (
    <main className="container py-5">
      <div
        className="rounded-4 p-4 p-md-5 mb-4 text-white"
        style={{ background: "#174b3b" }}
      >
        <p className="small mb-2">FRESH FLAVOURS, EVERY DAY</p>
        <h1 className="fw-bold">Find your favourite meal</h1>
        <p className="mb-0">
          Browse our menu, choose your favourites and make it delicious.
        </p>
      </div>

      <form
        className="row g-3 mb-4"
        onSubmit={(event) => {
          event.preventDefault();
          setSearch(searchInput.trim());
          setPage(1);
        }}
      >
        <div className="col-md-5">
          <label htmlFor="foodSearch" className="form-label">
            Search food
          </label>
          <div className="input-group">
            <input
              id="foodSearch"
              type="search"
              className="form-control"
              placeholder="Pizza, burger..."
              maxLength={150}
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
            />
            <button className="btn btn-success" type="submit">
              Search
            </button>
          </div>
        </div>

        <div className="col-md-3">
          <label htmlFor="foodCategory" className="form-label">
            Category
          </label>
          <select
            id="foodCategory"
            className="form-select"
            value={category}
            onChange={(event) => {
              setCategory(event.target.value);
              setPage(1);
            }}
          >
            <option value="">All categories</option>
            {categories.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>
        </div>

        <div className="col-md-4">
          <label htmlFor="foodSort" className="form-label">
            Sort by
          </label>
          <select
            id="foodSort"
            className="form-select"
            value={sorting}
            onChange={(event) => {
              setSorting(event.target.value);
              setPage(1);
            }}
          >
            <option value="name:asc">Name: A → Z</option>
            <option value="price:asc">Price: Low → High</option>
            <option value="price:desc">Price: High → Low</option>
          </select>
        </div>
      </form>

      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-center py-5" role="status">
          <div className="spinner-border text-success" />
          <p className="mt-3">Loading delicious meals...</p>
        </div>
      ) : !error ? (
        <>
          <p className="text-secondary">{total} foods found</p>

          <div className="row g-4">
            {foods.map((food) => (
              <div className="col-sm-6 col-lg-3" key={food.id}>
                <FoodCard food={food} />
              </div>
            ))}
          </div>

          {foods.length === 0 && (
            <div className="text-center bg-white rounded-4 p-5">
              <h2 className="h5">No foods found</h2>
              <p className="text-secondary mb-0">
                Try another search or category. Admin can add available foods.
              </p>
            </div>
          )}

          {totalPages > 0 && (
            <div className="d-flex justify-content-center align-items-center gap-3 mt-5">
              <button
                className="btn btn-outline-success"
                disabled={page <= 1}
                onClick={() => setPage((current) => current - 1)}
              >
                Previous
              </button>

              <span>Page {page} of {totalPages}</span>

              <button
                className="btn btn-outline-success"
                disabled={page >= totalPages}
                onClick={() => setPage((current) => current + 1)}
              >
                Next
              </button>
            </div>
          )}
        </>
      ) : null}
    </main>
  );
}