import OpenAI from 'openai';
import Food from '../models/Food.js';
import AIChat from '../models/AIChat.js';

const getOpenAIBaseURL = () => {
  const rawURL = process.env.OPENAI_API_URL || 'https://api.openai.com/v1';
  return rawURL.replace(/\/chat\/completions\/?$/, '').replace(/\/$/, '');
};

const getAIProvider = () => (process.env.AI_PROVIDER || 'openai').toLowerCase();

const generateWithOpenAI = async (systemPrompt, message) => {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('Missing OPENAI_API_KEY');
  }

  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    baseURL: getOpenAIBaseURL()
  });

  const completion = await openai.chat.completions.create({
    model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: message }
    ],
    temperature: 0.7,
  });

  return completion.choices[0].message.content;
};

const generateWithGemini = async (systemPrompt, message) => {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error('Missing GEMINI_API_KEY');
  }

  const model = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': process.env.GEMINI_API_KEY,
      },
      body: JSON.stringify({
        systemInstruction: {
          parts: [{ text: systemPrompt }],
        },
        contents: [
          {
            role: 'user',
            parts: [{ text: message }],
          },
        ],
        generationConfig: {
          temperature: 0.7,
        },
      }),
    }
  );

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error?.message || 'Gemini request failed');
  }

  const text = data.candidates?.[0]?.content?.parts
    ?.map((part) => part.text)
    .filter(Boolean)
    .join('\n')
    .trim();

  if (!text) {
    throw new Error('Gemini returned an empty response');
  }

  return text;
};

const generateAIResponse = async (systemPrompt, message) => {
  if (getAIProvider() === 'gemini') {
    return generateWithGemini(systemPrompt, message);
  }

  return generateWithOpenAI(systemPrompt, message);
};

