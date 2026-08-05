from django.urls import path
from .views import (
    start_session,
    active_session,
    verify_location,
    mark_attendance
)

urlpatterns = [
    path("start-session/", start_session),
    path("active-session/", active_session),
    path("verify-location/", verify_location),
    path(
    "mark-attendance/",
    mark_attendance
),
]