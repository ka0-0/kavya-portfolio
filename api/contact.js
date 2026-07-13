import { Resend } from 'resend';

// Initialize Resend with the API key from environment variables
const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: `Method ${req.method} not allowed` });
  }

  const { name, email, subject, message } = req.body;

  // Basic validation checks
  if (!name || !email || !subject || !message) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  // Email format validation on the server side
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: 'Please provide a valid email address' });
  }

  // Automatically calculate Date & Time in a readable local structure (IST / Global standard)
  const now = new Date();
  const dateStr = now.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  const timeStr = now.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    timeZoneName: 'short'
  });

  // Plain text fallback
  const textContent = `New Portfolio Contact\n\nName:\n${name}\n\nEmail:\n${email}\n\nSubject:\n${subject}\n\nMessage:\n${message}\n\n━━━━━━━━━━━━━━━━━━━━━━\n\nSent from\nKavya Makhan Portfolio\n\nDate: ${dateStr}\nTime: ${timeStr}\n\nReply directly to this email to respond to the sender.`;

  // Premium Responsive HTML structure with Inline CSS
  const htmlContent = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>New Portfolio Contact</title>
    </head>
    <body style="margin: 0; padding: 0; background-color: #f4f5f7; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale;">
      <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f4f5f7; padding: 40px 20px;">
        <tr>
          <td align="center">
            <!-- Main Content Container -->
            <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; background-color: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.05); border: 1px solid #e2e8f0;">
              
              <!-- Dark Header (#09090B) with Cyan accent line -->
              <tr>
                <td style="background-color: #09090B; padding: 32px 40px; text-align: left; position: relative;">
                  <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 800; letter-spacing: -0.5px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">Portfolio Contact</h1>
                  <p style="margin: 6px 0 0 0; color: #a1a1aa; font-size: 14px; font-weight: 500; tracking-wide: 0.5px; text-transform: uppercase; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">New Contact Request</p>
                  <!-- Cyan Accent line -->
                  <div style="position: absolute; bottom: 0; left: 0; right: 0; height: 4px; background-color: #06b6d4; font-size: 1px; line-height: 1px;">&nbsp;</div>
                </td>
              </tr>
              
              <!-- Card Body Content -->
              <tr>
                <td style="padding: 40px; background-color: #ffffff;">
                  <table border="0" cellpadding="0" cellspacing="0" width="100%">
                    
                    <!-- Name Section -->
                    <tr>
                      <td style="padding-bottom: 24px;">
                        <table border="0" cellpadding="0" cellspacing="0" width="100%">
                          <tr>
                            <td style="font-size: 12px; font-weight: 700; text-transform: uppercase; color: #06b6d4; letter-spacing: 1.2px; padding-bottom: 6px; font-family: SFMono-Regular, Consolas, 'Liberation Mono', Menlo, monospace;">👤 Name</td>
                          </tr>
                          <tr>
                            <td style="font-size: 16px; font-weight: 600; color: #09090B; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">${name}</td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                    
                    <!-- Email Section -->
                    <tr>
                      <td style="padding-bottom: 24px;">
                        <table border="0" cellpadding="0" cellspacing="0" width="100%">
                          <tr>
                            <td style="font-size: 12px; font-weight: 700; text-transform: uppercase; color: #06b6d4; letter-spacing: 1.2px; padding-bottom: 6px; font-family: SFMono-Regular, Consolas, 'Liberation Mono', Menlo, monospace;">📧 Email</td>
                          </tr>
                          <tr>
                            <td style="font-size: 16px; font-weight: 600; color: #09090B; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
                              <a href="mailto:${email}" style="color: #06b6d4; text-decoration: none; border-bottom: 1px dashed #06b6d4;">${email}</a>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                    
                    <!-- Subject Section -->
                    <tr>
                      <td style="padding-bottom: 24px;">
                        <table border="0" cellpadding="0" cellspacing="0" width="100%">
                          <tr>
                            <td style="font-size: 12px; font-weight: 700; text-transform: uppercase; color: #06b6d4; letter-spacing: 1.2px; padding-bottom: 6px; font-family: SFMono-Regular, Consolas, 'Liberation Mono', Menlo, monospace;">📝 Subject</td>
                          </tr>
                          <tr>
                            <td style="font-size: 16px; font-weight: 600; color: #09090B; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">${subject}</td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                    
                    <!-- Message Section -->
                    <tr>
                      <td style="padding-bottom: 32px; border-bottom: 1px solid #edf2f7;">
                        <table border="0" cellpadding="0" cellspacing="0" width="100%">
                          <tr>
                            <td style="font-size: 12px; font-weight: 700; text-transform: uppercase; color: #06b6d4; letter-spacing: 1.2px; padding-bottom: 8px; font-family: SFMono-Regular, Consolas, 'Liberation Mono', Menlo, monospace;">💬 Message</td>
                          </tr>
                          <tr>
                            <td style="font-size: 15px; line-height: 1.6; color: #2d3748; background-color: #f7fafc; border-radius: 12px; padding: 20px; border: 1px solid #edf2f7; white-space: pre-wrap; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">${message}</td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                    
                    <!-- Footer Info Section -->
                    <tr>
                      <td style="padding-top: 32px; text-align: left;">
                        <table border="0" cellpadding="0" cellspacing="0" width="100%">
                          <tr>
                            <td style="font-size: 13px; color: #718096; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.4;">
                              <span style="font-weight: 500; color: #a0aec0; text-transform: uppercase; font-size: 10px; tracking-wider: 1px; display: block; margin-bottom: 2px;">Sent from</span>
                              <strong style="color: #1a202c; font-size: 15px;">Kavya Makhan Portfolio</strong>
                            </td>
                          </tr>
                          <tr>
                            <td style="font-size: 11px; color: #a0aec0; padding-top: 8px; font-family: SFMono-Regular, Consolas, 'Liberation Mono', Menlo, monospace;">
                              Date: ${dateStr} <br>
                              Time: ${timeStr}
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                    
                  </table>
                </td>
              </tr>
              
              <!-- Actions/Reply Notice -->
              <tr>
                <td style="background-color: #f8fafc; padding: 24px 40px; text-align: center; border-top: 1px solid #edf2f7; font-size: 12px; color: #718096; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.5;">
                  Reply directly to this email to respond to the sender.
                </td>
              </tr>
              
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

  try {
    const data = await resend.emails.send({
      // Resend onboarding sandbox requires sending from onboarding@resend.dev unless a custom domain is verified
      from: 'Portfolio Contact <onboarding@resend.dev>',
      to: 'captaingaming16r@gmail.com',
      replyTo: email, // Enables pressing 'Reply' in Gmail to respond directly to the visitor
      subject: `Portfolio Contact: ${subject}`,
      text: textContent,
      html: htmlContent,
    });

    if (data.error) {
      return res.status(400).json({ error: data.error.message || 'Resend API returned an error' });
    }

    return res.status(200).json({ success: true, id: data.data?.id });
  } catch (error) {
    console.error('Serverless function error sending email:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
}
