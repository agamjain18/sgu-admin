const API_BASE_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://127.0.0.1:8000'
    : 'https://api.agamjain.online/sgu';

const getHeaders = (contentType = 'application/json') => {
    const token = localStorage.getItem('admin_token');
    const headers = {};
    if (contentType) headers['Content-Type'] = contentType;
    if (token) headers['Authorization'] = `Bearer ${token}`;
    return headers;
};

export const api = {
    // Products
    getProducts: async () => {
        const response = await fetch(`${API_BASE_URL}/products/`);
        if (!response.ok) {
            if (response.status === 401) {
                localStorage.removeItem('admin_token');
                window.location.href = '/login';
            }
            throw new Error('Failed to fetch products');
        }
        return response.ok ? response.json() : [];
    },

    getProduct: async (id) => {
        const response = await fetch(`${API_BASE_URL}/products/${id}`);
        if (!response.ok) throw new Error('Failed to fetch product');
        return response.json();
    },

    createProduct: async (product) => {
        const response = await fetch(`${API_BASE_URL}/products/`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(product),
        });
        if (!response.ok) throw new Error('Failed to create product');
        return response.json();
    },

    updateProduct: async (id, product) => {
        const response = await fetch(`${API_BASE_URL}/products/${id}`, {
            method: 'PUT',
            headers: getHeaders(),
            body: JSON.stringify(product),
        });
        if (!response.ok) throw new Error('Failed to update product');
        return response.json();
    },

    deleteProduct: async (id) => {
        const response = await fetch(`${API_BASE_URL}/products/${id}`, {
            method: 'DELETE',
            headers: getHeaders(''),
        });
        if (!response.ok) throw new Error('Failed to delete product');
        return response.json();
    },

    uploadImage: async (file) => {
        const formData = new FormData();
        formData.append('file', file);
        const response = await fetch(`${API_BASE_URL}/upload/`, {
            method: 'POST',
            body: formData,
        });
        if (!response.ok) throw new Error('Failed to upload image');
        return response.json();
    },

    getCountries: async () => {
        const response = await fetch(`${API_BASE_URL}/countries/`);
        if (!response.ok) throw new Error('Failed to fetch countries');
        return response.json();
    },

    // Inquiries
    getInquiries: async () => {
        const response = await fetch(`${API_BASE_URL}/inquiries/`, {
            headers: getHeaders()
        });
        if (!response.ok) {
            if (response.status === 401) {
                localStorage.removeItem('admin_token');
                window.location.href = '/login';
            }
            throw new Error('Failed to fetch inquiries');
        }
        return response.json();
    },

    deleteInquiry: async (id) => {
        const response = await fetch(`${API_BASE_URL}/inquiries/${id}`, {
            method: 'DELETE',
            headers: getHeaders('')
        });
        if (!response.ok) throw new Error('Failed to delete inquiry');
        return response.json();
    },

    // Settings
    getSettings: async () => {
        const response = await fetch(`${API_BASE_URL}/settings/`);
        if (!response.ok) throw new Error('Failed to fetch settings');
        return response.json();
    },

    updateSetting: async (key, value) => {
        const response = await fetch(`${API_BASE_URL}/settings/`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify({ key, value }),
        });
        if (!response.ok) throw new Error('Failed to update setting');
        return response.json();
    },
};
