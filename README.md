# AirCast

AirCast là một ứng dụng web cung cấp thông tin chất lượng không khí theo thời gian thực và dự báo, giúp người dùng theo dõi và bảo vệ sức khỏe của mình khỏi ô nhiễm không khí.

## Mục lục

- [AirCast](#aircast)
  - [Mục lục](#mục-lục)
  - [Tổng quan](#tổng-quan)
  - [Tính năng](#tính-năng)
  - [Công nghệ sử dụng](#công-nghệ-sử-dụng)
  - [Yêu cầu](#yêu-cầu)
  - [Cài đặt và Chạy dự án](#cài-đặt-và-chạy-dự-án)
  - [Cấu trúc dự án](#cấu-trúc-dự-án)
  - [API Endpoints](#api-endpoints)
  - [Giấy phép](#giấy-phép)

## Tổng quan

AirCast cung cấp cho người dùng bản đồ nhiệt tương tác hiển thị chỉ số chất lượng không khí (AQI) tại các địa điểm khác nhau. Người dùng có thể xem thông tin chi tiết về chất lượng không khí, nhận dự báo và báo cáo các vấn đề liên quan đến ô nhiễm không khí.

## Tính năng

- **Bản đồ nhiệt AQI:** Trực quan hóa dữ liệu chất lượng không khí trên bản đồ.
- **Thông tin vị trí:** Hiển thị thông tin chi tiết về AQI, nhiệt độ, độ ẩm và tốc độ gió cho một vị trí cụ thể.
- **Báo cáo người dùng:** Cho phép người dùng báo cáo các vấn đề về chất lượng không khí.
- **Xác thực người dùng:** Đăng ký và đăng nhập để truy cập các tính năng được cá nhân hóa.
- **Thành tích:** Người dùng có thể kiếm được thành tích bằng cách đóng góp dữ liệu.

## Công nghệ sử dụng

- **Frontend:**
  - React
  - TypeScript
  - Vite
  - Tailwind CSS
- **Backend:**
  - Django
  - Django REST Framework
  - PostgreSQL
- **Deployment:**
  - Docker

## Yêu cầu

- [Docker](https://www.docker.com/get-started)
- [Docker Compose](https://docs.docker.com/compose/install/)

## Cài đặt và Chạy dự án

1.  **Clone a repository:**

    ```bash
    git clone https://github.com/Hehe-Boiz/AirCast.git
    cd AirCast
    ```

2.  **Chạy dự án bằng Docker Compose:**

    ```bash
    docker-compose up --build
    ```

3.  **Truy cập ứng dụng:**
    - **Frontend:** Mở trình duyệt và truy cập `http://localhost:8080`
    - **Backend:** API sẽ có sẵn tại `http://localhost:3000`

## Cấu trúc dự án

Dự án được chia thành ba phần chính:

- `frontend/`: Chứa mã nguồn cho ứng dụng React.
- `backend/`: Chứa mã nguồn cho ứng dụng Django.
- `postgre_docker/`: Chứa cấu hình Docker cho cơ sở dữ liệu PostgreSQL.

## API Endpoints

Để biết danh sách chi tiết các điểm cuối API, vui lòng tham khảo tệp `ENDPOINTS_SUMMARY.md` trong thư mục `frontend/src`.

## Giấy phép

Dự án này được cấp phép theo Giấy phép MIT. Xem tệp `LICENSE` để biết thêm chi-tiết.
