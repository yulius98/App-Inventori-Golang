// API Configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

// Check if we're running on client-side
const isClient = typeof window !== 'undefined';

// Types
interface Produk {
  id?: number;
  ID?: number;  // Backend might use uppercase ID
  nama: string;
  id_kategori?: number;  // Optional karena backend mungkin tidak mengembalikan ini
  kategori?: string;     // Nama kategori yang dikembalikan backend
  keterangan: string;
  price: number;
  created_at?: string;
  updated_at?: string;
}

// For display purposes (when we get data back from server)
interface ProdukWithKategori extends Produk {
  kategori?: string; // Category name for display
}


export interface Kategori {
  ID?: number;           // Optional for new records, required after created
  id?: number;          // Backend menggunakan lowercase (raw data)
  kategori: string;
  DeletedAt?: string | null;  // Optional for new records
  CreatedAt?: string;         // Optional for new records
  UpdatedAt?: string;         // Optional for new records
}

// Interface specifically for creating new category
export interface NewKategori {
  kategori: string;
}

export interface Stok {
  ID?:number;
  id: number;
  kategori: string;
  produk: string;
  total_stock: number;
  price: number;
  
}

// Interface for creating new stock transaction (pembelian)
export interface NewStok {
  id_produk: number;
  id_kategori: number;
  tgl_trx: string;
  qty_in: number;
  qty_out: number;
}

interface AddKategoriResponse {
  success: boolean;
  message: string;
  data?: Record<string, unknown>;
}

export interface PaginatedResponse<T> {
  data: T[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

interface PaginationParams {
  page?: number;
  limit?: number;
}

// Type for unknown API response that might be array or object
type ApiResponse = Produk[] | PaginatedResponse<Produk> | {
  data?: Produk[];
  products?: Produk[];
  items?: Produk[];
  page?: number;
  currentPage?: number;
  limit?: number;
  pageSize?: number;
  per_page?: number;
  total?: number;
  totalItems?: number;
  count?: number;
  totalPages?: number;
  total_pages?: number;
}

// Helper function to get the correct ID from product object
export function getProductId(produk: Produk): number | undefined {
  return produk.id || produk.ID;
}

// Helper function to get the correct ID from kategori object
export function getKategoriId(kategori: Kategori): number | undefined {
  return kategori.ID || kategori.id;
}

// Helper function to get the correct ID from kategori object
export function getStokId(stok: Stok): number | undefined {
  return stok.ID || stok.id;
}

// Helper function to normalize product data from backend
function normalizeProductData(products: unknown[]): Produk[] {
  return products.map((item: unknown) => {
    const typedItem = item as Record<string, unknown>;
    // Normalize ID field - backend might use 'ID' instead of 'id'
    const normalizedProduct = { ...typedItem };
    if (typedItem.ID && !typedItem.id) {
      normalizedProduct.id = typedItem.ID;
    }
    return normalizedProduct as unknown as Produk;
  });
}

// Helper function to normalize kategori data from backend
function normalizeKategoriData(kategoris: unknown[]): Kategori[] {
  return kategoris.map((item: unknown) => {
    const typedItem = item as Record<string, unknown>;
    
    // Ensure required fields are present
    const normalizedKategori: Kategori = {
      ID: (typedItem.ID || typedItem.id) as number,
      kategori: typedItem.kategori as string,
      DeletedAt: (typedItem.DeletedAt as string | null) || null,
      CreatedAt: (typedItem.CreatedAt as string) || new Date().toISOString(),
      UpdatedAt: (typedItem.UpdatedAt as string) || new Date().toISOString(),
    };
    
    // Keep original id field for reference if needed
    if (typedItem.id) {
      normalizedKategori.id = typedItem.id as number;
    }
    
    return normalizedKategori;
  });
}

// Helper function to normalize stok data from backend
function normalizeStokData(stocks: unknown[]): Stok[] {
  return stocks.map((item: unknown) => {
    const typedItem = item as Record<string, unknown>;
    // Normalize ID field - backend might use 'ID' instead of 'id'
    const normalizedStok = { ...typedItem };
    if (typedItem.ID && !typedItem.id) {
      normalizedStok.id = typedItem.ID;
    }
    return normalizedStok as unknown as Stok;
  });
}

// API Error handling
class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public response?: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

async function apiRequest<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  if (!isClient) {
    throw new ApiError('API requests are only available on client-side', 0);
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15000); 

  try {
    const baseUrl = API_BASE_URL;
    const url = `${baseUrl}${endpoint}`;

    
    const response = await fetch(url, {
      signal: controller.signal,
      mode: 'cors', // Explicitly set CORS mode
      credentials: 'omit', // Don't send cookies to avoid CORS issues
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...options?.headers,
      },
      ...options,
    });

    clearTimeout(timeoutId);



    if (!response.ok) {
      const errorText = await response.text().catch(() => 'No error details');
      
      // Try to parse error as JSON first
      let errorMessage = `API request failed: ${response.statusText}`;
      try {
        const errorData = JSON.parse(errorText);
        errorMessage = errorData.message || errorData.error || errorMessage;
      } catch {
        // If not JSON, use the raw text
        errorMessage = errorText || errorMessage;
      }
      
      throw new ApiError(
        errorMessage,
        response.status,
        errorText
      );
    }

    // Check if response has content and is JSON
    const contentType = response.headers.get('content-type');
    
    if (!contentType || !contentType.includes('application/json')) {
      const textResponse = await response.text();
      throw new ApiError(
        `Server returned non-JSON response: ${textResponse}`,
        response.status,
        textResponse
      );
    }

    // Try to parse JSON with better error handling
    let data;
    let responseText = '';
    try {
      responseText = await response.text();
      
      if (!responseText.trim()) {
        throw new ApiError('Empty response from server', response.status, 'Empty response');
      }
      
      // Check if response looks like JSON
      const trimmedText = responseText.trim();
      if (!trimmedText.startsWith('{') && !trimmedText.startsWith('[')) {
        // This is likely a plain text error message from the backend
        throw new ApiError(
          `Backend error: ${trimmedText}`,
          response.status,
          trimmedText
        );
      }
      
      data = JSON.parse(responseText);
    } catch (parseError) {
      if (parseError instanceof ApiError) {
        throw parseError; // Re-throw our custom error
      }
      
      throw new ApiError(
        `Invalid JSON format: ${parseError instanceof Error ? parseError.message : 'Unknown parse error'}`,
        response.status,
        responseText
      );
    }
    
    return data;
  } catch (error) {
    clearTimeout(timeoutId);
    
    if (error instanceof ApiError) {
      throw error;
    }
    
    // Handle network errors specifically
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw new ApiError('Request timeout - server may be down', 0);
    }
    
