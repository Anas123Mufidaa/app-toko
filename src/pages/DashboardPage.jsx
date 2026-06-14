import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Button,
  Card,
  CardBody,
  Chip,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from '@heroui/react';
import { Icon } from '@iconify/react';
import { addProducts, deleteProducts, getProducts, updateProducts } from '@/service/api-service.js';
import { DataTable } from '@/components/data-table.jsx';

const columns = [
  { key: 'nama', header: 'Nama' },
  { key: 'kategori', header: 'Kategori' },
  { key: 'harga', header: 'Harga' },
  { key: 'status', header: 'Status' },
  { key: 'aksi', header: 'Aksi' },
];

function DashboardPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState(null);
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const result = await getProducts();
      setProducts(Array.isArray(result) ? result : []);
    } catch (fetchError) {
      setError(fetchError?.message || 'Gagal memuat data produk.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const filtered = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    if (!keyword) return products;
    return products.filter((item) => String(item.nama_barang || '').toLowerCase().includes(keyword));
  }, [products, search]);

  const rows = useMemo(() => filtered.map((item) => ({
    rowKey: `product-${item.id}`,
    id: item.id,
    nama: item.nama_barang,
    kategori: 'Produk',
    harga: item.harga,
    status: 'aktif',
  })), [filtered]);

  const openCreateModal = () => {
    setSelectedId(null);
    setTitle('');
    setPrice('');
    setIsEditorOpen(true);
  };

  const openEditModal = (row) => {
    setSelectedId(row.id);
    setTitle(row.nama);
    setPrice(String(row.harga ?? ''));
    setIsEditorOpen(true);
  };

  const openDeleteModal = (id) => {
    setDeleteId(id);
    setIsDeleteOpen(true);
  };

  const submitProduct = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      if (selectedId) {
        await updateProducts({ id: selectedId, nama_barang: title, harga: price });
      } else {
        await addProducts({ nama_barang: title, harga: price });
      }
      setIsEditorOpen(false);
      await fetchData();
    } catch (submitError) {
      setError(submitError?.message || 'Gagal menyimpan data.');
    } finally {
      setSubmitting(false);
    }
  };

  const confirmDelete = async () => {
    setSubmitting(true);
    setError('');
    try {
      await deleteProducts(deleteId);
      setIsDeleteOpen(false);
      await fetchData();
    } catch (deleteError) {
      setError(deleteError?.message || 'Gagal menghapus data.');
    } finally {
      setSubmitting(false);
    }
  };

  const renderCell = (row, columnKey) => {
    switch (columnKey) {
      case 'harga':
        return `Rp ${Number(row.harga).toLocaleString('id-ID')}`;
      case 'status':
        return (
          <Chip color="success" size="sm" variant="flat">
            Aktif
          </Chip>
        );
      case 'aksi':
        return (
          <div className="flex gap-2">
            <Button isIconOnly size="sm" variant="flat" onPress={() => openEditModal(row)}>
              <Icon icon="solar:pen-new-square-bold" width={16} />
            </Button>
            <Button isIconOnly color="danger" size="sm" variant="flat" onPress={() => openDeleteModal(row.id)}>
              <Icon icon="solar:trash-bin-trash-bold" width={16} />
            </Button>
          </div>
        );
      default:
        return row[columnKey] ?? '-';
    }
  };

  return (
    <div className="flex h-full min-h-0 flex-1 flex-col gap-4 rounded-medium bg-content1 p-2 sm:p-4">
      <Card shadow="none" className="border border-primary/10">
        <CardBody className="p-3">
          <div className="flex flex-wrap items-center gap-3 md:flex-nowrap">
            <Input
              size="sm"
              placeholder="Pencarian"
              startContent={<Icon icon="solar:magnifer-line-duotone" width={18} />}
              value={search}
              onValueChange={setSearch}
            />
            <div className="flex gap-2">
              <Button color="primary" className="text-white" size="sm" onPress={openCreateModal}>
                Tambah Data
              </Button>
              <Button color="primary" size="sm" variant="flat" onPress={fetchData}>
                Refresh
              </Button>
            </div>
          </div>
        </CardBody>
      </Card>

      {error ? (
        <div className="rounded-xl border border-danger-300 bg-danger-50 px-3 py-2 text-sm text-danger-700">
          {error}
        </div>
      ) : null}

      <div className="min-h-0 flex-1">
        <DataTable
          columns={columns}
          items={rows}
          renderCell={renderCell}
          isLoading={loading}
          emptyContent="Belum ada data produk"
        />
      </div>

      <Modal isOpen={isEditorOpen} onOpenChange={setIsEditorOpen}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>{selectedId ? 'Edit Produk' : 'Tambah Produk'}</ModalHeader>
              <ModalBody>
                <form id="product-form" className="space-y-3" onSubmit={submitProduct}>
                  <Input
                    label="Nama Barang"
                    labelPlacement="outside"
                    placeholder="Masukkan nama barang"
                    value={title}
                    onValueChange={setTitle}
                    isRequired
                  />
                  <Input
                    label="Harga"
                    labelPlacement="outside"
                    type="number"
                    placeholder="Masukkan harga"
                    value={price}
                    onValueChange={setPrice}
                    isRequired
                  />
                </form>
              </ModalBody>
              <ModalFooter>
                <Button variant="light" onPress={onClose}>Batal</Button>
                <Button color="primary" form="product-form" isLoading={submitting} type="submit">
                  {selectedId ? 'Update' : 'Simpan'}
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      <Modal isOpen={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>Konfirmasi Hapus</ModalHeader>
              <ModalBody>
                <p>Yakin ingin menghapus produk ini?</p>
              </ModalBody>
              <ModalFooter>
                <Button variant="light" onPress={onClose}>Batal</Button>
                <Button color="danger" isLoading={submitting} onPress={confirmDelete}>
                  Hapus
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
}

export default DashboardPage;
