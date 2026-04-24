import { useEffect, useState } from 'react';
import { Table } from "@heroui/react";
import { getProducts } from './service/api-service.js';

function App() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const result = await getProducts();
        setProducts(result);
      } catch (err) {
        setError("Gagal memuat data produk.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen text-slate-500 font-medium">
      Memuat data...
    </div>
  );

  if (error) return (
    <div className="flex items-center justify-center min-h-screen text-red-500 font-medium">
      {error}
    </div>
  );

  return (
    <div className="min-h-screen bg-linear-to-b from-blue-200 to-white p-8">
      <div className="max-w-3xl mx-auto mb-6 flex items-baseline justify-between">
        <h1 className="text-2xl font-bold text-slate-800">Daftar Produk</h1>
      </div>

      <div className="max-w-3xl mx-auto">
        <Table>
          <Table.ScrollContainer>
            <Table.Content aria-label="Daftar Produk" className="font-normal">
              <Table.Header>
                <Table.Column isRowHeader>No</Table.Column>
                <Table.Column>Nama Barang</Table.Column>
                <Table.Column>Harga</Table.Column>
              </Table.Header>
              <Table.Body emptyContent="Tidak ada produk tersedia.">
                {products.map((product, index) => (
                  <Table.Row key={product.id || index} className="font-medium text-neutral-300">
                    <Table.Cell>{index + 1}</Table.Cell>
                    <Table.Cell>{product.nama_barang}</Table.Cell>
                    <Table.Cell>
                      Rp {Number(product.harga).toLocaleString('id-ID')}
                    </Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table.Content>
          </Table.ScrollContainer>
        </Table>
      </div>
    </div>
  );
}

export default App;