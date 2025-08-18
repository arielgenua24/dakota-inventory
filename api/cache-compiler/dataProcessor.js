// Categorías disponibles
const Category = {
  jeans: "jeans",
  shirts: "shirts",
  jackets: "jackets",
  accessories: "accessories",
  other: "other",
};

export const processJeansData = (products) => {
  if (!products || products.length === 0) return [];

  console.log('Processing products:', products.length);

  // Agrupar productos por nombre
  const groupedProducts = products.reduce((acc, product) => {
    const key = product.name;
    if (!acc[key]) acc[key] = [];
    acc[key].push(product);
    return acc;
  }, {});

  return Object.entries(groupedProducts).map(([name, group]) => {
    // Reordenar: productos con image1 primero
    const prioritizedGroup = [...group].sort((a) => a.image1 ? -1 : 1);
    const mainProduct = prioritizedGroup[0] || {};

    const codeWithoutHash = mainProduct.productCode?.replace('#', '') || '0';
    const productCodeInt = parseInt(codeWithoutHash, 10);

    // Extraer tallas únicas
    const uniqueSizes = [...new Set(
      group.map(p => {
        const parsed = parseInt(p.size, 10);
        return isNaN(parsed) ? p.size : parsed;
      })
    )];

    return {
      id: productCodeInt,
      name,
      category: mainProduct.category || Category.other,
      specialTag: '',
      images: {
        img1: mainProduct.image1 || '',
        img2: mainProduct.image2 || '',
        img3: mainProduct.image3 || ''
      },
      price: parseInt(mainProduct.price) || 0,
      state: '',
      sizes: uniqueSizes
        .sort((a, b) => {
          // Si ambas son numéricas, ordena de forma ascendente
          if (typeof a === "number" && typeof b === "number") return a - b;
          // Si ambas son cadenas, ordena alfabéticamente
          if (typeof a === "string" && typeof b === "string") return a.localeCompare(b);
          // En caso de mezcla, se convierten a cadena para comparar
          return a.toString().localeCompare(b.toString());
        })
        .map(size => ({ size, quantity: 0 }))
    };
  });
};

// Función para particionar la data en chunks optimizados
export const partitionData = (processedData, maxDocSize = 950000) => {
  const chunks = [];
  let currentChunk = [];
  let currentSize = 0;

  for (const item of processedData) {
    const itemSize = JSON.stringify(item).length;
    
    // Si agregar este item excede el tamaño máximo, crear un nuevo chunk
    if (currentSize + itemSize > maxDocSize && currentChunk.length > 0) {
      chunks.push({
        data: currentChunk,
        metadata: {
          count: currentChunk.length,
          size: currentSize,
          firstId: currentChunk[0].id,
          lastId: currentChunk[currentChunk.length - 1].id
        }
      });
      currentChunk = [];
      currentSize = 0;
    }
    
    currentChunk.push(item);
    currentSize += itemSize;
  }
  
  // Agregar el último chunk si tiene datos
  if (currentChunk.length > 0) {
    chunks.push({
      data: currentChunk,
      metadata: {
        count: currentChunk.length,
        size: currentSize,
        firstId: currentChunk[0].id,
        lastId: currentChunk[currentChunk.length - 1].id
      }
    });
  }
  
  return chunks;
};
