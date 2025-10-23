import httpx
import asyncio
from django.conf import settings
from geopy.distance import geodesic
from geopy.point import Point

async def get_aqi_from_openweather_async(lat, lon, client):
    """
    Gọi API OpenWeather BẤT ĐỒNG BỘ để lấy AQI.
    Sử dụng lại httpx.AsyncClient để tăng hiệu quả.
    """
    API_KEY = settings.OPENWEATHER_API_KEY
    if not API_KEY or API_KEY == "YOUR_SECRET_API_KEY_HERE":
        print("ERROR: OPENWEATHER_API_KEY chưa được cấu hình.")
        return None

    url = f"http://api.openweathermap.org/data/2.5/air_pollution?lat={lat}&lon={lon}&appid={API_KEY}"

    try:
        response = await client.get(url, timeout=10.0)
        response.raise_for_status()
        data = response.json()
        aqi = data['list'][0]['main']['aqi']
        return lat, lon, aqi 
    except httpx.RequestError as e:
        print(f"Lỗi mạng khi gọi OpenWeather API cho ({lat},{lon}): {e}")
    except httpx.HTTPStatusError as e:
        print(f"Lỗi HTTP khi gọi OpenWeather API cho ({lat},{lon}): {e.response.status_code}")
    except Exception as e:
        print(f"Lỗi không xác định khi gọi OpenWeather API cho ({lat},{lon}): {e}")
    return lat, lon, None

def calculate_grid_points(lat_min, lon_min, lat_max, lon_max, distance_km=5.0):
    points = []
    current_point = Point(lat_min, lon_min)
    start_lon = lon_min
    while current_point.latitude <= lat_max:
        points.append((round(current_point.latitude, 6), round(current_point.longitude, 6)))
        current_point = geodesic(kilometers=distance_km).destination(current_point, 90)
        if current_point.longitude > lon_max:
            next_row_start = geodesic(kilometers=distance_km).destination(Point(current_point.latitude, start_lon), 0)
            current_point = Point(next_row_start.latitude, start_lon)
    return points