from django.db import models


class AttendanceSession(models.Model):
    department = models.CharField(max_length=100)
    section = models.CharField(max_length=20)

    faculty_latitude = models.FloatField()
    faculty_longitude = models.FloatField()

    radius = models.IntegerField(default=100)

    is_active = models.BooleanField(default=True)

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.department}-{self.section}"