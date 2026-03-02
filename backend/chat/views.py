from django.contrib.auth.models import User
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .models import Conversation, Message, SharedResource
from .serializers import ConversationSerializer, MessageSerializer, SharedResourceSerializer


@api_view(["GET", "POST"])
@permission_classes([IsAuthenticated])
def conversations_view(request):
    """
    GET  /api/chat/conversations/   – list user's conversations
    POST /api/chat/conversations/   – start or retrieve conversation with mentor_id
    """
    if request.method == "GET":
        convs = Conversation.objects.filter(
            user1=request.user
        ) | Conversation.objects.filter(user2=request.user)
        convs = convs.order_by("-created_at")
        serializer = ConversationSerializer(convs, many=True, context={"request": request})
        return Response(serializer.data)

    # POST – create/get
    mentor_id = request.data.get("mentor_id")
    if not mentor_id:
        return Response({"detail": "mentor_id required."}, status=status.HTTP_400_BAD_REQUEST)
    try:
        other = User.objects.get(pk=mentor_id)
    except User.DoesNotExist:
        return Response({"detail": "User not found."}, status=status.HTTP_404_NOT_FOUND)

    if other == request.user:
        return Response({"detail": "You cannot message yourself."}, status=status.HTTP_400_BAD_REQUEST)

    conversation, created = Conversation.get_or_create_between(request.user, other)
    serializer = ConversationSerializer(conversation, context={"request": request})
    return Response(serializer.data, status=status.HTTP_201_CREATED if created else status.HTTP_200_OK)


@api_view(["GET", "POST"])
@permission_classes([IsAuthenticated])
def messages_view(request, conv_id):
    """
    GET  /api/chat/conversations/:id/messages/  – list messages
    POST /api/chat/conversations/:id/messages/  – send a message
    """
    try:
        conv = Conversation.objects.get(pk=conv_id)
    except Conversation.DoesNotExist:
        return Response({"detail": "Not found."}, status=status.HTTP_404_NOT_FOUND)

    # Security: only participants
    if request.user not in [conv.user1, conv.user2]:
        return Response({"detail": "Forbidden."}, status=status.HTTP_403_FORBIDDEN)

    if request.method == "GET":
        messages = conv.messages.all()
        serializer = MessageSerializer(messages, many=True)
        return Response(serializer.data)

    # POST
    content = request.data.get("content", "").strip()
    if not content:
        return Response({"detail": "content required."}, status=status.HTTP_400_BAD_REQUEST)

    msg = Message.objects.create(conversation=conv, sender=request.user, content=content)
    return Response(MessageSerializer(msg).data, status=status.HTTP_201_CREATED)


@api_view(["GET", "POST"])
@permission_classes([IsAuthenticated])
def shared_resources_view(request, conv_id):
    """
    GET  /api/chat/conversations/:id/resources/  – list shared resources
    POST /api/chat/conversations/:id/resources/  – share a resource
    """
    try:
        conv = Conversation.objects.get(pk=conv_id)
    except Conversation.DoesNotExist:
        return Response({"detail": "Not found."}, status=status.HTTP_404_NOT_FOUND)

    # Security: only participants
    if request.user not in [conv.user1, conv.user2]:
        return Response({"detail": "Forbidden."}, status=status.HTTP_403_FORBIDDEN)

    if request.method == "GET":
        resources = conv.resources.all()
        serializer = SharedResourceSerializer(resources, many=True)
        return Response(serializer.data)

    # POST
    title = request.data.get("title", "").strip()
    url = request.data.get("url", "").strip()
    description = request.data.get("description", "").strip()
    resource_type = request.data.get("resource_type", "link").strip()

    if not title or not url:
        return Response({"detail": "title and url required."}, status=status.HTTP_400_BAD_REQUEST)

    resource = SharedResource.objects.create(
        conversation=conv,
        sender=request.user,
        title=title,
        description=description,
        url=url,
        resource_type=resource_type
    )
    return Response(SharedResourceSerializer(resource).data, status=status.HTTP_201_CREATED)
