import { MailService } from '@sendgrid/mail';

// Initialize SendGrid
const sendgridApiKey = process.env.SENDGRID_API_KEY;
if (!sendgridApiKey) {
  console.warn('SendGrid API key is missing. Email notifications will be disabled.');
}

const mailService = new MailService();
if (sendgridApiKey) {
  mailService.setApiKey(sendgridApiKey);
}

export interface EmailParams {
  to: string;
  from: string;
  subject: string;
  text?: string;
  html?: string;
}

// Function to send email
export async function sendEmail(params: EmailParams): Promise<boolean> {
  if (!sendgridApiKey) {
    console.warn('Cannot send email: SendGrid API key is not configured.');
    return false;
  }

  try {
    await mailService.send({
      to: params.to,
      from: params.from, // This should be a verified sender in your SendGrid account
      subject: params.subject,
      text: params.text,
      html: params.html,
    });
    console.log(`Email sent successfully to ${params.to}`);
    return true;
  } catch (error) {
    console.error('SendGrid email error:', error);
    return false;
  }
}

// Import the ChapterRequest type from schema
import { ChapterRequest } from "@shared/schema";

// Send chapter request notification email
export async function sendChapterRequestNotification(chapterRequest: ChapterRequest): Promise<boolean> {
  const to = 'a.freed@outlook.com'; // Your email address
  const from = 'notifications@cfpethicsworkshop.com'; // Should be verified in SendGrid
  const subject = `New Chapter Request: ${chapterRequest.chapter_name}`;
  
  const html = `
    <h2>New Chapter Request</h2>
    <p>A new chapter has requested an ethics workshop:</p>
    
    <h3>Request Details:</h3>
    <ul>
      <li><strong>Chapter Name:</strong> ${chapterRequest.chapter_name}</li>
      <li><strong>Contact Person:</strong> ${chapterRequest.contact_person}</li>
      <li><strong>Email:</strong> ${chapterRequest.email}</li>
      <li><strong>Phone:</strong> ${chapterRequest.phone || 'Not provided'}</li>
      <li><strong>Preferred Date:</strong> ${chapterRequest.preferred_date ? new Date(chapterRequest.preferred_date).toLocaleDateString() : 'Not provided'}</li>
      <li><strong>Estimated Attendees:</strong> ${chapterRequest.estimated_attendees}</li>
      <li><strong>Instructor Name:</strong> ${chapterRequest.instructor_name}</li>
      <li><strong>Additional Info:</strong> ${chapterRequest.additional_info || 'None'}</li>
    </ul>
    
    <p>Please follow up with the chapter to confirm details and schedule the workshop.</p>
  `;
  
  const text = `
    New Chapter Request
    
    A new chapter has requested an ethics workshop:
    
    Request Details:
    - Chapter Name: ${chapterRequest.chapter_name}
    - Contact Person: ${chapterRequest.contact_person}
    - Email: ${chapterRequest.email}
    - Phone: ${chapterRequest.phone || 'Not provided'}
    - Preferred Date: ${chapterRequest.preferred_date ? new Date(chapterRequest.preferred_date).toLocaleDateString() : 'Not provided'}
    - Estimated Attendees: ${chapterRequest.estimated_attendees}
    - Instructor Name: ${chapterRequest.instructor_name}
    - Additional Info: ${chapterRequest.additional_info || 'None'}
    
    Please follow up with the chapter to confirm details and schedule the workshop.
  `;
  
  return sendEmail({
    to,
    from,
    subject,
    html,
    text,
  });
}