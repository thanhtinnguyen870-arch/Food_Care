import { Award, HeartPulse, Leaf, Scale, ShieldCheck, Sparkles, Utensils } from 'lucide-react';

const commitments = [
  {
    icon: Scale,
    title: 'Cân bằng theo nhu cầu',
    description: 'Thực đơn được định hướng theo năng lượng, nhóm chất và khẩu phần phù hợp với từng mục tiêu sức khỏe.',
  },
  {
    icon: Utensils,
    title: 'Đa dạng bữa ăn Việt',
    description: 'Kết hợp tinh bột, đạm, chất béo tốt, rau củ và trái cây để bữa ăn đủ chất mà vẫn gần gũi khẩu vị Việt.',
  },
  {
    icon: ShieldCheck,
    title: 'Minh bạch và an toàn',
    description: 'Ưu tiên nguyên liệu rõ nguồn gốc, quy trình chế biến sạch và thông tin món ăn dễ theo dõi.',
  },
];

const values = [
  {
    icon: Leaf,
    title: 'Nguyên liệu chọn lọc',
    description: 'Rau củ, thịt cá và gia vị được lựa chọn kỹ, hạn chế lạm dụng dầu mỡ, đường và muối.',
  },
  {
    icon: HeartPulse,
    title: 'Cá nhân hóa sức khỏe',
    description: 'Gợi ý món ăn theo thể trạng, mục tiêu và thói quen dùng bữa để việc ăn lành mạnh dễ duy trì hơn.',
  },
  {
    icon: Sparkles,
    title: 'Ngon miệng mỗi ngày',
    description: 'FoodCare tin rằng dinh dưỡng tốt phải bắt đầu từ một bữa ăn khiến bạn thật sự muốn thưởng thức.',
  },
];

