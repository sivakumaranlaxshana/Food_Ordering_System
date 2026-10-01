import { Link, Route, Routes } from "react-router-dom";

import Navbar from "./components/Navbar.jsx";
import Footer from "./components/Footer.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import AdminRoute from "./components/AdminRoute.jsx";

import Home from "./pages/Home.jsx";
import Foods from "./pages/Foods.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import Cart from "./pages/Cart.jsx";
import Checkout from "./pages/Checkout.jsx";
import OrderConfirmation from "./pages/OrderConfirmation.jsx";
import MyOrders from "./pages/MyOrders.jsx";

import AdminDashboard from "./pages/AdminDashboard.jsx";
import AdminCategories from "./pages/AdminCategories.jsx";
import AdminFoods from "./pages/AdminFoods.jsx";
import AdminOrders from "./pages/AdminOrders.jsx";
import AdminUsers from "./pages/AdminUsers.jsx";

function protectedPage(page) {
  return <ProtectedRoute>{page}</ProtectedRoute>;
}

function adminPage(page) {
  return <AdminRoute>{page}</AdminRoute>;
}

function NotFound() {
  return (
    <main className="container py-5 text-center">
      <h1 className="h3">Page not found</h1>
      <Link to="/" className="btn btn-success mt-3">Home</Link>
    </main>
  );
}

export default function App() {
  return (
    <div className="d-flex flex-column min-vh-100">
      <Navbar />

      <div className="flex-grow-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/foods" element={<Foods />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/cart" element={<Cart />} />

          <Route path="/checkout" element={protectedPage(<Checkout />)} />
          <Route path="/orders/:id" element={protectedPage(<OrderConfirmation />)} />
          <Route path="/my-orders" element={protectedPage(<MyOrders />)} />

          <Route path="/admin" element={adminPage(<AdminDashboard />)} />
          <Route path="/admin/categories" element={adminPage(<AdminCategories />)} />
          <Route path="/admin/foods" element={adminPage(<AdminFoods />)} />
          <Route path="/admin/orders" element={adminPage(<AdminOrders />)} />
          <Route path="/admin/users" element={adminPage(<AdminUsers />)} />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>

      <Footer />
    </div>
  );
}