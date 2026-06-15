import { createTransport } from 'nodemailer'

const transporter = createTransport({
  host: process.env.EMAIL_SERVER_HOST,
  port: Number(process.env.EMAIL_SERVER_PORT),
  secure: false,
  auth: {
    user: process.env.EMAIL_SERVER_USER,
    pass: process.env.EMAIL_SERVER_PASSWORD,
  },
})

interface MailOptions {
  to: string
  subject: string
  html: string
}

export async function sendMail({ to, subject, html }: MailOptions) {
  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to,
    subject,
    html,
  })
}

export function welcomeEmail(name: string, email: string, tempPassword: string) {
  return {
    subject: 'Welcome to Taal Foundation — Your Login Credentials',
    html: `
      <div style="font-family:Inter,sans-serif;max-width:560px;margin:0 auto;padding:32px;background:#fff;border-radius:16px;border:1px solid #e2e8f0">
        <div style="text-align:center;margin-bottom:24px">
          <h1 style="color:#0f172a;font-size:24px;margin:0">Taal Foundation</h1>
          <p style="color:#64748b;font-size:13px;margin:4px 0 0">Kathak Dance Academy</p>
        </div>
        <h2 style="color:#0f172a;font-size:18px">Welcome, ${name}! 🎭</h2>
        <p style="color:#475569">Your student account has been created. Use the credentials below to log in.</p>
        <div style="background:#f8fafc;border-radius:12px;padding:20px;margin:20px 0;border:1px solid #e2e8f0">
          <p style="margin:0 0 8px"><strong>Email:</strong> ${email}</p>
          <p style="margin:0"><strong>Temporary Password:</strong> <code style="background:#fef3c7;padding:2px 8px;border-radius:6px;font-size:16px;letter-spacing:2px">${tempPassword}</code></p>
        </div>
        <p style="color:#475569">You will be asked to set a new password on your first login.</p>
        <a href="${process.env.NEXTAUTH_URL}/login" style="display:inline-block;background:linear-gradient(45deg,#f97316,#fbbf24);color:#0f172a;padding:12px 24px;border-radius:999px;font-weight:600;text-decoration:none;margin-top:16px">Login to Portal</a>
        <p style="color:#94a3b8;font-size:12px;margin-top:24px">If you have any issues, contact us at <a href="tel:+919765651268" style="color:#f97316">+91 97656 51268</a></p>
      </div>
    `,
  }
}

export function feeReminderEmail(name: string, amount: number, dueDate: string, month: string) {
  return {
    subject: `Fee Reminder — ₹${amount} due for ${month}`,
    html: `
      <div style="font-family:Inter,sans-serif;max-width:560px;margin:0 auto;padding:32px;background:#fff;border-radius:16px;border:1px solid #e2e8f0">
        <h1 style="color:#0f172a;font-size:20px">Taal Foundation</h1>
        <h2 style="color:#0f172a">Fee Reminder, ${name}</h2>
        <div style="background:#fef3c7;border-radius:12px;padding:20px;margin:20px 0;border:1px solid #fbbf24">
          <p style="margin:0 0 8px;color:#92400e"><strong>Amount Due:</strong> ₹${amount}</p>
          <p style="margin:0 0 8px;color:#92400e"><strong>Month:</strong> ${month}</p>
          <p style="margin:0;color:#92400e"><strong>Due Date:</strong> ${dueDate}</p>
        </div>
        <p style="color:#475569">Please log in to pay your fee to avoid disruption to your classes.</p>
        <a href="${process.env.NEXTAUTH_URL}/student/fees" style="display:inline-block;background:linear-gradient(45deg,#f97316,#fbbf24);color:#0f172a;padding:12px 24px;border-radius:999px;font-weight:600;text-decoration:none;margin-top:16px">Pay Now</a>
      </div>
    `,
  }
}

export function paymentConfirmationEmail(name: string, amount: number, paymentId: string) {
  return {
    subject: `Payment Confirmed — ₹${amount} received`,
    html: `
      <div style="font-family:Inter,sans-serif;max-width:560px;margin:0 auto;padding:32px;background:#fff;border-radius:16px;border:1px solid #e2e8f0">
        <h1 style="color:#0f172a;font-size:20px">Taal Foundation</h1>
        <h2 style="color:#16a34a">Payment Confirmed ✓</h2>
        <p style="color:#475569">Dear ${name}, your payment of <strong>₹${amount}</strong> has been received successfully.</p>
        <div style="background:#f0fdf4;border-radius:12px;padding:20px;margin:20px 0;border:1px solid #86efac">
          <p style="margin:0;color:#166534"><strong>Payment ID:</strong> ${paymentId}</p>
        </div>
        <p style="color:#475569">Your receipt is available in the student portal.</p>
        <a href="${process.env.NEXTAUTH_URL}/student/fees" style="display:inline-block;background:linear-gradient(45deg,#f97316,#fbbf24);color:#0f172a;padding:12px 24px;border-radius:999px;font-weight:600;text-decoration:none;margin-top:16px">View Receipt</a>
      </div>
    `,
  }
}

export function otpEmail(name: string, otp: string) {
  return {
    subject: 'Password Reset OTP — Taal Foundation',
    html: `
      <div style="font-family:Inter,sans-serif;max-width:560px;margin:0 auto;padding:32px;background:#fff;border-radius:16px;border:1px solid #e2e8f0">
        <h1 style="color:#0f172a;font-size:20px">Taal Foundation</h1>
        <h2 style="color:#0f172a">Password Reset</h2>
        <p style="color:#475569">Hi ${name}, use the OTP below to reset your password. It expires in 15 minutes.</p>
        <div style="text-align:center;margin:24px 0">
          <span style="font-size:40px;letter-spacing:12px;font-weight:700;color:#f97316">${otp}</span>
        </div>
        <p style="color:#94a3b8;font-size:13px">If you didn't request this, please ignore this email.</p>
      </div>
    `,
  }
}

export function annualIncrementEmail(name: string, newAmount: number) {
  return {
    subject: 'Fee Update — Annual Revision',
    html: `
      <div style="font-family:Inter,sans-serif;max-width:560px;margin:0 auto;padding:32px;background:#fff;border-radius:16px;border:1px solid #e2e8f0">
        <h1 style="color:#0f172a;font-size:20px">Taal Foundation</h1>
        <h2 style="color:#0f172a">Annual Fee Revision</h2>
        <p style="color:#475569">Dear ${name}, your monthly fee has been revised as per our annual policy.</p>
        <div style="background:#f8fafc;border-radius:12px;padding:20px;margin:20px 0;border:1px solid #e2e8f0">
          <p style="margin:0;color:#0f172a"><strong>New Monthly Fee:</strong> ₹${newAmount}</p>
        </div>
        <p style="color:#475569">This takes effect from the next billing cycle.</p>
      </div>
    `,
  }
}
