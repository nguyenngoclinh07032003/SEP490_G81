import { normalizeSearch } from './services.js';

// Article previews and images from the Stitch blog design.
export const featuredArticle = {
  "id": "may-lanh-thieu-gas",
  "category": "dieu-hoa",
  "title": "Dấu hiệu máy lạnh thiếu gas hoặc rò rỉ gas: Cách nhận biết trước khi hỏng block máy nén",
  "description": "Máy lạnh hoạt động liên tục nhưng không mát sâu, dàn lạnh bám tuyết trắng hoặc có tiếng xì gas nhẹ ở rắc-co là những dấu hiệu khẩn cấp. Kỹ sư Minh Đức phân tích nguyên nhân và giải pháp kiểm tra bằng đồng hồ đo áp suất chuyên dụng, giúp bạn tránh chi phí thay lốc hàng triệu đồng.",
  "image": "https://lh3.googleusercontent.com/aida-public/AB6AXuDfmanWsRR-bGNDWYR6iBPiqHdYa6H_e-m5637u35u3EHooYb7CUQY_TgQyI_F77v2jFnfrw23g6g7UDyG43YXRsEtYMlKzi0pn8DuNUVFYJOPJqMoEfpRzy_OsIzF3G0yY3rldiAnwSFtpuvi_y9GogoVZMNxOZGEm2Embb6xtihDaH_UpXiV846ndQdpdhahu2lVAiQXTHJIF4-5mHsdO9FBb3FVIyIQpPcrWiruQ0VIFgg_KR-dq4w",
  "alt": "Kỹ thuật viên Minh Đức kiểm tra đồng hồ áp suất và hệ thống máy nén Daikin",
  "author": "Kỹ sư Nguyễn Minh Đức",
  "duration": 7
};

