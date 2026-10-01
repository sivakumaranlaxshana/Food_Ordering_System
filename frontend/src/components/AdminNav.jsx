import { NavLink } from "react-router-dom";

export default function AdminNav() {
  const links = [
    ["/admin", "Dashboard"],
    ["/admin/categories", "Categories"],
    ["/admin/foods", "Foods"],
    ["/admin/orders", "Orders"],
    ["/admin/users", "Users"],
  ];

  return (
    <nav className="d-flex flex-wrap gap-2 mb-4" aria-label="Admin navigation">
      {links.map(([path, label]) => (
        <NavLink
          key={path}
          to={path}
          end
          className={({ isActive }) =>
            `btn btn-sm ${
              isActive ? "btn-success" : "btn-outline-success"
            }`
          }
        >
          {label}
        </NavLink>
      ))}
    </nav>
  );
}