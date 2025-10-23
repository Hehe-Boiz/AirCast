from rest_framework import generics, status
from rest_framework.response import Response
from .models import AqiPoint
from .serializers import AqiBoundingBoxSerializer
from .helpers import calculate_grid_points, get_aqi_from_openweather_async
import httpx
import asyncio
from django.utils import timezone
from datetime import timedelta
from asgiref.sync import sync_to_async, async_to_sync

class FetchAqiDataView(generics.GenericAPIView):
    serializer_class = AqiBoundingBoxSerializer

    # --- THÊM PHƯƠNG THỨC NÀY VÀO ---
    async def dispatch(self, request, *args, **kwargs):
        """
        Dispatch bất đồng bộ (async-aware) cho GenericAPIView.
        """
        self.args = args
        self.kwargs = kwargs
        request = self.initialize_request(request, *args, **kwargs)
        self.request = request
        self.headers = self.default_response_headers

        try:
            self.initial(request, *args, **kwargs)

            if request.method.lower() in self.http_method_names:
                handler = getattr(self, request.method.lower(),
                                  self.http_method_not_allowed)
            else:
                handler = self.http_method_not_allowed
            
            # Đây là thay đổi quan trọng:
            if asyncio.iscoroutinefunction(handler):
                response = await handler(request, *args, **kwargs)
            else:
                response = handler(request, *args, **kwargs)

        except Exception as exc:
            response = self.handle_exception(exc)

        self.response = self.finalize_response(request, response, *args, **kwargs)
        return self.response
    # --- KẾT THÚC PHẦN THÊM MỚI ---

    async def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        try:
            serializer.is_valid(raise_exception=True)
        except Exception as e:
             return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        data = serializer.validated_data

        grid_points_coords = calculate_grid_points(
            data['lat_min'], data['lon_min'],
            data['lat_max'], data['lon_max']
        )

        results = {}
        tasks = []
        points_to_fetch_api = []
        time_threshold = timezone.now() - timedelta(minutes=15)

        # Chuyển sang sync_to_async để truy vấn DB
        existing_points_list = await sync_to_async(list)(AqiPoint.objects.filter(
            lat__gte=data['lat_min'], lat__lte=data['lat_max'],
            lon__gte=data['lon_min'], lon__lte=data['lon_max']
        ))
        existing_points = {(p.lat, p.lon): p for p in existing_points_list}

        for lat, lon in grid_points_coords:
            point = existing_points.get((lat, lon))
            is_stale = (point is None) or (point.updated_at < time_threshold)

            if is_stale:
                points_to_fetch_api.append((lat, lon))
            else:
                results[(lat, lon)] = [point.lat, point.lon, point.aqi, point.pm25]

        if points_to_fetch_api:
            async with httpx.AsyncClient() as client:
                tasks = [
                    get_aqi_from_openweather_async(lat, lon, client)
                    for lat, lon in points_to_fetch_api
                ]
                api_results = await asyncio.gather(*tasks)

            points_to_update_or_create = []
            for lat, lon, aqi, pm25 in api_results:
                if aqi is not None:
                    results[(lat, lon)] = [lat, lon, aqi, pm25]
                    points_to_update_or_create.append(
                       AqiPoint(lat=lat, lon=lon, aqi=aqi, pm25=pm25, updated_at=timezone.now()) # Cập nhật updated_at thủ công
                    )
                else:
                    old_point = existing_points.get((lat, lon))
                    if old_point:
                         results[(lat, lon)] = [old_point.lat, old_point.lon, old_point.aqi, old_point.pm25]

            if points_to_update_or_create:
                 try:
                    await sync_to_async(AqiPoint.objects.bulk_update_or_create)(
                        points_to_update_or_create,
                        ['lat', 'lon'],
                        update_fields=['aqi', 'pm25', 'updated_at']
                    )
                 except Exception as db_error:
                      print(f"Lỗi khi cập nhật DB: {db_error}")


        final_results = [results[coord] for coord in grid_points_coords if coord in results]

        return Response(final_results, status=status.HTTP_200_OK)