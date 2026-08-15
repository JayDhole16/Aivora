import httpx
from typing import Optional, Dict, Any, List
from app.config import get_settings
from app.models import ToolName, ToolCall, CheckAvailabilityArgs, BookAppointmentArgs, TransferToHumanArgs, TakeMessageArgs

class AivoraAPIClient:
    def __init__(self):
        self.settings = get_settings()
        self.client = httpx.AsyncClient(
            base_url=self.settings.AIVORA_API_URL,
            timeout=30.0,
            headers={"Authorization": f"Bearer {self.settings.AIVORA_API_KEY}"} if self.settings.AIVORA_API_KEY else {}
        )
    
    async def close(self):
        await self.client.aclose()
    
    async def search_knowledge_base(self, org_id: str, query: str, top_k: int = 5, threshold: float = 0.7) -> List[Dict[str, Any]]:
        response = await self.client.post(
            f"/api/v1/knowledge-base/search",
            json={"query": query, "topK": top_k, "threshold": threshold},
            params={"orgId": org_id}
        )
        response.raise_for_status()
        return response.json().get("data", [])
    
    async def check_availability(self, org_id: str, args: CheckAvailabilityArgs) -> Dict[str, Any]:
        response = await self.client.get(
            f"/api/v1/appointments/availability",
            params={
                "serviceId": args.service_id,
                "date": args.date,
                "timezone": args.timezone,
                **({"staffId": args.staff_id} if args.staff_id else {}),
                "orgId": org_id
            }
        )
        response.raise_for_status()
        return response.json().get("data", {})
    
    async def book_appointment(self, org_id: str, args: BookAppointmentArgs) -> Dict[str, Any]:
        response = await self.client.post(
            f"/api/v1/appointments",
            json={
                "serviceId": args.service_id,
                "staffId": args.staff_id,
                "customerName": args.customer_name,
                "customerPhone": args.customer_phone,
                "customerEmail": args.customer_email,
                "startTime": args.start_time,
                "timezone": args.timezone,
                "notes": args.notes,
            },
            params={"orgId": org_id}
        )
        response.raise_for_status()
        return response.json().get("data", {})
    
    async def get_voice_config(self, org_id: str, service_id: str) -> Dict[str, Any]:
        response = await self.client.get(
            f"/api/v1/voice/services/{service_id}/config",
            params={"orgId": org_id}
        )
        response.raise_for_status()
        return response.json().get("data", {})

class ToolExecutor:
    def __init__(self, api_client: AivoraAPIClient):
        self.api_client = api_client
        self.allowed_tools = {
            ToolName.CHECK_AVAILABILITY,
            ToolName.BOOK_APPOINTMENT,
            ToolName.TRANSFER_TO_HUMAN,
            ToolName.TAKE_MESSAGE,
        }
    
    async def execute(self, org_id: str, tool_call: ToolCall) -> Dict[str, Any]:
        if tool_call.name not in self.allowed_tools:
            return {"success": False, "error": f"Tool {tool_call.name} not allowed"}
        
        try:
            if tool_call.name == ToolName.CHECK_AVAILABILITY:
                args = CheckAvailabilityArgs(**tool_call.arguments)
                return await self.api_client.check_availability(org_id, args)
            elif tool_call.name == ToolName.BOOK_APPOINTMENT:
                args = BookAppointmentArgs(**tool_call.arguments)
                return await self.api_client.book_appointment(org_id, args)
            elif tool_call.name == ToolName.TRANSFER_TO_HUMAN:
                args = TransferToHumanArgs(**tool_call.arguments)
                return {"success": True, "data": {"message": "Transferring to human", "phone": args.phone_number}}
            elif tool_call.name == ToolName.TAKE_MESSAGE:
                args = TakeMessageArgs(**tool_call.arguments)
                return {"success": True, "data": {"message": "Message taken", "content": args.message}}
        except Exception as e:
            return {"success": False, "error": str(e)}
        
        return {"success": False, "error": "Unknown tool"}