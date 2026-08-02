import { supabase } from './supabase';

export interface ChatMessageRow {
  id: string;
  session_id: string;
  user_id: string | null;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
}

export interface ChatSession {
  session_id: string;
  user_id: string | null;
  messages: ChatMessageRow[];
  last_at: string;
  question_count: number;
}

/**
 * Trae las conversaciones recientes con el asistente, agrupadas por sesion.
 * Resiliente. Trae hasta `limit` MENSAJES (no sesiones) y arma las sesiones
 * client-side, mismo patron que las otras estadisticas del panel.
 */
export async function fetchChatSessions(limit = 500): Promise<ChatSession[]> {
  try {
    const { data, error } = await supabase
      .from('chat_messages')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);
    if (error) return [];

    const rows = (data as ChatMessageRow[]) || [];
    const map = new Map<string, ChatSession>();
    for (const row of rows) {
      let session = map.get(row.session_id);
      if (!session) {
        session = { session_id: row.session_id, user_id: row.user_id, messages: [], last_at: row.created_at, question_count: 0 };
        map.set(row.session_id, session);
      }
      session.messages.push(row);
      if (row.user_id) session.user_id = row.user_id;
      if (row.role === 'user') session.question_count += 1;
      if (row.created_at > session.last_at) session.last_at = row.created_at;
    }

    const sessions = Array.from(map.values());
    for (const s of sessions) {
      s.messages.sort((a, b) => a.created_at.localeCompare(b.created_at));
    }
    sessions.sort((a, b) => b.last_at.localeCompare(a.last_at));
    return sessions;
  } catch {
    return [];
  }
}
