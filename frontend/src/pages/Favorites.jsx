import { useEffect, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { Heart, ShoppingCart, Trash2, UtensilsCrossed } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useFavorite } from '../context/FavoriteContext';
import { useCart } from '../context/CartContext';
import axiosClient from '../api/axiosClient';

const Favorites = () => {
  const { user } = useAuth();
  const { favoriteIds, removeFavorite } = useFavorite();
  const { addToCart } = useCart();
  const [foods, setFoods] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const fetchFavorites = async () => {
      setLoading(true);
      try {
        const { data } = await axiosClient.get('/auth/favorites');
        setFoods(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchFavorites();
  }, [user]);

  // Derive displayed foods from the fetched foods and the favoriteIds Set
  const displayedFoods = foods.filter((f) => favoriteIds.has(f._id));

  if (!user) return <Navigate to="/login" replace />;

  return (
    <div className="container mx-auto px-4 md:px-12 py-10 min-h-[70vh]">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 bg-red-50 rounded-2xl flex items-center justify-center">
          <Heart size={24} className="text-red-500" fill="currentColor" />
        </div>
        <div>
          <h1 className="text-3xl font-extrabold text-dark">
            Món ăn yêu thích
          </h1>
          <p className="text-gray-500 text-sm mt-0.5">
            {displayedFoods.length > 0 ? `${displayedFoods.length} món đã lưu` : 'Chưa có món nào được lưu'}
          </p>
        </div>
      </div>

      {/* Loading */}
      {loading ? (
        <div className="flex justify-center items-center py-24">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary" />
        </div>
      ) : displayedFoods.length === 0 ? (
        /* Empty state */
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-24 h-24 bg-red-50 rounded-full flex items-center justify-center mb-6">
            <UtensilsCrossed size={40} className="text-red-300" />
          </div>
          <h2 className="text-2xl font-bold text-dark mb-2">Chưa có món yêu thích</h2>
          <p className="text-gray-500 mb-8 max-w-md">
            Hãy khám phá thực đơn và nhấn vào biểu tượng ❤️ để lưu những món ăn bạn thích nhất!
          </p>
          <Link
            to="/foods"
            className="bg-primary text-white px-8 py-3 rounded-xl font-bold hover:bg-orange-600 transition-colors shadow-lg"
          >
            Khám phá thực đơn
          </Link>
        </div>
      ) : (
        /* Foods Grid */
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {displayedFoods.map((food) => (
            <div
              key={food._id}
              className="bg-white rounded-3xl overflow-hidden shadow-lg border border-gray-50 flex flex-col hover:-translate-y-1 transition-transform duration-300"
            >
              {/* Image */}
              <Link to={`/food/${food._id}`} className="block relative h-52 overflow-hidden">
                <img
                  src={food.images?.[0]}
                  onError={(e) => { e.target.onerror = null; e.target.src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=800&auto=format&fit=crop'; }}
                  alt={food.name}
                  className="w-full h-full object-cover hover:scale-110 transition-transform duration-700"
                />
                {/* Remove button */}
                <button
                  onClick={(e) => { e.preventDefault(); removeFavorite(food); }}
                  className="absolute top-3 right-3 w-9 h-9 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center text-red-500 hover:bg-red-50 transition-colors shadow-sm"
                  title="Xóa khỏi yêu thích"
                >
                  <Trash2 size={15} />
                </button>
                {/* Health tag */}
                {food.healthTags?.[0] && (
                  <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-healthy shadow-sm">
                    🌿 {food.healthTags[0]}
                  </div>
                )}
              </Link>

              {/* Info */}
              <div className="p-5 flex flex-col flex-1">
                <Link to={`/food/${food._id}`}>
                  <h3 className="font-bold text-lg mb-1 hover:text-primary transition-colors line-clamp-1">
                    {food.name}
                  </h3>
                </Link>
                <p className="text-gray-500 text-sm mb-3 line-clamp-2 flex-1">{food.description}</p>

                {/* Nutrition quick view */}
                {food.nutrition?.calories && (
                  <div className="flex gap-2 mb-3 text-xs text-gray-500">
                    <span className="bg-orange-50 text-orange-600 px-2 py-0.5 rounded-full font-semibold">
                      🔥 {food.nutrition.calories} kcal
                    </span>
                    {food.nutrition?.protein && (
                      <span className="bg-red-50 text-red-600 px-2 py-0.5 rounded-full font-semibold">
                        💪 {food.nutrition.protein}g protein
                      </span>
                    )}
                  </div>
                )}

                <div className="flex items-center justify-between mt-auto">
                  <span className="font-extrabold text-lg text-primary">
                    {food.price?.toLocaleString('vi-VN')}đ
                  </span>
                  <button
                    onClick={() => addToCart(food)}
                    className="w-10 h-10 bg-dark text-white rounded-full flex items-center justify-center hover:bg-primary transition-colors"
                    title="Thêm vào giỏ hàng"
                  >
                    <ShoppingCart size={17} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Favorites;
