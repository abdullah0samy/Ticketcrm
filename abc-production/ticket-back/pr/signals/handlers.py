from ABCHospital.helpers import WhatsAppHandler


def postsave_survey_handler(data):
    instance = data.get('instance')
    created = data.get('created')
    if created:
        if instance.satisfied:
            WhatsAppHandler.send(
                instance.info.phone,
            )