    if (error instanceof TypeError && (error.message.includes('fetch') || error.message.includes('network'))) {
      throw new ApiError('Network error - cannot connect to server. Make sure the Go backend is running on ' + API_BASE_URL, 0);
    }
    
    throw new ApiError(
      error instanceof Error ? error.message : 'Unknown API error',
      0
    );
  }
}

// Test API connection
export async function testApiConnection(): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE_URL}/kategori`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      mode: 'cors',
    });
    console.log('API Connection test result:', response.ok, response.status);
    return response.ok;
  } catch (error) {
    console.error('API Connection test failed:', error);
    return false;
  }
}

// API Functions to get data from backend
// Get categories with pagination
export async function getKategori(page?: number, limit?: number): Promise<PaginatedResponse<Kategori>> {
  try {
    const params = new URLSearchParams();
    if (page) params.append('page', page.toString());
    if (limit) params.append('limit', limit.toString());
    
    const url = `/kategori${params.toString() ? `?${params.toString()}` : ''}`;
    console.log('Fetching categories from URL:', `${API_BASE_URL}${url}`);
    
    const response = await apiRequest<PaginatedResponse<Kategori> | Kategori[]>(url);
    console.log('Raw API response:', response);
    
    // If response is array (old format), convert to paginated format
    if (Array.isArray(response)) {
      const normalizedData = normalizeKategoriData(response);
      return {
        data: normalizedData,
        page: 1,
        limit: normalizedData.length,
        total: normalizedData.length,
        totalPages: 1
      };
    }
    
    // Handle paginated response from backend
    const paginatedResponse = response as PaginatedResponse<Kategori>;
    if (paginatedResponse.data && Array.isArray(paginatedResponse.data)) {
      const normalizedData = normalizeKategoriData(paginatedResponse.data);
      return {
        ...paginatedResponse,
        data: normalizedData
      };
    }
    
    return {
      data: [],
      page: 1,
      limit: 10,
      total: 0,
      totalPages: 0
    };
  } catch (error) {
    console.error('Error fetching categories:', error);
    return {
      data: [],
      page: 1,
      limit: 10,
      total: 0,
      totalPages: 0
    };
  }
}

// Get all categories without pagination (for forms and simple lists)
export async function getAllKategori(): Promise<Kategori[]> {
  try {
    const response = await apiRequest<PaginatedResponse<Kategori> | Kategori[]>('/kategori');
    
    // Handle different response formats
    if (Array.isArray(response)) {
      return normalizeKategoriData(response);
    }
    
    // Handle paginated response
    const paginatedResponse = response as PaginatedResponse<Kategori>;
    if (paginatedResponse.data && Array.isArray(paginatedResponse.data)) {
      return normalizeKategoriData(paginatedResponse.data);
    }
    
    return [];
  } catch (error) {
    console.error('Error fetching all categories:', error);
    return [];
  }
}

export async function addKategori(kategori: NewKategori): Promise<AddKategoriResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/kategori`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        kategori: kategori.kategori
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new ApiError(
        `Add category failed: ${response.statusText}`,
        response.status,
        errorText
      );
    }

    const result = await response.json();
    return result;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(
      error instanceof Error ? error.message : 'Add category failed',
      0
    );
  }
}

