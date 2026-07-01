import { useEffect, useMemo, useRef, useState } from 'react';
import {
  AlertCircle,
  Bell,
  Camera,
  CheckCircle2,
  ClipboardList,
  DollarSign,
  Edit3,
  Eye,
  EyeOff,
  ExternalLink,
  LayoutDashboard,
  LogOut,
  Package,
  Plus,
  RefreshCw,
  Search,
  ShieldCheck,
  Trash2,
  TrendingUp,
  Truck,
  User,
  Users,
  X,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import axiosClient from '../api/axiosClient';
import { useAuth } from '../context/AuthContext';

const statusLabels = {
  pending: 'Chờ xác nhận',
  confirmed: 'Đã xác nhận',
  preparing: 'Đang chuẩn bị',
  shipping: 'Đang giao',
  completed: 'Hoàn thành',
  cancelled: 'Đã hủy',
};

const statusStyles = {
  pending: 'bg-amber-50 text-amber-700 border-amber-200',
  confirmed: 'bg-orange-50 text-orange-700 border-orange-200',
  preparing: 'bg-orange-50 text-orange-700 border-orange-200',
  shipping: 'bg-orange-100 text-orange-800 border-orange-200',
  completed: 'bg-green-50 text-green-700 border-green-200',
  cancelled: 'bg-rose-50 text-rose-700 border-rose-200',
};

const tabs = [
  { id: 'overview', label: 'Tổng quan', icon: LayoutDashboard },
  { id: 'orders', label: 'Đơn hàng', icon: ClipboardList },
  { id: 'foods', label: 'Thực đơn', icon: Package },
  { id: 'customers', label: 'Khách hàng', icon: Users },
  { id: 'revenue', label: 'Doanh thu', icon: TrendingUp },
  { id: 'notifications', label: 'Thông báo', icon: Bell },
  { id: 'profile', label: 'Hồ sơ cá nhân', icon: User },
  { id: 'public_menu', label: 'Xem Trang Chính', icon: ExternalLink },
];

const emptyFoodForm = {
  name: '',
  price: '',
  category: '',
  description: '',
  image: '',
  isAvailable: true,
  isVegetarian: false,
};

const emptyCategoryForm = {
  name: '',
  description: '',
};

const formatCurrency = (value = 0) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(value);

const formatDate = (value) =>
  value ? new Date(value).toLocaleString('vi-VN', { dateStyle: 'short', timeStyle: 'short' }) : '-';

const AdminDashboard = () => {
  const { user, logout, updateUser } = useAuth();
  const navigate = useNavigate();
  const avatarInputRef = useRef(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState(null);
  const [orders, setOrders] = useState([]);
  const [foods, setFoods] = useState([]);
  const [users, setUsers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [foodSearchTerm, setFoodSearchTerm] = useState('');
  const [customerNameFilter, setCustomerNameFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [orderSearchTerm, setOrderSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [availabilityFilter, setAvailabilityFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [editingFood, setEditingFood] = useState(null);
  const [foodForm, setFoodForm] = useState(emptyFoodForm);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [categoryForm, setCategoryForm] = useState(emptyCategoryForm);
  const [revenueFilterType, setRevenueFilterType] = useState('month');
  const [revenueFilterDate, setRevenueFilterDate] = useState(new Date().toISOString().slice(0, 10));
  const [revenueFilterMonth, setRevenueFilterMonth] = useState(new Date().toISOString().slice(0, 7));
  const [revenueFilterYear, setRevenueFilterYear] = useState(new Date().getFullYear().toString());
  const [adminProfileForm, setAdminProfileForm] = useState({ name: user?.name || '' });
  const [adminPasswordForm, setAdminPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [userForm, setUserForm] = useState({ name: '', phone: '', address: '' });
  const [userFormError, setUserFormError] = useState('');

  useEffect(() => {
    const syncProfileForm = setTimeout(() => {
      setAdminProfileForm({ name: user?.name || '' });
    }, 0);

    return () => clearTimeout(syncProfileForm);
  }, [user?.name]);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const [dashboardRes, ordersRes, foodsRes, usersRes, categoriesRes, notificationsRes] = await Promise.all([
        axiosClient.get('/admin/dashboard'),
        axiosClient.get('/admin/orders'),
        axiosClient.get('/admin/foods'),
        axiosClient.get('/admin/users'),
        axiosClient.get('/categories'),
        axiosClient.get('/admin/notifications'),
      ]);

      setStats(dashboardRes.data);
      setOrders(ordersRes.data);
      setFoods(foodsRes.data);
      setUsers(usersRes.data);
      setCategories(categoriesRes.data);
      setNotifications(notificationsRes.data);
    } catch (error) {
      setMessage(error.response?.data?.message || 'Không thể tải dữ liệu quản trị.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user || user.role !== 'admin') return;

    const loadAdminData = setTimeout(() => {
      fetchAdminData();
    }, 0);

    return () => clearTimeout(loadAdminData);
  }, [user, navigate]);

  useEffect(() => {
    if (!user || user.role !== 'admin') return;

    const baseUrl = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace('/api', '') : 'http://localhost:5000';
    const socket = io(baseUrl);

    socket.on('newOrder', (order) => {
      setOrders((prev) => [order, ...prev]);
      setStats((prev) => prev ? { ...prev, totalOrders: prev.totalOrders + 1 } : prev);
    });

    socket.on('newNotification', (notification) => {
      setNotifications((prev) => [notification, ...prev]);
    });

    socket.on('foodAdded', (food) => {
      setFoods((prev) => [food, ...prev]);
    });

    socket.on('foodUpdated', (updatedFood) => {
      setFoods((prev) => prev.map(f => f._id === updatedFood._id ? updatedFood : f));
    });

    socket.on('foodDeleted', (foodId) => {
      setFoods((prev) => prev.filter(f => f._id !== foodId));
    });

    socket.on('categoryAdded', (category) => {
      setCategories((prev) => [...prev, category]);
    });

    socket.on('orderUpdated', (updatedOrder) => {
      setOrders((prev) => prev.map(o => o._id === updatedOrder._id ? updatedOrder : o));
      setSelectedOrder((current) => current?._id === updatedOrder._id ? updatedOrder : current);
    });

    socket.on('notificationRead', (notificationId) => {
      setNotifications((prev) => prev.map(n => n._id === notificationId ? { ...n, isRead: true } : n));
    });

    return () => {
      socket.disconnect();
    };
  }, [user]);

  const unreadNotifications = notifications.filter(n => !n.isRead).length;
  const pendingOrdersCount = orders.filter(o => o.orderStatus === 'pending').length;

  const handleMarkNotificationAsRead = async (id) => {
    try {
      const { data } = await axiosClient.put(`/admin/notifications/${id}/read`);
      setNotifications((current) => current.map(n => n._id === id ? data : n));
    } catch (error) {
      console.error('Lỗi khi đánh dấu đã đọc:', error);
    }
  };

  const getNotificationFoodId = (notification) => {
    if (!notification?.food) return '';
    return typeof notification.food === 'string' ? notification.food : notification.food._id || '';
  };

  const handleOpenNotification = async (notification) => {
    if (!notification.isRead) {
      await handleMarkNotificationAsRead(notification._id);
    }

    const foodId = getNotificationFoodId(notification);
    if (foodId) {
      navigate(`/food/${foodId}`);
    }
  };

  const revenueToday = useMemo(() => {
    const today = new Date().toDateString();
    return orders
      .filter((order) => order.paymentStatus === 'paid' && order.orderStatus !== 'cancelled' && new Date(order.createdAt).toDateString() === today)
      .reduce((sum, order) => sum + (order.totalAmount || 0), 0);
  }, [orders]);

  const adminMetrics = useMemo(() => {
    const activeOrders = orders.filter((order) => !['completed', 'cancelled'].includes(order.orderStatus)).length;
    const hiddenFoods = foods.filter((food) => food.isAvailable === false).length;
    const paidOrders = orders.filter((order) => order.paymentStatus === 'paid').length;
    const averageOrder = paidOrders ? Math.round((stats?.totalRevenue || 0) / paidOrders) : 0;

    return { activeOrders, hiddenFoods, averageOrder, paidOrders };
  }, [foods, orders, stats]);

  const revenueStats = useMemo(() => {
    const groups = {};
    orders
      .filter((o) => o.paymentStatus === 'paid' && o.orderStatus !== 'cancelled')
      .forEach((order) => {
        const dateObj = new Date(order.createdAt);
        const orderYear = dateObj.getFullYear().toString();
        const orderMonth = dateObj.toISOString().slice(0, 7);
        const orderDate = dateObj.toISOString().slice(0, 10);

        let groupLabel, sortKey;

        if (revenueFilterType === 'year') {
          if (orderYear !== revenueFilterYear) return;
          groupLabel = `Tháng ${dateObj.getMonth() + 1}/${orderYear}`;
          sortKey = orderMonth;
        } else if (revenueFilterType === 'month') {
          if (orderMonth !== revenueFilterMonth) return;
          groupLabel = dateObj.toLocaleDateString('vi-VN');
          sortKey = orderDate;
        } else {
          if (orderDate !== revenueFilterDate) return;
          groupLabel = dateObj.toLocaleDateString('vi-VN');
          sortKey = orderDate;
        }

        if (!groups[sortKey]) groups[sortKey] = { label: groupLabel, sortKey, revenue: 0, orders: 0 };
        groups[sortKey].revenue += order.totalAmount || 0;
        groups[sortKey].orders += 1;
      });
    return Object.values(groups).sort((a, b) => b.sortKey.localeCompare(a.sortKey));
  }, [orders, revenueFilterType, revenueFilterDate, revenueFilterMonth, revenueFilterYear]);

  const topSellingFoods = useMemo(() => {
    const counts = {};
    orders.forEach(order => {
      if (order.orderStatus !== 'cancelled') {
        order.items?.forEach(item => {
          counts[item.food] = (counts[item.food] || 0) + item.quantity;
        });
      }
    });

    return [...foods].map(food => ({
      ...food,
      computedSoldCount: counts[food._id] || 0
    })).sort((a, b) => b.computedSoldCount - a.computedSoldCount).slice(0, 5);
  }, [foods, orders]);

  const filteredOrders = useMemo(() => {
    const term = orderSearchTerm.toLowerCase().trim();
    return orders.filter((order) => {
      const matchesStatus = statusFilter === 'all' || order.orderStatus === statusFilter;
      const searchable = `${order._id} ${order.user?.name || ''} ${order.email || ''} ${order.phone || ''}`.toLowerCase();
      return matchesStatus && searchable.includes(term);
    });
  }, [orders, orderSearchTerm, statusFilter]);

  const filteredFoods = useMemo(() => {
    const term = foodSearchTerm.toLowerCase().trim();
    return foods.filter((food) => {
      const categoryName = food.category?.name || '';
      const categoryId = food.category?._id || food.category || 'uncategorized';
      const matchesCategory = selectedCategory === 'all' || categoryId === selectedCategory;
      const matchesAvailability = availabilityFilter === 'all' || (availabilityFilter === 'hidden' && food.isAvailable === false) || (availabilityFilter === 'active' && food.isAvailable !== false);
      const matchesSearch = `${food.name} ${categoryName} ${food.description || ''}`.toLowerCase().includes(term);
      return matchesCategory && matchesAvailability && matchesSearch;
    });
  }, [foods, foodSearchTerm, selectedCategory, availabilityFilter]);

  const categorySummaries = useMemo(() => {
    const uncategorized = { _id: 'uncategorized', name: 'Chưa phân loại', count: 0, active: 0, hidden: 0 };
    const summaries = categories.map((category) => ({
      _id: category._id,
      name: category.name,
      count: 0,
      active: 0,
      hidden: 0,
    }));
    const byId = new Map(summaries.map((category) => [category._id, category]));

    foods.forEach((food) => {
      const categoryId = food.category?._id || food.category || 'uncategorized';
      const summary = byId.get(categoryId) || uncategorized;
      summary.count += 1;
      if (food.isAvailable === false) {
        summary.hidden += 1;
      } else {
        summary.active += 1;
      }
    });

    return [
      { _id: 'all', name: 'Tất cả danh mục', count: foods.length, active: foods.filter((food) => food.isAvailable !== false).length, hidden: foods.filter((food) => food.isAvailable === false).length },
      ...summaries,
      ...(uncategorized.count ? [uncategorized] : []),
    ];
  }, [categories, foods]);

  const filteredUsers = useMemo(() => {
    const nameTerm = customerNameFilter.toLowerCase().trim();
    return users.filter((item) => {
      const matchesName = (item.name || '').toLowerCase().includes(nameTerm);
      return matchesName;
    });
  }, [users, customerNameFilter]);

  const openFoodForm = (food = null) => {
    setEditingFood(food || {});
    setFoodForm(
      food
        ? {
            name: food.name || '',
            price: food.price ?? '',
            category: food.category?._id || food.category || categories[0]?._id || '',
            description: food.description || '',
            image: food.images?.[0] || '',
            isAvailable: food.isAvailable !== false,
            isVegetarian: Boolean(food.isVegetarian),
          }
        : { ...emptyFoodForm, category: categories[0]?._id || '' }
    );
  };

  const closeFoodForm = () => {
    setEditingFood(null);
    setFoodForm(emptyFoodForm);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleAdminAvatarChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('image', file);

    setAvatarUploading(true);
    try {
      const { data } = await axiosClient.post('/upload/avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const { data: updatedProfile } = await axiosClient.put('/auth/profile', { avatar: data.url });
      updateUser(updatedProfile);
      setMessage('Đã cập nhật avatar.');
    } catch (error) {
      setMessage(error.response?.data?.message || 'Không thể cập nhật avatar.');
    } finally {
      setAvatarUploading(false);
      event.target.value = '';
    }
  };

  const handleAdminProfileUpdate = async (event) => {
    event.preventDefault();

    try {
      const { data } = await axiosClient.put('/auth/profile', {
        name: adminProfileForm.name.trim(),
      });
      updateUser(data);
      setMessage('Đã cập nhật hồ sơ cá nhân.');
    } catch (error) {
      setMessage(error.response?.data?.message || 'Không thể cập nhật hồ sơ cá nhân.');
    }
  };

  const handleAdminPasswordChange = async (event) => {
    event.preventDefault();

    if (adminPasswordForm.newPassword !== adminPasswordForm.confirmPassword) {
      setMessage('Mật khẩu xác nhận không khớp.');
      return;
    }

    try {
      const { data } = await axiosClient.put('/auth/change-password', {
        currentPassword: adminPasswordForm.currentPassword,
        newPassword: adminPasswordForm.newPassword,
      });
      setAdminPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setMessage(data.message || 'Đã thay đổi mật khẩu thành công.');
    } catch (error) {
      setMessage(error.response?.data?.message || 'Không thể thay đổi mật khẩu.');
    }
  };

  const handleUpdateStatus = async (id, status) => {
    try {
      const { data } = await axiosClient.put(`/admin/orders/${id}/status`, { status });
      setOrders((current) => current.map((order) => (order._id === id ? data : order)));
      setSelectedOrder((current) => (current?._id === id ? data : current));
      setMessage('Đã cập nhật trạng thái đơn hàng.');
    } catch (error) {
      setMessage(error.response?.data?.message || 'Lỗi cập nhật đơn hàng.');
    }
  };

  const handleToggleAvailability = async (food) => {
    try {
      await axiosClient.put(`/foods/${food._id}`, { isAvailable: food.isAvailable === false ? true : false });
      setFoods((current) => current.map((f) => (f._id === food._id ? { ...f, isAvailable: food.isAvailable === false ? true : false } : f)));
      setMessage(food.isAvailable !== false ? `Đã tạm ẩn: ${food.name}` : `Đã mở bán lại: ${food.name}`);
    } catch (error) {
      setMessage(error.response?.data?.message || 'Lỗi cập nhật trạng thái món ăn.');
    }
  };

  const handleSaveFood = async (event) => {
    event.preventDefault();
    setSaving(true);

    const payload = {
      name: foodForm.name.trim(),
      price: Number(foodForm.price) || 0,
      category: foodForm.category,
      description: foodForm.description.trim() || 'Đang cập nhật mô tả món ăn.',
      images: foodForm.image ? [foodForm.image.trim()] : ['https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=800&auto=format&fit=crop'],
      isAvailable: foodForm.isAvailable,
      isVegetarian: foodForm.isVegetarian,
    };

    try {
      if (editingFood?._id) {
        await axiosClient.put(`/foods/${editingFood._id}`, payload);
        setMessage('Đã lưu thay đổi món ăn.');
      } else {
        await axiosClient.post('/foods', payload);
        setMessage('Đã thêm món ăn mới.');
      }
      closeFoodForm();
      const { data } = await axiosClient.get('/admin/foods');
      setFoods(data);
    } catch (error) {
      setMessage(error.response?.data?.message || 'Không thể lưu món ăn.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteFood = async (id) => {
    if (!window.confirm('Ẩn món ăn này khỏi thực đơn?')) return;

    try {
      const { data } = await axiosClient.delete(`/foods/${id}`);
      setFoods((current) =>
        current.map((food) => (food._id === id ? data.food : food)),
      );
      setMessage('Đã ẩn món ăn khỏi thực đơn.');
    } catch (error) {
      setMessage(error.response?.data?.message || 'Không thể ẩn món ăn.');
    }
  };

  const handleCreateCategory = async (event) => {
    event.preventDefault();
    setSaving(true);

    try {
      const { data } = await axiosClient.post('/categories', {
        name: categoryForm.name.trim(),
        description: categoryForm.description.trim(),
      });
      setCategories((current) => [...current, data]);
      setSelectedCategory(data._id);
      setCategoryForm(emptyCategoryForm);
      setIsCategoryModalOpen(false);
      setMessage('Đã thêm danh mục mới.');
    } catch (error) {
      setMessage(error.response?.data?.message || 'Không thể thêm danh mục.');
    } finally {
      setSaving(false);
    }
  };

  const handlePromoteUser = async (customer) => {
    const confirmed = window.confirm(`Phân quyền admin cho tài khoản ${customer.name}? Tài khoản này sẽ biến mất khỏi danh sách khách hàng.`);
    if (!confirmed) return;

    try {
      await axiosClient.put(`/admin/users/${customer._id}/role`, { role: 'admin' });
      setUsers((current) => current.filter((item) => item._id !== customer._id));
      setMessage(`${customer.name} đã được phân quyền admin. Người dùng cần đăng nhập lại để vào trang admin.`);
    } catch (error) {
      setMessage(error.response?.data?.message || 'Không thể phân quyền tài khoản.');
    }
  };

  const handleToggleUserBlock = async (customer) => {
    const nextBlocked = !customer.isBlocked;
    const actionLabel = nextBlocked ? 'khóa' : 'mở khóa';
    if (!window.confirm(`${actionLabel} tài khoản ${customer.name}?`)) return;

    try {
      const { data } = await axiosClient.put(`/admin/users/${customer._id}/block`, {
        isBlocked: nextBlocked,
      });
      setUsers((current) =>
        current.map((item) => (item._id === customer._id ? { ...item, ...data } : item)),
      );
      setMessage(`Đã ${actionLabel} tài khoản ${customer.name}.`);
    } catch (error) {
      setMessage(error.response?.data?.message || `Không thể ${actionLabel} tài khoản.`);
    }
  };

  const openUserForm = (customer) => {
    setEditingUser(customer);
    setUserForm({ name: customer.name || '', phone: customer.phone || '', address: customer.address || '' });
    setUserFormError('');
  };

  const closeUserForm = () => {
    setEditingUser(null);
    setUserForm({ name: '', phone: '', address: '' });
    setUserFormError('');
  };

  const handleUpdateUserInfo = async (event) => {
    event.preventDefault();
    setUserFormError('');

    // Bước 6: Kiểm tra tính hợp lệ phía client
    const trimmedName = userForm.name.trim();
    const trimmedPhone = userForm.phone.trim();

    if (!trimmedName || trimmedName.length < 2) {
      setUserFormError('Tên người dùng phải có ít nhất 2 ký tự.');
      return;
    }
    if (trimmedPhone && !/^[0-9]{10,11}$/.test(trimmedPhone)) {
      setUserFormError('Số điện thoại không hợp lệ (10-11 số).');
      return;
    }

    setSaving(true);
    try {
      // Bước 7: Lưu thay đổi vào cơ sở dữ liệu
      const { data } = await axiosClient.put(`/admin/users/${editingUser._id}`, {
        name: trimmedName,
        phone: trimmedPhone,
        address: userForm.address.trim(),
      });
      setUsers((current) =>
        current.map((item) => (item._id === editingUser._id ? { ...item, ...data } : item)),
      );
      // Bước 8: Thông báo cập nhật thành công
      setMessage(`Đã cập nhật thông tin tài khoản ${data.name}.`);
      closeUserForm();
    } catch (error) {
      // Bước 6.2: Dữ liệu không hợp lệ, hiển thị thông báo lỗi
      setUserFormError(error.response?.data?.message || 'Không thể cập nhật thông tin.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-orange-50/70 p-6">
        <div className="mx-auto flex min-h-[70vh] max-w-6xl items-center justify-center rounded-md border border-orange-100 bg-white">
          <div className="text-center">
            <RefreshCw className="mx-auto mb-3 animate-spin text-primary" size={30} />
            <p className="font-semibold text-orange-900">Đang tải dữ liệu quản trị...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!user || user.role !== 'admin') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-orange-50/70 p-6 text-slate-900">
        <div className="w-full max-w-md rounded-md border border-orange-100 bg-white p-6 text-center shadow-sm">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-md bg-primary text-white">
            <ShieldCheck size={24} />
          </div>
          <h1 className="text-2xl font-black">Khu vực quản trị</h1>
          <p className="mt-2 text-sm text-slate-600">
            Bạn cần đăng nhập bằng tài khoản có quyền admin để mở bảng điều khiển này.
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <button
              onClick={() => navigate('/login', { state: { from: '/admin' } })}
              className="flex-1 rounded-md bg-primary px-4 py-2 font-semibold text-white hover:bg-orange-600"
            >
              Đăng nhập
            </button>
            <button
              onClick={() => navigate('/')}
              className="flex-1 rounded-md border border-orange-200 px-4 py-2 font-semibold text-orange-700 hover:bg-orange-50"
            >
              Về trang chủ
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-orange-50/70 text-slate-900">
      <div className="grid min-h-screen lg:grid-cols-[280px_1fr]">
        <aside className="border-r border-orange-200 bg-gradient-to-b from-orange-600 to-orange-700 text-white">
          <div className="flex h-full flex-col p-5">
            <div className="mb-8 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-md bg-white text-primary">
                <ShieldCheck size={24} />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-orange-100">FoodCare</p>
                <h1 className="text-xl font-bold">Admin Console</h1>
              </div>
            </div>

            <nav className="space-y-1">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => {
                      if (tab.id === 'public_menu') {
                        navigate('/');
                      } else {
                        setActiveTab(tab.id);
                      }
                    }}
                    className={`flex h-11 w-full items-center gap-3 rounded-md px-3 text-left text-sm font-semibold transition relative ${
                      isActive ? 'bg-white text-primary' : 'text-orange-50 hover:bg-white/15 hover:text-white'
                    }`}
                  >
                    <Icon size={18} />
                    {tab.label}
                    {tab.id === 'notifications' && unreadNotifications > 0 && (
                      <span className="absolute right-3 top-1/2 flex h-5 min-w-[20px] -translate-y-1/2 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
                        {unreadNotifications}
                      </span>
                    )}
                    {tab.id === 'orders' && pendingOrdersCount > 0 && (
                      <span className="absolute right-3 top-1/2 flex h-5 min-w-[20px] -translate-y-1/2 items-center justify-center rounded-full bg-amber-500 px-1 text-[10px] font-bold text-white">
                        {pendingOrdersCount}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>

            <div className="mt-auto rounded-md border border-white/20 bg-white/10 p-4">
              <p className="text-xs text-orange-100">Đăng nhập với quyền admin</p>
              <p className="mt-1 truncate font-semibold">{user?.name || 'Quản trị viên'}</p>
              <button onClick={handleLogout} className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-white hover:text-orange-100">
                <LogOut size={16} />
                Đăng xuất
              </button>
            </div>
          </div>
        </aside>

        <main className="min-w-0">
          <div className="border-b border-orange-100 bg-white px-5 py-4 md:px-8">
            <div className="flex flex-col justify-between gap-4 xl:flex-row xl:items-center">
              <div>
                <p className="text-sm font-semibold text-orange-600">Bảng điều khiển vận hành</p>
                <h2 className="text-2xl font-bold text-slate-950">Quản trị bán hàng và thực đơn</h2>
              </div>
              <div className="flex items-center gap-3">
                <button onClick={fetchAdminData} className="flex h-10 items-center justify-center gap-2 whitespace-nowrap rounded-md border border-orange-200 bg-white px-4 text-sm font-semibold text-orange-700 hover:bg-orange-50 transition-colors">
                  <RefreshCw size={17} />
                  Làm mới
                </button>
              </div>
            </div>
          </div>

          <div className="p-5 md:p-8">
            {message && (
              <div className="mb-5 flex items-center justify-between rounded-md border border-orange-100 bg-white p-4 text-sm font-semibold text-orange-800">
                <span>{message}</span>
                <button onClick={() => setMessage('')} className="text-slate-400 hover:text-slate-700">
                  <X size={18} />
                </button>
              </div>
            )}

            {activeTab === 'overview' && (
              <section className="space-y-6">
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                  <MetricCard icon={DollarSign} label="Tổng doanh thu" value={formatCurrency(stats?.totalRevenue)} detail={`Hôm nay: ${formatCurrency(revenueToday)}`} />
                  <MetricCard icon={ClipboardList} label="Tổng đơn hàng" value={stats?.totalOrders || 0} detail={`${adminMetrics.activeOrders} đơn đang xử lý`} />
                  <MetricCard icon={Users} label="Khách hàng" value={stats?.totalUsers || 0} detail={`${adminMetrics.paidOrders} đơn đã thanh toán`} />
                  <MetricCard icon={Package} label="Món trong thực đơn" value={stats?.totalFoods || 0} detail={`${adminMetrics.hiddenFoods} món tạm ẩn`} />
                </div>

                <div className="grid gap-6 xl:grid-cols-[1.25fr_0.75fr]">
                  <Panel title="Đơn hàng mới nhất" action={<button onClick={() => setActiveTab('orders')} className="text-sm font-semibold text-slate-600 hover:text-slate-950">Xem tất cả</button>}>
                    <div className="divide-y divide-slate-100">
                      {(stats?.recentOrders || orders.slice(0, 5)).map((order) => (
                        <div key={order._id} className="flex flex-col gap-3 py-4 md:flex-row md:items-center md:justify-between">
                          <div>
                            <p className="font-semibold">{order.user?.name || 'Khách hàng'}</p>
                            <p className="text-sm text-slate-500">#{order._id.slice(-8).toUpperCase()} · {formatDate(order.createdAt)}</p>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="font-bold">{formatCurrency(order.totalAmount)}</span>
                            <StatusBadge status={order.orderStatus} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </Panel>

                  <Panel title="Cảnh báo vận hành">
                    <div className="space-y-3">
                      <OperationNotice icon={AlertCircle} title="Đơn chờ xác nhận" value={orders.filter((order) => order.orderStatus === 'pending').length} tone="amber" />
                      <OperationNotice icon={Truck} title="Đơn đang giao" value={orders.filter((order) => order.orderStatus === 'shipping').length} tone="indigo" />
                      <OperationNotice icon={Package} title="Món tạm ngừng bán" value={adminMetrics.hiddenFoods} tone="rose" />
                      <OperationNotice icon={DollarSign} title="Giá trị đơn trung bình" value={formatCurrency(adminMetrics.averageOrder)} tone="emerald" />
                    </div>
                  </Panel>
                </div>
              </section>
            )}

            {activeTab === 'orders' && (
              <Panel
                title="Quản lý đơn hàng"
                action={
                  <div className="flex flex-col sm:flex-row gap-2">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                      <input
                        type="text"
                        placeholder="Tìm tên KH hoặc mã đơn..."
                        value={orderSearchTerm}
                        onChange={(e) => setOrderSearchTerm(e.target.value)}
                        className="h-10 w-full sm:w-64 rounded-md border border-orange-100 bg-white pl-9 pr-3 text-sm outline-none focus:border-primary"
                      />
                    </div>
                    <select
                      value={statusFilter}
                      onChange={(event) => setStatusFilter(event.target.value)}
                      className="h-10 rounded-md border border-orange-100 bg-white px-3 text-sm font-semibold outline-none focus:border-primary"
                    >
                      <option value="all">Tất cả trạng thái</option>
                      {Object.entries(statusLabels).map(([value, label]) => (
                        <option key={value} value={value}>{label}</option>
                      ))}
                    </select>
                  </div>
                }
              >
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[900px] text-left text-sm">
                    <thead className="bg-orange-50 text-xs uppercase tracking-wide text-orange-600">
                      <tr>
                        <th className="px-4 py-3">Mã đơn</th>
                        <th className="px-4 py-3">Khách hàng</th>
                        <th className="px-4 py-3">Liên hệ</th>
                        <th className="px-4 py-3">Ngày đặt</th>
                        <th className="px-4 py-3">Thanh toán</th>
                        <th className="px-4 py-3">Tổng tiền</th>
                        <th className="px-4 py-3">Trạng thái</th>
                        <th className="px-4 py-3 text-right">Thao tác</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredOrders.map((order) => (
                        <tr key={order._id} className={order.orderStatus === 'cancelled' ? 'bg-rose-50/70 hover:bg-rose-50' : 'bg-white hover:bg-orange-50/60'}>
                          <td className="px-4 py-4 font-mono font-semibold">#{order._id.slice(-8).toUpperCase()}</td>
                          <td className="px-4 py-4 font-semibold">{order.user?.name || 'Khách'}</td>
                          <td className="px-4 py-4 text-slate-600">
                            <p>{order.phone}</p>
                            <p className="text-xs">{order.email}</p>
                          </td>
                          <td className="px-4 py-4 text-slate-600">{formatDate(order.createdAt)}</td>
                          <td className="px-4 py-4">
                            <span className={`rounded-md px-2 py-1 text-xs font-bold ${order.paymentStatus === 'paid' ? 'bg-orange-50 text-orange-700' : 'bg-orange-50 text-orange-600'}`}>
                              {order.paymentStatus === 'paid' ? 'Đã trả' : 'Chưa trả'}
                            </span>
                          </td>
                          <td className="px-4 py-4 font-bold">{formatCurrency(order.totalAmount)}</td>
                          <td className="px-4 py-4">
                            {order.orderStatus === 'completed' ? (
                              <span className="inline-flex h-9 items-center gap-2 rounded-md border border-green-200 bg-green-50 px-3 text-sm font-bold text-green-700">
                                <CheckCircle2 size={16} />
                                Hoàn thành
                              </span>
                            ) : order.orderStatus === 'cancelled' ? (
                              <span className="inline-flex h-9 items-center gap-2 rounded-md border border-rose-200 bg-rose-100 px-3 text-sm font-bold text-rose-700">
                                <X size={16} />
                                Đã hủy
                              </span>
                            ) : (
                              <select
                                value={order.orderStatus}
                                onChange={(event) => handleUpdateStatus(order._id, event.target.value)}
                                className="h-9 rounded-md border border-orange-100 bg-white px-2 text-sm outline-none focus:border-primary"
                              >
                                {Object.entries(statusLabels).map(([value, label]) => (
                                  <option key={value} value={value}>{label}</option>
                                ))}
                              </select>
                            )}
                          </td>
                          <td className="px-4 py-4 text-right">
                            <button onClick={() => setSelectedOrder(order)} className="inline-flex h-9 items-center gap-2 rounded-md border border-orange-200 px-3 font-semibold text-orange-700 hover:bg-orange-50">
                              <Eye size={16} />
                              Chi tiết
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Panel>
            )}
            {activeTab === 'foods' && (
              <Panel
                title="Quản lý thực đơn"
                action={
                  <div className="flex flex-col gap-2 sm:flex-row">
                    <div className="relative w-full sm:w-64">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                      <input
                        type="text"
                        placeholder="Tìm tên món..."
                        value={foodSearchTerm}
                        onChange={(e) => setFoodSearchTerm(e.target.value)}
                        className="h-10 w-full rounded-md border border-orange-100 bg-white pl-9 pr-3 text-sm outline-none focus:border-primary"
                      />
                    </div>
                    <button onClick={() => setIsCategoryModalOpen(true)} className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-orange-200 bg-white px-4 text-sm font-semibold text-orange-700 hover:bg-orange-50">
                      <Plus size={17} />
                      Thêm danh mục
                    </button>
                    <button onClick={() => openFoodForm()} className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-primary px-4 text-sm font-semibold text-white hover:bg-orange-600">
                      <Plus size={17} />
                      Thêm món
                    </button>
                  </div>
                }
              >
                <div>
                  <div className="mb-4 grid gap-3 rounded-md bg-orange-50 p-4 lg:grid-cols-[minmax(240px,360px)_minmax(150px,200px)_1fr] lg:items-end">
                    <FormField label="Xem theo danh mục">
                      <select
                        value={selectedCategory}
                        onChange={(event) => setSelectedCategory(event.target.value)}
                        className="admin-input"
                      >
                        {categorySummaries.map((category) => (
                          <option key={category._id} value={category._id}>
                            {category.name} ({category.count})
                          </option>
                        ))}
                      </select>
                    </FormField>
                    <FormField label="Trạng thái món">
                      <select
                        value={availabilityFilter}
                        onChange={(event) => setAvailabilityFilter(event.target.value)}
                        className="admin-input"
                      >
                        <option value="all">Tất cả trạng thái</option>
                        <option value="active">Đang bán</option>
                        <option value="hidden">Tạm ngừng bán</option>
                      </select>
                    </FormField>
                    <div className="flex flex-col justify-between gap-2 md:flex-row md:items-center">
                      <div>
                        <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Danh mục đang xem</p>
                        <h4 className="text-lg font-black">
                          {categorySummaries.find((category) => category._id === selectedCategory)?.name || 'Tất cả danh mục'}
                        </h4>
                      </div>
                      <div className="text-sm font-semibold text-slate-600">
                        <p>{filteredFoods.length} món phù hợp</p>
                        <p className="text-xs text-slate-500">
                          {categorySummaries.find((category) => category._id === selectedCategory)?.active || 0} đang bán · {categorySummaries.find((category) => category._id === selectedCategory)?.hidden || 0} tạm ẩn
                        </p>
                      </div>
                    </div>
                  </div>

                    {filteredFoods.length ? (
                      <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
                        {filteredFoods.map((food) => (
                          <div key={food._id} className="rounded-md border border-slate-200 bg-white p-4">
                            <div className="flex gap-4">
                              <img
                                src={food.images?.[0] || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=800&auto=format&fit=crop'}
                                alt={food.name}
                                className="h-20 w-20 rounded-md object-cover"
                              />
                              <div className="min-w-0 flex-1">
                                <div className="flex items-start justify-between gap-2">
                                  <h3 className="line-clamp-2 font-bold">{food.name}</h3>
                                  <span className={`rounded-md px-2 py-1 text-xs font-bold ${food.isAvailable !== false ? 'bg-orange-50 text-orange-700' : 'bg-rose-50 text-rose-700'}`}>
                                    {food.isAvailable !== false ? 'Đang bán' : 'Ẩn'}
                                  </span>
                                </div>
                                <p className="mt-1 text-sm text-slate-500">{food.category?.name || 'Chưa phân loại'}</p>
                                <p className="mt-2 font-bold">{formatCurrency(food.price)}</p>
                              </div>
                            </div>
                            <div className="mt-4 grid grid-cols-3 gap-2 text-sm">
                              <FoodStat label="Đã bán" value={food.soldCount || 0} />
                              <FoodStat label="Đánh giá" value={(food.ratingAverage || 0).toFixed(1)} />
                              <FoodStat label="Lượt đánh giá" value={food.ratingCount || 0} />
                            </div>
                            <div className="mt-4 flex gap-2">
                              <button onClick={() => handleToggleAvailability(food)} className={`inline-flex items-center justify-center rounded-md border px-3 py-2 text-sm font-semibold transition ${food.isAvailable !== false ? 'border-amber-200 text-amber-700 hover:bg-amber-50' : 'border-emerald-200 text-emerald-700 hover:bg-emerald-50'}`} title={food.isAvailable !== false ? 'Tạm hết món này' : 'Mở bán lại món này'}>
                                {food.isAvailable !== false ? <EyeOff size={16} /> : <Eye size={16} />}
                              </button>
                              <button onClick={() => openFoodForm(food)} className="inline-flex flex-1 items-center justify-center gap-2 rounded-md border border-slate-200 px-3 py-2 text-sm font-semibold hover:border-slate-400">
                                <Edit3 size={16} />
                                Sửa
                              </button>
                              <button onClick={() => handleDeleteFood(food._id)} className="inline-flex items-center justify-center rounded-md border border-rose-200 px-3 py-2 text-rose-600 hover:bg-rose-50" title="Xóa món">
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="rounded-md border border-dashed border-slate-300 bg-white p-8 text-center">
                        <Package className="mx-auto mb-3 text-slate-400" size={30} />
                        <p className="font-bold">Không có món nào trong danh mục này</p>
                        <p className="mt-1 text-sm text-slate-500">Thêm món mới hoặc đổi bộ lọc tìm kiếm để xem tiếp.</p>
                      </div>
                    )}
                </div>
              </Panel>
            )}

            {activeTab === 'customers' && (
              <Panel
                title="Quản lý khách hàng"
                action={
                  <div className="relative w-full sm:w-72">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={17} />
                    <input
                      value={customerNameFilter}
                      onChange={(event) => setCustomerNameFilter(event.target.value)}
                      placeholder="Lọc theo tên khách hàng..."
                      className="h-10 w-full rounded-md border border-slate-200 bg-white pl-10 pr-3 text-sm outline-none transition focus:border-slate-500"
                    />
                  </div>
                }
              >
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[860px] text-left text-sm">
                    <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                      <tr>
                        <th className="px-4 py-3">Khách hàng</th>
                        <th className="px-4 py-3">Email</th>
                        <th className="px-4 py-3">Vai trò</th>
                        <th className="px-4 py-3">Hạng thành viên</th>
                        <th className="px-4 py-3">Tổng chi tiêu</th>
                        <th className="px-4 py-3">Ngày tham gia</th>
                        <th className="px-4 py-3">Trạng thái</th>
                        <th className="px-4 py-3 text-right">Phân quyền</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredUsers.map((item) => (
                        <tr key={item._id} className="bg-white hover:bg-slate-50">
                          <td className="px-4 py-4 font-semibold">{item.name}</td>
                          <td className="px-4 py-4 text-slate-600">{item.email}</td>
                          <td className="px-4 py-4">
                            <span className="rounded-md bg-slate-100 px-2 py-1 text-xs font-bold text-slate-700">{item.role || 'user'}</span>
                          </td>
                          <td className="px-4 py-4">
                            <span className={`rounded-md px-2 py-1 text-xs font-bold ${item.tier === 'Kim Cương' ? 'bg-violet-100 text-violet-700' : item.tier === 'Vàng' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'}`}>
                              {item.tier || 'Thành viên'}
                            </span>
                          </td>
                          <td className="px-4 py-4 font-bold text-slate-700">{formatCurrency(item.totalSpent || 0)}</td>
                          <td className="px-4 py-4 text-slate-600">{formatDate(item.createdAt)}</td>
                          <td className="px-4 py-4">
                            <span className={`inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-bold ${item.isBlocked ? 'bg-rose-50 text-rose-700' : 'bg-emerald-50 text-emerald-700'}`}>
                              {item.isBlocked ? <X size={14} /> : <CheckCircle2 size={14} />}
                              {item.isBlocked ? 'Đã khóa' : 'Hoạt động'}
                            </span>
                          </td>
                          <td className="px-4 py-4 text-right">
                            {user?.email === 'thanhtinnguyen870@gmail.com' ? (
                              <div className="flex justify-end gap-2">
                                <button
                                  onClick={() => openUserForm(item)}
                                  className="inline-flex h-9 items-center justify-center gap-1.5 rounded-md border border-orange-200 px-3 font-semibold text-orange-700 hover:bg-orange-50"
                                  title="Xem và chỉnh sửa thông tin"
                                >
                                  <Edit3 size={15} />
                                  Sửa
                                </button>
                                <button
                                  onClick={() => handleToggleUserBlock(item)}
                                  className={`inline-flex h-9 items-center justify-center rounded-md border px-3 font-semibold ${item.isBlocked ? 'border-emerald-200 text-emerald-700 hover:bg-emerald-50' : 'border-rose-200 text-rose-700 hover:bg-rose-50'}`}
                                >
                                  {item.isBlocked ? 'Mở khóa' : 'Khóa'}
                                </button>
                                <button
                                  onClick={() => handlePromoteUser(item)}
                                  disabled={item.isBlocked}
                                  className="inline-flex h-9 items-center justify-center gap-2 rounded-md border border-slate-200 px-3 font-semibold text-slate-700 hover:border-slate-400 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                  Phân quyền
                                </button>
                              </div>
                            ) : (
                              <span className="text-xs text-slate-400 italic">Chỉ Super Admin</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Panel>
            )}

            {activeTab === 'revenue' && (
              <section className="space-y-6">
                {/* ── Summary cards ── */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Tổng doanh thu kỳ */}
                  <div className="rounded-md border border-orange-100 bg-white p-5 shadow-sm shadow-orange-100/60">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-md bg-orange-100 text-primary">
                        <TrendingUp size={20} />
                      </div>
                      <span className="text-xs font-bold uppercase tracking-wide text-orange-400">Theo kỳ lọc</span>
                    </div>
                    <p className="text-sm font-semibold text-orange-700">Tổng doanh thu</p>
                    <p className="mt-1 text-2xl font-black text-slate-950">
                      {formatCurrency(revenueStats.reduce((s, r) => s + r.revenue, 0))}
                    </p>
                    <p className="mt-1 text-xs text-slate-400">
                      {revenueFilterType === 'day' ? `Ngày ${revenueFilterDate}` : revenueFilterType === 'month' ? `Tháng ${revenueFilterMonth}` : `Năm ${revenueFilterYear}`}
                    </p>
                  </div>

                  {/* Tổng đơn hàng kỳ */}
                  <div className="rounded-md border border-orange-100 bg-white p-5 shadow-sm shadow-orange-100/60">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-md bg-orange-100 text-primary">
                        <ClipboardList size={20} />
                      </div>
                      <span className="text-xs font-bold uppercase tracking-wide text-orange-400">Theo kỳ lọc</span>
                    </div>
                    <p className="text-sm font-semibold text-orange-700">Tổng đơn hàng</p>
                    <p className="mt-1 text-2xl font-black text-slate-950">
                      {revenueStats.reduce((s, r) => s + r.orders, 0).toLocaleString('vi-VN')}
                    </p>
                    <p className="mt-1 text-xs text-slate-400">Đơn đã thanh toán</p>
                  </div>

                  {/* Doanh thu trung bình / đơn */}
                  <div className="rounded-md border border-orange-100 bg-white p-5 shadow-sm shadow-orange-100/60">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-md bg-orange-100 text-primary">
                        <DollarSign size={20} />
                      </div>
                      <span className="text-xs font-bold uppercase tracking-wide text-orange-400">Trung bình</span>
                    </div>
                    <p className="text-sm font-semibold text-orange-700">Doanh thu / đơn</p>
                    <p className="mt-1 text-2xl font-black text-slate-950">
                      {(() => {
                        const totalOrders = revenueStats.reduce((s, r) => s + r.orders, 0);
                        const totalRev = revenueStats.reduce((s, r) => s + r.revenue, 0);
                        return totalOrders ? formatCurrency(Math.round(totalRev / totalOrders)) : '—';
                      })()}
                    </p>
                    <p className="mt-1 text-xs text-slate-400">Giá trị đơn hàng trung bình</p>
                  </div>
                </div>

                {/* ── Detail + Top foods ── */}
                <div className="grid gap-6 xl:grid-cols-2">
                  <Panel
                    title="Thống kê doanh thu"
                    action={
                      <div className="flex items-center gap-2">
                        <select
                          value={revenueFilterType}
                          onChange={e => setRevenueFilterType(e.target.value)}
                          className="bg-slate-100 font-semibold text-slate-700 text-sm px-2 py-1 outline-none rounded-md cursor-pointer"
                        >
                          <option value="day">Theo ngày</option>
                          <option value="month">Theo tháng</option>
                          <option value="year">Theo năm</option>
                        </select>

                        {revenueFilterType === 'day' && (
                          <input
                            type="date"
                            value={revenueFilterDate}
                            onChange={e => setRevenueFilterDate(e.target.value)}
                            className="bg-orange-50 font-semibold text-orange-700 text-sm px-2 py-1 outline-none rounded-md"
                          />
                        )}

                        {revenueFilterType === 'month' && (
                          <div className="flex items-center gap-1 bg-orange-50 rounded-md px-2 py-1">
                            <select
                              value={revenueFilterMonth.split('-')[1]}
                              onChange={e => setRevenueFilterMonth(`${revenueFilterMonth.split('-')[0]}-${e.target.value.padStart(2, '0')}`)}
                              className="bg-transparent font-semibold text-orange-700 text-sm outline-none cursor-pointer"
                            >
                              {Array.from({length: 12}).map((_, i) => <option key={i+1} value={i+1}>Tháng {i+1}</option>)}
                            </select>
                            <span className="text-orange-300">/</span>
                            <select
                              value={revenueFilterMonth.split('-')[0]}
                              onChange={e => setRevenueFilterMonth(`${e.target.value}-${revenueFilterMonth.split('-')[1]}`)}
                              className="bg-transparent font-semibold text-orange-700 text-sm outline-none cursor-pointer"
                            >
                              {Array.from({length: 5}).map((_, i) => {
                                const y = new Date().getFullYear() - i;
                                return <option key={y} value={y}>{y}</option>;
                              })}
                            </select>
                          </div>
                        )}

                        {revenueFilterType === 'year' && (
                          <select
                            value={revenueFilterYear}
                            onChange={e => setRevenueFilterYear(e.target.value)}
                            className="bg-orange-50 font-semibold text-orange-700 text-sm px-2 py-1 outline-none rounded-md cursor-pointer"
                          >
                            {Array.from({length: 5}).map((_, i) => {
                              const y = new Date().getFullYear() - i;
                              return <option key={y} value={y}>Năm {y}</option>;
                            })}
                          </select>
                        )}
                      </div>
                    }
                  >
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-sm">
                        <thead className="border-b border-orange-100 bg-orange-50/50 text-slate-500">
                          <tr>
                            <th className="px-4 py-3">Thời gian</th>
                            <th className="px-4 py-3 text-center">Số đơn</th>
                            <th className="px-4 py-3 text-right">Doanh thu</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {revenueStats.length > 0 ? revenueStats.map((item) => (
                            <tr key={item.sortKey} className="hover:bg-slate-50">
                              <td className="px-4 py-4 font-semibold text-slate-700">{item.label}</td>
                              <td className="px-4 py-4 text-center text-slate-600">{item.orders}</td>
                              <td className="px-4 py-4 text-right font-bold text-orange-600">{formatCurrency(item.revenue)}</td>
                            </tr>
                          )) : (
                            <tr><td colSpan="3" className="p-4 text-center text-slate-500">Chưa có dữ liệu</td></tr>
                          )}
                        </tbody>
                        {revenueStats.length > 1 && (
                          <tfoot>
                            <tr className="border-t-2 border-orange-200 bg-orange-50/70">
                              <td className="px-4 py-3 font-black text-slate-800">Tổng cộng</td>
                              <td className="px-4 py-3 text-center font-black text-slate-800">
                                {revenueStats.reduce((s, r) => s + r.orders, 0)}
                              </td>
                              <td className="px-4 py-3 text-right font-black text-orange-700">
                                {formatCurrency(revenueStats.reduce((s, r) => s + r.revenue, 0))}
                              </td>
                            </tr>
                          </tfoot>
                        )}
                      </table>
                    </div>
                  </Panel>
                  <Panel title="Top món bán chạy nhất">
                    <div className="divide-y divide-slate-100">
                      {topSellingFoods.length > 0 ? topSellingFoods.map((food, idx) => (
                        <div key={food._id} className="flex items-center justify-between p-4 hover:bg-slate-50">
                          <div className="flex items-center gap-3">
                            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-orange-100 text-xs font-bold text-orange-700">{idx + 1}</span>
                            <div>
                              <p className="font-bold text-slate-800">{food.name}</p>
                              <p className="text-xs text-slate-500">{food.category?.name || 'Không có danh mục'}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-slate-900">{food.computedSoldCount} phần</p>
                            <p className="text-xs text-slate-500">{formatCurrency(food.price)} / phần</p>
                          </div>
                        </div>
                      )) : (
                        <p className="p-4 text-center text-slate-500">Chưa có dữ liệu</p>
                      )}
                    </div>
                  </Panel>
                </div>
              </section>
            )}
            {activeTab === 'profile' && (
              <section className="grid gap-6 xl:grid-cols-[320px_1fr]">
                <Panel title="Avatar">
                  <div className="flex flex-col items-center text-center">
                    <div className="relative mb-4 h-32 w-32 overflow-hidden rounded-full border-4 border-orange-100">
                      <img src={user?.avatar || 'https://via.placeholder.com/150'} alt="Admin avatar" className="h-full w-full object-cover" />
                      <button
                        type="button"
                        onClick={() => avatarInputRef.current?.click()}
                        className="absolute inset-0 flex items-center justify-center bg-slate-950/45 text-white opacity-0 transition hover:opacity-100"
                      >
                        {avatarUploading ? <span className="h-6 w-6 animate-spin rounded-full border-2 border-white border-t-transparent" /> : <Camera size={26} />}
                      </button>
                      <input ref={avatarInputRef} type="file" accept="image/*" onChange={handleAdminAvatarChange} className="hidden" />
                    </div>
                    <p className="font-bold text-slate-900">{user?.name}</p>
                    <p className="text-sm text-slate-500">{user?.email}</p>
                    <button
                      type="button"
                      onClick={() => avatarInputRef.current?.click()}
                      className="mt-4 rounded-md border border-orange-200 px-4 py-2 text-sm font-semibold text-orange-700 hover:bg-orange-50"
                    >
                      Đổi avatar
                    </button>
                  </div>
                </Panel>

                <div className="space-y-6">
                  <Panel title="Thông tin cá nhân">
                    <form onSubmit={handleAdminProfileUpdate} className="space-y-4">
                      <FormField label="Tên hiển thị">
                        <input
                          value={adminProfileForm.name}
                          onChange={(event) => setAdminProfileForm({ ...adminProfileForm, name: event.target.value })}
                          required
                          className="admin-input"
                        />
                      </FormField>
                      <FormField label="Email">
                        <input value={user?.email || ''} disabled className="admin-input bg-slate-50 text-slate-500" />
                      </FormField>
                      <button type="submit" className="rounded-md bg-primary px-4 py-2 font-semibold text-white hover:bg-orange-600">
                        Lưu hồ sơ
                      </button>
                    </form>
                  </Panel>

                  <Panel title="Thay đổi mật khẩu">
                    <form onSubmit={handleAdminPasswordChange} className="grid gap-4 md:grid-cols-3">
                      <FormField label="Mật khẩu hiện tại">
                        <input
                          type="password"
                          value={adminPasswordForm.currentPassword}
                          onChange={(event) => setAdminPasswordForm({ ...adminPasswordForm, currentPassword: event.target.value })}
                          required
                          className="admin-input"
                        />
                      </FormField>
                      <FormField label="Mật khẩu mới">
                        <input
                          type="password"
                          value={adminPasswordForm.newPassword}
                          onChange={(event) => setAdminPasswordForm({ ...adminPasswordForm, newPassword: event.target.value })}
                          required
                          className="admin-input"
                        />
                      </FormField>
                      <FormField label="Xác nhận mật khẩu">
                        <input
                          type="password"
                          value={adminPasswordForm.confirmPassword}
                          onChange={(event) => setAdminPasswordForm({ ...adminPasswordForm, confirmPassword: event.target.value })}
                          required
                          className="admin-input"
                        />
                      </FormField>
                      <div className="md:col-span-3">
                        <button type="submit" className="rounded-md bg-slate-950 px-4 py-2 font-semibold text-white hover:bg-slate-800">
                          Cập nhật mật khẩu
                        </button>
                      </div>
                    </form>
                  </Panel>
                </div>
              </section>
            )}

            {activeTab === 'notifications' && (
              <Panel title="Thông báo hệ thống">
                <div className="divide-y divide-slate-100">
                  {notifications.length ? notifications.map((notif) => (
                    <div 
                      key={notif._id} 
                      className={`flex items-start gap-4 p-4 transition ${!notif.isRead ? 'bg-orange-50/50' : 'bg-white'} ${getNotificationFoodId(notif) ? 'cursor-pointer hover:bg-orange-50' : ''}`}
                      onClick={() => handleOpenNotification(notif)}
                    >
                      <div className={`mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${!notif.isRead ? 'bg-primary text-white' : 'bg-slate-100 text-slate-400'}`}>
                        <Bell size={18} />
                      </div>
                      <div className="flex-1">
                        <p className={`text-sm ${!notif.isRead ? 'font-bold text-slate-900' : 'font-semibold text-slate-600'}`}>{notif.message}</p>
                        <p className="mt-1 text-xs text-slate-500">{formatDate(notif.createdAt)}</p>
                      </div>
                      {!notif.isRead && (
                        <div className="h-2 w-2 rounded-full bg-primary mt-2"></div>
                      )}
                    </div>
                  )) : (
                    <div className="p-8 text-center">
                      <Bell className="mx-auto mb-3 text-slate-400" size={30} />
                      <p className="font-bold">Chưa có thông báo nào</p>
                    </div>
                  )}
                </div>
              </Panel>
            )}
          </div>
        </main>
      </div>

      {selectedOrder && (
        <Modal title={`Chi tiết đơn #${selectedOrder._id.slice(-8).toUpperCase()}`} onClose={() => setSelectedOrder(null)}>
          <div className="space-y-5">
            <div className="grid gap-3 md:grid-cols-2">
              <Info label="Khách hàng" value={selectedOrder.user?.name || 'Khách'} />
              <Info label="Số điện thoại" value={selectedOrder.phone} />
              <Info label="Email" value={selectedOrder.email} />
              <Info label="Địa chỉ" value={selectedOrder.shippingAddress} />
              <Info label="Thanh toán" value={`${selectedOrder.paymentMethod} · ${selectedOrder.paymentStatus === 'paid' ? 'Đã trả' : 'Chưa trả'}`} />
              <Info label="Ghi chú" value={selectedOrder.note || 'Không có'} />
            </div>
            <div className="rounded-md border border-slate-200">
              <div className="border-b border-slate-200 px-4 py-3 font-bold">Món đã đặt</div>
              <div className="divide-y divide-slate-100">
                {selectedOrder.items?.map((item) => (
                  <div key={`${item.food}-${item.name}`} className="flex items-center justify-between gap-4 p-4">
                    <div className="flex items-center gap-3">
                      {item.image && <img src={item.image} alt={item.name} className="h-12 w-12 rounded-md object-cover" />}
                      <div>
                        <p className="font-semibold">{item.name}</p>
                        <p className="text-sm text-slate-500">Số lượng: {item.quantity}</p>
                      </div>
                    </div>
                    <p className="font-bold">{formatCurrency(item.price * item.quantity)}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex items-center justify-between rounded-md bg-slate-50 p-4">
              <span className="font-bold">Tổng cộng</span>
              <span className="text-xl font-black">{formatCurrency(selectedOrder.totalAmount)}</span>
            </div>
          </div>
        </Modal>
      )}

      {isCategoryModalOpen && (
        <Modal title="Thêm danh mục" onClose={() => setIsCategoryModalOpen(false)}>
          <form onSubmit={handleCreateCategory} className="space-y-4">
            <FormField label="Tên danh mục">
              <input
                value={categoryForm.name}
                onChange={(event) => setCategoryForm({ ...categoryForm, name: event.target.value })}
                required
                className="admin-input"
                placeholder="Ví dụ: Cơm healthy, Salad, Nước ép"
              />
            </FormField>
            <FormField label="Mô tả">
              <textarea
                value={categoryForm.description}
                onChange={(event) => setCategoryForm({ ...categoryForm, description: event.target.value })}
                rows="4"
                className="admin-input resize-none"
                placeholder="Mô tả ngắn để nội bộ dễ phân loại thực đơn"
              />
            </FormField>
            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsCategoryModalOpen(false)}
                className="rounded-md border border-slate-200 px-4 py-2 font-semibold text-slate-700 hover:border-slate-400"
              >
                Hủy
              </button>
              <button type="submit" disabled={saving} className="rounded-md bg-primary px-4 py-2 font-semibold text-white hover:bg-orange-600 disabled:opacity-60">
                {saving ? 'Đang lưu...' : 'Thêm danh mục'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {editingFood !== null && (
        <Modal title={editingFood?._id ? 'Cập nhật món ăn' : 'Thêm món ăn'} onClose={closeFoodForm}>
          <form onSubmit={handleSaveFood} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <FormField label="Tên món">
                <input value={foodForm.name} onChange={(event) => setFoodForm({ ...foodForm, name: event.target.value })} required className="admin-input" />
              </FormField>
              <FormField label="Danh mục">
                <select value={foodForm.category} onChange={(event) => setFoodForm({ ...foodForm, category: event.target.value })} required className="admin-input">
                  <option value="">Chọn danh mục</option>
                  {categories.map((category) => (
                    <option key={category._id} value={category._id}>{category.name}</option>
                  ))}
                </select>
              </FormField>
              <FormField label="Giá bán">
                <input type="number" min="0" value={foodForm.price} onChange={(event) => setFoodForm({ ...foodForm, price: event.target.value })} required className="admin-input" />
              </FormField>
            </div>
            <FormField label="Link ảnh">
              <input value={foodForm.image} onChange={(event) => setFoodForm({ ...foodForm, image: event.target.value })} className="admin-input" />
            </FormField>
            <FormField label="Mô tả">
              <textarea value={foodForm.description} onChange={(event) => setFoodForm({ ...foodForm, description: event.target.value })} rows="4" className="admin-input resize-none" />
            </FormField>
            <div className="grid gap-3 md:grid-cols-2">
              <Toggle label="Đang bán" checked={foodForm.isAvailable} onChange={(checked) => setFoodForm({ ...foodForm, isAvailable: checked })} />
              <Toggle label="Món chay" checked={foodForm.isVegetarian} onChange={(checked) => setFoodForm({ ...foodForm, isVegetarian: checked })} />
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={closeFoodForm} className="rounded-md border border-slate-200 px-4 py-2 font-semibold text-slate-700 hover:border-slate-400">
                Hủy
              </button>
              <button type="submit" disabled={saving} className="rounded-md bg-primary px-4 py-2 font-semibold text-white hover:bg-orange-600 disabled:opacity-60">
                {saving ? 'Đang lưu...' : 'Lưu món ăn'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {editingUser && (
        <Modal title={`Chỉnh sửa thông tin: ${editingUser.name}`} onClose={closeUserForm}>
          {/* Bước 4: Hiển thị thông tin chi tiết người dùng */}
          <div className="mb-5 grid gap-3 md:grid-cols-2">
            <Info label="Email" value={editingUser.email} />
            <Info label="Ngày tham gia" value={formatDate(editingUser.createdAt)} />
            <Info label="Hạng thành viên" value={editingUser.tier || 'Thành viên'} />
            <Info label="Tổng chi tiêu" value={formatCurrency(editingUser.totalSpent || 0)} />
          </div>
          {/* Bước 5: Thực hiện thao tác cập nhật thông tin */}
          <form onSubmit={handleUpdateUserInfo} className="space-y-4">
            <FormField label="Tên người dùng *">
              <input
                value={userForm.name}
                onChange={(e) => setUserForm({ ...userForm, name: e.target.value })}
                required
                minLength={2}
                className="admin-input"
                placeholder="Nhập tên người dùng"
              />
            </FormField>
            <div className="grid gap-4 md:grid-cols-2">
              <FormField label="Số điện thoại">
                <input
                  value={userForm.phone}
                  onChange={(e) => setUserForm({ ...userForm, phone: e.target.value })}
                  className="admin-input"
                  placeholder="10-11 chữ số"
                  maxLength={11}
                />
              </FormField>
              <FormField label="Địa chỉ">
                <input
                  value={userForm.address}
                  onChange={(e) => setUserForm({ ...userForm, address: e.target.value })}
                  className="admin-input"
                  placeholder="Địa chỉ người dùng"
                />
              </FormField>
            </div>
            {/* Bước 6.2: Hiển thị thông báo lỗi nếu dữ liệu không hợp lệ */}
            {userFormError && (
              <div className="flex items-center gap-2 rounded-md border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
                <AlertCircle size={16} />
                {userFormError}
              </div>
            )}
            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={closeUserForm}
                className="rounded-md border border-slate-200 px-4 py-2 font-semibold text-slate-700 hover:border-slate-400"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={saving}
                className="rounded-md bg-primary px-4 py-2 font-semibold text-white hover:bg-orange-600 disabled:opacity-60"
              >
                {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

const MetricCard = ({ icon: Icon, label, value, detail }) => (
  <div className="rounded-md border border-orange-100 bg-white p-5 shadow-sm shadow-orange-100/60">
    <div className="mb-4 flex items-center justify-between">
      <div className="flex h-10 w-10 items-center justify-center rounded-md bg-orange-100 text-primary">
        <Icon size={20} />
      </div>
      <span className="text-xs font-bold uppercase tracking-wide text-orange-400">Cập nhật</span>
    </div>
    <p className="text-sm font-semibold text-orange-700">{label}</p>
    <p className="mt-1 text-2xl font-black text-slate-950">{value}</p>
    <div className="mt-2 text-sm text-slate-500">{detail}</div>
  </div>
);

const Panel = ({ title, action, children }) => (
  <section className="rounded-md border border-orange-100 bg-white shadow-sm shadow-orange-100/50">
    <div className="flex flex-col gap-3 border-b border-orange-100 bg-orange-50/50 px-5 py-4 md:flex-row md:items-center md:justify-between">
      <h3 className="text-lg font-bold text-slate-950">{title}</h3>
      {action}
    </div>
    <div className="p-5">{children}</div>
  </section>
);

const StatusBadge = ({ status }) => (
  <span className={`rounded-md border px-2 py-1 text-xs font-bold ${statusStyles[status] || 'border-slate-200 bg-slate-50 text-slate-700'}`}>
    {statusLabels[status] || status}
  </span>
);

const OperationNotice = ({ icon: Icon, title, value, tone }) => {
  const tones = {
    amber: 'bg-amber-50 text-amber-700',
    indigo: 'bg-orange-50 text-orange-700',
    rose: 'bg-rose-50 text-rose-700',
    emerald: 'bg-orange-100 text-orange-800',
  };

  return (
    <div className="flex items-center justify-between rounded-md border border-orange-100 p-4">
      <div className="flex items-center gap-3">
        <div className={`flex h-10 w-10 items-center justify-center rounded-md ${tones[tone]}`}>
          <Icon size={19} />
        </div>
        <p className="font-semibold">{title}</p>
      </div>
      <p className="font-black">{value}</p>
    </div>
  );
};

const FoodStat = ({ label, value }) => (
  <div className="rounded-md bg-slate-50 p-2 text-center">
    <p className="text-xs font-semibold text-slate-500">{label}</p>
    <p className="font-black">{value}</p>
  </div>
);

const Modal = ({ title, onClose, children }) => (
  <div className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-950/60 p-4">
    <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-md bg-white shadow-2xl">
      <div className="sticky top-0 flex items-center justify-between border-b border-slate-200 bg-white px-5 py-4">
        <h3 className="text-lg font-bold">{title}</h3>
        <button onClick={onClose} className="rounded-md p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900">
          <X size={20} />
        </button>
      </div>
      <div className="p-5">{children}</div>
    </div>
  </div>
);

const Info = ({ label, value }) => (
  <div className="rounded-md bg-slate-50 p-3">
    <p className="text-xs font-bold uppercase tracking-wide text-slate-500">{label}</p>
    <p className="mt-1 font-semibold">{value}</p>
  </div>
);

const FormField = ({ label, children }) => (
  <label className="block">
    <span className="mb-2 block text-sm font-bold text-slate-700">{label}</span>
    {children}
  </label>
);

const Toggle = ({ label, checked, onChange }) => (
  <label className="flex items-center justify-between rounded-md border border-slate-200 p-3 font-semibold">
    {label}
    <input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} className="h-5 w-5 accent-slate-950" />
  </label>
);

export default AdminDashboard;
