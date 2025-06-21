
import { useCallback } from 'react';

const PRODUCTS_STORAGE_KEY = 'raw_products';
const PROCESSED_PRODUCTS_STORAGE_KEY = 'processed_products';

/**
 * Transforma el array de productos para que cada nombre de jean quede
 * condensado en un solo objeto con sus talles e imágenes principales.
 * @param {Array<Object>} products
 * @returns {Array<Object>}
 */
const processJeansData = (products) => {
  if (!products || products.length === 0) return [];

  // Agrupar productos por nombre
  const groupedProducts = products.reduce((acc, product) => {
    const key = product.name;
    if (!acc[key]) acc[key] = [];
    acc[key].push(product);
    return acc;
  }, {});

  return Object.entries(groupedProducts).map(([name, group]) => {
    // Reordenar: primero los que tienen image1
    const prioritizedGroup = [...group].sort((a, b) =>
      a.image1 && !b.image1 ? -1 : !a.image1 && b.image1 ? 1 : 0
    );
    const mainProduct = prioritizedGroup[0] || {};

    const codeWithoutHash = (mainProduct.productCode || "").replace("#", "");
    const productCodeInt =
      Number.parseInt(codeWithoutHash, 10) || Date.now(); // Fallback: timestamp

    // Talles únicos (número o string)
    const uniqueSizes = [
      ...new Set(
        group.map((p) => {
          const parsed = Number.parseInt(p.size || "", 10);
          return isNaN(parsed) ? p.size : parsed;
        })
      ),
    ];

    return {
      id: productCodeInt,
      name,
      category: mainProduct.category || "other",
      specialTag: "",
      images: {
        img1: mainProduct.image1 || "",
        img2: mainProduct.image2 || "",
        img3: mainProduct.image3 || "",
      },
      price: Number(mainProduct.price || "0") || 0,
      curvePrice: Number(mainProduct.curvePrice || "0") || 0,
      state: "",
      totalSizes: uniqueSizes.length,
      sizes: uniqueSizes
        .sort((a, b) => {
          if (typeof a === "number" && typeof b === "number") return a - b;
          if (typeof a === "string" && typeof b === "string")
            return (a || "").localeCompare(b || "");
          return (a?.toString() || "").localeCompare(b?.toString() || "");
        })
        .map((size) => ({ size, quantity: 10 })),
    };
  });
};


export const useProducts = () => {
  const getProducts = useCallback(() => {
    try {
      const products = sessionStorage.getItem(PRODUCTS_STORAGE_KEY);
      return products ? JSON.parse(products) : null;
    } catch (error) {
      console.error("Error getting products from sessionStorage:", error);
      return null;
    }
  }, []);

  const saveProducts = useCallback((products) => {
    try {
      sessionStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(products));
    } catch (error) {
      console.error("Error saving products to sessionStorage:", error);
    }
  }, []);

  const processAndSaveJeans = useCallback(async () => {
    try {
        const rawProducts = getProducts();
        if (rawProducts) {
            const processed = processJeansData(rawProducts);
            sessionStorage.setItem(PROCESSED_PRODUCTS_STORAGE_KEY, JSON.stringify(processed));
            return processed;
        }
        return null;
    } catch (error) {
        console.error("Error processing and saving jeans data:", error);
        return null;
    }
  }, [getProducts]);

  const getProcessedJeans = useCallback(() => {
    try {
      const products = sessionStorage.getItem(PROCESSED_PRODUCTS_STORAGE_KEY);
      return products ? JSON.parse(products) : null;
    } catch (error) {
      console.error("Error getting processed jeans from sessionStorage:", error);
      return null;
    }
  }, []);

  const clearProducts = useCallback(() => {
    try {
      sessionStorage.removeItem(PRODUCTS_STORAGE_KEY);
      sessionStorage.removeItem(PROCESSED_PRODUCTS_STORAGE_KEY);
    } catch (error) {
      console.error("Error clearing products from sessionStorage:", error);
    }
  }, []);

  return { saveProducts, getProducts, processAndSaveJeans, getProcessedJeans, clearProducts };
};
