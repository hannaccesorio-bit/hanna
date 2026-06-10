const API_URL = import.meta.env.VITE_GOOGLE_SCRIPT_URL;
const IMGBB_API_KEY = import.meta.env.VITE_IMGBB_API_KEY;

const apiPost = async (body) => {
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const text = await response.text();
    try {
      return JSON.parse(text);
    } catch {
      return { success: false, raw: text };
    }
  } catch (error) {
    console.error('API Error:', error);
    return { success: false };
  }
};

export const fetchProducts = async () => {
  try {
    const response = await fetch(`${API_URL}?action=getProducts`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching products', error);
    return [];
  }
};

export const loginAdmin = async (password) => {
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      body: JSON.stringify({ action: 'login', password }),
    });
    const text = await response.text();
    console.log('Login raw response:', text.substring(0, 200));
    const result = JSON.parse(text);
    return result.success;
  } catch (error) {
    console.error('Login error', error);
    return false;
  }
};

export const recoverPassword = async () => {
  try {
    await fetch(API_URL, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'recoverPassword' }),
    });
    return true;
  } catch (error) {
    console.error('Recover password error', error);
    return false;
  }
};

export const createProduct = async (productData) => {
  const result = await apiPost({ action: 'createProduct', product: productData });
  return result.success;
};

export const deleteProduct = async (productId) => {
  const result = await apiPost({ action: 'deleteProduct', productId });
  return result.success;
};

export const updateProduct = async (productId, productData) => {
  const result = await apiPost({ action: 'updateProduct', productId, product: productData });
  return result.success;
};

export const sendOrder = async (orderData) => {
  try {
    await fetch(API_URL, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'createOrder', ...orderData }),
    });
    return true;
  } catch (error) {
    console.error('Error sending order', error);
    return false;
  }
};

export const fetchOrders = async () => {
  try {
    const response = await fetch(`${API_URL}?action=getOrders`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching orders', error);
    return [];
  }
};

export const uploadImageToImgBB = async (file) => {
  try {
    const formData = new FormData();
    formData.append('image', file);
    const response = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, {
      method: 'POST',
      body: formData,
    });
    const data = await response.json();
    if (data.success) {
      return data.data.url;
    }
    return null;
  } catch (error) {
    console.error('Error uploading to ImgBB', error);
    return null;
  }
};
