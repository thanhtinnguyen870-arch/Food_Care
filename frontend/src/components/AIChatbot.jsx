import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, X, Send, Bot, ShoppingCart, Maximize2, Minimize2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import axiosClient from '../api/axiosClient';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

const AIChatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const chatContainerRef = useRef(null);
  
  const { user } = useAuth();
  const { addToCart } = useCart();
  const navigate = useNavigate();

  const quickChips = [
    "Tôi bị tiểu đường",
    "Tôi đang giảm cân",
    "Tôi tập gym",
    "Tôi muốn ăn chay",
    "Cao huyết áp",
    "Gợi ý bữa tối nhẹ"
  ];

  useEffect(() => {
    const resetChat = setTimeout(() => {
      setChatHistory([]);
      setMessage('');
    }, 0);

    return () => clearTimeout(resetChat);
  }, [user?._id]);

  // Auto scroll
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [chatHistory, loading, isOpen]);

  const handleSendMessage = async (msgText) => {
    if (!msgText.trim() || loading) return;

    if (!user) return; // shouldn't happen due to UI block, but just in case

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
    } catch {
      setChatHistory(prev => prev.map(c => c._id === newMsg._id ? { ...c, response: 'Xin lỗi, tôi đang gặp sự cố kết nối. Vui lòng thử lại.' } : c));
    } finally {
      setLoading(false);
    }
  };

  const renderResponse = (text = '') => {
    const labelPattern = /(Món chính|Món phụ|Đồ uống|Tráng miệng|Bữa sáng|Bữa trưa|Bữa tối|Gợi ý|Lưu ý|Khuyến nghị|Thực đơn|Calories|Protein|Tinh bột|Chất xơ|Giá|Lý do)\s*:/gi;

    return text.split('\n').map((line, lineIndex) => (
      <p key={`${line}-${lineIndex}`} className="mb-2 last:mb-0">
        {line.split(labelPattern).map((part, index) => {
          if (index % 2 === 1) {
            return (
              <strong key={`${part}-${index}`} className="font-extrabold text-orange-700">
                {part}:
              </strong>
            );
          }
          return <span key={`${part}-${index}`}>{part}</span>;
        })}
      </p>
    ));
  };

  return (
    <>
      {/* Floating Button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-[60] w-16 h-16 rounded-full bg-gradient-to-tr from-primary to-secondary text-white shadow-float flex items-center justify-center hover:scale-110 transition-transform"
        animate={{
          boxShadow: ['0 0 0 0 rgba(255,122,0,0.4)', '0 0 0 15px rgba(255,122,0,0)'],
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
        }}
      >
        {isOpen ? <X size={28} /> : <Sparkles size={28} />}
      </motion.button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9, transition: { duration: 0.2 } }}
            className={`fixed z-[60] glassmorphism shadow-2xl border border-white/40 flex flex-col overflow-hidden ${
              isFullscreen
                ? 'inset-4 md:inset-8 rounded-3xl'
                : 'bottom-28 right-6 w-[calc(100vw-48px)] md:w-[380px] h-[560px] max-h-[75vh] rounded-3xl'
            }`}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-primary to-secondary p-4 text-white flex items-center justify-between shadow-sm">
              <div>
                <h3 className="font-bold flex items-center gap-2"><Bot size={20} /> Chuyên viên Dinh dưỡng</h3>
                <p className="text-xs text-white/80 mt-1">Tư vấn món ăn theo nhu cầu và sức khỏe</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsFullscreen((current) => !current)}
                  className="text-white/80 hover:text-white transition-colors"
                  title={isFullscreen ? 'Thu nhỏ' : 'Phóng to'}
                >
                  {isFullscreen ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
                </button>
                <button onClick={() => setIsOpen(false)} className="text-white/80 hover:text-white transition-colors" title="Đóng">
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Chat Area */}
            <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-4 bg-gray-50/50 space-y-4">
              {chatHistory.length === 0 && !loading && user && (
                <div className="h-full flex flex-col items-center justify-center text-gray-400">
                  <Bot size={48} className="mb-3 text-primary/50" />
                  <p className="text-sm text-center px-4">Xin chào! Tôi có thể giúp bạn tìm món ăn phù hợp với sức khỏe hôm nay?</p>
                </div>
              )}

              {chatHistory.map((chat) => (
                <div key={chat._id} className="space-y-3">
                  {/* User message */}
                  <div className="flex justify-end">
                    <div className="bg-white border border-gray-100 p-3 rounded-2xl rounded-tr-sm max-w-[85%] shadow-sm text-sm text-gray-800">
                      {chat.message}
                    </div>
                  </div>

                  {/* AI Response */}
                  <div className="flex justify-start gap-2">
                    <div className="w-8 h-8 rounded-full bg-primary flex-shrink-0 flex items-center justify-center text-white shadow-md">
                      <Sparkles size={14} />
                    </div>
                    <div className="bg-white border border-orange-200 p-4 rounded-2xl rounded-tl-sm max-w-[90%] shadow-sm text-[15px] text-slate-800">
                      {chat.isTemporary && !chat.response ? (
                        <div className="flex space-x-1.5 items-center h-5">
                          <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce"></div>
                          <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                          <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                        </div>
                      ) : (
                        <div className="leading-7">
                          {renderResponse(chat.response)}
                        </div>
                      )}

                      {/* Food Cards inside chat */}
                      {chat.recommendedFoods && chat.recommendedFoods.length > 0 && (
                        <div className="mt-4 space-y-2">
                          {chat.recommendedFoods.map((food) => (
                            <div key={food._id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
                              <div className="flex p-2 gap-2">
                                <img src={food.images[0]} onError={(e) => { e.target.onerror = null; e.target.src="https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=800&auto=format&fit=crop"; }} alt={food.name} className="w-16 h-16 object-cover rounded-lg" />
                                <div className="flex-1 min-w-0">
                                  <h5 className="font-bold text-xs truncate">{food.name}</h5>
                                  <p className="text-primary text-xs font-semibold">{food.price.toLocaleString()}đ</p>
                                  <p className="text-[10px] text-gray-500">{food.nutrition?.calories} kcal</p>
                                </div>
                              </div>
                              <div className="flex border-t border-gray-50 text-xs">
                                <Link 
                                  to={`/food/${food._id}`} 
                                  onClick={() => setIsOpen(false)}
                                  className="flex-1 py-2 text-center text-gray-600 font-semibold hover:bg-gray-50 transition-colors"
                                >
                                  Chi tiết
                                </Link>
                                <div className="w-px bg-gray-50"></div>
                                <button 
                                  onClick={() => addToCart(food)}
                                  className="flex-1 py-2 text-center text-primary font-bold hover:bg-orange-50 transition-colors flex items-center justify-center gap-1"
                                >
                                  <ShoppingCart size={12}/> Thêm
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Input Area */}
            <div className="bg-white border-t border-gray-100">
              {user ? (
                <>
                  {/* Quick Chips */}
                  <div className="px-3 py-2 flex gap-2 overflow-x-auto no-scrollbar border-b border-gray-50">
                    {quickChips.map((chip, idx) => (
                      <button 
                        key={idx}
                        onClick={() => handleSendMessage(chip)}
                        className="whitespace-nowrap px-3 py-1 bg-gray-100 rounded-full text-[11px] font-medium text-gray-600 hover:bg-primary hover:text-white transition-colors"
                      >
                        {chip}
                      </button>
                    ))}
                  </div>
                  {/* Input Form */}
                  <form 
                    onSubmit={(e) => { e.preventDefault(); handleSendMessage(message); }}
                    className="p-3 flex items-center gap-2"
                  >
                    <input 
                      type="text" 
                      className="flex-1 bg-gray-100 rounded-full px-4 py-2 text-sm outline-none focus:ring-1 focus:ring-primary"
                      placeholder="Hỏi chuyên viên tư vấn món ăn..."
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      disabled={loading}
                    />
                    <button 
                      type="submit"
                      disabled={loading || !message.trim()}
                      className="w-9 h-9 rounded-full bg-primary text-white flex items-center justify-center flex-shrink-0 hover:bg-orange-600 disabled:opacity-50 transition-colors"
                    >
                      <Send size={16} className="-ml-0.5" />
                    </button>
                  </form>
                </>
              ) : (
                <div className="p-6 text-center">
                  <p className="text-sm text-gray-500 mb-3">Vui lòng đăng nhập để được tư vấn món ăn.</p>
                  <button 
                    onClick={() => {
                      setIsOpen(false);
                      navigate('/login');
                    }}
                    className="bg-primary text-white text-sm px-6 py-2 rounded-full font-bold shadow-md hover:bg-orange-600 transition-colors"
                  >
                    Đăng nhập ngay
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default AIChatbot;