const extractRecommendedFoodNames = (aiResponseText) => {
  const recMatch = aiResponseText.match(/RECOMMENDATIONS:\s*(\[[\s\S]*?\]|.+)$/i);
  if (!recMatch?.[1]) {
    return { responseMessage: aiResponseText, recommendedFoodNames: [] };
  }

  const rawRecommendations = recMatch[1].trim();
  let recommendedFoodNames = [];

  if (rawRecommendations.startsWith('[')) {
    try {
      recommendedFoodNames = JSON.parse(rawRecommendations);
    } catch (error) {
      console.error('Error parsing AI recommendations', error);
    }
  }

  if (recommendedFoodNames.length === 0) {
    recommendedFoodNames = rawRecommendations
      .replace(/^\[|\]$/g, '')
      .split(',')
      .map((name) => name.trim().replace(/^["']|["']$/g, ''))
      .filter(Boolean);
  }

  return {
    responseMessage: aiResponseText.replace(/RECOMMENDATIONS:\s*(\[[\s\S]*?\]|.+)$/i, '').trim(),
    recommendedFoodNames,
  };
};

// @desc    Get AI Food Recommendation
// @route   POST /api/ai/recommend
// @access  Private
export const recommendFood = async (req, res) => {
  try {
    const message = String(req.body.message || '').trim();
    const user = req.user;

    if (!message) {
      return res.status(400).json({ message: 'Vui long nhap cau hoi can tu van.' });
    }

    if (message.length > 2000) {
      return res.status(400).json({ message: 'Cau hoi vuot qua do dai cho phep.' });
    }

    // Fetch foods from DB to provide context
    const foods = await Food.find({ isAvailable: true }).select(
      'name description ingredients price nutrition healthTags suitableFor warningFor'
    );

    const foodContext = foods.map(f => 
      `Món: ${f.name}\n` +
      `Thành phần: ${f.ingredients.join(', ')}\n` +
      `Dinh dưỡng: Calo ${f.nutrition.calories}, Protein ${f.nutrition.protein}g, Carb ${f.nutrition.carbs}g, Béo ${f.nutrition.fat}g, Đường ${f.nutrition.sugar}g\n` +
      `Phù hợp: ${f.suitableFor.join(', ')}\n` +
      `Hạn chế: ${f.warningFor.join(', ')}\n` +
      `Tags: ${f.healthTags.join(', ')}\n`
    ).join('\n---\n');

    const portionGuidance = `
QUY TAC TU VAN DIEU CHINH KHAU PHAN:
- Thanh phan trong menu la khau phan healthy tieu chuan cho nguoi binh thuong. Vi du "Gao lut 100g(345 calo)" nghia la khau phan goc cua mon co 100g gao lut.
- Khi nguoi dung co benh ly hoac muc tieu rieng, hay giu ten mon trong menu nhung de xuat dieu chinh gram tung nguyen lieu neu can.
- Neu nguoi dung bi tieu duong, tien tieu duong, can kiem soat duong huyet, hoac hoi mon co phu hop khong: uu tien giam nguon tinh bot/duong nhu gao, bun, mi, mien, khoai, trai cay ngot, nuoc ep; tang/giu rau xanh va dam nac. Goi y giam tinh bot khoang 20-40% tuy mon. Vi du: "Com gao lut uc ga rau cu" co gao lut 100g thi co the de xuat "gao lut 70g", giu uc ga, tang sup lo/cai xanh/dua chuot neu phu hop.
- Neu nguoi dung giam can: giam tinh bot va nguyen lieu nhieu nang luong khoang 10-30%, tang rau it calo, giu dam nac de no lau.
- Neu nguoi dung tang co/tap gym: co the giu hoac tang dam 10-30%, giu tinh bot vua du cho buoi tap; khong tu dong cat tinh bot qua manh.
- Neu nguoi dung cao huyet ap: uu tien mon it muoi/it natri, khuyen giam nuoc cham, nuoc tuong, do che bien san; khong tang sodium.
- Neu nguoi dung hoi ve mot mon cu the, hay tra loi theo cau truc:
  1. Mon nay co phu hop hay khong va vi sao.
  2. Khau phan goc tu menu.
  3. Khau phan nen dieu chinh theo tinh trang cua nguoi dung, ghi ro gram moi.
  4. Neu tinh duoc tu calo trong ngoac, hay uoc tinh calo sau dieu chinh va noi ro la uoc tinh.
  5. Nhac thong tin chi tham khao, nen hoi bac si/chuyen gia dinh duong neu co benh ly.
- BAT BUOC: Neu nguoi dung co tieu duong/tien tieu duong/duong huyet cao/giam can va hoi ve mot mon co tinh bot, khong duoc chi lap lai y nguyen khau phan goc. Phai tao muc "Khau phan de xuat" co it nhat 1 thanh phan bi giam/tang ro rang.
- BAT BUOC: Khi dieu chinh, hay viet dang bang Markdown voi cac cot: Thanh phan | Khau phan goc | Khau phan de xuat | Ly do.
- BAT BUOC: Voi tieu duong, nguon tinh bot chinh phai giam ro rang neu co. Quy tac nhanh:
  * Gao/bun/mi/mien/khoai 100g -> 60-75g.
  * Gao/bun/mi/mien/khoai 80-99g -> 55-70g.
  * Trai cay/nuoc ep ngot -> giam 30-50% hoac khuyen han che.
  * Dam nac nhu ga/ca/tom/dau phu co the giu nguyen hoac tang 10-20g neu can no lau.
  * Rau it calo nhu sup lo, cai xanh, cai thia, dua chuot, bi xanh co the tang 20-50g.
- VI DU MAU:
  Neu mon goc la "Com gao lut uc ga rau cu" gom "Gao lut 100g(345 calo), Thit ga ta 80g(159 calo), Sup lo xanh 70g(18 calo), Ca rot 40g(16 calo)" va nguoi dung bi tieu duong, cau tra loi phai de xuat:
  | Gao lut | 100g | 70g | Giam tinh bot de han che tang duong huyet sau an |
  | Thit ga ta | 80g | 90g | Giu/tang nhe dam nac giup no lau |
  | Sup lo xanh | 70g | 100g | Tang chat xo, it calo |
  | Ca rot | 40g | 30-40g | Giu vua phai vi co vi ngot tu nhien |
  Uoc tinh calo moi phai thap hon khau phan goc neu giam tinh bot.
- Khong bia ra mon an ngoai menu. Khi thay the nguyen lieu, uu tien cac nguyen lieu dang co trong menu/bang thanh phan.
`;

    const systemPrompt = `Bạn là trợ lý tư vấn món ăn thông minh cho website FoodCare AI. 
Người dùng tên là ${user.name}.
Hồ sơ sức khỏe của người dùng (nếu có): 
- Tuổi: ${user.healthProfile?.age || 'Không rõ'}
- Bệnh lý: ${user.healthProfile?.conditions?.join(', ') || 'Không có'}
- Dị ứng: ${user.healthProfile?.allergies?.join(', ') || 'Không có'}
- Mục tiêu: ${user.healthProfile?.goal || 'Không rõ'}

Nhiệm vụ của bạn là hỗ trợ người dùng chọn món ăn phù hợp với nhu cầu, sở thích và tình trạng cơ thể.
Bạn CHỈ ĐƯỢC phép gợi ý các món ăn có trong danh sách dữ liệu thực đơn dưới đây. Tuyệt đối KHÔNG bịa ra món ăn không tồn tại trong danh sách.

Danh sách thực đơn hiện có:
${foodContext}

Quy tắc bắt buộc:
1. Khi người dùng nhắc đến bệnh lý như tiểu đường, cao huyết áp, v.v., bạn phải trả lời thận trọng.
2. Không chẩn đoán bệnh. Khuyến nghị hỏi bác sĩ.
3. Giải thích lý do chọn món.
4. Nêu các món nên hạn chế nếu cần.
5. Trả lời bằng tiếng Việt, thân thiện, rõ ràng, trình bày đẹp bằng Markdown (bullet points, in đậm).
6. Luôn nhắc nhở ở cuối: "Thông tin chỉ mang tính tham khảo, không thay thế lời khuyên từ bác sĩ hoặc chuyên gia dinh dưỡng."
7. Cuối cùng, hãy liệt kê CHÍNH XÁC tên các món ăn bạn gợi ý thành một mảng JSON (ví dụ: ["Salad ức gà rau củ", "Đậu hũ sốt nấm"]) nằm ở dòng cuối cùng của câu trả lời, theo định dạng: RECOMMENDATIONS: ["Tên món 1", "Tên món 2"]. Đây là mã để hệ thống trích xuất.`;

    const upgradedSystemPrompt = `${systemPrompt}

CAP NHAT VAI TRO MO RONG:
${portionGuidance}
- Ban la tro ly FoodCare ve dinh duong, suc khoe tong quat, thoi quen an uong, loi song lanh manh va lua chon mon an.
- Ban co the tra loi cac cau hoi ve calo, protein, carb, chat beo, vitamin, khoang chat, giam can, tang can, tap luyen, tieu duong, huyet ap, cholesterol, gout, da day, di ung thuc pham, an chay, an kieng va lap ke hoach bua an.
- Voi cau hoi suc khoe, chi dua thong tin giao duc va khuyen nghi an toan o muc tham khao. Khong chan doan benh, khong ke don thuoc, khong thay the bac si.
- Neu nguoi dung co dau hieu nguy hiem nhu dau nguc, kho tho, dot quy, ngat, dau bung du doi, phan ung di ung nang, duong huyet qua cao/thap hoac trieu chung cap cuu, hay khuyen di cap cuu hoac gap bac si ngay.
- Neu cau hoi khong lien quan truc tiep den mon an, van tra loi huu ich trong pham vi suc khoe/dinh duong/loi song. Khi khong can goi y mon trong menu, dong cuoi phai la: RECOMMENDATIONS: [].
- Khi goi y mon an, chi duoc goi y cac mon co trong danh sach thuc don. Dong cuoi phai la JSON array dung dinh dang: RECOMMENDATIONS: ["Ten mon 1", "Ten mon 2"].
- Tra loi bang tieng Viet tu nhien, ngan gon nhung du thong tin; uu tien checklist, bullet point va loi khuyen thuc te de nguoi dung lam theo.`;

    let aiResponseText;
    try {
      aiResponseText = await generateAIResponse(upgradedSystemPrompt, message);
    } catch (apiError) {
      console.warn('AI API Error (Fallback triggered):', apiError.message);
      
      // Fallback mode using actual DB foods to prevent presentation failure
      const fallbackFoods = foods.slice(0, 3);
      const fallbackNames = fallbackFoods.map(f => f.name);
      
      aiResponseText = `Chào bạn, hiện tại máy chủ AI đang quá tải nên tôi đang dùng chế độ tư vấn dự phòng. Tuy nhiên, tôi xin gợi ý một số món ăn nổi bật của cửa hàng rất phù hợp cho bạn lúc này:

${fallbackFoods.map(f => `- **${f.name}**: Rất ngon và đầy đủ dinh dưỡng.`).join('\n')}

Chúc bạn có một bữa ăn ngon miệng và lành mạnh!

*Thông tin chỉ mang tính tham khảo, không thay thế lời khuyên từ bác sĩ.*
RECOMMENDATIONS: ${JSON.stringify(fallbackNames)}`;
    }

    const { responseMessage, recommendedFoodNames } = extractRecommendedFoodNames(aiResponseText);

    // Find food ObjectIds
    let recommendedFoods = [];
    if (recommendedFoodNames.length > 0) {
      const foodsInDb = await Food.find({ name: { $in: recommendedFoodNames } });
      recommendedFoods = foodsInDb.map(f => f._id);
    }

    // Save chat history
    const chat = await AIChat.create({
      user: user._id,
      message,
      response: responseMessage,
      recommendedFoods
    });

    // Populate food info before sending back
    const populatedChat = await AIChat.findById(chat._id).populate('recommendedFoods', 'name images price nutrition healthTags');

    res.json(populatedChat);
  } catch (error) {
    console.error('AI Error:', error);
    res.status(500).json({ message: 'Lỗi khi gọi AI hoặc cấu hình API Key chưa chính xác.' });
  }
};

// @desc    Get Chat History
// @route   GET /api/ai/history
// @access  Private
export const getChatHistory = async (req, res) => {
  try {
    const history = await AIChat.find({ user: req.user._id })
      .populate('recommendedFoods', 'name images price nutrition healthTags')
      .sort({ createdAt: -1 });
    res.json(history);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
