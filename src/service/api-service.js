const API_URL = 'http://localhost:8081/api-toko';

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

export { getProducts };