import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LogisticsPage } from "./pages/LogisticsPage";
import { ProductShippingTab } from "./pages/ProductShippingTab";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LogisticsPage />} />
        <Route path="/product-shipping" element={<ProductShippingTab />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
);
