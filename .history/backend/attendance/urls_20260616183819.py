from django.urls import path
from .views import start_session, active_session

urlpatterns = [
    path("start-session/", start_session),

    path(
        "active-session/",
        active_session
    ),
]