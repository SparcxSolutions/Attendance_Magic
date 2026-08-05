from django.db import models
from django.utils import timezone
from datetime import timedelta
from django.contrib.auth.models import User
import uuid

import uuid
from django.contrib.auth.models import User

class AttendanceSession(models.Model):

    department = models.CharField(max_length=100)
    section = models.CharField(max_length=20)

    faculty_latitude = models.FloatField()
    faculty_longitude = models.FloatField()

    radius = models.IntegerField(default=100)

    duration_minutes = models.IntegerField(default=2)

    expires_at = models.DateTimeField()

    is_active = models.BooleanField(default=True)

    created_at = models.DateTimeField(auto_now_add=True)

    faculty = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="attendance_sessions",
        null=True,
        blank=True
    )

    session_code = models.CharField(
        max_length=8,
        unique=True,
        editable=False,
        blank=True
    )

    def save(self, *args, **kwargs):

        if not self.session_code:

            self.session_code = (
                str(uuid.uuid4())
                .replace("-", "")[:8]
                .upper()
            )

        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.department}-{self.section}"


class AttendanceRecord(models.Model):

    session = models.ForeignKey(
        AttendanceSession,
        on_delete=models.CASCADE
    )

    name = models.CharField(max_length=100)

    roll_number = models.CharField(max_length=30)

    department = models.CharField(max_length=50)

    section = models.CharField(max_length=10)

    attendance_time = models.DateTimeField(
        auto_now_add=True
    )

    def __str__(self):
        return self.roll_number