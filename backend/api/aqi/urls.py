from django.urls import path
from .views import FetchAqiDataView

urlpatterns = [
    path('fetch/', FetchAqiDataView.as_view(), name='fetch-aqi-data'),
]