export async function deleteKategori(id: number): Promise<void> {
  try {
    const response = await fetch(`${API_BASE_URL}/kategori/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new ApiError(
        `Delete category failed: ${response.statusText}`,
        response.status,
        errorText
      );
    }
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(
      error instanceof Error ? error.message : 'Delete category failed',
      0
    );
  }
}

export async function updateKategori(id: number, kategori: Partial<Kategori>): Promise<void> {
  try {
    const response = await fetch(`${API_BASE_URL}/kategori/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(kategori),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new ApiError(
        `Update category failed: ${response.statusText}`,
        response.status,
        errorText
      );
    }
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(
      error instanceof Error ? error.message : 'Update category failed',
      0
    );
  }
}

// Helper functions for parsing unknown response formats
function extractArray(obj: Record<string, unknown>, keys: string[]): unknown[] {
  for (const key of keys) {
    if (key in obj && Array.isArray(obj[key])) {
      return obj[key] as unknown[];
    }
  }
  return [];
}

function extractNumber(obj: Record<string, unknown>, keys: string[]): number | undefined {
  for (const key of keys) {
    if (key in obj && typeof obj[key] === 'number') {
      return obj[key] as number;
    }
  }
  return undefined;
}

export async function getProduk(page: number = 1): Promise<PaginatedResponse<Produk>> {
  try {
    // Construct URL with page parameter - always include page parameter
    const endpoint = `/produk?page=${page}`;
    const response = await apiRequest<ApiResponse>(endpoint);
    
    // Handle different response formats from backend
    if (Array.isArray(response)) {
      // Backend returns array directly (no pagination wrapper)
      const normalizedData = normalizeProductData(response);
      return {
        data: normalizedData,
        page: page,
        limit: normalizedData.length,
        total: normalizedData.length,
        totalPages: 1
      };
    } else if (response && typeof response === 'object') {
      // Try to parse as our expected PaginatedResponse format first
      if ('data' in response && Array.isArray(response.data)) {
        const paginatedResponse = response as PaginatedResponse<Produk>;
        const normalizedData = normalizeProductData(paginatedResponse.data);
        return {
          ...paginatedResponse,
          data: normalizedData
        };
      }
      
      // Handle different backend response formats using helper functions
      const resp = response as Record<string, unknown>;
      const data = extractArray(resp, ['data', 'products', 'items']);
      const currentPage = extractNumber(resp, ['page', 'currentPage']) || page;
      const limit = extractNumber(resp, ['limit', 'pageSize', 'per_page']) || data.length;
      const total = extractNumber(resp, ['total', 'totalItems', 'count']) || data.length;
      const totalPages = extractNumber(resp, ['totalPages', 'total_pages']) || Math.ceil(total / limit);
      
      const normalizedData = normalizeProductData(data);
      
      return {
        data: normalizedData,
        page: currentPage,
        limit: limit,
        total: total,
        totalPages: totalPages
      };
    }
    
    // Fallback for empty or invalid response
    return {
      data: [],
      page: page,
      limit: 10,
      total: 0,
      totalPages: 0
    };
  } catch (error) {
    throw error;
  }
}

export async function getAllProduk(): Promise<Produk[]> {
  try {
    const endpoint = '/produk';
    const response = await apiRequest<ApiResponse>(endpoint);
    
    if (Array.isArray(response)) {
      return normalizeProductData(response);
    } else if (response && typeof response === 'object') {
      const resp = response as Record<string, unknown>;
      const data = extractArray(resp, ['data', 'products', 'items']);
      return normalizeProductData(data);
    }
    
    return [];
  } catch (error) {
    throw error;
  }
}

export async function deleteProduk(id: number): Promise<void> {
  try {
    const endpoint = `/produk/${id}`;
    
    await apiRequest(endpoint, {
      method: 'DELETE',
    });
  } catch (error) {
    throw error;
  }
}