const About = () => {
  return (
    <div className="min-h-screen bg-light">
      <section className="relative overflow-hidden px-4 py-12 md:py-16">
        <div className="absolute inset-0 z-0 bg-[radial-gradient(circle_at_top_left,rgba(255,122,0,0.16),transparent_32%),radial-gradient(circle_at_bottom_right,rgba(38,194,129,0.14),transparent_30%)]" />
        <div className="container relative z-10 mx-auto max-w-6xl">
          <div className="grid items-center gap-10 lg:grid-cols-[1.05fr_0.95fr]">
            <div>
              <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-orange-200 bg-white/80 px-4 py-2 text-sm font-bold text-primary shadow-sm">
                <Award size={16} />
                Dinh dưỡng tử tế cho người Việt
              </span>
              <h1 className="text-4xl font-extrabold leading-tight text-dark md:text-6xl">
                Về <span className="text-primary">FoodCare</span>
              </h1>
              <p className="mt-5 max-w-2xl text-lg leading-relaxed text-gray-600 md:text-xl">
                FoodCare được tạo ra để mỗi bữa ăn không chỉ ngon miệng, mà còn có lý do rõ ràng cho sức khỏe. Chúng tôi mang dinh dưỡng khoa học đến gần hơn với nhịp sống bận rộn, bằng những thực đơn dễ chọn, dễ ăn và dễ duy trì.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <span className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-gray-700 shadow-sm">Đa dạng</span>
                <span className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-gray-700 shadow-sm">Cân bằng</span>
                <span className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-gray-700 shadow-sm">An toàn</span>
                <span className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-gray-700 shadow-sm">Phù hợp thể trạng</span>
              </div>
            </div>

            <div className="relative">
              <img
                src="https://images.unsplash.com/photo-1543339308-43e59d6b73a6?q=80&w=2070&auto=format&fit=crop"
                alt="Bữa ăn lành mạnh"
                className="h-[360px] w-full rounded-[2rem] object-cover shadow-float md:h-[460px]"
              />
              <div className="absolute bottom-5 left-5 right-5 rounded-2xl bg-white/90 p-5 shadow-3d backdrop-blur">
                <p className="text-sm font-bold uppercase tracking-wide text-primary">Cam kết FoodCare</p>
                <p className="mt-2 text-lg font-extrabold text-dark">Ăn ngon hơn, hiểu cơ thể hơn, chăm sóc sức khỏe chủ động hơn.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 py-10">
        <div className="container mx-auto grid max-w-6xl gap-8 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <p className="text-sm font-bold uppercase tracking-wide text-primary">Sứ mệnh</p>
            <h2 className="mt-3 text-3xl font-extrabold text-dark md:text-4xl">Biến ăn uống lành mạnh thành một thói quen dễ thương</h2>
          </div>
          <div className="space-y-4 text-lg leading-relaxed text-gray-600">
            <p>
              Chúng tôi tin rằng một thực đơn tốt không nên làm bạn áp lực. Nó cần đủ dinh dưỡng, hợp khẩu vị, vừa túi tiền và phù hợp với mục tiêu của từng người, từ kiểm soát cân nặng, tập luyện, ăn kiêng đến chăm sóc sức khỏe gia đình.
            </p>
            <p>
              FoodCare kết hợp dữ liệu món ăn, gợi ý cá nhân hóa và tinh thần bếp Việt để giúp bạn chọn món nhanh hơn, ăn có chủ đích hơn và duy trì lối sống lành mạnh một cách tự nhiên.
            </p>
          </div>
        </div>
      </section>

      <section className="px-4 py-10">
        <div className="container mx-auto max-w-6xl rounded-[2rem] bg-dark p-6 text-white shadow-3d md:p-10">
          <div className="grid gap-8 lg:grid-cols-[0.85fr_1.15fr]">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-bold text-orange-100">
                <ShieldCheck size={16} />
                Lời cam đoan dinh dưỡng
              </span>
              <h2 className="mt-5 text-3xl font-extrabold md:text-4xl">Thực đơn được xây dựng có cơ sở, không chạy theo cảm tính</h2>
              <p className="mt-4 leading-relaxed text-orange-50/90">
                FoodCare cam kết định hướng thực đơn dựa trên các nguyên tắc dinh dưỡng hợp lý, tham chiếu khuyến nghị dinh dưỡng cho người Việt Nam và tinh thần hướng dẫn của Bộ Y tế Việt Nam cùng Viện Dinh dưỡng Quốc gia.
              </p>
              <p className="mt-4 text-sm leading-relaxed text-white/65">
                Các gợi ý trên FoodCare hỗ trợ lựa chọn bữa ăn hằng ngày và không thay thế chẩn đoán, điều trị hoặc tư vấn cá nhân từ bác sĩ, chuyên gia dinh dưỡng trong trường hợp bệnh lý đặc thù.
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              {commitments.map(({ icon: Icon, title, description }) => (
                <div key={title} className="rounded-2xl bg-white p-5 text-dark shadow-sm">
                  <Icon className="mb-4 text-primary" size={30} />
                  <h3 className="text-lg font-extrabold">{title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-gray-600">{description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 py-10">
        <div className="container mx-auto max-w-6xl">
          <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div>
              <p className="text-sm font-bold uppercase tracking-wide text-primary">Giá trị cốt lõi</p>
              <h2 className="mt-3 text-3xl font-extrabold text-dark md:text-4xl">Chăm chút từ nguyên liệu đến trải nghiệm</h2>
            </div>
            <p className="max-w-xl leading-relaxed text-gray-600">
              Mỗi món ăn trên FoodCare được nhìn bằng hai lăng kính: ngon để bạn muốn ăn, và hợp lý để cơ thể được chăm sóc đúng cách.
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-3">
            {values.map(({ icon: Icon, title, description }) => (
              <div key={title} className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-3d">
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-50 text-primary">
                  <Icon size={26} />
                </div>
                <h3 className="text-xl font-extrabold text-dark">{title}</h3>
                <p className="mt-3 leading-relaxed text-gray-600">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 pb-16 pt-8">
        <div className="container mx-auto max-w-5xl rounded-[2rem] border border-orange-100 bg-white p-8 text-center shadow-3d md:p-12">
          <HeartPulse className="mx-auto mb-5 text-red-500" size={52} />
          <h2 className="text-3xl font-extrabold text-dark">Sức khỏe của bạn là ưu tiên hàng đầu</h2>
          <p className="mx-auto mt-4 max-w-3xl text-lg leading-relaxed text-gray-600">
            FoodCare không chỉ là nơi đặt món. Chúng tôi muốn trở thành người bạn đồng hành trong từng lựa chọn nhỏ mỗi ngày, để bữa ăn của bạn luôn có đủ sự ngon lành, an tâm và yêu thương.
          </p>
        </div>
      </section>
    </div>
  );
};

export default About;
