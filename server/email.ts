import { MailService } from '@sendgrid/mail';
import { ChapterRequest } from "@shared/schema";

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
    const msg = {
      to: params.to,
      from: params.from, // This should be a verified sender in your SendGrid account
      subject: params.subject,
      text: params.text || '', 
      html: params.html || '',
    };
    await mailService.send(msg);
    console.log(`Email sent successfully to ${params.to}`);
    return true;
  } catch (error) {
    console.error('SendGrid email error:', error);
    return false;
  }
}

// Send chapter request notification email
export async function sendChapterRequestNotification(chapterRequest: ChapterRequest): Promise<boolean> {
  const to = 'ops@bhfe.com'; // Your email address
  // Use a from address that's verified in your SendGrid account
  const from = 'notifications@cfpethicsworkshop.com'; 
  const subject = `New Chapter Request: ${chapterRequest.chapterName}`;
  
  const html = `
    <h2>New Chapter Request</h2>
    <p>A new chapter has requested an ethics workshop:</p>
    
    <h3>Request Details:</h3>
    <ul>
      <li><strong>Chapter Name:</strong> ${chapterRequest.chapterName}</li>
      <li><strong>Contact Person:</strong> ${chapterRequest.contactPerson}</li>
      <li><strong>Email:</strong> ${chapterRequest.email}</li>
      <li><strong>Phone:</strong> ${chapterRequest.phone || 'Not provided'}</li>
      <li><strong>Preferred Date:</strong> ${chapterRequest.preferredDate ? new Date(chapterRequest.preferredDate).toLocaleDateString() : 'Not provided'}</li>
      <li><strong>Estimated Attendees:</strong> ${chapterRequest.estimatedAttendees}</li>
      <li><strong>Instructor Name:</strong> ${chapterRequest.instructorName}</li>
      <li><strong>Additional Info:</strong> ${chapterRequest.additionalInfo || 'None'}</li>
    </ul>
    
    <p>Please follow up with the chapter to confirm details and schedule the workshop.</p>
  `;
  
  const text = `
New Chapter Request

A new chapter has requested an ethics workshop:

Request Details:
- Chapter Name: ${chapterRequest.chapterName}
- Contact Person: ${chapterRequest.contactPerson}
- Email: ${chapterRequest.email}
- Phone: ${chapterRequest.phone || 'Not provided'}
- Preferred Date: ${chapterRequest.preferredDate ? new Date(chapterRequest.preferredDate).toLocaleDateString() : 'Not provided'}
- Estimated Attendees: ${chapterRequest.estimatedAttendees}
- Instructor Name: ${chapterRequest.instructorName}
- Additional Info: ${chapterRequest.additionalInfo || 'None'}

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