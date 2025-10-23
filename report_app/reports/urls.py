from django.urls import path
from . import views

urlpatterns = [
    path('/reports/', views.ReportListAPIView.as_view(), name='Get all reports (without filters)'),
    path('/reprots/<int:id>/', views.ReportDetailedRetriveAPIView.as_view(), name='Get single report by id'),
    path('/reports/', views.ReportDetailedCreateAPIView.as_view(), name='Create new report'),
    path('/reports/by-location/', )
]