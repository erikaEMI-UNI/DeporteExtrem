function generarEmailHTML(nombre, link) {
    return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Recuperación de Contraseña</title>
      <style type="text/css">
        /* Estilos base para clientes que soportan CSS */
        body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
        table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
        img { -ms-interpolation-mode: bicubic; }

        /* Resetear estilos */
        img { border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none; }
        table { border-collapse: collapse !important; }
        body { height: 100% !important; margin: 0 !important; padding: 0 !important; width: 100% !important; }

        /* Estilos para clientes que no muestran estilos */
        #bodyTable { height: 100% !important; margin: 0; padding: 0; width: 100% !important; }
        
        /* Estilos para dispositivos móviles */
        @media screen and (max-width: 600px) {
          .email-container {
            width: 100% !important;
            max-width: 600px !important;
          }
          .fluid {
            max-width: 100% !important;
            height: auto !important;
            margin-left: auto !important;
            margin-right: auto !important;
          }
          .stack-column,
          .stack-column-center {
            display: block !important;
            width: 100% !important;
            max-width: 100% !important;
            direction: ltr !important;
          }
          .stack-column-center {
            text-align: center !important;
          }
          .center-on-narrow {
            text-align: center !important;
            display: block !important;
            margin-left: auto !important;
            margin-right: auto !important;
            float: none !important;
          }
          table.center-on-narrow {
            display: inline-block !important;
          }
          .email-container p {
            font-size: 16px !important;
            line-height: 24px !important;
          }
        }

        /* Estilos para dispositivos muy pequeños */
        @media screen and (max-width: 480px) {
          .button-td,
          .button-a {
            display: block !important;
            width: 100% !important;
            max-width: 100% !important;
          }
          .email-container {
            padding: 10px !important;
          }
          .header-td {
            padding: 20px 15px !important;
          }
          .content-td {
            padding: 25px 15px !important;
          }
          h1 {
            font-size: 20px !important;
          }
        }
      </style>
    </head>
    <body style="margin: 0; padding: 0; font-family: Arial, Helvetica, sans-serif; background-color: #f4f7fa; width: 100%;">
      <center style="width: 100%; background-color: #f4f7fa; text-align: left;">
        <div style="max-width: 600px; margin: auto;" class="email-container">
          <table role="presentation" cellspacing="0" cellpadding="0" border="0" align="center" width="100%" style="max-width: 600px;" class="email-container">
            <!-- Header -->
            <tr>
              <td class="header-td" style="background-color: #4f46e5; padding: 30px 40px; border-radius: 8px 8px 0 0; text-align: center;">
                <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 600;">Recuperación de Contraseña</h1>
              </td>
            </tr>
            
            <!-- Content -->
            <tr>
              <td class="content-td" style="background-color: #ffffff; padding: 40px;">
                <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                  <tr>
                    <td style="padding-bottom: 20px;">
                      <p style="margin: 0; font-size: 16px; line-height: 1.5; color: #333333;">Hola <strong>${nombre}</strong>,</p>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding-bottom: 20px;">
                      <p style="margin: 0; font-size: 16px; line-height: 1.5; color: #333333;">Has solicitado recuperar tu contraseña. Para continuar con el proceso, haz clic en el botón de abajo:</p>
                    </td>
                  </tr>
                  
                  <!-- Button -->
                  <tr>
                    <td style="padding: 30px 0;">
                      <table role="presentation" cellspacing="0" cellpadding="0" border="0" align="center" class="center-on-narrow">
                        <tr>
                          <td class="button-td" style="background-color: #4f46e5; border-radius: 4px; text-align: center;">
                            <a href="${link}" class="button-a" style="display: inline-block; padding: 14px 30px; color: #ffffff; font-size: 16px; font-weight: 600; text-decoration: none; border-radius: 4px;">Restablecer Contraseña</a>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                  
                  <tr>
                    <td style="padding-bottom: 10px;">
                      <p style="margin: 0; font-size: 16px; line-height: 1.5; color: #333333;">Este enlace expirará en 30 minutos por razones de seguridad.</p>
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <p style="margin: 0; font-size: 16px; line-height: 1.5; color: #333333;">Si no has solicitado este cambio, puedes ignorar este correo.</p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            
            <!-- Footer -->
            <tr>
              <td style="background-color: #f7f7f9; padding: 20px; border-radius: 0 0 8px 8px; text-align: center; border-top: 1px solid #e5e7eb;">
                <p style="margin: 0; font-size: 14px; color: #6b7280;">© ${new Date().getFullYear()} Tu Empresa. Todos los derechos reservados.</p>
              </td>
            </tr>
          </table>
        </div>
      </center>
    </body>
    </html>
  `;
}

module.exports = { generarEmailHTML };