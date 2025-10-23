from rest_framework.pagination import PageNumberPagination
from rest_framework.response import Response
class StandardResultSetPaginations(PageNumberPagination):
    ## Cấu trúc JSON định nghĩa
    # count = serializers.IntegerField()
    # next = serializers.URLField(allow_null=True)
    # previous = serializers.URLField(allow_null=True)
    # reports = ReportDetailedListSerializers(many=True)

    ## Django RestFramework mặc định key result cho danh sách các đối tượng
    page_size = 10 # Số lượng report load mỗi lần phân trang
    page_size_query_param = 'page_size'
    max_page_size = 100
    result_field = 'reports'

    def get_paginated_response(self, data):
            return Response({
                'count': self.page.paginator.count,
                'next': self.get_next_link(),
                'previous': self.get_previous_link(),
                'reports': data
            })
