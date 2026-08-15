from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any, Literal
from enum import Enum

class ToolName(str, Enum):
    CHECK_AVAILABILITY = "check_availability"
    BOOK_APPOINTMENT = "book_appointment"
    TRANSFER_TO_HUMAN = "transfer_to_human"
    TAKE_MESSAGE = "take_message"

class ToolCall(BaseModel):
    id: str
    name: str
    arguments: Dict[str, Any]

class Message(BaseModel):
    role: Literal["user", "assistant", "system", "tool"]
    content: str
    tool_calls: Optional[List[ToolCall]] = None
    tool_call_id: Optional[str] = None

class ConversationState(BaseModel):
    conversation_id: str
    org_id: str
    service_id: str
    customer_identifier: str
    is_sandbox: bool = False
    messages: List[Message] = []
    context: Dict[str, Any] = {}

class CheckAvailabilityArgs(BaseModel):
    service_id: str
    staff_id: Optional[str] = None
    date: str
    timezone: str = "UTC"

class BookAppointmentArgs(BaseModel):
    service_id: str
    staff_id: Optional[str] = None
    customer_name: str
    customer_phone: str
    customer_email: Optional[str] = None
    start_time: str
    timezone: str
    notes: Optional[str] = None

class TransferToHumanArgs(BaseModel):
    reason: str
    phone_number: str

class TakeMessageArgs(BaseModel):
    message: str
    callback_number: Optional[str] = None

class ToolResult(BaseModel):
    success: bool
    data: Optional[Dict[str, Any]] = None
    error: Optional[str] = None

class ConversationRequest(BaseModel):
    state: ConversationState
    user_utterance: str

class ConversationResponse(BaseModel):
    state: ConversationState
    response: str
    tool_calls: List[ToolCall] = []
    should_end: bool = False
    should_transfer: bool = False