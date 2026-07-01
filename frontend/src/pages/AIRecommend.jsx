import { useState, useEffect, useRef } from 'react';
import { Send, Bot, Sparkles } from 'lucide-react';
import axiosClient from '../api/axiosClient';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';

const AIRecommend = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [message, setMessage] = useState(searchParams.get('ask') || '');
  const [chatHistory, setChatHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const chatContainerRef = useRef(null);

  const quickChips = [
    "Tôi bị tiểu đường, nên ăn gì?",
    "Tôi đang giảm cân",
    "Tôi tập gym",
    "Tôi bị cao huyết áp",
    "Tôi muốn ăn chay",
    "Tôi muốn bữa tối nhẹ"
  ];

  useEffect(() => {
    if (!user) return;
    const fetchHistory = async () => {
      try {
        const { data } = await axiosClient.get('/ai/history');
        setChatHistory(data.reverse()); // Reverse to show oldest first if backend sorts by newest
      } catch (error) {
        console.error(error);
      }
    };
    fetchHistory();
  }, [user]);

  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatHistory, loading]);

  if (!user) {
    return (
      <div className="min-h-[calc(100vh-80px)] flex items-center justify-center px-4">
        <div className="absolute inset-0 z-[-1] overflow-hidden">
          <div className="blob bg-primary/10 w-96 h-96 rounded-full top-10 left-10" />
          <div className="blob bg-blue-300/15 w-80 h-80 rounded-full bottom-10 right-20" />
        </div>
        <div className="text-center max-w-md">
          <div className="w-28 h-28 rounded-full bg-orange-50 flex items-center justify-center mx-auto mb-6 shadow-lg">
            <Bot size={56} className="text-primary" />
          </div>
          <h1 className="text-3xl font-bold text-dark mb-3">Tư vấn Ẩm thực AI</h1>
          <p className="text-gray-500 mb-8 leading-relaxed">
            Đăng nhập để nhận gợi ý món ăn cá nhân hóa dựa trên tình trạng sức khỏe và sở thích của bạn từ chuyên gia AI FoodCare.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              to="/login"
              state={{ from: '/ai-recommend' }}
              className="bg-primary text-white px-8 py-3 rounded-full font-bold shadow-lg hover:bg-orange-600 transition-all hover:-translate-y-1"
            >
              Đăng nhập ngay
            </Link>
            <Link
              to="/register"
              className="border border-primary text-primary px-8 py-3 rounded-full font-bold hover:bg-orange-50 transition-all hover:-translate-y-1"
            >
              Đăng ký miễn phí
            </Link>
          </div>
          <div className="mt-10 grid grid-cols-3 gap-4 text-center">
            {[
              { icon: '🥗', label: 'Gợi ý theo bệnh lý' },
              { icon: '🎯', label: 'Cá nhân hóa 100%' },
              { icon: '⚡', label: 'Phản hồi tức thì' },
            ].map((item) => (
              <div key={item.label} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                <div className="text-3xl mb-2">{item.icon}</div>
                <p className="text-xs font-semibold text-gray-600">{item.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }




  const handleSendMessage = async (msgText) => {
    if (!msgText.trim() || loading) return;

    if (!user) {
      alert("Vui lòng đăng nhập để sử dụng tính năng tư vấn!");
      navigate('/login');
      return;
    }

    const newMsg = {
      _id: `pending-${chatHistory.length}`,
      message: msgText,
      response: '',
      isTemporary: true
    };

    setChatHistory(prev => [...prev, newMsg]);
    setMessage('');
    setLoading(true);

    try {
      const { data } = await axiosClient.post('/ai/recommend', { message: msgText });
      setChatHistory(prev => prev.map(c => c._id === newMsg._id ? data : c));
    } catch (error) {
      console.error(error);
      setChatHistory(prev => prev.map(c => c._id === newMsg._id ? { ...c, response: 'Xin lỗi, đã có lỗi xảy ra khi kết nối.' } : c));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 md:px-12 py-10 h-[calc(100vh-80px)] flex flex-col relative">
      {/* Background elements */}
      <div className="absolute inset-0 z-[-1] overflow-hidden">
        <div className="blob bg-primary/10 w-96 h-96 rounded-full top-10 left-10"></div>
        <div className="blob bg-blue-300/20 w-80 h-80 rounded-full bottom-10 right-20"></div>
      </div>

      <div className="text-center mb-6">
        <h1 className="text-3xl md:text-4xl font-bold flex items-center justify-center gap-2">
          <Sparkles className="text-primary" /> Tư vấn Ẩm thực Khoa học
        </h1>
        <p className="text-gray-600 mt-2">Hỏi FoodCare để nhận được những gợi ý món ăn chuẩn xác nhất cho sức khỏe của bạn.</p>
      </div>

      <div className="flex-1 glassmorphism rounded-3xl shadow-3d overflow-hidden flex flex-col max-w-4xl mx-auto w-full">
        {/* Chat Area */}
        <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-6 space-y-6">
          {chatHistory.length === 0 && !loading && (
            <div className="h-full flex flex-col items-center justify-center text-gray-500 opacity-70">
              <Bot size={64} className="mb-4 text-primary" />
              <p>Hãy gửi một câu hỏi để bắt đầu!</p>
            </div>
          )}

          {chatHistory.map((chat) => (
            <div key={chat._id} className="space-y-4">
              {/* User message */}
              <div className="flex justify-end">
                <div className="bg-gray-100 p-4 rounded-2xl rounded-tr-sm max-w-[80%] shadow-sm">
                  {chat.message}
                </div>
              </div>

              {/* AI Response */}
              <div className="flex justify-start items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-primary flex-shrink-0 flex items-center justify-center text-white shadow-md">
                  <Bot size={20} />
                </div>
                <div className="bg-orange-50 text-gray-800 border border-orange-100 p-4 rounded-2xl rounded-tl-sm max-w-[85%] shadow-sm">
                  {chat.isTemporary && !chat.response ? (
                    <div className="flex space-x-2 items-center h-6">
                      <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                    </div>
                  ) : (
                    <div className="whitespace-pre-wrap leading-relaxed markdown-body">
                      {chat.response}
                    </div>
                  )}

                  {/* Recommended Foods inside chat bubble */}
                  {chat.recommendedFoods && chat.recommendedFoods.length > 0 && (
                    <div className="mt-6 border-t border-orange-200 pt-4">
                      <p className="font-semibold mb-3 text-orange-800">Món ăn đề xuất từ FoodCare:</p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {chat.recommendedFoods.map((food) => (
                          <Link to={`/food/${food._id}`} key={food._id} className="bg-white rounded-xl shadow p-3 flex gap-3 hover:-translate-y-1 transition-transform border border-gray-100">
                            <img src={food.images[0]} onError={(e) => { e.target.onerror = null; e.target.src="https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=800&auto=format&fit=crop"; }} alt={food.name} className="w-16 h-16 object-cover rounded-lg" />
                            <div>
                              <h5 className="font-bold text-sm line-clamp-1">{food.name}</h5>
                              <p className="text-primary text-sm font-semibold">{food.price.toLocaleString()}đ</p>
                            </div>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Chips */}
        <div className="px-6 py-3 flex gap-2 overflow-x-auto no-scrollbar border-t border-gray-100">
          {quickChips.map((chip, idx) => (
            <button 
              key={idx}
              onClick={() => handleSendMessage(chip)}
              className="whitespace-nowrap px-4 py-2 bg-white rounded-full text-sm shadow-sm border border-gray-200 text-gray-700 hover:bg-primary hover:text-white hover:border-primary transition-colors"
            >
              {chip}
            </button>
          ))}
        </div>

        {/* Input Area */}
        <div className="p-4 bg-white/50 border-t border-gray-200">
          <form 
            onSubmit={(e) => { e.preventDefault(); handleSendMessage(message); }}
            className="flex items-center gap-3 bg-white p-2 rounded-full shadow-inner border border-gray-100"
          >
            <input 
              type="text" 
              className="flex-1 bg-transparent px-4 py-2 outline-none"
              placeholder="Nhập tình trạng sức khỏe hoặc yêu cầu của bạn..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              disabled={loading}
            />
            <button 
              type="submit"
              disabled={loading || !message.trim()}
              className="w-12 h-12 bg-primary text-white rounded-full flex items-center justify-center hover:bg-orange-600 transition-colors disabled:opacity-50"
            >
              <Send size={20} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AIRecommend;
