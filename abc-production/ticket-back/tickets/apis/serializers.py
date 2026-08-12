import phonenumbers
from rest_framework import serializers
from django.utils.translation import gettext_lazy as _
from ticket.models.models import *
from ticket.models.choices import *
from ABCHospital.helpers import Serializer
from ABCHospital.constants import ADMIN_DEPARTMENT
from ABCHospital.middlewares import RequestMiddleware
from django.db import transaction


class ISSUESTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = ISSUESType
        fields = '__all__'

    def to_representation(self, instance):
        data = super(self.__class__, self).to_representation(instance)

        data.update(
            department=Serializer(self.context['request'], instance, 'department', ['id', 'name', 'reciever', 'modules'], True).serialize() if instance.department else ADMIN_DEPARTMENT,

        )
        return data


class SelectISSUESTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model =  ISSUESType
        fields = ['id', 'name']
        extra_kwargs = {
            'name': {'read_only': True}, 
            "id":  {'read_only': True}, 
        } 

    def to_representation(self, instance):
        data = super(self.__class__, self).to_representation(instance)        
        data['label'] = data.pop('name', None)
        data['value'] = data.pop('id', None)
        return data

class ImageSerializer(serializers.Serializer):
    id = serializers.IntegerField(required=False)
    image = serializers.ImageField(
        max_length=100000,
        allow_empty_file=False,
        use_url=True,
        write_only=True,
        required=True
    )
    
class TicketSerializer(serializers.ModelSerializer):
    image = serializers.ListField(
            child=serializers.FileField(
                max_length=100000,
                allow_empty_file=False,
                use_url=True
            ),
            required=False, write_only=True
        )
    image_id = serializers.IntegerField(required=False, write_only=True)
    images = serializers.SerializerMethodField('get_images')
    comment = serializers.SerializerMethodField('get_last_comment')

    class Meta:
        model = Ticket
        media_model = TicketMedia
        media_instance = 'ticket'
        exclude = ['subscribers']
        extra_fields = ['image', 'image_id', 'comment']
        extra_kwargs = {
            'complaint': {'read_only': True},
            'description': {'required': True},
            "image": {"write_only": True},
            "image_id": {"write_only": True},
        }

    def get_images(self, obj):
        request = RequestMiddleware(get_response=None)
        request = request.thread_local.current_request
        request = self.context.get('request', request) 

        return [{"id": m.id, "image": request.build_absolute_uri(m.image.url)} for m in obj.image_ticket.all()]


    def get_last_comment(self, obj):
        return obj.ticket_comment.last().comment if obj.ticket_comment.exists() else None



    def create(self, validated_data):
        images = validated_data.pop('image', [])

        with transaction.atomic():
            instance = self.Meta.model.objects.create(
                **validated_data, complaint=self.context['request'].user)
            
            for image in images:
                self.Meta.media_model.objects.create(
                    **{self.Meta.media_instance: instance}, image=image)
            return instance

    def update(self, instance, validated_data):
        mdi = validated_data.pop('image', None)
        mdi_id = validated_data.pop('image_id', None)

        with transaction.atomic():
            if mdi and mdi_id:
                media = self.Meta.media_model.objects.filter(
                    **{self.Meta.media_instance: instance}, id=mdi_id)
                if media.exists():
                    media = media.get()
                    media.image = mdi[0]
                    media.save()
                    
            elif mdi_id and not mdi:
                self.Meta.media_model.objects.filter(
                    **{self.Meta.media_instance: instance}, id=mdi_id).delete()

            elif mdi and not mdi_id:
                self.Meta.media_model.objects.create(
                    **{self.Meta.media_instance: instance}, image=mdi[0])

            return super(self.__class__, self).update(instance=instance, validated_data=validated_data)

    def to_representation(self, instance):
        request = RequestMiddleware(get_response=None)
        request = request.thread_local.current_request
        request = self.context.get('request', request) 
        data = super(self.__class__, self).to_representation(instance)
        
        phone_parser = phonenumbers.parse(
            instance.phone) if instance.phone else None
        data.update(
            complaint={"id": instance.complaint.id, "name": instance.complaint.get_full_name(),  "department": instance.complaint.department.name if instance.complaint.department else None,
                       "image": request.build_absolute_uri(instance.complaint.image.url) if instance.complaint.image else None},
            department=Serializer(request, instance, 'department', ['id', 'name', 'reciever', 'modules'], True).serialize()  if instance.department else ADMIN_DEPARTMENT,

            phone={"country_code": f"+{phone_parser.country_code}",
                   "phone": f"{phone_parser.national_number}"} if phone_parser else None,
            issuetype=Serializer(request, instance, 'issuetype', ['id', 'name'], True).serialize(),
        )
        return data

class TicketHistorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Ticket.history.model
        fields = '__all__'
        ordering = 'history_id'

    def to_representation(self, instance):
        data = super(self.__class__, self).to_representation(instance)

        try:
            history_user = {
                'id': instance.history_user.id,
                'first_name': instance.history_user.first_name,
                'last_name': instance.history_user.last_name,
                'username': instance.history_user.username,
                'email': instance.history_user.email,
                'image': self.context['request'].build_absolute_uri(instance.history_user.image.url)
            }
        except:
            history_user = None

        data.update(
            history_user=history_user,
            department=Serializer(self.context['request'], instance, 'department', ['id', 'name', 'reciever', 'modules'], True).serialize() if instance.department else ADMIN_DEPARTMENT,

            issuetype=Serializer(self.context['request'], instance, 'issuetype', 
                                 ['id', 'name'], True).serialize()
        )

        return data