export async function addProduk(produk: Omit<Produk, 'id' | 'created_at' | 'updated_at'>): Promise<Produk> {
  try {
    // Validate that id_kategori is a number
    if (!produk.id_kategori || typeof produk.id_kategori !== 'number') {
      throw new ApiError('Invalid category ID: must be a number', 400);
    }
    
    // Ensure the payload matches backend expectations exactly
    const payload = {
      nama: produk.nama?.trim() || "",
      id_kategori: Number(produk.id_kategori),
      keterangan: produk.keterangan?.trim() || "",
      price: Number(produk.price)
    };
    
    // Additional validation
    if (!payload.nama) {
      throw new ApiError('Product name is required', 400);
    }
    
    if (payload.price <= 0) {
      throw new ApiError('Price must be greater than 0', 400);
    }
    
    const response = await apiRequest<Produk>('/produk', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    
    return response;
  } catch (error) {
    throw error;
  }
}

export async function updateProduk(id: number, produk: Partial<Produk>): Promise<Produk> {
  try {
    // Ensure the payload matches backend expectations
    const payload: Record<string, string | number> = {};
    
    if (produk.nama) payload.nama = produk.nama;
    if (produk.id_kategori) payload.id_kategori = produk.id_kategori;
    if (produk.keterangan !== undefined) payload.keterangan = produk.keterangan;
    if (produk.price) payload.price = produk.price;
    
    const response = await apiRequest<Produk>(`/produk/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
    return response;
  } catch (error) {
    throw error;
  }
}

export async function addStok(data: {
  id_produk: number;
  id_kategori: number;
  tgl_trx: string;
  qty_in: number;
  qty_out: number;
}): Promise<void> {
  try {
    const response = await fetch(`${API_BASE_URL}/stok`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new ApiError(
        `Add stock failed: ${response.statusText}`,
        response.status,
        errorText
      );
    }
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(
      error instanceof Error ? error.message : 'Add stock failed',
      0
    );
  }
}

export async function delStok(data: {
  id_produk: number;
  id_kategori: number;
  tgl_trx: string;
  qty_in: number;
  qty_out: number;
}): Promise<void> {
  try {
    const response = await fetch(`${API_BASE_URL}/stok`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new ApiError(
        `Delete stock failed: ${response.statusText}`,
        response.status,
        errorText
      );
    }
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(
      error instanceof Error ? error.message : 'Delete stock failed',
      0
    );
  }
}

export async function getStok(page: number = 1): Promise<PaginatedResponse<Stok>> {
  try {
    // Construct URL with page parameter - always include page parameter
    const endpoint = `/stok?page=${page}`;
    const response = await apiRequest<ApiResponse>(endpoint);
    
    // Handle different response formats from backend
    if (Array.isArray(response)) {
      // Backend returns array directly (no pagination wrapper)
      const normalizedData = normalizeStokData(response);
      return {
        data: normalizedData,
        page: page,
        limit: normalizedData.length,
        total: normalizedData.length,
        totalPages: 1
      };
    } else if (response && typeof response === 'object') {
      // Try to parse as our expected PaginatedResponse format first
      if ('data' in response && Array.isArray(response.data)) {
        const paginatedResponse = response as PaginatedResponse<Produk>;
        const normalizedData = normalizeStokData(paginatedResponse.data);
        return {
          ...paginatedResponse,
          data: normalizedData
        };
      }
      
      // Handle different backend response formats using helper functions
      const resp = response as Record<string, unknown>;
      const data = extractArray(resp, ['data', 'stocks', 'items']);
      const currentPage = extractNumber(resp, ['page', 'currentPage']) || page;
      const limit = extractNumber(resp, ['limit', 'pageSize', 'per_page']) || data.length;
      const total = extractNumber(resp, ['total', 'totalItems', 'count']) || data.length;
      const totalPages = extractNumber(resp, ['totalPages', 'total_pages']) || Math.ceil(total / limit);
      
      const normalizedData = normalizeStokData(data);
      
      return {
        data: normalizedData,
        page: currentPage,
        limit: limit,
        total: total,
        totalPages: totalPages
      };
    }
    
    // Fallback for empty or invalid response
    return {
      data: [],
      page: page,
      limit: 10,
      total: 0,
      totalPages: 0
    };
  } catch (error) {
    throw error;
  }
}

// Export types for use in components
export type { Produk, ProdukWithKategori, ApiError, PaginationParams };

// Export constants for use in components
//export { STORAGE_BASE_URL };

