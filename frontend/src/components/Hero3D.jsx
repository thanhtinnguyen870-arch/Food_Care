import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const dishes = [
  {
    name: 'Salad ức gà',
    image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=900&auto=format&fit=crop',
    className: 'left-[8%] top-[16%] h-44 w-44',
    delay: 0,
  },
  {
    name: 'Cơm cá hồi',
    image: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?q=80&w=900&auto=format&fit=crop',
    className: 'right-[8%] top-[24%] h-56 w-56',
    delay: 0.7,
  },
  {
    name: 'Bowl rau củ',
    image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?q=80&w=900&auto=format&fit=crop',
    className: 'left-[26%] bottom-[12%] h-52 w-52',
    delay: 1.4,
  },
];

const Hero3D = () => {
  return (
    <div className="relative flex h-[80vh] w-full items-center justify-between overflow-hidden px-10 md:px-24">
      <div className="absolute left-0 top-0 z-[-2] h-full w-full bg-gradient-to-br from-cream to-white"></div>
      <div className="blob bg-primary/20 w-96 h-96 rounded-full top-20 left-10"></div>
      <div className="blob bg-healthy/20 w-80 h-80 rounded-full bottom-20 right-20"></div>

      <motion.div
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8 }}
        className="z-10 max-w-2xl"
      >
        <h1 className="mb-6 text-5xl font-bold leading-tight text-dark md:text-7xl">
          Ăn ngon hơn, <br />
          <span className="text-gradient">sống khỏe hơn</span> <br />
          mỗi ngày
        </h1>
        <p className="mb-8 max-w-xl text-lg text-gray-600">
          FoodCare phục vụ bữa ăn lành mạnh tại Đà Nẵng, nhận đơn nhanh trong các quận nội thành và gợi ý món phù hợp với thể trạng, mục tiêu sức khỏe, sở thích cá nhân.
        </p>
        <div className="flex space-x-4">
          <Link to="/foods" className="inline-block rounded-full bg-primary px-8 py-3 text-center font-semibold text-white shadow-lg transition-all duration-300 hover:-translate-y-1 hover:bg-orange-600">
            Đặt món ngay
          </Link>
          <Link to="/contact" className="inline-block rounded-full border border-primary bg-white px-8 py-3 text-center font-semibold text-primary shadow-md transition-all duration-300 hover:bg-orange-50">
            Liên hệ tư vấn
          </Link>
        </div>
      </motion.div>

      <div className="pointer-events-none absolute right-0 hidden h-full w-1/2 md:block">
        <motion.div
          className="absolute inset-0"
          animate={{ y: [0, -12, 0], rotate: [0, 1.5, 0] }}
          transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
        >
          {dishes.map((dish) => (
            <motion.div
              key={dish.name}
              className={`absolute overflow-hidden rounded-full border-8 border-white bg-white shadow-2xl ${dish.className}`}
              animate={{ y: [0, -18, 0], x: [0, 8, 0] }}
              transition={{ duration: 5.5, repeat: Infinity, ease: 'easeInOut', delay: dish.delay }}
            >
              <img src={dish.image} alt={dish.name} className="h-full w-full object-cover" />
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          className="absolute bottom-[18%] right-[18%] rounded-3xl border border-primary/20 bg-orange-50/95 px-5 py-4 shadow-xl shadow-orange-200/40 backdrop-blur"
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut' }}
        >
          <p className="text-sm font-semibold text-orange-700">Món healthy trong ngày</p>
          <p className="text-lg font-black text-primary">Tươi mới, giao tận nơi</p>
        </motion.div>
      </div>
    </div>
  );
};

export default Hero3D;
