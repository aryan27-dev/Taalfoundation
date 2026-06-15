import twilio from 'twilio'

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID!,
  process.env.TWILIO_AUTH_TOKEN!
)

const FROM = `whatsapp:${process.env.TWILIO_WHATSAPP_FROM}`

/**
 * Normalise an Indian phone number to E.164 (+91XXXXXXXXXX)
 * Accepts: 9XXXXXXXXX, 09XXXXXXXXX, +919XXXXXXXXX
 */
function toE164(phone: string): string {
  const digits = phone.replace(/\D/g, '')
  if (digits.startsWith('91') && digits.length === 12) return `+${digits}`
  if (digits.length === 10) return `+91${digits}`
  return `+${digits}`
}

export async function sendWhatsApp(phone: string, message: string) {
  if (!process.env.TWILIO_ACCOUNT_SID) {
    console.warn('WhatsApp: TWILIO_ACCOUNT_SID not set, skipping')
    return
  }
  try {
    await client.messages.create({
      from: FROM,
      to: `whatsapp:${toE164(phone)}`,
      body: message,
    })
  } catch (err) {
    console.error('WhatsApp send error:', err)
  }
}

// ─── Message templates ────────────────────────────────────────────────────────

export function feeReminderMessage(name: string, amount: number, dueDate: string, month: string) {
  return (
    `🎭 *Taal Foundation*\n\n` +
    `Hi ${name}! 🙏\n\n` +
    `Your fee of *₹${amount.toLocaleString('en-IN')}* for *${month}* is due on *${dueDate}*.\n\n` +
    `Please log in to pay:\n` +
    `👉 ${process.env.NEXTAUTH_URL}/login\n\n` +
    `For queries, contact the academy. Thank you! 🌸`
  )
}

export function paymentConfirmMessage(name: string, amount: number, paymentId: string) {
  return (
    `🎭 *Taal Foundation*\n\n` +
    `✅ Payment received! Thank you, ${name}.\n\n` +
    `*Amount:* ₹${amount.toLocaleString('en-IN')}\n` +
    `*Ref ID:* ${paymentId}\n\n` +
    `Keep dancing! 💃`
  )
}

export function welcomeMessage(name: string, email: string, tempPassword: string) {
  return (
    `🎭 *Taal Foundation — Welcome!*\n\n` +
    `Hi ${name}! You've been enrolled.\n\n` +
    `*Login at:* ${process.env.NEXTAUTH_URL}/login\n` +
    `*Email:* ${email}\n` +
    `*Temp Password:* \`${tempPassword}\`\n\n` +
    `Please change your password after first login. 🌟`
  )
}

export function annualIncrementMessage(name: string, oldAmount: number, newAmount: number) {
  return (
    `🎭 *Taal Foundation*\n\n` +
    `Hi ${name}, your monthly fee has been updated.\n\n` +
    `*Previous:* ₹${oldAmount.toLocaleString('en-IN')}\n` +
    `*New fee:* ₹${newAmount.toLocaleString('en-IN')}\n\n` +
    `This takes effect from next month. Thank you! 🙏`
  )
}