class TransferTicketSerializer(serializers.Serializer):
    department = serializers.PrimaryKeyRelatedField(
        queryset=Department.objects.filter(reciever=True)
    )
    option = serializers.ChoiceField(
        choices=[
            (True, _('True')),
            (False, _('False')),
        ]
    )
    ticket = serializers.ListField(
        child=serializers.PrimaryKeyRelatedField(
            queryset=Ticket.objects.filter(status__in=[
                TicketStatus.ON_HOLD,
                TicketStatus.IN_PROGRESS
            ]),
        ),
    )

class RestoreTicketSerializer(serializers.Serializer):
    ticket = serializers.ListField(
        child=serializers.PrimaryKeyRelatedField(
            queryset=Ticket.deleted_objects.all(),
        ),
    )

class SoftDeleteTicketSerializer(serializers.Serializer):
    ticket = serializers.ListField(
        child=serializers.PrimaryKeyRelatedField(
            queryset=Ticket.objects.filter(status__in=[
                TicketStatus.COMPLETE,
            ]),
        ),
    )
    
class TicketCommentSerializer(serializers.ModelSerializer):

    class Meta:
        model = TicketComment
        fields = '__all__'
        extra_kwargs = {
            'commenter': {'read_only': True},
            "comment": {'required': True},
        }

    def create(self, validated_data):
        return self.Meta.model.objects.create(**validated_data, commenter=self.context['request'].user)

    def to_representation(self, instance):
        request = RequestMiddleware(get_response=None)
        request = request.thread_local.current_request
        request = self.context.get('request', request) 

        data = super(self.__class__, self).to_representation(instance)
        try:
            commenter = instance.commenter
        except:
            commenter = None

        if commenter is not None:
            commenter = {"id": instance.commenter.id, "name": instance.commenter.get_full_name(
            ), "image": f"{request.build_absolute_uri(instance.commenter.image.url)}"}

        data.update(
            commenter=commenter,
        )
        return data


class NoteSerializer(serializers.ModelSerializer):
    media = serializers.ListField(
        child=serializers.FileField(
            max_length=100000,
            allow_empty_file=False,
            use_url=True
        ),
        required=False, write_only=True
    )
    media_id = serializers.IntegerField(required=False, write_only=True)
    medias = serializers.SerializerMethodField('get_medias')
        
    class Meta:
        model = Note
        media_model = NoteMedia
        media_instance = 'note'
        fields = '__all__'
        extra_fields = ['media', 'media_id', 'medias']
        extra_kwargs = {
            'poster': {'read_only': True},
            'department': {'read_only': True},
            'description': {'required': True},
            "media": {"write_only": True},
            "media_id": {"write_only": True},
        }

    def get_medias(self, obj):
        request = RequestMiddleware(get_response=None)
        request = request.thread_local.current_request
        request = self.context.get('request', request) 

        return [{"id": m.id, "media": request.build_absolute_uri(m.media.url)} for m in obj.media_note.all()]

    def create(self, validated_data):
        mdi = validated_data.pop('media', [])

        with transaction.atomic():
            instance = self.Meta.model.objects.create(
                **validated_data, poster=self.context['request'].user, department=self.context['request'].user.department)

            for m in mdi:
                self.Meta.media_model.objects.create(
                    **{self.Meta.media_instance: instance}, media=m)
                
            return instance

    def update(self, instance, validated_data):
        mdi = validated_data.pop('media', None)
        mdi_id = validated_data.pop('media_id', None)

        with transaction.atomic():
            if mdi and mdi_id:
                media = self.Meta.media_model.objects.filter(
                    **{self.Meta.media_instance: instance}, id=mdi_id)
                if media.exists():
                    media = media.get()
                    media.media = mdi[0]
                    media.save()
                    
            elif mdi_id and not mdi:
                self.Meta.media_model.objects.filter(
                    **{self.Meta.media_instance: instance}, id=mdi_id).delete()

            elif mdi and not mdi_id:
                self.Meta.media_model.objects.create(
                    **{self.Meta.media_instance: instance}, media=mdi[0])
                
            return super(self.__class__, self).update(instance=instance, validated_data=validated_data)

    def to_representation(self, instance):
        request = RequestMiddleware(get_response=None)
        request = request.thread_local.current_request
        request = self.context.get('request', request) 

        data = super(self.__class__, self).to_representation(instance)

        data.update(
            poster={"id": instance.poster.id, "name": instance.poster.get_full_name(
            ),  "image": request.build_absolute_uri(instance.poster.image.url) if instance.poster.image else None},
            department=Serializer(request, instance, 'department', ['id', 'name', 'reciever', 'modules'], True).serialize()  if instance.department else ADMIN_DEPARTMENT,
        )
        return data


class NoteCommentSerializer(serializers.ModelSerializer):

    class Meta:
        model = NoteComment
        fields = '__all__'
        extra_kwargs = {
            'commenter': {'read_only': True},
        }

    def create(self, validated_data):
        return self.Meta.model.objects.create(**validated_data, commenter=self.context['request'].user)

    def to_representation(self, instance):
        data = super(NoteCommentSerializer, self).to_representation(instance)
        data.update(
            commenter={"name": instance.commenter.get_full_name(
            ), "image": f"{self.context['request'].build_absolute_uri(instance.commenter.image.url)}"},
        )
        return data


class ImportExportFileSerializer(serializers.ModelSerializer):
    class Meta:
        model = ImportExportFile
        fields = ['id', 'files', 'title', 'created_at']
