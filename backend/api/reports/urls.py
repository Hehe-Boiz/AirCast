from django.urls import path
from .views import ReportListAPIView, ReportDetailedRetriveAPIView, ReportDetailedCreateAPIView, ReportListCreateAPIView

urlpatterns = [
    path('', ReportListCreateAPIView.as_view(), name='Get all reports (without filters)'),
    path('<int:id>/', ReportDetailedRetriveAPIView.as_view(), name='Get single report by id'),
    # path('', ReportDetailedCreateAPIView.as_view(), name='Create new report'),
#     path('by-location/', )
]