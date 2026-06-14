import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  addToast,
  Button,
  Card,
  CardBody,
  Chip,
  Image,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Select,
  SelectItem,
} from '@heroui/react';
import { Icon } from '@iconify/react';
import { addProducts, deleteProducts, getProducts, updateProducts } from '@/service/api-service.js';
import { DataTable } from '@/components/data-table.jsx';

const columns = [
  { key: 'gambar', header: 'Gambar' },
  { key: 'nama', header: 'Nama' },
  { key: 'kategori', header: 'Kategori' },
  { key: 'harga', header: 'Harga' },
  { key: 'status', header: 'Status' },
  { key: 'aksi', header: 'Aksi' },
];

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const STATUS_OPTIONS = [
  { key: 'aktif', label: 'Aktif' },
  { key: 'nonaktif', label: 'Nonaktif' },
];
const EMPTY_FIELD_ERRORS = {
  nama_barang: '',
  harga: '',
  kategori: '',
  status: '',
  gambar: '',
};

function ProductImagePlaceholder() {
  return (
    <div
      aria-label="Tidak ada gambar"
      className="flex h-14 w-14 items-center justify-center rounded-lg bg-default-100 text-default-400"
      role="img"
    >
      <svg
        aria-hidden="true"
        className="h-7 w-7"
        fill="none"
        viewBox="0 0 24 24"
      >
        <path d="M0 0h24v24H0z" fill="none" />
        <g fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M2.384 13.793c-.447-3.164-.67-4.745.278-5.77C3.61 7 5.298 7 8.672 7h6.656c3.374 0 5.062 0 6.01 1.024s.724 2.605.278 5.769l-.422 3c-.35 2.48-.525 3.721-1.422 4.464s-2.22.743-4.867.743h-5.81c-2.646 0-3.97 0-4.867-.743s-1.072-1.983-1.422-4.464zM19.562 7a2.132 2.132 0 0 0-2.1-2.5H6.538a2.132 2.132 0 0 0-2.1 2.5M17.5 4.5c.028-.26.043-.389.043-.496a2 2 0 0 0-1.787-1.993C15.65 2 15.52 2 15.26 2H8.74c-.26 0-.391 0-.497.011a2 2 0 0 0-1.787 1.993c0 .107.014.237.043.496" />
          <circle cx="16.5" cy="11.5" r="1.5" />
          <path
            d="m20 20l-2.884-2.149c-.93-.692-2.316-.761-3.34-.166l-.266.155c-.712.414-1.68.345-2.294-.164l-3.839-3.177c-.766-.634-1.995-.668-2.81-.078l-1.324.96"
            strokeLinecap="round"
          />
        </g>
      </svg>
    </div>
  );
}

function DashboardPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState(null);
  const [existingImageUrl, setExistingImageUrl] = useState('');
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('');
  const [status, setStatus] = useState('aktif');
  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [imageError, setImageError] = useState('');
  const [fieldErrors, setFieldErrors] = useState(EMPTY_FIELD_ERRORS);
  const [submitting, setSubmitting] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (!imageFile) {
      setPreviewUrl('');
      return undefined;
    }

    const objectUrl = URL.createObjectURL(imageFile);
    setPreviewUrl(objectUrl);

    return () => URL.revokeObjectURL(objectUrl);
  }, [imageFile]);

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
    return products.filter((item) => (
      String(item.nama_barang || '').toLowerCase().includes(keyword)
      || String(item.kategori || '').toLowerCase().includes(keyword)
    ));
  }, [products, search]);

  const rows = useMemo(() => filtered.map((item) => ({
    rowKey: `product-${item.id}`,
    id: item.id,
    gambar: item.gambar,
    gambar_url: item.gambar_url,
    nama: item.nama_barang,
    nama_barang: item.nama_barang,
    kategori: item.kategori,
    harga: item.harga,
    status: item.status,
  })), [filtered]);

  const resetImageInput = useCallback(() => {
    setImageFile(null);
    setImageError('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, []);

  const resetEditorForm = useCallback(() => {
    setSelectedId(null);
    setExistingImageUrl('');
    setTitle('');
    setPrice('');
    setCategory('');
    setStatus('aktif');
    setFieldErrors(EMPTY_FIELD_ERRORS);
    resetImageInput();
  }, [resetImageInput]);

  const openCreateModal = () => {
    resetEditorForm();
    setIsEditorOpen(true);
  };

  const openEditModal = (row) => {
    resetImageInput();
    setFieldErrors(EMPTY_FIELD_ERRORS);
    setSelectedId(row.id);
    setExistingImageUrl(row.gambar_url ?? '');
    setTitle(row.nama);
    setPrice(String(row.harga ?? ''));
    setCategory(row.kategori ?? '');
    setStatus(row.status ?? 'aktif');
    setIsEditorOpen(true);
  };

  const handleEditorOpenChange = (isOpen) => {
    setIsEditorOpen(isOpen);
    if (!isOpen) {
      resetEditorForm();
    }
  };

  const handleImageChange = (event) => {
    const file = event.target.files?.[0] ?? null;

    if (!file) {
      setImageFile(null);
      setImageError(selectedId ? '' : 'Gambar barang wajib dipilih.');
      return;
    }

    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      event.target.value = '';
      setImageFile(null);
      setImageError('Format gambar harus JPG, PNG, atau WebP.');
      return;
    }

    setImageFile(file);
    setImageError('');
    setFieldErrors((current) => ({ ...current, gambar: '' }));
  };

  const clearFieldError = (field) => {
    setFieldErrors((current) => ({ ...current, [field]: '' }));
  };

  const openDeleteModal = (product) => {
    setProductToDelete(product);
    setIsDeleteOpen(true);
  };

  const handleDeleteOpenChange = (isOpen) => {
    setIsDeleteOpen(isOpen);
    if (!isOpen) {
      setProductToDelete(null);
    }
  };

  const submitProduct = async (event) => {
    event.preventDefault();
    const isEditing = Boolean(selectedId);
    setSubmitting(true);
    setError('');
    setFieldErrors(EMPTY_FIELD_ERRORS);
    try {
      if (isEditing) {
        await updateProducts({
          id: selectedId,
          nama_barang: title,
          harga: price,
          kategori: category,
          status,
          gambar: imageFile,
        });
      } else {
        if (!imageFile) {
          setImageError('Gambar barang wajib dipilih.');
          return;
        }

        await addProducts({
          nama_barang: title,
          harga: price,
          gambar: imageFile,
          kategori: category,
          status,
        });
      }
      resetEditorForm();
      setIsEditorOpen(false);
      await fetchData();
      addToast({
        title: isEditing ? 'Produk diperbarui' : 'Produk ditambahkan',
        description: isEditing
          ? 'Data barang berhasil diperbarui.'
          : 'Data dan gambar barang berhasil disimpan.',
        color: 'success',
      });
    } catch (submitError) {
      const validationErrors = submitError?.errors ?? submitError?.responseData?.errors ?? {};
      setFieldErrors((current) => ({ ...current, ...validationErrors }));
      setImageError(validationErrors.gambar ?? '');

      if (submitError?.status === 422) {
        addToast({
          title: 'Validasi gagal',
          description: submitError?.message || 'Periksa kembali data produk.',
          color: 'danger',
        });
      } else {
        const message = submitError?.message || 'Gagal menyimpan data.';
        setError(message);
        addToast({
          title: 'Gagal menyimpan',
          description: message,
          color: 'danger',
        });
      }
    } finally {
      setSubmitting(false);
    }
  };

  const confirmDelete = async () => {
    if (!productToDelete) return;

    setSubmitting(true);
    setError('');
    try {
      await deleteProducts(productToDelete.id);
      setIsDeleteOpen(false);
      setProductToDelete(null);
      await fetchData();
      addToast({
        title: 'Produk dihapus',
        description: 'Data dan file gambar barang berhasil dihapus.',
        color: 'success',
      });
    } catch (deleteError) {
      const message = deleteError?.message || 'Gagal menghapus data.';
      setError(message);
      addToast({
        title: 'Gagal menghapus',
        description: message,
        color: 'danger',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const renderCell = (row, columnKey) => {
    switch (columnKey) {
      case 'gambar':
        return row.gambar_url ? (
          <img
            src={row.gambar_url}
            alt={row.nama_barang}
            className="h-14 w-14 rounded-lg object-cover"
            loading="lazy"
          />
        ) : (
          <ProductImagePlaceholder />
        );
      case 'harga':
        return `Rp ${Number(row.harga).toLocaleString('id-ID')}`;
      case 'status':
        return (
          <Chip color={row.status === 'aktif' ? 'success' : 'danger'} size="sm" variant="flat">
            {row.status === 'aktif' ? 'Aktif' : 'Nonaktif'}
          </Chip>
        );
      case 'aksi':
        return (
          <div className="flex gap-2">
            <Button
              isIconOnly
              aria-label={`Edit ${row.nama_barang}`}
              size="sm"
              variant="flat"
              onPress={() => openEditModal(row)}
            >
              <Icon icon="solar:pen-new-square-bold" width={16} />
            </Button>
            <Button
              isIconOnly
              aria-label={`Hapus ${row.nama_barang}`}
              color="danger"
              size="sm"
              variant="flat"
              onPress={() => openDeleteModal(row)}
            >
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

      <Modal
        isOpen={isEditorOpen}
        scrollBehavior="inside"
        size="lg"
        onOpenChange={handleEditorOpenChange}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>{selectedId ? 'Edit Produk' : 'Tambah Produk'}</ModalHeader>
              <ModalBody>
                <form id="product-form" className="space-y-3" onSubmit={submitProduct}>
                  <Input
                    errorMessage={fieldErrors.nama_barang}
                    isInvalid={Boolean(fieldErrors.nama_barang)}
                    label="Nama Barang"
                    labelPlacement="outside"
                    placeholder="Masukkan nama barang"
                    value={title}
                    onValueChange={(value) => {
                      setTitle(value);
                      clearFieldError('nama_barang');
                    }}
                    isRequired
                  />
                  <Input
                    errorMessage={fieldErrors.harga}
                    isInvalid={Boolean(fieldErrors.harga)}
                    label="Harga"
                    labelPlacement="outside"
                    type="number"
                    className="pt-5"
                    placeholder="Masukkan harga"
                    value={price}
                    onValueChange={(value) => {
                      setPrice(value);
                      clearFieldError('harga');
                    }}
                    isRequired
                  />
                  <Input
                    errorMessage={fieldErrors.kategori}
                    isInvalid={Boolean(fieldErrors.kategori)}
                    isRequired
                    label="Kategori"
                    labelPlacement="outside"
                    className="py-5"
                    placeholder="Contoh: Minuman"
                    value={category}
                    onValueChange={(value) => {
                      setCategory(value);
                      clearFieldError('kategori');
                    }}
                  />
                  <Select
                    errorMessage={fieldErrors.status}
                    isInvalid={Boolean(fieldErrors.status)}
                    isRequired
                    items={STATUS_OPTIONS}
                    label="Status"
                    labelPlacement="outside"
                    placeholder="Pilih status barang"
                    selectedKeys={new Set([status])}
                    onSelectionChange={(keys) => {
                      const selectedStatus = Array.from(keys)[0];
                      if (selectedStatus) {
                        setStatus(String(selectedStatus));
                        clearFieldError('status');
                      }
                    }}
                  >
                    {(item) => <SelectItem key={item.key}>{item.label}</SelectItem>}
                  </Select>
                  <div className="flex flex-col gap-3">
                    <Input
                      ref={fileInputRef}
                      isRequired={!selectedId}
                      accept="image/jpeg,image/png,image/webp"
                      className="pt-5"
                      description={selectedId ? 'Kosongkan jika tidak ingin mengganti gambar.' : undefined}
                      errorMessage={imageError || fieldErrors.gambar}
                      isInvalid={Boolean(imageError || fieldErrors.gambar)}
                      label={selectedId ? 'Gambar Baru (Opsional)' : 'Gambar Barang'}
                      labelPlacement="outside"
                      type="file"
                      onChange={handleImageChange}
                    />
                    {(previewUrl || existingImageUrl) ? (
                      <Card shadow="none" className="border border-default-200">
                        <CardBody className="flex flex-col gap-3 p-3 sm:flex-row sm:items-center">
                          <Image
                            alt={previewUrl ? `Preview ${title || 'gambar barang'}` : `Gambar ${title}`}
                            className="h-24 w-24 object-cover"
                            radius="lg"
                            src={previewUrl || existingImageUrl}
                          />
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium text-default-700">
                              {previewUrl ? 'Preview gambar baru' : 'Gambar saat ini'}
                            </p>
                            <p className="truncate text-xs text-default-500">
                              {previewUrl ? imageFile?.name : 'Gambar yang tersimpan di server'}
                            </p>
                          </div>
                          {previewUrl ? (
                            <Button
                              color="danger"
                              size="sm"
                              variant="flat"
                              onPress={resetImageInput}
                            >
                              Batalkan Gambar Baru
                            </Button>
                          ) : null}
                        </CardBody>
                      </Card>
                    ) : (
                      selectedId ? <ProductImagePlaceholder /> : null
                    )}
                  </div>
                </form>
              </ModalBody>
              <ModalFooter>
                <Button isDisabled={submitting} variant="light" onPress={onClose}>Batal</Button>
                <Button color="primary" form="product-form" className="text-white" isLoading={submitting} type="submit">
                  {selectedId ? 'Update' : 'Simpan'}
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      <Modal isOpen={isDeleteOpen} onOpenChange={handleDeleteOpenChange}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>Konfirmasi Hapus</ModalHeader>
              <ModalBody>
                <div className="flex items-center gap-3">
                  {productToDelete?.gambar_url ? (
                    <img
                      alt={productToDelete.nama_barang}
                      className="h-16 w-16 rounded-lg object-cover"
                      src={productToDelete.gambar_url}
                    />
                  ) : (
                    <ProductImagePlaceholder />
                  )}
                  <div>
                    <p className="font-medium text-default-700">{productToDelete?.nama_barang}</p>
                    <p className="text-sm text-default-500">
                      Data dan file gambar produk akan dihapus permanen.
                    </p>
                  </div>
                </div>
              </ModalBody>
              <ModalFooter>
                <Button isDisabled={submitting} variant="light" onPress={onClose}>Batal</Button>
                <Button
                  color="danger"
                  isDisabled={!productToDelete}
                  isLoading={submitting}
                  onPress={confirmDelete}
                >
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
