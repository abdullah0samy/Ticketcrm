from django.utils import timezone
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

    # Computed helpers so every client doesn't re-derive SLA state or look up
    # the assignee's name separately.
    assigned_to_name = serializers.SerializerMethodField()
    is_overdue = serializers.SerializerMethodField()
    sla_state = serializers.SerializerMethodField()

    class Meta:
        model = Ticket
        media_model = TicketMedia
        media_instance = 'ticket'
        exclude = ['subscribers']
        extra_fields = ['image', 'image_id', 'comment',
                        'assigned_to_name', 'is_overdue', 'sla_state']
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

    def get_assigned_to_name(self, obj):
        if not obj.assigned_to:
            return None
        full = f"{obj.assigned_to.first_name} {obj.assigned_to.last_name}".strip()
        return full or str(obj.assigned_to.fingerid)

    def get_is_overdue(self, obj):
        """True only while the ticket is still open past its deadline."""
        if not obj.sla_deadline or obj.status in (TicketStatus.COMPLETE, TicketStatus.CLOSED):
            return False
        return timezone.now() > obj.sla_deadline

    def get_sla_state(self, obj):
        """`ok` | `warning` (>=80% elapsed) | `breached` | `met` | null."""
        if not obj.sla_deadline:
            return None
        if obj.status in (TicketStatus.COMPLETE, TicketStatus.CLOSED):
            finished = obj.completed_at or obj.closed_at
            if not finished:
                return None
            return "met" if finished <= obj.sla_deadline else "breached"

        now = timezone.now()
        if now > obj.sla_deadline:
            return "breached"
        total = (obj.sla_deadline - obj.created_at).total_seconds()
        if total <= 0:
            return "ok"
        elapsed = (now - obj.created_at).total_seconds()
        return "warning" if elapsed / total >= 0.8 else "ok"



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
    # Optional free-text justification, stored on the TicketTransfer record.
    reason = serializers.CharField(required=False, allow_blank=True, allow_null=True)
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
    # `kind` is derived from the uploaded file's content type, never trusted
    # from the client — it decides which player the UI renders.
    kind = serializers.CharField(read_only=True)
    attachment_name = serializers.CharField(read_only=True)
    attachment_size = serializers.IntegerField(read_only=True)
    reply_preview = serializers.SerializerMethodField()

    class Meta:
        model = TicketComment
        fields = '__all__'
        extra_kwargs = {
            'commenter': {'read_only': True},
            'edited_at': {'read_only': True},
            # Optional now: a photo or a voice note is a message on its own.
            # The model still rejects a message carrying neither.
            'comment': {'required': False, 'allow_blank': True},
        }

    def get_reply_preview(self, instance):
        """Enough of the quoted message to render the quote bar, no more."""
        parent = instance.reply_to
        if parent is None:
            return None
        body = (parent.comment or '').strip()
        return {
            'id': parent.id,
            'kind': parent.kind,
            'comment': body[:140],
            'commenter_name': parent.commenter.get_full_name() if parent.commenter_id else None,
        }

    def validate_attachment(self, value):
        if value is None:
            return value
        # 25 MB. Voice notes are tiny; this is really a guard on video-sized
        # files being dropped into a chat that has no streaming story.
        limit = 25 * 1024 * 1024
        if value.size > limit:
            raise serializers.ValidationError(
                _("attachment is larger than 25MB"))
        return value

    def create(self, validated_data):
        upload = validated_data.get('attachment')
        if upload is not None:
            content_type = (getattr(upload, 'content_type', '') or '').lower()
            if content_type.startswith('image/'):
                kind = CommentKind.IMAGE
            elif content_type.startswith('audio/') or content_type.startswith('video/webm'):
                # MediaRecorder emits audio-only clips labelled video/webm on
                # some browsers, so the container alone cannot be trusted.
                kind = CommentKind.AUDIO
            else:
                kind = CommentKind.FILE
            validated_data['kind'] = kind
            validated_data['attachment_name'] = getattr(upload, 'name', '') or ''
            validated_data['attachment_size'] = upload.size
        else:
            validated_data['kind'] = CommentKind.TEXT
            validated_data.pop('duration', None)

        return self.Meta.model.objects.create(
            **validated_data, commenter=self.context['request'].user)

    def update(self, instance, validated_data):
        # Only the text of a message is editable; swapping the file out from
        # under an existing message would rewrite history for everyone else.
        instance.comment = validated_data.get('comment', instance.comment)
        instance.edited_at = timezone.now()
        instance.save()
        return instance

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
    poster_name = serializers.SerializerMethodField()
    likes_count = serializers.SerializerMethodField()
    liked_by_me = serializers.SerializerMethodField()
    comments_count = serializers.SerializerMethodField()

    class Meta:
        model = Note
        media_model = NoteMedia
        media_instance = 'note'
        fields = '__all__'
        extra_fields = ['media', 'media_id', 'medias', 'poster_name',
                        'likes_count', 'liked_by_me', 'comments_count']
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

    def get_poster_name(self, obj):
        return obj.poster.get_full_name() if obj.poster else None

    def get_likes_count(self, obj):
        return obj.reactions.count()

    def get_liked_by_me(self, obj):
        request = self.context.get('request')
        user = getattr(request, 'user', None)
        if not (user and user.is_authenticated):
            return False
        return obj.reactions.filter(user=user).exists()

    def get_comments_count(self, obj):
        return obj.comment_note.count()

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


class TicketTransferSerializer(serializers.ModelSerializer):
    """History of a ticket moving between departments."""
    ticket_number = serializers.CharField(source='ticket.ticket_number', read_only=True)
    ticket_description = serializers.CharField(source='ticket.description', read_only=True)
    ticket_status = serializers.CharField(source='ticket.status', read_only=True)
    ticket_priority = serializers.CharField(source='ticket.priority', read_only=True)
    from_department_name = serializers.CharField(source='from_department.name', read_only=True)
    to_department_name = serializers.CharField(source='to_department.name', read_only=True)
    transferred_by_name = serializers.SerializerMethodField()

    class Meta:
        model = TicketTransfer
        fields = ['id', 'ticket', 'ticket_number', 'ticket_description', 'ticket_status',
                  'ticket_priority', 'from_department', 'from_department_name',
                  'to_department', 'to_department_name', 'transferred_by',
                  'transferred_by_name', 'fresh_start', 'reason', 'created_at']

    def get_transferred_by_name(self, obj):
        return obj.transferred_by.get_full_name() if obj.transferred_by else None
