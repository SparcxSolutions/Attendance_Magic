from rest_framework import serializers
from .models import (
    AttendanceSession,
    AttendanceRecord
)


class AttendanceSessionSerializer(serializers.ModelSerializer):
    class Meta:
        model = AttendanceSession
        fields = "__all__"