from rest_framework.decorators import api_view
from rest_framework.response import Response

@api_view(['POST'])
def receive_data(request):
    data = request.data  # gets JSON payload
    name = data.get("name")
    message = data.get("message")
    print("Received from frontend:", name, message)

    return Response({"status": "success", "name": name, "message": message})
