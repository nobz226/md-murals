import { createContext, useCallback, useContext, useRef, useState } from 'react';
import { useMutation } from 'convex/react';
import { ConvexError } from 'convex/values';

const STORAGE_KEY = 'mdAdminKey';

const AdminContext = createContext(null);

function readStoredKey() {
  try {
    return sessionStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

// Human-readable message from a Convex or network error
export function errorMessage(error) {
  if (error instanceof ConvexError) return String(error.data);
  return error?.message || 'Something went wrong';
}

export function AdminProvider({ children }) {
  const [adminKey, setAdminKey] = useState(readStoredKey);
  const [toasts, setToasts] = useState([]);
  const toastIdRef = useRef(0);

  const login = useCallback((key) => {
    try {
      sessionStorage.setItem(STORAGE_KEY, key);
    } catch {
      // Session storage unavailable: stay logged in for this page load only
    }
    setAdminKey(key);
  }, []);

  const logout = useCallback(() => {
    try {
      sessionStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
    setAdminKey(null);
  }, []);

  const toast = useCallback((message, type = 'success') => {
    const id = ++toastIdRef.current;
    // Keep at most three on screen
    setToasts((current) => [...current.slice(-2), { id, message, type }]);
    setTimeout(() => {
      setToasts((current) => current.filter((t) => t.id !== id));
    }, type === 'error' ? 6000 : 3000);
  }, []);

  return (
    <AdminContext.Provider value={{ adminKey, login, logout, toast }}>
      {children}
      <div className="admin-toasts" role="status" aria-live="polite">
        {toasts.map((t) => (
          <div key={t.id} className={`admin-toast admin-toast-${t.type}`}>{t.message}</div>
        ))}
      </div>
    </AdminContext.Provider>
  );
}

export function useAdmin() {
  return useContext(AdminContext);
}

// useMutation that adds the admin key to every call and logs out if it's rejected
export function useAdminMutation(mutationRef) {
  const mutate = useMutation(mutationRef);
  const { adminKey, logout } = useAdmin();

  return useCallback(async (args = {}) => {
    try {
      return await mutate({ ...args, adminKey });
    } catch (error) {
      if (error instanceof ConvexError && error.data === 'Unauthorized') logout();
      throw error;
    }
  }, [mutate, adminKey, logout]);
}

// Upload a file to a Convex storage upload URL and return its storage id
export async function uploadFile(uploadUrl, file) {
  const response = await fetch(uploadUrl, {
    method: 'POST',
    headers: { 'Content-Type': file.type },
    body: file
  });
  if (!response.ok) {
    throw new Error(`Upload failed for ${file.name} (${response.status})`);
  }
  const { storageId } = await response.json();
  return storageId;
}
