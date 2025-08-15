const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

/**
 * Compila el caché automáticamente (trigger desde operaciones CRUD)
 */
export async function autoCompileCache() {
  try {
    const response = await fetch(`${API_BASE_URL}/cache-compiler`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'compile',
        trigger: 'auto'
      })
    });

    const result = await response.json();
    
    if (!result.success) {
      console.error('Cache compilation failed:', result.message);
    } else {
      console.log('Cache compiled successfully:', result.stats);
    }
    
    return result;
  } catch (error) {
    console.error('Error compiling cache:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Compila el caché manualmente (requiere contraseña)
 */
export async function manualCompileCache(password) {
  try {
    const response = await fetch(`${API_BASE_URL}/cache-compiler`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'compile',
        password
      })
    });

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Error in manual cache compilation:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Limpia el caché (requiere contraseña)
 */
export async function clearCache(password) {
  try {
    const response = await fetch(`${API_BASE_URL}/cache-compiler`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'clear',
        password
      })
    });

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Error clearing cache:', error);
    return { success: false, error: error.message };
  }
}
