import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import QRCode from "npm:qrcode@1.5.3";

interface RequestBody {
  email: string;
  fullName: string;
  eventTitle: string;
  eventDateTime: string;
  eventLocation: string;
  qrCodeData: string;
}

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const body: RequestBody = await req.json();
    const { email, fullName, eventTitle, eventDateTime, eventLocation, qrCodeData } = body;

    const qrCodeDataUrl = await QRCode.toDataURL(qrCodeData, {
      width: 300,
      margin: 2,
    });

    const eventDate = new Date(eventDateTime);
    const formattedDate = eventDate.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    const formattedTime = eventDate.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });

    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Event Registration Confirmation</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f3f4f6;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f3f4f6; padding: 20px;">
            <tr>
              <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                  <tr>
                    <td style="background: linear-gradient(135deg, #2563eb 0%, #4f46e5 100%); padding: 40px; text-align: center;">
                      <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: bold;">Registration Confirmed!</h1>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 40px;">
                      <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                        Hi ${fullName},
                      </p>
                      <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                        Thank you for registering for <strong>${eventTitle}</strong>. We're excited to see you there!
                      </p>
                      
                      <div style="background-color: #f9fafb; border-left: 4px solid #2563eb; padding: 20px; margin: 30px 0;">
                        <h2 style="color: #1f2937; margin: 0 0 15px 0; font-size: 18px;">Event Details</h2>
                        <p style="color: #4b5563; margin: 8px 0; font-size: 15px;">
                          <strong>📅 Date:</strong> ${formattedDate}
                        </p>
                        <p style="color: #4b5563; margin: 8px 0; font-size: 15px;">
                          <strong>🕒 Time:</strong> ${formattedTime}
                        </p>
                        <p style="color: #4b5563; margin: 8px 0; font-size: 15px;">
                          <strong>📍 Location:</strong> ${eventLocation}
                        </p>
                      </div>

                      <div style="text-align: center; margin: 30px 0;">
                        <h3 style="color: #1f2937; margin: 0 0 15px 0; font-size: 18px;">Your Event Ticket</h3>
                        <p style="color: #6b7280; font-size: 14px; margin: 0 0 15px 0;">
                          Present this QR code at the event for check-in
                        </p>
                        <img src="${qrCodeDataUrl}" alt="QR Code Ticket" style="max-width: 300px; height: auto; border: 2px solid #e5e7eb; border-radius: 8px;" />
                      </div>

                      <div style="background-color: #fef3c7; border-radius: 8px; padding: 15px; margin: 30px 0;">
                        <p style="color: #92400e; margin: 0; font-size: 14px;">
                          <strong>💡 Tip:</strong> Save this email or take a screenshot of your QR code for quick access at the event.
                        </p>
                      </div>

                      <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 20px 0 0 0;">
                        If you have any questions, please don't hesitate to reach out.
                      </p>
                      <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 10px 0 0 0;">
                        See you soon!<br>
                        <strong>The EventReg Pro Team</strong>
                      </p>
                    </td>
                  </tr>
                  <tr>
                    <td style="background-color: #f9fafb; padding: 20px; text-align: center; border-top: 1px solid #e5e7eb;">
                      <p style="color: #6b7280; font-size: 12px; margin: 0;">
                        &copy; 2025 EventReg Pro. All rights reserved.
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
      </html>
    `;

    console.log(`📧 Registration email prepared for ${email}`);
    console.log(`Event: ${eventTitle}`);
    console.log(`Note: Email sending is simulated. In production, integrate with a service like Resend.`);

    return new Response(
      JSON.stringify({
        success: true,
        message: "Registration email prepared successfully",
        recipient: email,
      }),
      {
        status: 200,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("Error processing request:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  }
});