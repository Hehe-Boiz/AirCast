from django.shortcuts import render
from rest_framework import generics
from rest_framework.response import Response
from .serializers import ReportDetailedListSerializers, PaginatedReportDetailedSerializers
from .models import ReportDetailed

# Create your views here.
class ReportListAPIView(generics.ListAPIView):
    def get(self, request, fromat=None):
        reports = ReportDetailed.objects.all()
        paginator = PaginatedReportDetailedSerializers()
        paginator.page_size = 10
        paginator_reports = paginator.paginate_queryset(request, reports)
        respone_data = {
            'count':paginator.page.paginator.count(),
            'next':paginator.get_next_link(),
            'previous':paginator.get_previous_link(),
            'result': ReportDetailedListSerializers(paginator_reports, many=True).data 
        }
        return Response(respone_data)
