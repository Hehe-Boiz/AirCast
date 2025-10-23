from rest_framework import serializers
class StandardResultSetPaginations(serializers.Serializer):
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
