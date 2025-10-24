from django.urls import path
from .views import ReportUpvoteAPIView, ReportDownvoteAPIView, ReportDetailedRetriveAPIView, ReportDetailedCreateAPIView, ReportListCreateAPIView

urlpatterns = [
    path('', ReportListCreateAPIView.as_view(), name='Get all reports (without filters)'),
    path('<int:id>/', ReportDetailedRetriveAPIView.as_view(), name='Get single report by id'),
    path('<int:id>/upvote/', ReportUpvoteAPIView.as_view(), name='report-upvote'),
    path('<int:id>/downvote/', ReportDownvoteAPIView.as_view(), name='report-downvote'),
    # path('<int:id>/vote/',ReportVoteAPIView.as_view(), name='user vote report' )
]