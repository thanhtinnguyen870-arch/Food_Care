import { createContext, useCallback, useContext, useState, useEffect, useRef } from 'react';
import { toast } from 'react-toastify';
import axiosClient from '../api/axiosClient';

const AuthContext = createContext();

const getStoredUser = () => {
  try {
    const userInfo = localStorage.getItem('userInfo');
    return userInfo ? JSON.parse(userInfo) : null;
  } catch {
    localStorage.removeItem('userInfo');
    localStorage.removeItem('token');
    return null;
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(getStoredUser);
  const [loading] = useState(false);
  const syncedUserIdRef = useRef(null);

  const updateUser = useCallback((userData) => {
    setUser((currentUser) => {
      if (!currentUser) return currentUser;
      const updatedUser = { ...currentUser, ...userData };
      localStorage.setItem('userInfo', JSON.stringify(updatedUser));
      return updatedUser;
    });
  }, []);

  const storeAuthenticatedUser = (data) => {
    setUser(data);
    localStorage.setItem('userInfo', JSON.stringify(data));
    localStorage.setItem('token', data.token);
  };

  // Sync user tier/totalSpent once per session (only when userId changes, not on every render)
  useEffect(() => {
    const token = localStorage.getItem('token');
    const userId = user?._id;

    // Only sync if we have a token+user AND haven't synced for this user yet
    if (!token || !userId || syncedUserIdRef.current === userId) return;

    syncedUserIdRef.current = userId;

    axiosClient.get('/auth/me').then(({ data }) => {
      if (data.totalSpent !== user?.totalSpent || data.tier !== user?.tier) {
        updateUser({ totalSpent: data.totalSpent, tier: data.tier });
      }
    }).catch((error) => {
      if ([401, 403].includes(error.response?.status)) {
        syncedUserIdRef.current = null;
        setUser(null);
        localStorage.removeItem('userInfo');
        localStorage.removeItem('token');
        return;
      }
      console.error('Failed to sync user data:', error);
    });
  }, [user?._id, user?.tier, user?.totalSpent, updateUser]);

  const login = async (email, password) => {
    try {
      const { data } = await axiosClient.post('/auth/login', { email, password });
      storeAuthenticatedUser(data);
      toast.success('Đăng nhập thành công!');
      return { success: true, user: data };
    } catch (error) {
      return { success: false, message: error.response?.data?.message || 'Đăng nhập thất bại.' };
    }
  };

  const googleLogin = async (credential) => {
    try {
      const { data } = await axiosClient.post('/auth/google', { credential });
      storeAuthenticatedUser(data);
      toast.success('Đăng nhập bằng Google thành công!');
      return { success: true, user: data };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Đăng nhập Google không thành công.',
      };
    }
  };

  const register = async (name, email, password) => {
    try {
      const { data } = await axiosClient.post('/auth/register', { name, email, password });
      storeAuthenticatedUser(data);
      return { success: true };
    } catch (error) {
      return { success: false, message: error.response?.data?.message || 'Đăng ký thất bại.' };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('userInfo');
    localStorage.removeItem('token');
    toast.success('Đăng xuất thành công!');
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, googleLogin, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext);
