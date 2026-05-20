import { useEffect, useState, useCallback, useMemo } from 'react';
import { Icon } from '@iconify/react';
import penNewRoundBold from '@iconify-icons/solar/pen-new-round-bold';
import trashBinTrashBold from '@iconify-icons/solar/trash-bin-trash-bold';
import { Pagination, Table, Button, Input, Label, Modal, TextField, Toast, toast } from '@heroui/react';
import { getProducts, addProducts, deleteProducts, updateProducts } from './service/api-service.js';

const ROWS_PER_PAGE = 10;

function App() {
  const [products, setProducts] = useState([]);
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [isOpen, setIsOpen] = useState(false);
  const [selectedId, setSelectedId] = useState(null);

  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [idToDelete, setIdToDelete] = useState(null);

  const [submitError, setSubmitError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [page, setPage] = useState(1);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const result = await getProducts();
      const safeProducts = Array.isArray(result) ? result : [];
      setProducts(safeProducts);
      setPage(1);
    } catch (err) {
      setError('Gagal memuat data produk.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const totalPages = Math.max(1, Math.ceil(products.length / ROWS_PER_PAGE));
  const pages = useMemo(
    () => Array.from({ length: totalPages }, (_, index) => index + 1),
    [totalPages],
  );

  const paginatedProducts = useMemo(() => {
    const start = (page - 1) * ROWS_PER_PAGE;
    return products.slice(start, start + ROWS_PER_PAGE);
  }, [products, page]);

  const startResult = products.length === 0 ? 0 : (page - 1) * ROWS_PER_PAGE + 1;
  const endResult = Math.min(page * ROWS_PER_PAGE, products.length);

  const openDeleteModal = (id) => {
    setIdToDelete(id);
    setIsDeleteOpen(true);
  };

  const confirmDelete = async () => {
    setSubmitting(true);
    try {
      await deleteProducts(idToDelete);
      toast.success('Dihapus', { description: 'Produk berhasil dihapus.' });
      setIsDeleteOpen(false);
      await fetchData();
    } catch (err) {
      toast.error('Gagal', { description: 'Gagal menghapus data.' });
    } finally {
      setSubmitting(false);
    }
  };

  const onEditHandler = (product) => {
    setSelectedId(product.id);
    setTitle(product.nama_barang);
    setPrice(product.harga);
    setIsOpen(true);
  };

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmitError(null);

    try {
      if (selectedId) {
        await updateProducts({ id: selectedId, nama_barang: title, harga: price });
        toast.success('Diperbarui', { description: 'Data berhasil diubah' });
      } else {
        await addProducts({ nama_barang: title, harga: price });
        toast.success('Berhasil', { description: 'Data berhasil ditambahkan' });
      }
      handleOpenChange(false);
      await fetchData();
    } catch (err) {
      setSubmitError('Terjadi kesalahan teknis.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenChange = (open) => {
    setIsOpen(open);
    if (!open) {
      setTitle('');
      setPrice(0);
      setSelectedId(null);
    }
  };

  if (loading) return <div className="flex items-center justify-center min-h-screen">Memuat data...</div>;

  return (
    <div className="min-h-screen bg-linear-to-b from-blue-200 to-white p-8">
      <Toast.Provider placement="top end" />

      <div className="max-w-3xl mx-auto mb-6 flex items-baseline justify-between">
        <h1 className="text-2xl font-bold text-slate-800">Daftar Produk</h1>
        <Button variant="primary" onPress={() => setIsOpen(true)}>Tambah Data</Button>

        <Modal isOpen={isOpen} onOpenChange={handleOpenChange} variant="blur">
          <Modal.Backdrop variant="blur">
            <Modal.Container>
              <Modal.Dialog>
                <Modal.Header>
                  <Modal.Heading>{selectedId ? 'Edit Produk' : 'Tambah Produk'}</Modal.Heading>
                </Modal.Header>
                <Modal.Body className="p-6">
                  <form id="product-form" onSubmit={onSubmitHandler} className="flex flex-col gap-4">
                    <TextField>
                      <Label>Nama Barang</Label>
                      <Input value={title} onChange={(e) => setTitle(e.target.value)} required />
                    </TextField>
                    <TextField>
                      <Label>Harga</Label>
                      <Input type="number" value={price} onChange={(e) => setPrice(e.target.value)} required />
                    </TextField>
                  </form>
                </Modal.Body>
                <Modal.Footer>
                  <Button slot="close" variant="outline">Batal</Button>
                  <Button type="submit" form="product-form" isLoading={submitting}>
                    {selectedId ? 'Update' : 'Simpan'}
                  </Button>
                </Modal.Footer>
              </Modal.Dialog>
            </Modal.Container>
          </Modal.Backdrop>
        </Modal>

        <Modal isOpen={isDeleteOpen} onOpenChange={setIsDeleteOpen} variant="blur">
          <Modal.Backdrop variant="blur">
            <Modal.Container>
              <Modal.Dialog>
                <Modal.Header>
                  <Modal.Heading className="text-red-600">Konfirmasi Hapus</Modal.Heading>
                </Modal.Header>
                <Modal.Body>
                  <p>Apakah Anda yakin ingin menghapus data ini? Tindakan ini tidak dapat dibatalkan.</p>
                </Modal.Body>
                <Modal.Footer>
                  <Button slot="close" variant="outline" isDisabled={submitting}>Batal</Button>
                  <Button
                    variant="danger"
                    onPress={confirmDelete}
                    isLoading={submitting}
                  >
                    Ya, Hapus
                  </Button>
                </Modal.Footer>
              </Modal.Dialog>
            </Modal.Container>
          </Modal.Backdrop>
        </Modal>
      </div>

      <div className="max-w-3xl mx-auto overflow-x-auto overflow-y-visible">
        {error ? (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-red-600">{error}</div>
        ) : null}

        <Table>
          <Table.ScrollContainer className="sm:min-w-190">
            <Table.Content aria-label="Tabel Produk" className="min-w-190">
              <Table.Header>
                <Table.Column className="whitespace-nowrap">No</Table.Column>
                <Table.Column className="whitespace-nowrap">Nama Barang</Table.Column>
                <Table.Column className="whitespace-nowrap">Harga</Table.Column>
                <Table.Column className="whitespace-nowrap" align="end">Aksi</Table.Column>
              </Table.Header>
              <Table.Body emptyContent="Data kosong.">
                {paginatedProducts.map((product, index) => (
                  <Table.Row key={product.id}>
                    <Table.Cell className="whitespace-nowrap">
                      {(page - 1) * ROWS_PER_PAGE + index + 1}
                    </Table.Cell>
                    <Table.Cell className="whitespace-nowrap">{product.nama_barang}</Table.Cell>
                    <Table.Cell className="whitespace-nowrap">
                      Rp {Number(product.harga).toLocaleString('id-ID')}
                    </Table.Cell>
                    <Table.Cell className="whitespace-nowrap">
                      <div className="flex justify-end gap-2">
                        <Button variant="light" className="bg-blue-100" isIconOnly onPress={() => onEditHandler(product)}>
                          <Icon icon={penNewRoundBold} className="text-blue-600" />
                        </Button>
                        <Button variant="danger-soft" isIconOnly onPress={() => openDeleteModal(product.id)}>
                          <Icon icon={trashBinTrashBold} className="w-5 h-5" />
                        </Button>
                      </div>
                    </Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table.Content>
          </Table.ScrollContainer>
          <Table.Footer>
            <Pagination size="sm">
              <Pagination.Summary>
                {startResult} to {endResult} of {products.length} results
              </Pagination.Summary>
              <Pagination.Content>
                <Pagination.Item>
                  <Pagination.Previous
                    isDisabled={page === 1}
                    onPress={() => setPage((currentPage) => Math.max(1, currentPage - 1))}
                  >
                    <Pagination.PreviousIcon />
                    Prev
                  </Pagination.Previous>
                </Pagination.Item>
                {pages.map((paginationPage) => (
                  <Pagination.Item key={paginationPage}>
                    <Pagination.Link
                      isActive={paginationPage === page}
                      onPress={() => setPage(paginationPage)}
                    >
                      {paginationPage}
                    </Pagination.Link>
                  </Pagination.Item>
                ))}
                <Pagination.Item>
                  <Pagination.Next
                    isDisabled={page === totalPages || products.length === 0}
                    onPress={() => setPage((currentPage) => Math.min(totalPages, currentPage + 1))}
                  >
                    Next
                    <Pagination.NextIcon />
                  </Pagination.Next>
                </Pagination.Item>
              </Pagination.Content>
            </Pagination>
          </Table.Footer>
        </Table>
      </div>
    </div>
  );
}

export default App;
