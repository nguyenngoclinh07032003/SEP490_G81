const modules = [
  ['Quản lý phòng', 'Theo dõi danh sách phòng và tình trạng sử dụng.'],
  ['Đặt phòng', 'Quản lý đặt phòng, nhận phòng và trả phòng.'],
  ['Khách hàng', 'Lưu trữ thông tin khách hàng và lịch sử lưu trú.'],
  ['Dịch vụ', 'Quản lý dịch vụ sử dụng trong thời gian lưu trú.'],
];

export default function HomePage() {
  return (
    <main>
      <section className="intro">
        <p>Không gian quản lý</p>
        <h1>Hệ thống quản lý khách sạn</h1>
        <p>Nền tảng khởi đầu cho ứng dụng HRMSS.</p>
      </section>
      <section className="module-grid" aria-label="Các phân hệ dự kiến">
        {modules.map(([title, description]) => (
          <article key={title}>
            <span>Sắp phát triển</span>
            <h2>{title}</h2>
            <p>{description}</p>
          </article>
        ))}
      </section>
    </main>
  );
}
