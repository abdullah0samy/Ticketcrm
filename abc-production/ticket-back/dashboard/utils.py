import pandas as pd
from pr.models.choices import QuestionType

from django.db.models import Avg
from ticket.models import Ticket

def calculate_aht(queryset):
    # Filter tickets that are closed
    closed_tickets = queryset.filter(closed_at__isnull=False)
    # Calculate the average resolution time
    avg_resolution_time = closed_tickets.aggregate(
        avg_time=Avg('resolution_time')
    )['avg_time']

    return avg_resolution_time



# Common function for processing survey data
def process_survey_data(survey_data):
    scaler = lambda group, answer: answer * 5 if group == QuestionType.YES_NO else answer
    
    answers = [answer for survey in survey_data for answer in survey.answers.all()]
    data = {
        'answer': [scaler(answer.group, answer.answer) for answer in answers],
        'category': [answer.category for answer in answers],
        'periority': [answer.periority for answer in answers],
    }
    df = pd.DataFrame(data)
    if df.empty:
        return pd.Series(dtype=float)
    grouped_data = df.groupby('category')
    result_df = grouped_data.apply(lambda group: (group['answer'] * group['periority']).sum() / group['periority'].sum())
    return result_df


def transpose_dicts(*dicts):
    transposed_dict = {}

    for d in dicts:
        for key, inner_dict in d.items():
            for sub_key, value in inner_dict.items():
                if sub_key not in transposed_dict:
                    transposed_dict[sub_key] = {"category": sub_key, "inpatient": 0, "outpatient": 0}

                transposed_dict[sub_key][key] = value

    return list(transposed_dict.values())