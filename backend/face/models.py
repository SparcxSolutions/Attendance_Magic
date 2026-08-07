from django.db import models
from attendance.models import AttendanceSession, AttendanceRecord


class SessionFace(models.Model):

    session = models.ForeignKey(
        AttendanceSession,
        on_delete=models.CASCADE,
        related_name="faces"
    )

    attendance = models.OneToOneField(
        AttendanceRecord,
        on_delete=models.CASCADE,
        related_name="face"
    )

    embedding = models.JSONField()

    image_url = models.URLField(
        blank=True,
        null=True
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )