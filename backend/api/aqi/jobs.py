from .models import AqiPoint
from .helpers import get_aqi_from_openweather_sync

def update_all_aqi_points():
    """
    Chạy mỗi 15 phút.
    Lặp qua TẤT CẢ các điểm AQI trong DB và cập nhật chúng.
    """
    print("CRON JOB: Bắt đầu cập nhật tất cả các điểm AQI...")
    points_to_update = AqiPoint.objects.all()
    updated_count = 0
    
    for point in points_to_update:
        try:
            aqi, pm25 = get_aqi_from_openweather_sync(point.lat, point.lon)
            if aqi is not None:
                point.aqi = aqi
                point.pm25 = pm25
                point.save()
                updated_count += 1
        except Exception as e:
            print(f"CRON JOB: Lỗi khi cập nhật điểm {point.id}: {e}")
            
    print(f"CRON JOB: Hoàn thành. Đã cập nhật {updated_count} điểm.")