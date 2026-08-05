from rest_framework.decorators import api_view
from rest_framework.response import Response
from math import radians, sin, cos, sqrt, atan2
from django.utils import timezone
from datetime import timedelta
from django.db.models import Count
import pandas as pd
from django.http import HttpResponse
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import permission_classes
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .models import AttendanceSession, AttendanceRecord
from .serializers import (
    AttendanceSessionSerializer,
    AttendanceRecordSerializer
)

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def faculty_profile(request):

    return Response({

        "username": request.user.username,

        "email": request.user.email,

        "id": request.user.id

    })
def calculate_distance(lat1, lon1, lat2, lon2):

    R = 6371000

    dlat = radians(lat2 - lat1)
    dlon = radians(lon2 - lon1)

    a = (
        sin(dlat / 2) ** 2
        + cos(radians(lat1))
        * cos(radians(lat2))
        * sin(dlon / 2) ** 2
    )

    c = 2 * atan2(
        sqrt(a),
        sqrt(1 - a)
    )

    return R * c


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def start_session(request):

    data = request.data.copy()

    duration = int(
        data.get("duration_minutes", 2)
    )

    data["expires_at"] = (
        timezone.now() +
        timedelta(minutes=duration)
    )

    # Close previous active sessions
    AttendanceSession.objects.filter(
        is_active=True
    ).update(
        is_active=False
    )

    serializer = AttendanceSessionSerializer(
        data=data
    )

    if serializer.is_valid():

        session = serializer.save(
            faculty=request.user
        )

        attendance_link = (
            f"http://localhost:5173/attendance/{session.id}"
        )

        return Response({

            "message": "Attendance Session Created",

            "session_id": session.id,

            "attendance_link": attendance_link,

            "data": AttendanceSessionSerializer(session).data

        })

    return Response(
        serializer.errors,
        status=400
    )
@api_view(["GET"])
def active_session(request):

    AttendanceSession.objects.filter(
        expires_at__lt=timezone.now(),
        is_active=True
    ).update(
        is_active=False
    )

    session = AttendanceSession.objects.filter(
        is_active=True
    ).first()

    if not session:
        return Response(
            {"message": "No Active Session"},
            status=404
        )

    serializer = AttendanceSessionSerializer(
        session
    )

    return Response(
        serializer.data
    )

@api_view(["GET"])
def session_details(request, session_id):

    try:

        session = AttendanceSession.objects.get(
            id=session_id,
            is_active=True
        )

    except AttendanceSession.DoesNotExist:

        return Response(
            {
                "message": "Session Not Found"
            },
            status=404
        )

    if timezone.now() > session.expires_at:

        session.is_active = False
        session.save()

        return Response(
            {
                "message": "Session Expired"
            },
            status=400
        )

    return Response({

        "id": session.id,

        "department": session.department,

        "section": session.section,

        "faculty": session.faculty.username,

        "radius": session.radius,

        "expires_at": session.expires_at,

        "is_active": session.is_active

    })


@api_view(["POST"])
def verify_location(request):

    student_lat = request.data.get("latitude")
    student_lon = request.data.get("longitude")

    session = AttendanceSession.objects.filter(
        is_active=True
    ).first()

    if not session:
        return Response(
            {"message": "No Active Session"},
            status=404
        )

    if timezone.now() > session.expires_at:

        session.is_active = False
        session.save()

        return Response(
            {"message": "Attendance Session Expired"},
            status=400
        )
    
    print("Faculty:", session.faculty_latitude, session.faculty_longitude)
    print("Student:", student_lat, student_lon)

    distance = calculate_distance(
        session.faculty_latitude,
        session.faculty_longitude,
        float(student_lat),
        float(student_lon)
    )

    print("Distance:", distance)

    return Response({
        "verified": distance <= session.radius,
        "distance": round(distance, 2),
        "radius": session.radius,
        "department": session.department,
        "section": session.section
    })


@api_view(["POST"])
def mark_attendance(request):
    
    console.log("Mark Attendance Clicked");

    session_id = request.data.get("session_id")

    try:

        session = AttendanceSession.objects.get(
            id=session_id,
            is_active=True
        )

    except AttendanceSession.DoesNotExist:

        return Response(
            {
                "message": "Attendance Session Not Found"
            },
            status=404
        )

    if timezone.now() > session.expires_at:

        session.is_active = False
        session.save()

        return Response(
            {
                "message": "Attendance Session Expired"
            },
            status=400
        )

    roll_number = request.data.get("roll_number")

    already_marked = AttendanceRecord.objects.filter(
        session=session,
        roll_number=roll_number
    ).exists()

    if already_marked:

        return Response(
            {
                "message": "Attendance Already Marked"
            },
            status=400
        )

    data = request.data.copy()

    data["session"] = session.id

    serializer = AttendanceRecordSerializer(
        data=data
    )

    if serializer.is_valid():

        serializer.save()

        return Response({

            "message": "Attendance Marked Successfully",

            "data": serializer.data

        })

    return Response(
        serializer.errors,
        status=400
    )

# ===== FACULTY DASHBOARD APIs =====

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def attendance_summary(request):

    summary = (
        AttendanceRecord.objects
        .values(
            "department",
            "section"
        )
        .annotate(
            student_count=Count("id")
        )
        .order_by(
            "department",
            "section"
        )
    )

    return Response(summary)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def attendance_list(request):

    department = request.GET.get(
        "department"
    )

    section = request.GET.get(
        "section"
    )

    records = AttendanceRecord.objects.filter(
        department=department,
        section=section
    ).order_by(
        "roll_number"
    )

    serializer = AttendanceRecordSerializer(
        records,
        many=True
    )

    return Response(serializer.data)   

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def export_excel(request):

    department = request.GET.get("department")
    section = request.GET.get("section")

    records = AttendanceRecord.objects.filter(
        department=department,
        section=section
    )

    data = []

    for record in records:

        data.append({

            "Name": record.name,
            "Roll Number": record.roll_number,
            "Department": record.department,
            "Section": record.section

        })

    df = pd.DataFrame(data)

    response = HttpResponse(
        content_type=
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    )

    filename = (
        f"{department}_{section}_Attendance.xlsx"
    )

    response[
        "Content-Disposition"
    ] = (
        f'attachment; filename="{filename}"'
    )

    df.to_excel(
        response,
        index=False
    )

    return response 