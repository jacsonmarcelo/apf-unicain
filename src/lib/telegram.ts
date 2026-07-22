// Utility to send Telegram Bot Notifications on new Beta Registrations

const LOCAL_BOT_TOKEN_KEY = 'finanza_telegram_bot_token';
const LOCAL_CHAT_ID_KEY = 'finanza_telegram_chat_id';

export interface TelegramConfig {
  botToken: string;
  chatId: string;
}

export function getTelegramConfig(): TelegramConfig {
  const localToken = localStorage.getItem(LOCAL_BOT_TOKEN_KEY) || '';
  const localChatId = localStorage.getItem(LOCAL_CHAT_ID_KEY) || '';

  const metaEnv = (import.meta as any).env || {};
  const envToken = metaEnv.VITE_TELEGRAM_BOT_TOKEN || '';
  const envChatId = metaEnv.VITE_TELEGRAM_CHAT_ID || '';

  return {
    botToken: localToken || envToken,
    chatId: localChatId || envChatId,
  };
}

export function saveTelegramConfig(botToken: string, chatId: string) {
  localStorage.setItem(LOCAL_BOT_TOKEN_KEY, botToken.trim());
  localStorage.setItem(LOCAL_CHAT_ID_KEY, chatId.trim());
}

export async function sendTelegramNotification(data: {
  name: string;
  email: string;
  phone?: string;
  motivation?: string;
}): Promise<{ success: boolean; message: string }> {
  const config = getTelegramConfig();

  if (!config.botToken || !config.chatId) {
    console.warn('Telegram não configurado (Bot Token ou Chat ID ausente).');
    return {
      success: false,
      message: 'Telegram Bot Token ou Chat ID não configurados.',
    };
  }

  const text = `🎉 *NOVA SOLICITAÇÃO BETA FINANZA!*

👤 *Nome:* ${data.name}
📧 *E-mail:* \`${data.email}\`
📱 *WhatsApp:* ${data.phone || 'Não informado'}
💡 *Motivação:*
_${data.motivation || 'Sem texto fornecido'}_

⏰ *Data:* ${new Date().toLocaleString('pt-BR')}

👉 *Acesse o painel para aprovar:* https://finanza.app`;

  try {
    const url = `https://api.telegram.org/bot${config.botToken}/sendMessage`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: config.chatId,
        text: text,
        parse_mode: 'Markdown',
      }),
    });

    const resData = await response.json();

    if (resData.ok) {
      return { success: true, message: 'Notificação enviada com sucesso no Telegram!' };
    } else {
      console.error('Erro no Telegram API:', resData);
      return {
        success: false,
        message: resData.description || 'Erro ao enviar notificação no Telegram.',
      };
    }
  } catch (error: any) {
    console.error('Erro ao conectar com Telegram:', error);
    return {
      success: false,
      message: error.message || 'Falha na conexão com o Telegram.',
    };
  }
}