export const blogArticles = [
  {
    "id": "bao-duong-may-giat",
    "category": "may-giat",
    "title": "Quy trình bảo dưỡng máy giặt định kỳ 6 tháng: Tiết kiệm 30% điện năng và chống rung lắc bạc đạn",
    "description": "Lồng giặt tích tụ cặn bột giặt và nấm mốc sau thời gian dài là nguyên nhân khiến mâm quay nặng tải, tốn điện và làm rách gioăng cao su. Hướng dẫn cách tháo vệ sinh đúng kỹ thuật.",
    "image": "https://lh3.googleusercontent.com/aida-public/AB6AXuDuEoJlSXa8KzetP9DNf0EfBgpmBsbFomsuYG3NshjJ8g4D-UHI6s53wpKz0q33SnhI6KF19WSgj3x5ndzbmItSI48K8Wh7vf57OhvfaGUrBV3dz5Ncx16_O5HxQhG8SdgUJLDrjscHfT_ZTkVBVkYpA6YyvVB4XzlizCIMbg7XLhFa20JbTW1ITv8D75dfmOBwTzlf1Mjo9xVdIjNP8tWW20KDbYYk9WUZCIcNxcRh7WY8XzERRjK06Q",
    "alt": "Kỹ thuật viên HRMSS kiểm tra và tháo lắp bạc đạn lồng giặt máy giặt cửa trước",
    "author": "KTV Phạm Minh Tuấn",
    "duration": 5
  },
  {
    "id": "an-toan-dien",
    "category": "dien-nuoc",
    "title": "Nguy cơ rò điện từ bình nóng lạnh và tầm quan trọng của rơ-le chống giật ELCB",
    "description": "Tìm hiểu vai trò của thiết bị chống giật ELCB, các dấu hiệu bất thường và khi nào cần liên hệ kỹ thuật viên kiểm tra bình nóng lạnh.",
    "image": null,
    "alt": "Nguy cơ rò điện từ bình nóng lạnh và tầm quan trọng của rơ-le chống giật ELCB",
    "author": "Kỹ sư Nguyễn Đức",
    "duration": 6
  },
  {
    "id": "tu-lanh-dong-tuyet",
    "category": "tu-lanh",
    "title": "Tủ lạnh Side-by-side và Inverter bị đóng tuyết ngăn đá: 4 nguyên nhân phổ biến và cách xử lý",
    "description": "Cảm biến âm trần (sò lạnh), cầu chì nhiệt hoặc điện trở phá băng gặp trục trặc khiến quạt gió bị kẹt và hơi lạnh không thể tuần hoàn xuống ngăn mát.",
    "image": null,
    "alt": "Tủ lạnh Side-by-side và Inverter bị đóng tuyết ngăn đá: 4 nguyên nhân phổ biến và cách xử lý",
    "author": "KTV Lê Văn Hùng",
    "duration": 6
  },
  {
    "id": "thay-loi-loc-nuoc",
    "category": "dien-nuoc",
    "title": "Bao lâu nên thay lõi lọc nước RO 1-2-3? Cách kiểm tra chỉ số TDS nước uống trực tiếp",
    "description": "Lõi lọc thô quá hạn làm giảm tuổi thọ màng RO đắt tiền và khiến máy bơm chạy liên tục không ngắt. Cách đọc bút thử TDS và nhận biết thời điểm thay lõi.",
    "image": null,
    "alt": "Bao lâu nên thay lõi lọc nước RO 1-2-3? Cách kiểm tra chỉ số TDS nước uống trực tiếp",
    "author": "KTV Hoàng Nam",
    "duration": 4
  },
  {
    "id": "tiet-kiem-dien",
    "category": "dieu-hoa",
    "title": "Cách cài đặt nhiệt độ điều hòa Inverter mùa nắng nóng giúp bảo vệ sức khỏe và không sốc tiền điện",
    "description": "Tìm hiểu chế độ Eco/Sleep và cách sử dụng điều hòa phù hợp để tăng sự thoải mái và quản lý điện năng trong mùa nóng.",
    "image": null,
    "alt": "Cách cài đặt nhiệt độ điều hòa Inverter mùa nắng nóng giúp bảo vệ sức khỏe và không sốc tiền điện",
    "author": "Kỹ sư Nguyễn Minh Đức",
    "duration": 5
  },
  {
    "id": "bao-hanh-dien-tu",
    "category": "app-hrmss",
    "title": "Số hóa bảo hành thiết bị: Cách tra cứu lịch sử sửa chữa và tạo yêu cầu bảo hành 1-chạm trên HRMSS",
    "description": "Không lo thất lạc phiếu giấy bảo hành, quản lý chi tiết từng linh kiện thay thế và đánh giá trực tiếp tay nghề kỹ thuật viên trên điện thoại của bạn.",
    "image": null,
    "alt": "Số hóa bảo hành thiết bị: Cách tra cứu lịch sử sửa chữa và tạo yêu cầu bảo hành 1-chạm trên HRMSS",
    "author": "Ban Quản trị HRMSS",
    "duration": 3
  }
];

export const blogCategories = [
  { id: 'all', label: 'Tất cả bài viết' },
  { id: 'dieu-hoa', label: 'Điều hòa & Máy lạnh' },
  { id: 'may-giat', label: 'Máy giặt & Máy sấy' },
  { id: 'tu-lanh', label: 'Tủ lạnh & Bảo quản' },
  { id: 'dien-nuoc', label: 'An toàn Điện & Nước' },
  { id: 'app-hrmss', label: 'Hướng dẫn App HRMSS' },
];

export function filterArticles(articles, category, query) {
  const keywords = normalizeSearch(query).split(/\s+/).filter(Boolean);
  return articles.filter(article => {
    const text = normalizeSearch([article.title, article.description, article.author].join(' '));
    const words = text.split(/[^a-z0-9]+/).filter(Boolean);
    return (category === 'all' || category === article.category) && keywords.every(keyword => words.some(word => keyword.length < 3 ? word === keyword : word.startsWith(keyword)));
  }).sort((a, b) => Number(normalizeSearch(b.title).includes(normalizeSearch(query))) - Number(normalizeSearch(a.title).includes(normalizeSearch(query))));
}
