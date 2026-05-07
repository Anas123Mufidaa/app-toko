const API_URL = import.meta.env.VITE_API_URL;

async function getProducts() {
    try {
        const response = await fetch(`${API_URL}/get_barang.php`);
        const result = await response.json();

        if (result.status === 'success') {
            return result.data; 
        }
        return []; 
    } catch (error) {
        console.error("Fetch error:", error);
        return []; 
    }
}


async function addProducts({ nama_barang, harga }) {
    try {
        const response = await fetch(`${API_URL}/tambah_barang.php`, {
            method: "POST",
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({nama_barang, harga}),
        });

        const result = await response.json();
        
        if (result.status === 'success') {
            return result.data;
        }
        return [];
    } catch (error) {
        console.error("Fetch error:", error);
        return [];
    }
}

async function deleteProducts(id) { 
    try {
        const response = await fetch(`${API_URL}/hapus_barang.php`, {
            method: "DELETE",
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ id }) 
        });
        return await response.json();
    } catch (error) {
        console.error("Delete error:", error);
        return { status: 'error' };
    }
}

async function updateProducts({id, nama_barang, harga}) {
    try {
        const response = await fetch(`${API_URL}/update_barang.php`, {
            method: "PUT", 
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ id, nama_barang, harga }),
        });
        return await response.json();
    } catch (error) {
        console.error('Update error:', error);
        return { status: 'error' };
    }
}

export { getProducts, addProducts, deleteProducts, updateProducts };