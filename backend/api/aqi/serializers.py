from rest_framework import serializers

class AqiBoundingBoxSerializer(serializers.Serializer):
    """
    Serializer để xác thực (validate) 4 tọa độ
    của khung hình chữ nhật.
    """
    lat_min = serializers.FloatField(required=True)
    lon_min = serializers.FloatField(required=True)
    lat_max = serializers.FloatField(required=True)
    lon_max = serializers.FloatField(required=True)

    def validate(self, data):
        if data['lat_min'] >= data['lat_max']:
            raise serializers.ValidationError("lat_min phải nhỏ hơn lat_max")
        if data['lon_min'] >= data['lon_max']:
            raise serializers.ValidationError("lon_min phải nhỏ hơn lon_max")
        return data