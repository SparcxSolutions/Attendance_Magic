from django.db import models
from django.utils import timezone
from datetime import timedelta

# class AttendanceSession(models.Model):
#     department = models.CharField(max_length=100)
#     section = models.CharField(max_length=20)

#     faculty_latitude = models.FloatField()
#     faculty_longitude = models.FloatField()

#     radius = models.IntegerField(default=100)

#     is_active = models.BooleanField(default=True)

#     created_at = models.DateTimeField(auto_now_add=True)

#     def __str__(self):
#         return f"{self.department}-{self.section}"
    

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

    def __str__(self):
        return f"{self.department}-{self.section}"