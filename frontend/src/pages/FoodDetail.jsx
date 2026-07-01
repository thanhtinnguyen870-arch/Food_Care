import { useState, useEffect } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import axiosClient from '../api/axiosClient';
import { ShoppingCart, Bot, ArrowLeft, Star, MessageSquare, Flame, Beef, Wheat, Droplets, AlertTriangle, CheckCircle2, Heart } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useFavorite } from '../context/FavoriteContext';
import { toast } from 'react-toastify';

const FoodDetail = () => {
  const { id } = useParams();
  const location = useLocation();
  const [food, setFood] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [reviewLoading, setReviewLoading] = useState(false);
  const [replyContent, setReplyContent] = useState({});
  const [canReview, setCanReview] = useState(false);
  const [cantReviewMessage, setCantReviewMessage] = useState('');
  const [draftReviewId, setDraftReviewId] = useState(null);
  const [hoverRating, setHoverRating] = useState(0);
  const [selectedImage, setSelectedImage] = useState(null);
  const { addToCart } = useCart();
  const { user } = useAuth();
  const { addFavorite, isFavorited } = useFavorite();

  useEffect(() => {
    const fetchFoodAndReviews = async () => {
      try {
        const [foodRes, reviewsRes] = await Promise.all([
          axiosClient.get(`/foods/${id}`),
          axiosClient.get(`/foods/${id}/reviews`)
        ]);
        setFood(foodRes.data);
        setReviews(reviewsRes.data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchFoodAndReviews();
  }, [id]);

  useEffect(() => {
    if (user && user.role !== 'admin') {
      const checkReviewEligibility = async () => {
        try {
          const res = await axiosClient.get(`/foods/${id}/can-review`);
          setCanReview(res.data.canReview);
          setCantReviewMessage(res.data.message || '');
        } catch (error) {
          console.error('Error checking review eligibility:', error);
        }
      };
      checkReviewEligibility();
    }
  }, [id, user]);

  const submitStarRating = async (star) => {
    setRating(star);
    try {
      if (draftReviewId) {
        await axiosClient.put(`/foods/${id}/reviews/${draftReviewId}`, { rating: star });
      } else {
        const res = await axiosClient.post(`/foods/${id}/reviews`, { rating: star, comment: '' });
        setDraftReviewId(res.data.reviewId);
      }
      const [reviewsRes] = await Promise.all([
        axiosClient.get(`/foods/${id}/reviews`),
        axiosClient.get(`/foods/${id}/can-review`)
      ]);
      setReviews(reviewsRes.data);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Lỗi khi gửi đánh giá');
    }
  };

  const submitReviewHandler = async (e) => {
    e.preventDefault();
    if (!comment.trim()) return;
    setReviewLoading(true);
    try {
      if (draftReviewId) {
        await axiosClient.put(`/foods/${id}/reviews/${draftReviewId}`, { rating, comment });
      } else {
        await axiosClient.post(`/foods/${id}/reviews`, { rating, comment });
      }
      toast.success('Cảm ơn bạn đã đánh giá! 🌟');
      setComment('');
      setDraftReviewId(null);
      const [reviewsRes, canReviewRes] = await Promise.all([
        axiosClient.get(`/foods/${id}/reviews`),
        axiosClient.get(`/foods/${id}/can-review`)
      ]);
      setReviews(reviewsRes.data);
      setCanReview(canReviewRes.data.canReview);
      setCantReviewMessage(canReviewRes.data.message || '');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Lỗi khi gửi bình luận');
    } finally {
      setReviewLoading(false);
    }
  };

  const submitReplyHandler = async (reviewId) => {
    const text = replyContent[reviewId];
    if (!text || !text.trim()) return;
    try {
      await axiosClient.put(`/foods/${id}/reviews/${reviewId}/reply`, { reply: text });
      toast.success('Đã gửi câu trả lời!');
      setReplyContent(prev => ({ ...prev, [reviewId]: '' }));
      const reviewsRes = await axiosClient.get(`/foods/${id}/reviews`);
      setReviews(reviewsRes.data);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Lỗi khi gửi câu trả lời');
    }
  };

  if (loading) return (
    <div className="flex justify-center items-center min-h-[60vh]">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary" />
    </div>
  );
  if (!food) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-gray-500">
      <span className="text-6xl mb-4">🍽️</span>
      <p className="text-xl font-semibold">Không tìm thấy món ăn</p>
    </div>
  );

  const backToFoods = location.state?.from || (food.category?.slug ? `/foods?category=${food.category.slug}` : '/foods');
  const ratingLabels = { 1: 'Tệ', 2: 'Tạm được', 3: 'Tốt', 4: 'Rất tốt', 5: 'Tuyệt vời ⭐' };
  const nutritionItems = [
    { icon: <Flame size={18} className="text-orange-500" />, label: 'Calo', value: food.nutrition?.calories, unit: 'kcal' },
    { icon: <Beef size={18} className="text-red-400" />, label: 'Protein', value: food.nutrition?.protein, unit: 'g' },
    { icon: <Wheat size={18} className="text-amber-500" />, label: 'Carb', value: food.nutrition?.carbs, unit: 'g' },
    { icon: <Droplets size={18} className="text-blue-400" />, label: 'Fat', value: food.nutrition?.fat, unit: 'g' },
  ];

  return (
    <div className="container mx-auto px-4 md:px-12 py-10">
      {/* Back button */}
      <Link
        to={backToFoods}
        className="inline-flex items-center gap-2 bg-white border border-gray-200 text-gray-700 hover:bg-primary hover:text-white hover:border-primary px-5 py-2.5 rounded-full font-semibold mb-8 transition-all shadow-sm group"
      >
        <ArrowLeft size={18} className="transition-transform group-hover:-translate-x-1" />
        Quay lại thực đơn
      </Link>

      {/* Main Card */}
      <div className="bg-white rounded-3xl shadow-xl overflow-hidden flex flex-col md:flex-row">
        {/* Image */}
        <div className="md:w-1/2 flex flex-col">
          <div className="h-[380px] md:h-[450px] relative overflow-hidden">
            <img
              src={selectedImage || food.images[0]}
              onError={(e) => { e.target.onerror = null; e.target.src = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=800&auto=format&fit=crop"; }}
              alt={food.name}
              className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
            />
            {/* Health tags */}
            <div className="absolute top-4 left-4 flex flex-wrap gap-2">
              {food.healthTags?.map((tag, idx) => (
                <span key={idx} className="bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-full font-bold text-xs text-healthy shadow-sm">
                  🌿 {tag}
                </span>
              ))}
            </div>
            {/* Gradient overlay bottom */}
            <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-black/20 to-transparent md:hidden" />
          </div>
          {/* Thumbnails */}
          {food.images?.length > 1 && (
            <div className="flex gap-2 p-4 bg-gray-50 overflow-x-auto">
              {food.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(img)}
                  className={`relative w-20 h-20 flex-shrink-0 rounded-xl overflow-hidden border-2 transition-all ${
                    (selectedImage || food.images[0]) === img ? 'border-primary shadow-md' : 'border-transparent hover:border-orange-300'
                  }`}
                >
                  <img src={img} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Details */}
        <div className="md:w-1/2 p-8 md:p-10 flex flex-col">
          <span className="inline-block text-xs font-bold text-primary uppercase tracking-widest bg-orange-50 px-3 py-1 rounded-full mb-3 self-start">
            {food.category?.name}
          </span>
          <h1 className="text-3xl md:text-4xl font-extrabold text-dark mb-3 leading-tight">{food.name}</h1>

          {/* Rating summary */}
          {food.ratingAverage > 0 && (
            <div className="flex items-center gap-2 mb-4">
              <div className="flex items-center gap-0.5">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star key={s} size={16} fill={s <= Math.round(food.ratingAverage) ? '#FBBF24' : 'none'} stroke={s <= Math.round(food.ratingAverage) ? '#FBBF24' : '#D1D5DB'} />
                ))}
              </div>
              <span className="font-bold text-sm text-gray-700">{food.ratingAverage?.toFixed(1)}</span>
              <span className="text-sm text-gray-400">({food.ratingCount || 0} đánh giá)</span>
            </div>
          )}

          <p className="text-3xl font-black text-primary mb-5">{food.price.toLocaleString('vi-VN')}đ</p>
          <p className="text-gray-600 mb-6 leading-relaxed">{food.description}</p>

          {/* Nutrition Grid */}
          <div className="grid grid-cols-4 gap-3 mb-6">
            {nutritionItems.map((item) => (
              <div key={item.label} className="bg-gradient-to-b from-gray-50 to-white border border-gray-100 rounded-2xl p-3 text-center shadow-sm">
                <div className="flex justify-center mb-1">{item.icon}</div>
                <p className="font-black text-base text-dark">{item.value}<span className="text-xs font-normal text-gray-400 ml-0.5">{item.unit}</span></p>
                <p className="text-xs text-gray-500 mt-0.5">{item.label}</p>
              </div>
            ))}
          </div>

          {/* Info tags */}
          <div className="space-y-3 mb-6">
            <div className="flex items-start gap-2 text-sm">
              <CheckCircle2 size={16} className="text-healthy flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-gray-700">Thành phần: </span>
                <span className="text-gray-500">{food.ingredients.join(', ')}</span>
              </div>
            </div>
            <div className="flex items-start gap-2 text-sm">
              <CheckCircle2 size={16} className="text-blue-500 flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-gray-700">Phù hợp cho: </span>
                <span className="text-gray-500">{food.suitableFor.join(', ')}</span>
              </div>
            </div>
            {food.warningFor?.length > 0 && (
              <div className="flex items-start gap-2 text-sm bg-red-50 p-3 rounded-xl border border-red-100">
                <AlertTriangle size={16} className="text-red-500 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-red-600">Lưu ý: </span>
                  <span className="text-red-500">{food.warningFor.join(', ')}</span>
                </div>
              </div>
            )}
          </div>

          {/* CTAs */}
          {user?.role !== 'admin' && (
            <div className="mt-auto flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => addToCart(food)}
                className="flex-1 bg-primary text-white py-3.5 rounded-xl font-bold shadow-lg flex items-center justify-center gap-2 hover:bg-orange-600 hover:-translate-y-0.5 transition-all"
              >
                <ShoppingCart size={20} /> Thêm vào giỏ
              </button>
              <button
                onClick={() => addFavorite(food)}
                className={`py-3.5 px-5 rounded-xl font-bold border-2 flex items-center justify-center gap-2 transition-all hover:-translate-y-0.5 ${
                  isFavorited(food._id)
                    ? 'bg-red-50 border-red-300 text-red-500 hover:bg-red-100'
                    : 'bg-white border-gray-200 text-gray-500 hover:border-red-300 hover:text-red-400'
                }`}
                title={isFavorited(food._id) ? 'Xóa khỏi yêu thích' : 'Thêm vào yêu thích'}
              >
                <Heart size={20} fill={isFavorited(food._id) ? 'currentColor' : 'none'} />
                {isFavorited(food._id) ? 'Đã yêu thích' : 'Yêu thích'}
              </button>
              <Link
                to={`/ai-recommend?ask=${encodeURIComponent('Món ' + food.name + ' có phù hợp với tôi không?')}`}
                className="flex-1 bg-white text-dark border-2 border-gray-200 py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 hover:border-primary hover:text-primary transition-all"
              >
                <Bot size={20} /> Tư vấn món này
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Reviews Section */}
      <div className="mt-10 bg-white rounded-3xl shadow-xl p-8 md:p-10">
        <h2 className="text-2xl font-bold mb-8 flex items-center gap-2">
          <MessageSquare className="text-primary" />
          Đánh giá của khách hàng
          <span className="ml-1 bg-primary/10 text-primary text-sm font-semibold px-2.5 py-0.5 rounded-full">
            {food.ratingCount || 0}
          </span>
        </h2>

        {reviews.length === 0 ? (
          <div className="text-center py-10 text-gray-400">
            <MessageSquare size={40} className="mx-auto mb-3 opacity-30" />
            <p>Chưa có đánh giá nào. Hãy là người đầu tiên!</p>
          </div>
        ) : (
          <div className="space-y-5 mb-8">
            {reviews.map((rv) => (
              <div key={rv._id} className="bg-gray-50 rounded-2xl p-5 border border-gray-100">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-primary to-orange-400 rounded-full flex items-center justify-center font-bold text-white text-sm uppercase shadow">
                    {rv.user?.name ? rv.user.name.charAt(0) : 'U'}
                  </div>
                  <div className="flex-1">
                    <h5 className="font-bold text-dark text-sm">{rv.user?.name || 'Người dùng'}</h5>
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} size={13} fill={i < rv.rating ? '#FBBF24' : 'none'} stroke={i < rv.rating ? '#FBBF24' : '#D1D5DB'} />
                      ))}
                    </div>
                  </div>
                  <span className="text-xs text-gray-400 bg-white px-2.5 py-1 rounded-full border border-gray-100">
                    {new Date(rv.createdAt).toLocaleDateString('vi-VN')}
                  </span>
                </div>
                <p className="text-gray-600 text-sm leading-relaxed pl-13">{rv.comment}</p>

                {rv.adminReply && (
                  <div className="mt-3 ml-13 bg-orange-50 p-4 rounded-xl border-l-4 border-primary">
                    <p className="text-xs font-bold text-primary mb-1">🏪 Phản hồi từ quán</p>
                    <p className="text-sm text-gray-700">{rv.adminReply}</p>
                  </div>
                )}

                {!rv.adminReply && user?.role === 'admin' && (
                  <div className="ml-13 mt-3 space-y-2">
                    <textarea
                      rows="2"
                      value={replyContent[rv._id] || ''}
                      onChange={(e) => setReplyContent(prev => ({ ...prev, [rv._id]: e.target.value }))}
                      className="w-full px-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:border-primary text-sm bg-white"
                      placeholder="Nhập câu trả lời của bạn..."
                    />
                    <button
                      onClick={() => submitReplyHandler(rv._id)}
                      className="bg-primary text-white px-4 py-1.5 rounded-lg text-sm font-bold hover:bg-orange-600 transition-colors"
                    >
                      Trả lời
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Review Form */}
        {user ? (
          user.role === 'admin' ? (
            <div className="bg-orange-50 text-orange-800 p-4 rounded-2xl flex items-center justify-center gap-2 font-semibold text-sm">
              <span>👨‍💼 Admin không thể viết đánh giá, chỉ có thể phản hồi bình luận của khách.</span>
            </div>
          ) : !canReview ? (
            <div className="bg-orange-50 text-orange-700 p-4 rounded-2xl flex items-center gap-3 text-sm font-semibold border border-orange-100">
              <AlertTriangle size={18} className="flex-shrink-0" />
              <span>{cantReviewMessage || 'Bạn cần đặt mua và nhận món ăn này trước khi đánh giá!'}</span>
            </div>
          ) : (
            <div className="bg-gradient-to-br from-orange-50 to-amber-50 p-6 rounded-2xl border border-orange-100">
              <h3 className="font-bold text-lg mb-5 flex items-center gap-2">
                <Star size={20} className="text-amber-400" /> Viết đánh giá của bạn
              </h3>
              <form onSubmit={submitReviewHandler}>
                {/* Stars */}
                <div className="mb-5">
                  <label className="block text-gray-700 font-semibold mb-2 text-sm">Xếp hạng</label>
                  <div className="flex items-center gap-1 mb-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => submitStarRating(star)}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                        className="p-0.5 hover:scale-125 transition-transform"
                      >
                        <Star
                          size={32}
                          fill={(hoverRating || rating) >= star ? '#FBBF24' : 'none'}
                          stroke={(hoverRating || rating) >= star ? '#FBBF24' : '#D1D5DB'}
                        />
                      </button>
                    ))}
                  </div>
                  <p className="text-sm font-semibold text-amber-600">
                    {ratingLabels[hoverRating || rating]}
                  </p>
                </div>
                {/* Comment */}
                <div className="mb-4">
                  <label className="block text-gray-700 font-semibold mb-2 text-sm">Bình luận</label>
                  <textarea
                    rows="3"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-orange-200 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 bg-white text-sm resize-none"
                    placeholder="Chia sẻ cảm nhận của bạn về món ăn này..."
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={reviewLoading}
                  className="bg-primary text-white px-8 py-2.5 rounded-xl font-bold hover:bg-orange-600 transition-colors disabled:opacity-50 shadow-md"
                >
                  {reviewLoading ? 'Đang gửi...' : '📤 Gửi đánh giá'}
                </button>
              </form>
            </div>
          )
        ) : (
          <div className="bg-gradient-to-r from-orange-50 to-amber-50 p-5 rounded-2xl flex items-center justify-between border border-orange-100">
            <div>
              <p className="font-semibold text-gray-700">Bạn muốn đánh giá món này?</p>
              <p className="text-sm text-gray-500">Đăng nhập để chia sẻ trải nghiệm của bạn</p>
            </div>
            <Link to="/login" className="bg-primary text-white px-5 py-2.5 rounded-xl font-bold shadow-md hover:bg-orange-600 transition-colors text-sm whitespace-nowrap">
              Đăng nhập
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default FoodDetail;
