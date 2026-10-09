export interface ToolCall {
  tool: string;
  arguments: string | Record<string, any>;
  result: any;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  toolCalls?: ToolCall[];
  error?: boolean;
}

export interface ChatResponse {
  reply: string;
  tool_calls_executed: ToolCall[];
  success: boolean;
}

export interface BackendHealth {
  status: string;
  orders_loaded: number;
  openai_configured: boolean;
  gemini_configured?: boolean;
  model?: string;
  timestamp: number;
}
