from django.shortcuts import render
from rest_framework import generics, status
from rest_framework.response import Response
from .serializers import ReportDetailedListSerializers
from .paginations import StandardResultSetPaginations
from .models import ReportDetailed

# # settings.py
# REST_FRAMEWORK = {
#     # Sử dụng CursorPagination làm mặc định cho tất cả các List View
#     'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.CursorPagination',
    
#     # Số lượng item trả về trong mỗi request
#     'PAGE_SIZE': 10,
    
#     # Chỉ định trường để sắp xếp và làm "con trỏ"
#     # Tên này phải khớp với trường trong Model và trong Meta.ordering
#     'ORDERING': '-create_at',
# }
class ReportListCreateAPIView(generics.ListCreateAPIView):
   # Hỗ trợ cả GET (ListAPIView) và POST (CreateAPIView)
    queryset = ReportDetailed.objects.all()
    serializer_class = ReportDetailedListSerializers
    def perform_create(self, serializer):
       # THAO TÁC QUAN TRỌNG: Gán user từ request (token) vào field 'user' của model
       serializer.save(user=self.request.user)
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        # 1. Tạo Report và gán user
        report = serializer.save(user=request.user)

        # 2. Cập nhật điểm uy tín (theo logic Frontend/README)
        REPUTATION_GAIN = 5

        user = request.user
        # Sử dụng method có sẵn trong User model để tăng reputation
        user.increase_reputation(REPUTATION_GAIN) 
        # Note: Nếu muốn cập nhật total_reports/accuracy_rate, cần gọi user.update_stats()

        # 3. Trả về response theo format yêu cầu của Frontend (src/services/reports.ts)
        return Response({
            "id": str(report.id),
            "message": "Báo cáo đã được tạo thành công",
            "reputation_gained": REPUTATION_GAIN
        }, status=status.HTTP_201_CREATED)

#@GET
class ReportListAPIView(generics.ListAPIView):
   # SELECT * FROM "reports_reportdetailed" 
   # ORDER BY "create_at" DESC 
   # LIMIT 10;
   queryset = ReportDetailed.objects.all()
   serializer_class = ReportDetailedListSerializers 
#    pagination_class = StandardResultSetPaginations

class ReportDetailedRetriveAPIView(generics.RetrieveAPIView):
    # SELECT * FROM reports_reportdetailed WHERE id = 'id' LIMIT 1
    lookup_field = 'id'
    queryset = ReportDetailed.objects.all()
    serializer_class = ReportDetailedListSerializers

#@POST
class ReportDetailedCreateAPIView(generics.CreateAPIView):
    # INSERT INTO reports_reportdetailed VALUE(?,?,...)
    queryset = ReportDetailed.objects.all()
    serializer_class = ReportDetailedListSerializers
#@POST Get reports by locations
class ReportDetailedGenericAPIView(generics.GenericAPIView):
    queryset = ReportDetailed.objects.all()
    serializer_class = ReportDetailedListSerializers
    pagination_class = StandardResultSetPaginations
    def post(self, request, *args, **kwargs):
        data = request.data
        serializer = self.get_serializer( many=True)
        # Dùng serializers A để validate data trước
        lat = serializer.validate_data['lat']
        lng = serializer.validate_data['lng']
        # Query set theo trường dữ liệu
        
        qs = (
            self.get_queryset().filter(lat, lng)
        )

        page = self.paginate_queryset(qs)

        outser_data = self.result_serializers_class(qs, many=True)
        return Response(outser_data.data, status=status.HTTPS_200_OK)

