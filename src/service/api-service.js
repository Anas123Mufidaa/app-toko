function trimTrailingSlash(url) {
  return url.endsWith('/') ? url.slice(0, -1) : url;
}

function resolveApiUrl() {
  const envApiUrl = (import.meta.env.VITE_API_URL ?? '').trim();
  if (!envApiUrl) return '';

  const isAbsoluteUrl = /^https?:\/\//i.test(envApiUrl);

  if (!isAbsoluteUrl) {
    return trimTrailingSlash(envApiUrl);
  }

  try {
    const parsedUrl = new URL(envApiUrl);

    if (import.meta.env.DEV) {
      return trimTrailingSlash(parsedUrl.pathname || '');
    }

    if (typeof window !== 'undefined') {
      const runtimeHost = window.location.hostname;
      const isEnvLocalhost = ['localhost', '127.0.0.1'].includes(parsedUrl.hostname);
      const isRuntimeLocalhost = ['localhost', '127.0.0.1'].includes(runtimeHost);

      if (runtimeHost && isEnvLocalhost && !isRuntimeLocalhost) {
        parsedUrl.hostname = runtimeHost;
      }
    }

    return trimTrailingSlash(parsedUrl.toString());
  } catch {
    return trimTrailingSlash(envApiUrl);
  }
}

const API_URL = resolveApiUrl();
const PRODUCT_CACHE_KEY = 'app-toko-products-cache';

function readProductsCache() {
  try {
    const rawProducts = localStorage.getItem(PRODUCT_CACHE_KEY);
    if (!rawProducts) return [];
    const parsedProducts = JSON.parse(rawProducts);
    return Array.isArray(parsedProducts) ? parsedProducts : [];
  } catch {
    return [];
  }
}

function writeProductsCache(products) {
  try {
    localStorage.setItem(PRODUCT_CACHE_KEY, JSON.stringify(products));
  } catch {
  }
}

async function requestJSON(path, options = {}) {
  if (!API_URL) {
    throw new Error('VITE_API_URL belum diatur.');
  }

  const requestUrl = `${API_URL}/${path}`;

  let response;
  try {
    response = await fetch(requestUrl, options);
  } catch {
    throw new Error(`Tidak bisa menghubungi API: ${requestUrl}`);
  }

  if (!response.ok) {
    throw new Error(`Request gagal: ${response.status}`);
  }

  const responseBody = await response.text();
  try {
    return JSON.parse(responseBody);
  } catch {
    throw new Error('Respons API bukan JSON valid.');
  }
}

async function getProducts() {
  try {
    const result = await requestJSON('get_barang.php');
    if (result.status === 'success' && Array.isArray(result.data)) {
      writeProductsCache(result.data);
      return result.data;
    }
    return readProductsCache();
  } catch (error) {
    const cachedProducts = readProductsCache();
    if (cachedProducts.length > 0) {
      return cachedProducts;
    }
    console.error('Fetch error:', error);
    throw error;
  }
}

async function addProducts({ nama_barang, harga }) {
  try {
    const result = await requestJSON('tambah_barang.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nama_barang, harga }),
    });

    if (result.status !== 'success') {
      throw new Error(result.message || 'Gagal menambah produk.');
    }
    return result.data;
  } catch (error) {
    console.error('Add error:', error);
    throw error;
  }
}

async function deleteProducts(id) {
  try {
    const result = await requestJSON('hapus_barang.php', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });

    if (result.status !== 'success') {
      throw new Error(result.message || 'Gagal menghapus produk.');
    }
    return result;
  } catch (error) {
    console.error('Delete error:', error);
    throw error;
  }
}

async function updateProducts({ id, nama_barang, harga }) {
  try {
    const result = await requestJSON('update_barang.php', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, nama_barang, harga }),
    });

    if (result.status !== 'success') {
      throw new Error(result.message || 'Gagal memperbarui produk.');
    }
    return result.data;
  } catch (error) {
    console.error('Update error:', error);
    throw error;
  }
}

export { getProducts, addProducts, deleteProducts, updateProducts };
