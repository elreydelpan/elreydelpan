import { Routes, Route } from "react-router";
import { CartProvider } from "@/lib/cart";
import Home from "./pages/Home";
import Admin from "./pages/Admin";

export default function App() {
  return (
    <CartProvider>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="*" element={<Home />} />
      </Routes>
    </CartProvider>
  );
}
