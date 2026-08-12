"""Survey dashboard for the standalone PR service.

This view lived in the monolith's `dashboard` app and was not carried over when
`pr` was split out, so the service's own Statistics screen called an endpoint
that did not exist here and got a 404. Ported with its two helpers so the
service is self-contained — it must not import from the ticketing monolith.
"""
from datetime import timedelta

import pandas as pd
from django.utils.timezone import now
from django.utils.translation import gettext_lazy as _
from django.db.models import F
from rest_framework import serializers, status
from rest_framework.authentication import TokenAuthentication
from rest_framework.response import Response
from rest_framework.views import APIView

from pr.models.choices import QuestionType, SurveyType
from pr.models.models import Survey
from pr.permissions import PRManagerOrCeoPermission


def _range_time(value):
    """Parse a `dd-mm-YYYY dd-mm-YYYY` range, end-inclusive."""
    from datetime import datetime

    start, end = value.split(" ")
    return (
        datetime.strptime(start, "%d-%m-%Y"),
        datetime.strptime(end, "%d-%m-%Y") + timedelta(days=1),
    )


def process_survey_data(survey_data):
    """Weighted average score per category."""
    def scaler(group, answer):
        # Yes/No answers are stored 0-1 but scored on the same 5-point scale
        # as the rest, so they are rescaled before averaging.
        return answer * 5 if group == QuestionType.YES_NO else answer

    answers = [answer for survey in survey_data for answer in survey.answers.all()]
    data = {
        "answer": [scaler(a.group, a.answer) for a in answers],
        "category": [a.category for a in answers],
        "periority": [a.periority for a in answers],
    }
    df = pd.DataFrame(data)
    if df.empty:
        return pd.Series(dtype=float)

    grouped = df.groupby("category")
    return grouped.apply(
        lambda g: (g["answer"] * g["periority"]).sum() / g["periority"].sum()
    )


def transpose_dicts(*dicts):
    transposed = {}
    for d in dicts:
        for key, inner in d.items():
            for sub_key, value in inner.items():
                if sub_key not in transposed:
                    transposed[sub_key] = {"category": sub_key, "inpatient": 0, "outpatient": 0}
                transposed[sub_key][key] = value
    return list(transposed.values())


class SurveyDashboardAPIView(APIView):
    authentication_classes = (TokenAuthentication,)
    permission_classes = [PRManagerOrCeoPermission]

    def get(self, request, *args, **kwargs):
        range_time = request.GET.get("created_at", None)

        if range_time:
            try:
                start_time, end_time = _range_time(range_time)
            except (ValueError, AttributeError):
                raise serializers.ValidationError({"pr": _("invalid range time format")})
            qs = Survey.objects.filter(created__range=(start_time, end_time))
        else:
            # No date picked means "everything", not "the last 24 hours". The
            # old default silently hid every survey older than a day, so the
            # dashboard opened at 0.00% with an empty table on a database that
            # had hundreds of records.
            qs = Survey.objects.all()
        number_all = qs.count()

        satisfied_count = qs.filter(satisfied=True).count()

        inpatient = qs.filter(flag=False).order_by("-id")
        outpatient = qs.filter(flag=True).order_by("-id")

        unsatisfied = qs.filter(satisfied=False).annotate(
            doctor=F("info__doctor"),
            patient=F("info__patient"),
            medical_no=F("info__admission_no"),
        ).values("id", "doctor", "patient", "medical_no", "comment")

        categories = transpose_dicts(
            {"inpatient": process_survey_data(inpatient).transpose().to_dict()},
            {"outpatient": process_survey_data(outpatient).transpose().to_dict()},
        )

        data = {
            "counts": {
                "all": number_all,
                "overall_rate": (satisfied_count / number_all) * 100 if number_all else 0,
                "inpatient": {
                    "inperson": inpatient.filter(survey_type=SurveyType.IN_PERSON).count(),
                    "call": inpatient.filter(survey_type=SurveyType.CALL).count(),
                },
                "outpatient": {
                    "inperson": outpatient.filter(survey_type=SurveyType.IN_PERSON).count(),
                    "call": outpatient.filter(survey_type=SurveyType.CALL).count(),
                },
            },
            "categories": categories,
            "unsatisfied": list(unsatisfied[:10]),
            "status": status.HTTP_200_OK,
        }
        return Response(data, status=status.HTTP_200_OK)
