import { ApiError, apiFetch } from './api-client.js';
import { PRODUCT_CACHE_KEY } from './auth-storage.js';

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
    // Ignore storage write errors.
  }
}

async function login({ username, password }) {
  const result = await apiFetch('login.php', {
    method: 'POST',
    body: { username, password },
    requiresAuth: false,
  });

  if (result?.status !== 'success' || !result?.token) {
    throw new ApiError(result?.message || 'Login gagal.', { responseData: result });
  }

  return result;
}

async function getProducts() {
  try {
    const result = await apiFetch('get_barang.php');
    if (result?.status === 'success' && Array.isArray(result?.data)) {
      writeProductsCache(result.data);
      return result.data;
    }
    return readProductsCache();
  } catch (error) {
    if (error?.isUnauthorized) {
      throw error;
    }

    const cachedProducts = readProductsCache();
    if (cachedProducts.length > 0) {
      return cachedProducts;
    }

    throw error;
  }
}

async function addProducts({ nama_barang, harga, gambar, kategori, status }) {
  const formData = new FormData();
  formData.append('nama_barang', nama_barang);
  formData.append('harga', harga);
  formData.append('gambar', gambar);
  formData.append('kategori', kategori);
  formData.append('status', status);

  const result = await apiFetch('tambah_barang.php', {
    method: 'POST',
    body: formData,
  });

  if (result?.status !== 'success') {
    throw new ApiError(result?.message || 'Gagal menambah produk.', { responseData: result });
  }

  return result.data;
}

async function deleteProducts(id) {
  const result = await apiFetch('hapus_barang.php', {
    method: 'DELETE',
    body: { id },
  });

  if (result?.status !== 'success') {
    throw new ApiError(result?.message || 'Gagal menghapus produk.', { responseData: result });
  }

  return result;
}

async function updateProducts({
  id,
  nama_barang,
  harga,
  kategori,
  status,
  gambar,
}) {
  const formData = new FormData();
  formData.append('id', id);
  formData.append('nama_barang', nama_barang);
  formData.append('harga', harga);
  formData.append('kategori', kategori);
  formData.append('status', status);

  if (gambar) {
    formData.append('gambar', gambar);
  }

  const result = await apiFetch('update_barang.php', {
    method: 'POST',
    body: formData,
  });

  if (result?.status !== 'success') {
    throw new ApiError(result?.message || 'Gagal memperbarui produk.', { responseData: result });
  }

  return result.data;
}

export { login, getProducts, addProducts, deleteProducts, updateProducts };
