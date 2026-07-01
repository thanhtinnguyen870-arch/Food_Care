import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import axiosClient from '../api/axiosClient';
import { Search, ShoppingCart, X, Heart } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useFavorite } from '../context/FavoriteContext';

const Foods = () => {
  const { user } = useAuth();
  const { addFavorite, isFavorited } = useFavorite();
  const [searchParams, setSearchParams] = useSearchParams();
  const categorySlugParam = searchParams.get('category');
  const keywordParam = searchParams.get('keyword') || '';
  const [foods, setFoods] = useState([]);
  const [categories, setCategories] = useState([]);
  const [categoriesLoaded, setCategoriesLoaded] = useState(false);
  const [searchTerm, setSearchTerm] = useState(keywordParam);
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(keywordParam);
  const [loading, setLoading] = useState(true);
  const [isSwitchingCategory, setIsSwitchingCategory] = useState(false);
  const { addToCart } = useCart();

  const selectedCategory = categories.find((cat) => cat.slug === categorySlugParam)?._id || '';
  const selectedCategorySlug = categorySlugParam || '';
  const returnToFoodsParams = new URLSearchParams();
  if (selectedCategorySlug) returnToFoodsParams.set('category', selectedCategorySlug);
  if (debouncedSearchTerm.trim()) returnToFoodsParams.set('keyword', debouncedSearchTerm.trim());
  const returnToFoodsQuery = returnToFoodsParams.toString();
  const returnToFoods = returnToFoodsQuery ? `/foods?${returnToFoodsQuery}` : '/foods';

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data } = await axiosClient.get('/categories');
        setCategories(data);
      } catch (error) {
        console.error(error);
      } finally {
        setCategoriesLoaded(true);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setSearchTerm(keywordParam);
      setDebouncedSearchTerm(keywordParam);
    }, 0);
    return () => clearTimeout(timeoutId);
  }, [keywordParam]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      const trimmedKeyword = searchTerm.trim();
      setDebouncedSearchTerm(trimmedKeyword);

      const nextParams = {};
      if (categorySlugParam) nextParams.category = categorySlugParam;
      if (trimmedKeyword) nextParams.keyword = trimmedKeyword;
      setSearchParams(nextParams, { replace: true });
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [categorySlugParam, searchTerm, setSearchParams]);

  useEffect(() => {
    if (!categoriesLoaded) return undefined;

    if (categorySlugParam) {
      const categoryFromUrl = categories.find(c => c.slug === categorySlugParam);
      if (categoryFromUrl && selectedCategory !== categoryFromUrl._id) return undefined;
    }

    let ignoreRequest = false;

    const fetchFoods = async () => {
      const hasExistingFoods = foods.length > 0;
      setLoading(!hasExistingFoods);
      setIsSwitchingCategory(hasExistingFoods);
      try {
        const params = new URLSearchParams();
        if (selectedCategory) params.set('category', selectedCategory);
        if (debouncedSearchTerm.trim()) params.set('keyword', debouncedSearchTerm.trim());
        const query = params.toString();
        const { data } = await axiosClient.get(query ? `/foods?${query}` : '/foods');
        if (!ignoreRequest) setFoods(data);
      } catch (error) {
        if (!ignoreRequest) console.error(error);
      } finally {
        if (!ignoreRequest) {
          setLoading(false);
          setIsSwitchingCategory(false);
        }
      }
    };
    fetchFoods();

    return () => {
      ignoreRequest = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categories, categoriesLoaded, categorySlugParam, debouncedSearchTerm, selectedCategory]);

  return (
    <div className="container mx-auto px-4 md:px-12 py-10">
      <h1 className="text-4xl font-bold mb-8 text-center">Khám Phá <span className="text-primary">Thực Đơn</span></h1>
      
      {/* Categories Filter */}
      <div className="mx-auto mb-8 max-w-xl">
        <div className="relative">
          <Search className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Tìm món ăn..."
            className="h-13 w-full rounded-full border border-orange-100 bg-white pl-12 pr-12 text-base font-medium text-dark shadow-sm outline-none transition-all duration-300 focus:border-primary focus:shadow-float"
          />
          {searchTerm && (
            <button
              type="button"
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full text-gray-400 transition-colors hover:bg-orange-50 hover:text-primary"
              aria-label="Xóa tìm kiếm"
            >
              <X size={18} />
            </button>
          )}
        </div>
      </div>

      <div className="flex flex-wrap justify-center gap-3 mb-12">
        <button 
          onClick={() => {
            const nextParams = {};
            if (debouncedSearchTerm.trim()) nextParams.keyword = debouncedSearchTerm.trim();
            setSearchParams(nextParams);
          }}
          className={`px-5 py-2 rounded-full font-medium shadow-sm transition-all duration-300 ease-out hover:-translate-y-0.5 active:scale-95 ${selectedCategory === '' ? 'bg-primary text-white shadow-float scale-105' : 'bg-white text-gray-700 hover:bg-gray-100 hover:shadow-md'}`}
        >
          Tất cả
        </button>
        {categories.map((cat) => (
          <button 
            key={cat._id}
            onClick={() => {
              const nextParams = { category: cat.slug };
              if (debouncedSearchTerm.trim()) nextParams.keyword = debouncedSearchTerm.trim();
              setSearchParams(nextParams);
            }}
            className={`px-5 py-2 rounded-full font-medium shadow-sm transition-all duration-300 ease-out hover:-translate-y-0.5 active:scale-95 ${selectedCategory === cat._id ? 'bg-primary text-white shadow-float scale-105' : 'bg-white text-gray-700 hover:bg-gray-100 hover:shadow-md'}`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Foods Grid */}
      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : (
        <div className="relative min-h-[520px]">
          {isSwitchingCategory && (
            <div className="absolute right-0 top-0 z-10 rounded-full border border-orange-100 bg-white/90 px-4 py-2 text-sm font-semibold text-primary shadow-sm backdrop-blur">
              Đang cập nhật...
            </div>
          )}
          <div
            key={selectedCategory || 'all'}
            className={`grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 transition-all duration-300 ease-out ${
              isSwitchingCategory ? 'opacity-55 scale-[0.99]' : 'opacity-100 scale-100 animate-menu-fade'
            }`}
          >
          {foods.map((food, index) => (
            <div
              key={food._id}
              className="bg-white rounded-3xl overflow-hidden shadow-lg card-3d border border-gray-50 flex flex-col animate-menu-card"
              style={{ animationDelay: `${Math.min(index * 35, 210)}ms` }}
            >
              <Link to={`/food/${food._id}`} state={{ from: returnToFoods }} className="block relative h-56 overflow-hidden">
                <img src={food.images[0]} onError={(e) => { e.target.onerror = null; e.target.src="https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=800&auto=format&fit=crop"; }} 
                  alt={food.name} 
                  className="w-full h-full object-cover transition-transform duration-700 hover:scale-110"
                />
                {food.healthTags && food.healthTags.length > 0 && (
                  <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-healthy shadow-sm">
                    {food.healthTags[0]}
                  </div>
                )}
              </Link>
              <div className="p-5 flex flex-col flex-1">
                <Link to={`/food/${food._id}`} state={{ from: returnToFoods }}>
                  <h3 className="font-bold text-xl mb-1 hover:text-primary transition-colors line-clamp-1">{food.name}</h3>
                </Link>
                <p className="text-gray-500 text-sm mb-2 line-clamp-2 flex-1">{food.description}</p>

                {/* Rating */}
                {food.ratingAverage > 0 && (
                  <div className="flex items-center gap-1.5 mb-3">
                    <div className="flex items-center">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <svg key={star} className={`w-3.5 h-3.5 ${star <= Math.round(food.ratingAverage) ? 'text-amber-400' : 'text-gray-200'}`} fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                    <span className="text-xs text-gray-500 font-medium">
                      {food.ratingAverage.toFixed(1)} ({food.ratingCount || 0})
                    </span>
                  </div>
                )}

                <div className="flex justify-between items-center mt-auto">
                  <span className="font-extrabold text-lg text-primary">{food.price.toLocaleString()}đ</span>
                  <div className="flex items-center gap-2">
                    {user && user.role !== 'admin' && (
                      <button
                        onClick={(e) => { e.preventDefault(); addFavorite(food); }}
                        className={`w-10 h-10 rounded-full flex items-center justify-center transition-all border ${
                          isFavorited(food._id)
                            ? 'bg-red-50 border-red-200 text-red-500 hover:bg-red-100'
                            : 'bg-gray-50 border-gray-200 text-gray-400 hover:bg-red-50 hover:text-red-400 hover:border-red-200'
                        }`}
                        title={isFavorited(food._id) ? 'Xóa khỏi yêu thích' : 'Thêm vào yêu thích'}
                      >
                        <Heart size={17} fill={isFavorited(food._id) ? 'currentColor' : 'none'} />
                      </button>
                    )}
                    {user?.role !== 'admin' && (
                      <button
                        onClick={() => addToCart(food)}
                        className="w-10 h-10 bg-dark text-white rounded-full flex items-center justify-center hover:bg-primary transition-colors"
                      >
                        <ShoppingCart size={18} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Foods;
