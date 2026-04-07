const quotesUploadedEmail = (requisitionId) => {
  return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="UTF-8">
    <title>Quotes Uploaded</title>
  </head>

  <body style="margin:0; padding:0; background:#f4f4f4; font-family: Arial, sans-serif;">

    <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f4; padding:20px;">
      <tr>
        <td align="center">

          <!-- Container -->
          <table width="500" cellpadding="0" cellspacing="0" style="background:#ffffff; border-radius:8px; padding:30px;">

            <!-- Header -->
            <tr>
              <td align="center" style="padding-bottom:20px;">
                <h2 style="margin:0; color:#333;">Quotes Uploaded</h2>
              </td>
            </tr>

            <!-- Message -->
            <tr>
              <td style="color:#555; font-size:14px; text-align:center; padding-bottom:20px;">
                The quotes for the following requisition have been successfully uploaded.
              </td>
            </tr>

            <!-- Requisition ID -->
            <tr>
              <td align="center" style="padding:15px; background:#fafafa; border-radius:6px; font-size:16px; font-weight:bold; color:#333;">
                Requisition ID: ${requisitionId}
              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td style="padding-top:25px; font-size:12px; color:#999; text-align:center;">
                This is an automated message. Please do not reply.
              </td>
            </tr>

          </table>

        </td>
      </tr>
    </table>

  </body>
  </html>
  `;
};

export default quotesUploadedEmail;