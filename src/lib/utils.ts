import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string): string {
  const d = new Date(date);
  return d.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

export function formatTime(date: Date | string): string {
  const d = new Date(date);
  return d.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

export function formatDateTime(date: Date | string): string {
  return `${formatDate(date)} at ${formatTime(date)}`;
}

export function generateRSVPToken(eventId: string, userId: string): string {
  const data = `${eventId}:${userId}:${Date.now()}`;
  return Buffer.from(data).toString("base64url");
}

export function parseRSVPToken(token: string): { eventId: string; userId: string } | null {
  try {
    const decoded = Buffer.from(token, "base64url").toString();
    const [eventId, userId] = decoded.split(":");
    if (eventId && userId) {
      return { eventId, userId };
    }
    return null;
  } catch {
    return null;
  }
}

export function getCarrierEmailDomain(carrier: string): string | null {
  const carrierDomains: Record<string, string> = {
    // Canadian carriers
    bell: "txt.bell.ca",
    rogers: "pcs.rogers.com",
    telus: "msg.telus.com",
    fido: "fido.ca",
    koodo: "msg.koodomobile.com",
    "virgin-mobile": "vmobile.ca",
    videotron: "sms.videotron.ca",
    // US carriers
    "at&t": "txt.att.net",
    verizon: "vtext.com",
    "t-mobile": "tmomail.net",
    sprint: "messaging.sprintpcs.com",
  };
  
  return carrierDomains[carrier.toLowerCase()] || null;
}

export function buildEmailToSMS(phoneNumber: string, carrier: string): string | null {
  const domain = getCarrierEmailDomain(carrier);
  if (!domain) return null;
  
  // Remove all non-numeric characters
  const cleanNumber = phoneNumber.replace(/\D/g, "");
  return `${cleanNumber}@${domain}`;
}





