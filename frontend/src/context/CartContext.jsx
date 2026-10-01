import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

const CartContext = createContext(null);
const STORAGE_KEY = "food_ordering_cart";

function loadCart() {
  try {
    const saved = JSON.parse(
      sessionStorage.getItem(STORAGE_KEY) || "[]"
    );

    if (!Array.isArray(saved)) return [];

    return saved.filter(
      (item) =>
        Number.isInteger(item.id) &&
        item.id > 0 &&
        typeof item.name === "string" &&
        Number.isFinite(Number(item.price)) &&
        Number(item.price) > 0 &&
        Number.isInteger(item.quantity) &&
        item.quantity >= 1 &&
        item.quantity <= 1000
    );
  } catch {
    return [];
  }
}

export function CartProvider({ children }) {
  const [cart, setCart] = useState(loadCart);

  useEffect(() => {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
    } catch {
      // The cart can still work in memory if storage is unavailable.
    }
  }, [cart]);

  function addToCart(food) {
    if (!food.is_available) return;

    setCart((current) => {
      const existing = current.find(
        (item) => item.id === food.id
      );

      if (existing) {
        return current.map((item) =>
          item.id === food.id
            ? {
                ...item,
                quantity: Math.min(1000, item.quantity + 1),
              }
            : item
        );
      }

      return [
        ...current,
        {
          id: food.id,
          name: food.name,
          price: food.price,
          image: food.image,
          quantity: 1,
        },
      ];
    });
  }

  function increaseQuantity(id) {
    setCart((current) =>
      current.map((item) =>
        item.id === id
          ? {
              ...item,
              quantity: Math.min(1000, item.quantity + 1),
            }
          : item
      )
    );
  }

  function decreaseQuantity(id) {
    setCart((current) =>
      current.map((item) =>
        item.id === id
          ? {
              ...item,
              quantity: Math.max(1, item.quantity - 1),
            }
          : item
      )
    );
  }

  function removeFromCart(id) {
    setCart((current) =>
      current.filter((item) => item.id !== id)
    );
  }

  function clearCart() {
    setCart([]);
  }

  const cartCount = cart.reduce(
    (sum, item) => sum + item.quantity,
    0
  );

  const totalCents = cart.reduce(
    (sum, item) =>
      sum + Math.round(Number(item.price) * 100) * item.quantity,
    0
  );

  const total = totalCents / 100;

  return (
    <CartContext.Provider
      value={{
        cart,
        cartCount,
        total,
        addToCart,
        increaseQuantity,
        decreaseQuantity,
        removeFromCart,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(
      "useCart must be used inside CartProvider"
    );
  }

  return context;
}