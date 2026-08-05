from django.urls import path
from .views import start_session

urlpatterns = [
    path(
        "start-session/",
        start_session
    ),
]