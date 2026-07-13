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

  try {
    const data = await resend.emails.send({
      // Resend onboarding sandbox requires sending from onboarding@resend.dev unless a custom domain is verified
      from: 'Portfolio Contact <onboarding@resend.dev>',
      to: 'captaingaming16r@gmail.com',
      replyTo: email, // Enables pressing 'Reply' in Gmail to respond directly to the visitor
      subject: `Portfolio Contact: ${subject}`,
      text: `New Portfolio Contact\n\nName:\n${name}\n\nEmail:\n${email}\n\nSubject:\n${subject}\n\nMessage:\n${message}`,
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
