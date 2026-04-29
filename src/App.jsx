import { useEffect, useState, useCallback } from 'react';
import { Table } from "@heroui/react";
import { getProducts, addProducts } from './service/api-service.js';
import { Button, Input, Label, Modal, Surface, TextField } from "@heroui/react";
import { Toast, toast } from '@heroui/react';

function App() {
  const [products, setProducts] = useState([]);
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isOpen, setIsOpen] = useState(false);           
  const [submitError, setSubmitError] = useState(null);  
  const [submitting, setSubmitting] = useState(false);  

  const fetchData = useCallback(async () => {
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
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmitError(null);

    try {
      await addProducts({ nama_barang: title, harga: price });

      toast.success("Berhasil", {    
        className: "bg-success text-success-foreground",
        description: "Data berhasil ditambahkan",
        timeout: 10000,
      });

      setIsOpen(false);
      setTitle('');
      setPrice(0);
      await fetchData(); 

    } catch (err) {
      console.error(err);
      setSubmitError("Gagal menambah produk. Coba lagi.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenChange = (open) => {
    setIsOpen(open);
    if (!open) {
      setSubmitError(null);
      setTitle('');
      setPrice(0);
    }
  };

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
      <Toast.Provider placement="top end"/>
      <div className="max-w-3xl mx-auto mb-6 flex items-baseline justify-between">
        <h1 className="text-2xl font-bold text-slate-800">Daftar Produk</h1>

        <Modal isOpen={isOpen} onOpenChange={handleOpenChange} variant="blur">
          <Button variant="primary" onPress={() => setIsOpen(true)}>
            Tambah Data
          </Button>
          <Modal.Backdrop variant="blur">
            <Modal.Container placement="auto">
              <Modal.Dialog className="sm:max-w-md">
                <Modal.CloseTrigger />
                <Modal.Header>
                  <Modal.Heading>Tambah Data Produk</Modal.Heading>
                </Modal.Header>
                <Modal.Body className="p-6">
                  <Surface variant="default">
                    <form id="add-product-form" onSubmit={onSubmitHandler} className="flex flex-col gap-4">
                      <TextField className="w-full">
                        <Label>Nama Barang</Label>
                        <Input
                          value={title}
                          onChange={(e) => setTitle(e.target.value)}
                          placeholder="Minyak Bimoli"
                          required
                        />
                      </TextField>

                      <TextField className="w-full">
                        <Label>Harga</Label>
                        <Input
                          type="number"
                          value={price}
                          onChange={(e) => setPrice(e.target.value)}
                          placeholder="100000"
                          required
                        />
                      </TextField>

                      {submitError && (
                        <p className="text-sm text-red-500">{submitError}</p>
                      )}
                    </form>
                  </Surface>
                </Modal.Body>
                <Modal.Footer>
                  <Button slot="close" variant="outline" isDisabled={submitting}>
                    Batal
                  </Button>
                  <Button
                    type="submit"
                    form="add-product-form"
                    isLoading={submitting}
                    isDisabled={submitting}
                  >
                    Tambah
                  </Button>
                </Modal.Footer>
              </Modal.Dialog>
            </Modal.Container>
          </Modal.Backdrop>
        </Modal>
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