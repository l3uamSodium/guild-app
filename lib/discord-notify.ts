// lib/discord-notify.ts
import { prisma } from "@/lib/prisma";

interface EmbedConfig {
  title: string;
  color: number;
}

const EMBED_PRESETS: Record<string, EmbedConfig> = {
  TEST_NOTIFICATION: {
    title: "🛡️ ระบบแจ้งเตือนกิลด์ ONIZUKA",
    color: 0x8B5CF6,
  },
  APPROVED: {
    title: "✅ อนุมัติพักกิจกรรมกิลด์สำเร็จ",
    color: 0x10B981,
  },
  REJECTED: {
    title: "❌ คำขอพักกิจกรรมไม่ได้รับการอนุมัติ",
    color: 0xEF4444,
  },
  ITEM_DELIVERED: {
    title: "🎁 จัดส่งของรางวัลสำเร็จเรียบร้อย",
    color: 0xFF2D78,
  },
  SYSTEM: {
    title: "📢 การแจ้งเตือนระบบ",
    color: 0x64748B,
  },
};

/**
 * Sends a direct message (DM) to a Discord user using the Discord Bot Token.
 * Logs success or failure to the NotificationLog table.
 * Does not throw errors on API failure; instead, logs them and returns false.
 *
 * @param discordUserId The unique Discord snowflake ID of the user.
 * @param message The text message to send.
 * @param type The type of notification for logging (e.g., "APPROVED", "REJECTED", "ITEM_DELIVERED").
 * @returns Promise<boolean> True if successfully sent, false otherwise.
 */
export async function sendDM(
  discordUserId: string,
  message: string,
  type: string = "SYSTEM"
): Promise<boolean> {
  const token = process.env.DISCORD_BOT_TOKEN;
  if (!token) {
    console.error("DISCORD_BOT_TOKEN is not configured in environment variables.");
    await logNotification("unknown", type, { error: "DISCORD_BOT_TOKEN is missing", message }, false);
    return false;
  }

  // Resolve memberId from discordUserId for logging
  let memberId = "unknown";
  try {
    const user = await prisma.user.findUnique({
      where: { discordId: discordUserId },
      include: { member: true },
    });
    if (user?.member) {
      memberId = user.member.id;
    }
  } catch (dbError) {
    console.error("Failed to query member for discordUserId:", discordUserId, dbError);
  }

  try {
    // 1. Open a DM channel with the recipient
    const channelResponse = await fetch("https://discord.com/api/v10/users/@me/channels", {
      method: "POST",
      headers: {
        Authorization: `Bot ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        recipient_id: discordUserId,
      }),
    });

    if (!channelResponse.ok) {
      const errorText = await channelResponse.text();
      console.error(`Failed to create Discord DM channel for user ${discordUserId}: ${channelResponse.status} ${errorText}`);
      await logNotification(
        memberId,
        type,
        { error: `DM channel creation failed: ${channelResponse.status}`, details: errorText, message },
        false
      );
      return false;
    }

    const channelData = await channelResponse.json();
    const channelId = channelData.id;

    if (!channelId) {
      console.error(`No channel ID returned by Discord users/@me/channels API for ${discordUserId}`);
      await logNotification(
        memberId,
        type,
        { error: "No channel ID returned from users/@me/channels API", message },
        false
      );
      return false;
    }

    const preset = EMBED_PRESETS[type] || EMBED_PRESETS.SYSTEM;

    const embed = {
      title: preset.title,
      description: message,
      color: preset.color,
      footer: {
        text: "ONIZUKA Guild Manager • ระบบอัตโนมัติ",
      },
      timestamp: new Date().toISOString(),
    };

    // 2. Dispatch the DM message with rich embed
    const messageResponse = await fetch(`https://discord.com/api/v10/channels/${channelId}/messages`, {
      method: "POST",
      headers: {
        Authorization: `Bot ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        embeds: [embed],
      }),
    });

    if (!messageResponse.ok) {
      const errorText = await messageResponse.text();
      console.error(`Failed to dispatch Discord DM message for user ${discordUserId}: ${messageResponse.status} ${errorText}`);
      await logNotification(
        memberId,
        type,
        { error: `Message dispatch failed: ${messageResponse.status}`, details: errorText, message },
        false
      );
      return false;
    }

    // 3. Log successful notification
    await logNotification(memberId, type, { message }, true);
    return true;
  } catch (error: any) {
    console.error(`Unexpected exception in sendDM for user ${discordUserId}:`, error);
    await logNotification(
      memberId,
      type,
      { error: error.message || String(error), message },
      false
    );
    return false;
  }
}

/**
 * Sends a rich embed message to a Discord server channel via Webhook.
 *
 * @param webhookUrl The Discord Webhook URL.
 * @param embed The Discord Embed object structure.
 * @returns Promise<boolean> True if successfully sent, false otherwise.
 */
export async function sendWebhook(webhookUrl: string, embed: object): Promise<boolean> {
  if (!webhookUrl || webhookUrl === "your-webhook-url") {
    console.warn("DISCORD_WEBHOOK_URL is not set or using placeholder.");
    return false;
  }

  try {
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        embeds: [embed],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Failed to send Discord Webhook: ${response.status} ${errorText}`);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Unexpected exception in sendWebhook:", error);
    return false;
  }
}

/**
 * Helper to persist logs into the database.
 */
async function logNotification(
  memberId: string,
  type: string,
  payload: any,
  success: boolean
) {
  try {
    await prisma.notificationLog.create({
      data: {
        memberId,
        type,
        payload: payload || {},
        success,
      },
    });
  } catch (error) {
    console.error("Critical: Failed to save NotificationLog to database:", error);
  }
}
