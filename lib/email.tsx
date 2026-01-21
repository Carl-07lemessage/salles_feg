import { getSupabaseAdminClient } from "@/lib/supabase-admin"


// Lazy import nodemailer to avoid initialization errors
let nodemailerModule: typeof import("nodemailer") | null = null
let transporter: any = null

async function getNodemailer() {
  if (!nodemailerModule) {
    try {
      nodemailerModule = await import("nodemailer")
    } catch (error) {
      console.warn("Nodemailer not available:", error)
      return null
    }
  }
  return nodemailerModule
}

function getSmtpUser() {
  return process.env.SMTP_USER || process.env.EMAIL_USER || ""
}

async function getTransporter() {
  // Check for required environment variables first
  const emailUser = process.env.EMAIL_USER
  const emailPass = process.env.EMAIL_APP_PASSWORD
  
  if (!emailUser || !emailPass) {
    console.warn("Variables d'environnement EMAIL manquantes. Les emails ne seront pas envoyés.")
    return null
  }

  if (transporter) {
    return transporter
  }

  try {
    const nodemailer = await getNodemailer()
    if (!nodemailer) {
      return null
    }

    const smtpHost = process.env.SMTP_HOST || "smtp.gmail.com"
    const smtpPort = Number.parseInt(process.env.SMTP_PORT || "587", 10)

    transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpPort === 465,
      auth: {
        user: emailUser,
        pass: emailPass,
      },
    })

    // Don't block on verify, just log
    transporter.verify().then(() => {
      console.log("Serveur SMTP prêt à envoyer des emails")
    }).catch((error: any) => {
      console.error("Erreur de vérification SMTP:", error)
    })

    return transporter
  } catch (error) {
    console.error("Erreur lors de la création du transporteur SMTP:", error)
    return null
  }
}

interface ReservationEmailData {
  customerName: string
  customerEmail: string
  roomName: string
  startDate: string
  endDate: string
  totalPrice: number
  reservationId: string
  customerPhone?: string
  notes?: string
  eventObject?: string
  startHour?: number
  endHour?: number
  lunchSelected?: boolean
  breakfastOption?: number | null
  coffeeBreakSelected?: boolean
  numberOfGuests?: number
}

function formatCateringOptions(data: ReservationEmailData): string {
  if (!data.lunchSelected && !data.breakfastOption && !data.coffeeBreakSelected) {
    return ""
  }

  const guests = data.numberOfGuests || 1
  let html = `
    <div style="text-align:left;background:#ffffff;border-radius:8px;padding:16px;border:1px solid #e2e8f0;margin-top:16px;">
      <div style="font-size:12px;color:#718096;font-weight:500;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:12px;">Options de Restauration (${guests} personne${guests > 1 ? "s" : ""})</div>
      <div style="space-y:8px;">
  `

  if (data.lunchSelected) {
    html += `
      <div style="padding:8px 0;border-bottom:1px solid #e2e8f0;">
        <div style="font-weight:600;color:#063d21;margin-bottom:4px;">✓ Déjeuner Complet</div>
        <div style="font-size:12px;color:#718096;">Entrée, plat de résistance et dessert</div>
        <div style="font-size:13px;color:#0a5a31;font-weight:600;margin-top:4px;">${(25000 * guests).toLocaleString("fr-FR")} FCFA</div>
      </div>
    `
  }

  if (data.breakfastOption) {
    const breakfastOptions = [
      {
        id: 1,
        price: 6000,
        name: "Petit-déjeuner Option 1",
        items: ["Boisson chaude", "Boisson froide (jus d'orange, jus de pommes)", "Viennoiserie"],
      },
      {
        id: 2,
        price: 9000,
        name: "Petit-déjeuner Option 2",
        items: [
          "Boisson chaude",
          "Boisson froide (jus d'orange, pommes, cocktail, ananas)",
          "Viennoiserie, eau, corbeille de pains",
          "Beurre, confiture, fromage",
          "Fruits (pommes et oranges)",
        ],
      },
      {
        id: 3,
        price: 12000,
        name: "Petit-déjeuner Option 3",
        items: [
          "Boisson chaude",
          "Boisson froide (orange, pommes, cocktail, ananas, mangue, raisin)",
          "Viennoiserie, corbeille de pains",
          "Beurre, confiture, fromage, charcuterie",
          "Fruits (pommes, oranges, bananes, pastèque, poires)",
        ],
      },
    ]
    const breakfast = breakfastOptions.find((b) => b.id === data.breakfastOption)
    if (breakfast) {
      html += `
        <div style="padding:8px 0;border-bottom:1px solid #e2e8f0;">
          <div style="font-weight:600;color:#063d21;margin-bottom:4px;">✓ ${breakfast.name}</div>
          <ul style="font-size:12px;color:#718096;margin:4px 0;padding-left:20px;">
            ${breakfast.items.map((item) => `<li>${item}</li>`).join("")}
          </ul>
          <div style="font-size:13px;color:#0a5a31;font-weight:600;margin-top:4px;">${(breakfast.price * guests).toLocaleString("fr-FR")} FCFA</div>
        </div>
      `
    }
  }

  if (data.coffeeBreakSelected) {
    html += `
      <div style="padding:8px 0;">
        <div style="font-weight:600;color:#063d21;margin-bottom:4px;">✓ Pause-café</div>
        <div style="font-size:12px;color:#718096;">Rafraîchissements et collations</div>
        <div style="font-size:13px;color:#0a5a31;font-weight:600;margin-top:4px;">${(3500 * guests).toLocaleString("fr-FR")} FCFA</div>
      </div>
    `
  }

  html += `
      </div>
    </div>
  `

  return html
}

// Template email de confirmation pour le client - Version institutionnelle
export async function sendCustomerConfirmationEmail(data: ReservationEmailData) {
  const { customerName, customerEmail, roomName, startDate, endDate, totalPrice, reservationId, customerPhone } = data

  const emailTransporter = await getTransporter()
  if (!emailTransporter) {
    console.warn("Email non envoyé - configuration manquante")
    return { success: false, error: "Email configuration missing" }
  }

  const mailOptions = {
    from: `"Gestion des salles - FEG" <${getSmtpUser()}>`,
    to: customerEmail,
    subject: `Confirmation de réservation - ${roomName}`,
    html: `
      <!doctype html>
      <html lang="fr">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Playfair+Display:wght@600;700&display=swap" rel="stylesheet">
      </head>
      <body style="margin:0;padding:0;background:linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);font-family:'Inter', system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
        <div style="max-width:680px;margin:0 auto;padding:20px;">
          
          <!-- Header FEG -->
          <div style="background:linear-gradient(135deg, #063d21 0%, #0a5a31 100%);border-radius:12px 12px 0 0;padding:20px 15px;text-align:center;color:#ffffff;position:relative;overflow:hidden;box-shadow:0 4px 20px rgba(6, 61, 33, 0.15);">
            <div style="position:relative;z-index:2;">
              <div style="display:flex;align-items:center;justify-content:center;gap:20px;margin-bottom:20px;background:rgba(255,255,255,0.1);padding:16px 24px;border-radius:12px;border:1px solid rgba(255,255,255,0.2);">
                <div style="width:64px;height:64px;background:#ffffff;border-radius:10px;display:flex;align-items:center;justify-content:center;box-shadow:0 4px 12px rgba(0,0,0,0.1);">
                  <img src="${process.env.NEXT_PUBLIC_APP_URL || "https://salles-feg.vercel.app"}/logo-feg.png" alt="FEG" style="height:52px;width:52px;object-fit:contain;display:block;" />
                </div>
              </div>
              <div style="height:2px;background:linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.2) 50%, transparent 100%);margin:16px 0 12px 0;"></div>
              <div style="font-size:14px;color:#a5d6b0;font-weight:500;text-transform:uppercase;letter-spacing:1px;">Service de Réservation de Salles</div>
            </div>
          </div>

          <!-- Carte Principale -->
          <div style="background:#ffffff;padding:40px;box-shadow:0 8px 32px rgba(0, 0, 0, 0.08);border:1px solid #e2e8f0;">
            
            <!-- Badge de Confirmation -->
            <div style="background:linear-gradient(135deg, #f7faf7 0%, #f0f4f0 100%);border:1px solid #d1e7dd;border-radius:10px;padding:28px 24px 24px 24px;margin-bottom:32px;text-align:center;position:relative;">
              <div style="position:absolute;top:-12px;left:50%;transform:translateX(-50%);">
                <div style="display:inline-flex;align-items:center;gap:8px;background:linear-gradient(135deg, #063d21 0%, #0a5a31 100%);color:#ffffff;padding:8px 20px;border-radius:6px;font-size:12px;font-weight:600;box-shadow:0 4px 12px rgba(6, 61, 33, 0.25);border:1px solid rgba(255,255,255,0.1);">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style="filter:drop-shadow(0 1px 2px rgba(0,0,0,0.2));">
                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" strokeLinecap="round" strokeLinejoin="round"></path>
                  </svg>
                  RÉSERVATION CONFIRMÉE
                </div>
              </div>
              <h1 style="margin:20px 0 8px;font-size:24px;font-weight:700;color:#063d21;letter-spacing:-0.025em;text-shadow:0 1px 2px rgba(6, 61, 33, 0.1);">
                Votre réservation est confirmée
              </h1>
              <p style="margin:0;color:#4a5568;font-size:14px;line-height:1.5;">
                Bonjour <strong style="color:#063d21">${customerName}</strong>, nous avons le plaisir de confirmer votre réservation
              </p>
            </div>

            <!-- Détails de la Réservation -->
            <div style="margin-bottom:32px;">
              <div style="background:#f8faf9;border-radius:10px;padding:24px;margin:24px 0;border-left:4px solid #063d21;">
                <div style="display:flex;align-items:center;gap:12px;margin-bottom:20px;">
                  <div>
                    <div style="font-size:13px;color:#718096;font-weight:500;margin-bottom:4px;">Numéro de réservation</div>
                    <div style="font-size:16px;color:#2d3748;font-weight:600;">${reservationId}</div>
                  </div>
                </div>
                
                <div style="display:grid;grid-template-columns:1fr;gap:16px;">
                  <div style="text-align:left;background:#ffffff;border-radius:8px;padding:16px;border:1px solid #e2e8f0;">
                    <div style="display:flex;align-items:center;gap:12px;margin-bottom:8px;">
                      <div>
                        <div style="font-size:12px;color:#718096;font-weight:500;text-transform:uppercase;letter-spacing:0.5px;">Salle Réservée</div>
                        <div style="font-size:16px;color:#063d21;font-weight:600;">${roomName}</div>
                      </div>
                    </div>
                  </div>

                  ${data.eventObject ? `
                  <div style="text-align:left;background:#ffffff;border-radius:8px;padding:16px;border:1px solid #e2e8f0;">
                    <div style="font-size:12px;color:#718096;font-weight:500;text-transform:uppercase;letter-spacing:0.5px;">Objet de l'événement</div>
                    <div style="font-size:14px;color:#063d21;font-weight:600;margin-top:4px;">${data.eventObject}</div>
                  </div>
                  ` : ''}

                  <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
                    <div style="text-align:left;background:#ffffff;border-radius:8px;padding:16px;border:1px solid #e2e8f0;">
                      <div style="font-size:12px;color:#718096;font-weight:500;text-transform:uppercase;letter-spacing:0.5px;">Date de Début</div>
                      <div style="font-size:14px;color:#063d21;font-weight:600;margin-top:4px;">${new Date(startDate).toLocaleDateString("fr-FR", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</div>
                      ${data.startHour !== undefined ? `<div style="font-size:12px;color:#718096;margin-top:4px;">${data.startHour.toString().padStart(2, '0')}:00</div>` : ''}
                    </div>
                    <div style="text-align:left;background:#ffffff;border-radius:8px;padding:16px;border:1px solid #e2e8f0;">
                      <div style="font-size:12px;color:#718096;font-weight:500;text-transform:uppercase;letter-spacing:0.5px;">Date de Fin</div>
                      <div style="font-size:14px;color:#063d21;font-weight:600;margin-top:4px;">${new Date(endDate).toLocaleDateString("fr-FR", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</div>
                      ${data.endHour !== undefined ? `<div style="font-size:12px;color:#718096;margin-top:4px;">${data.endHour.toString().padStart(2, '0')}:00</div>` : ''}
                    </div>
                  </div>

                  ${customerPhone ? `
                  <div style="text-align:left;background:#ffffff;border-radius:8px;padding:16px;border:1px solid #e2e8f0;">
                    <div style="font-size:12px;color:#718096;font-weight:500;text-transform:uppercase;letter-spacing:0.5px;">Téléphone</div>
                    <div style="font-size:14px;color:#063d21;font-weight:600;margin-top:4px;">${customerPhone}</div>
                  </div>
                  ` : ''}

                  ${formatCateringOptions(data)}

                  <div style="text-align:center;background:linear-gradient(135deg, #f7faf7 0%, #f0f4f0 100%);border-radius:8px;padding:20px;border:2px solid #d1e7dd;">
                    <div style="font-size:12px;color:#718096;font-weight:500;text-transform:uppercase;letter-spacing:0.5px;">Montant Total</div>
                    <div style="font-size:24px;color:#063d21;font-weight:700;margin-top:8px;">${totalPrice.toLocaleString("fr-FR")} FCFA</div>
                  </div>
                </div>
              </div>

              <div style="background:#fffbe6;border:1px solid #f5e8b8;padding:20px;border-radius:8px;margin:20px 0;">
                <h3 style="margin:0 0 12px 0;font-size:16px;color:#856404;font-weight:600;">Informations importantes</h3>
                <ul style="margin:0;padding-left:20px;color:#718096;font-size:14px;line-height:1.6;">
                  <li>Veuillez arriver 15 minutes avant l'heure de début de votre réservation</li>
                  <li>En cas d'annulation, merci de nous prévenir au moins 24h à l'avance</li>
                  <li>Pour toute question, n'hésitez pas à nous contacter</li>
                </ul>
              </div>
            </div>
          </div>

          <!-- Footer FEG -->
          <div style="text-align:center;padding:40px 20px 30px 20px;color:#718096;font-size:13px;background:linear-gradient(135deg, #f8fafc 0%, #f0f4f0 100%);border-radius:0 0 12px 12px;border:1px solid #e2e8f0;border-top:none;">
            <div style="margin-bottom:20px;">
              <div style="font-family:'Playfair Display',serif;font-weight:700;color:#063d21;margin-bottom:8px;font-size:18px;letter-spacing:-0.025em;">FACULTÉ DES ÉTUDES DE GESTION</div>
              <div style="margin-bottom:6px;font-size:13px;color:#4a5568;font-weight:500;">Service de Réservation de Salles</div>
              <div style="font-size:12px;color:#0a5a31;font-weight:600;letter-spacing:1px;text-transform:uppercase;">Excellence • Professionnalisme • Service</div>
            </div>
            
            <div style="height:2px;background:linear-gradient(90deg, transparent 0%, #063d21 50%, transparent 100%);margin:24px 0 20px 0;opacity:0.1;"></div>
            
            <div style="font-size:12px;color:#718096;line-height:1.6;max-width:460px;margin:0 auto;">
              <div style="font-weight:500;margin-bottom:4px;">&copy; ${new Date().getFullYear()} Faculté des Études de Gestion</div>
              <div style="opacity:0.8;">
                Tous droits réservés. Cet email a été généré automatiquement par le système de gestion FEG.
                Veuillez ne pas répondre directement à cet email.
              </div>
            </div>
          </div>
        </div>
      </body>
      </html>
    `,
  }

  try {
    await emailTransporter.sendMail(mailOptions)
    console.log("Email de confirmation envoyé au client:", customerEmail)
    return { success: true }
  } catch (error) {
    console.error("Erreur envoi email client:", error)
    return { success: false, error }
  }
}

// Template email de notification pour l'admin - Version institutionnelle
export async function sendAdminNotificationEmail(data: ReservationEmailData) {
  const { customerName, customerEmail, roomName, startDate, endDate, totalPrice, reservationId, customerPhone, notes } = data

  const emailTransporter = await getTransporter()
  if (!emailTransporter) {
    console.warn("Email non envoyé - configuration manquante")
    return { success: false, error: "Email configuration missing" }
  }

  let recipients = process.env.ADMIN_EMAIL || process.env.EMAIL_USER
  try {
    const supabaseAdmin = getSupabaseAdminClient()
    const { data: adminRows, error: adminErr } = await supabaseAdmin.from("admin_users").select("email").not("email", "is", null)
    if (adminErr) {
      console.error("Erreur récupération admin emails:", adminErr)
    }
    if (adminRows && Array.isArray(adminRows) && adminRows.length > 0) {
      const emails = adminRows.map((r: any) => r.email).filter(Boolean)
      if (emails.length > 0) recipients = emails.join(",")
    }
  } catch (err) {
    console.error("Exception fetching admin emails:", err)
  }

  const mailOptions = {
    from: `"Gestion des salles - FEG" <${getSmtpUser()}>`,
    to: recipients,
    subject: `Nouvelle réservation - ${roomName}`,
    html: `
      <!doctype html>
      <html lang="fr">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Playfair+Display:wght@600;700&display=swap" rel="stylesheet">
      </head>
      <body style="margin:0;padding:0;background:linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);font-family:'Inter', system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
        <div style="max-width:680px;margin:0 auto;padding:20px;">
          
          <!-- Header FEG -->
          <div style="background:linear-gradient(135deg, #063d21 0%, #0a5a31 100%);border-radius:12px 12px 0 0;padding:20px 15px;text-align:center;color:#ffffff;position:relative;overflow:hidden;box-shadow:0 4px 20px rgba(6, 61, 33, 0.15);">
            <div style="position:relative;z-index:2;">
              <div style="display:flex;align-items:center;justify-content:center;gap:20px;margin-bottom:20px;background:rgba(255,255,255,0.1);padding:16px 24px;border-radius:12px;border:1px solid rgba(255,255,255,0.2);">
                <div style="width:64px;height:64px;background:#ffffff;border-radius:10px;display:flex;align-items:center;justify-content:center;box-shadow:0 4px 12px rgba(0,0,0,0.1);">
                  <img src="${process.env.NEXT_PUBLIC_APP_URL || "https://salles-feg.vercel.app"}/logo-feg.png" alt="FEG" style="height:52px;width:52px;object-fit:contain;display:block;" />
                </div>
              </div>
              <div style="height:2px;background:linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.2) 50%, transparent 100%);margin:16px 0 12px 0;"></div>
              <div style="font-size:14px;color:#a5d6b0;font-weight:500;text-transform:uppercase;letter-spacing:1px;">Service de Réservation de Salles</div>
            </div>
          </div>

          <!-- Carte Principale -->
          <div style="background:#ffffff;padding:40px;box-shadow:0 8px 32px rgba(0, 0, 0, 0.08);border:1px solid #e2e8f0;">
            
            <!-- Badge d'Alerte -->
            <div style="background:linear-gradient(135deg, #fff3cd 0%, #fce8b2 100%);border:1px solid #f5c6cb;border-radius:10px;padding:28px 24px 24px 24px;margin-bottom:32px;text-align:center;position:relative;">
              <div style="position:absolute;top:-12px;left:50%;transform:translateX(-50%);">
                <div style="display:inline-flex;align-items:center;gap:8px;background:linear-gradient(135deg, #856404 0%, #b38b00 100%);color:#ffffff;padding:8px 20px;border-radius:6px;font-size:12px;font-weight:600;box-shadow:0 4px 12px rgba(133, 100, 4, 0.25);border:1px solid rgba(255,255,255,0.1);">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style="filter:drop-shadow(0 1px 2px rgba(0,0,0,0.2));">
                    <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" strokeLinecap="round" strokeLinejoin="round"></path>
                  </svg>
                  NOUVELLE RÉSERVATION
                </div>
              </div>
              <h1 style="margin:20px 0 8px;font-size:24px;font-weight:700;color:#856404;letter-spacing:-0.025em;text-shadow:0 1px 2px rgba(133, 100, 4, 0.1);">
                Action Requise
              </h1>
              <p style="margin:0;color:#856404;font-size:14px;line-height:1.5;">
                Une nouvelle réservation nécessite votre attention
              </p>
            </div>

            <!-- Détails de la Réservation -->
            <div style="margin-bottom:32px;">
              <div style="background:#f8faf9;border-radius:10px;padding:24px;margin:24px 0;border-left:4px solid #063d21;">
                
                <div style="display:grid;grid-template-columns:1fr;gap:16px;">
                  <div style="text-align:left;background:#ffffff;border-radius:8px;padding:16px;border:1px solid #e2e8f0;">
                    <div style="font-size:12px;color:#718096;font-weight:500;text-transform:uppercase;letter-spacing:0.5px;">Numéro de Réservation</div>
                    <div style="font-size:16px;color:#063d21;font-weight:600;margin-top:4px;">${reservationId}</div>
                  </div>

                  <div style="text-align:left;background:#ffffff;border-radius:8px;padding:16px;border:1px solid #e2e8f0;">
                    <div style="font-size:12px;color:#718096;font-weight:500;text-transform:uppercase;letter-spacing:0.5px;">Salle Réservée</div>
                    <div style="font-size:16px;color:#063d21;font-weight:600;margin-top:4px;">${roomName}</div>
                  </div>

                  ${data.eventObject ? `
                  <div style="text-align:left;background:#ffffff;border-radius:8px;padding:16px;border:1px solid #e2e8f0;">
                    <div style="font-size:12px;color:#718096;font-weight:500;text-transform:uppercase;letter-spacing:0.5px;">Objet de l'événement</div>
                    <div style="font-size:14px;color:#063d21;font-weight:600;margin-top:4px;">${data.eventObject}</div>
                  </div>
                  ` : ''}

                  <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
                    <div style="text-align:left;background:#ffffff;border-radius:8px;padding:16px;border:1px solid #e2e8f0;">
                      <div style="font-size:12px;color:#718096;font-weight:500;text-transform:uppercase;letter-spacing:0.5px;">Client</div>
                      <div style="font-size:14px;color:#063d21;font-weight:600;margin-top:4px;">${customerName}</div>
                    </div>
                    <div style="text-align:left;background:#ffffff;border-radius:8px;padding:16px;border:1px solid #e2e8f0;">
                      <div style="font-size:12px;color:#718096;font-weight:500;text-transform:uppercase;letter-spacing:0.5px;">Email</div>
                      <div style="font-size:14px;color:#063d21;font-weight:600;margin-top:4px;">${customerEmail}</div>
                    </div>
                  </div>

                  ${customerPhone ? `
                  <div style="text-align:left;background:#ffffff;border-radius:8px;padding:16px;border:1px solid #e2e8f0;">
                    <div style="font-size:12px;color:#718096;font-weight:500;text-transform:uppercase;letter-spacing:0.5px;">Téléphone</div>
                    <div style="font-size:14px;color:#063d21;font-weight:600;margin-top:4px;">${customerPhone}</div>
                  </div>
                  ` : ''}

                  <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
                    <div style="text-align:left;background:#ffffff;border-radius:8px;padding:16px;border:1px solid #e2e8f0;">
                      <div style="font-size:12px;color:#718096;font-weight:500;text-transform:uppercase;letter-spacing:0.5px;">Date de Début</div>
                      <div style="font-size:14px;color:#063d21;font-weight:600;margin-top:4px;">${new Date(startDate).toLocaleDateString("fr-FR", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</div>
                      ${data.startHour !== undefined ? `<div style="font-size:12px;color:#718096;margin-top:4px;">${data.startHour.toString().padStart(2, '0')}:00</div>` : ''}
                    </div>
                    <div style="text-align:left;background:#ffffff;border-radius:8px;padding:16px;border:1px solid #e2e8f0;">
                      <div style="font-size:12px;color:#718096;font-weight:500;text-transform:uppercase;letter-spacing:0.5px;">Date de Fin</div>
                      <div style="font-size:14px;color:#063d21;font-weight:600;margin-top:4px;">${new Date(endDate).toLocaleDateString("fr-FR", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</div>
                      ${data.endHour !== undefined ? `<div style="font-size:12px;color:#718096;margin-top:4px;">${data.endHour.toString().padStart(2, '0')}:00</div>` : ''}
                    </div>
                  </div>

                  ${notes ? `
                  <div style="text-align:left;background:#ffffff;border-radius:8px;padding:16px;border:1px solid #e2e8f0;">
                    <div style="font-size:12px;color:#718096;font-weight:500;text-transform:uppercase;letter-spacing:0.5px;">Notes</div>
                    <div style="font-size:14px;color:#063d21;font-weight:600;margin-top:4px;">${notes}</div>
                  </div>
                  ` : ''}

                  ${formatCateringOptions(data)}

                  <div style="text-align:center;background:linear-gradient(135deg, #f7faf7 0%, #f0f4f0 100%);border-radius:8px;padding:20px;border:2px solid #d1e7dd;">
                    <div style="font-size:12px;color:#718096;font-weight:500;text-transform:uppercase;letter-spacing:0.5px;">Montant Total</div>
                    <div style="font-size:24px;color:#063d21;font-weight:700;margin-top:8px;">${totalPrice.toLocaleString("fr-FR")} FCFA</div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Bouton d'Action -->
            <div style="text-align:center;margin:40px 0 32px;">
              <a href="${process.env.NEXT_PUBLIC_APP_URL || "https://salles-feg.vercel.app"}/admin/reservations" target="_blank" rel="noopener noreferrer" 
                 style="display:inline-block;padding:0;text-decoration:none;width:100%;max-width:320px;">
                <div style="background:linear-gradient(135deg, #063d21 0%, #0a5a31 100%);padding:3px;border-radius:12px;box-shadow:0 4px 20px rgba(6, 61, 33, 0.25);">
                  <div style="background:linear-gradient(135deg, #063d21 0%, #0a5a31 100%);padding:16px 32px;border-radius:10px;border:1px solid rgba(255,255,255,0.2);">
                    <div style="display:flex;align-items:center;justify-content:center;gap:12px;">
                      <span style="color:#ffffff;font-weight:600;font-size:16px;letter-spacing:0.5px;text-shadow:0 2px 4px rgba(0,0,0,0.2);">
                        Gérer la Réservation
                      </span>
                    </div>
                  </div>
                </div>
              </a>
            </div>
          </div>

          <!-- Footer FEG -->
          <div style="text-align:center;padding:40px 20px 30px 20px;color:#718096;font-size:13px;background:linear-gradient(135deg, #f8fafc 0%, #f0f4f0 100%);border-radius:0 0 12px 12px;border:1px solid #e2e8f0;border-top:none;">
            <div style="margin-bottom:20px;">
              <div style="font-family:'Playfair Display',serif;font-weight:700;color:#063d21;margin-bottom:8px;font-size:18px;letter-spacing:-0.025em;">FACULTÉ DES ÉTUDES DE GESTION</div>
              <div style="margin-bottom:6px;font-size:13px;color:#4a5568;font-weight:500;">Service de Réservation de Salles</div>
              <div style="font-size:12px;color:#0a5a31;font-weight:600;letter-spacing:1px;text-transform:uppercase;">Excellence • Professionnalisme • Service</div>
            </div>
            
            <div style="height:2px;background:linear-gradient(90deg, transparent 0%, #063d21 50%, transparent 100%);margin:24px 0 20px 0;opacity:0.1;"></div>
            
            <div style="font-size:12px;color:#718096;line-height:1.6;max-width:460px;margin:0 auto;">
              <div style="font-weight:500;margin-bottom:4px;">&copy; ${new Date().getFullYear()} Faculté des Études de Gestion</div>
              <div style="opacity:0.8;">
                Cet email a été généré automatiquement par le système de gestion FEG.
              </div>
            </div>
          </div>
        </div>
      </body>
      </html>
    `,
  }

  try {
    await emailTransporter.sendMail(mailOptions)
    console.log("Email de notification envoyé à l'admin")
    return { success: true }
  } catch (error) {
    console.error("Erreur envoi email admin:", error)
    return { success: false, error }
  }
}

// Email d'annulation de réservation - Version institutionnelle
export async function sendCancellationEmail(data: ReservationEmailData) {
  const { customerName, customerEmail, roomName, startDate, endDate, reservationId } = data

  const emailTransporter = await getTransporter()
  if (!emailTransporter) {
    console.warn("Email non envoyé - configuration manquante")
    return { success: false, error: "Email configuration missing" }
  }

  const mailOptions = {
    from: `"Gestion des salles - FEG" <${getSmtpUser()}>`,
    to: customerEmail,
    subject: `Annulation de réservation - ${roomName}`,
    html: `
      <!doctype html>
      <html lang="fr">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Playfair+Display:wght@600;700&display=swap" rel="stylesheet">
      </head>
      <body style="margin:0;padding:0;background:linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);font-family:'Inter', system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
        <div style="max-width:680px;margin:0 auto;padding:20px;">
          
          <!-- Header FEG -->
          <div style="background:linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);border-radius:12px 12px 0 0;padding:20px 15px;text-align:center;color:#ffffff;position:relative;overflow:hidden;box-shadow:0 4px 20px rgba(220, 38, 38, 0.15);">
            <div style="position:relative;z-index:2;">
              <div style="display:flex;align-items:center;justify-content:center;gap:20px;margin-bottom:20px;background:rgba(255,255,255,0.1);padding:16px 24px;border-radius:12px;border:1px solid rgba(255,255,255,0.2);">
                <div style="width:64px;height:64px;background:#ffffff;border-radius:10px;display:flex;align-items:center;justify-content:center;box-shadow:0 4px 12px rgba(0,0,0,0.1);">
                  <img src="${process.env.NEXT_PUBLIC_APP_URL || "https://salles-feg.vercel.app"}/logo-feg.png" alt="FEG" style="height:52px;width:52px;object-fit:contain;display:block;" />
                </div>
              </div>
              <div style="height:2px;background:linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.2) 50%, transparent 100%);margin:16px 0 12px 0;"></div>
              <div style="font-size:14px;color:#fca5a5;font-weight:500;text-transform:uppercase;letter-spacing:1px;">Service de Réservation de Salles</div>
            </div>
          </div>

          <!-- Carte Principale -->
          <div style="background:#ffffff;padding:40px;box-shadow:0 8px 32px rgba(0, 0, 0, 0.08);border:1px solid #e2e8f0;">
            
            <!-- Badge d'Annulation -->
            <div style="background:linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%);border:1px solid #fecaca;border-radius:10px;padding:28px 24px 24px 24px;margin-bottom:32px;text-align:center;position:relative;">
              <div style="position:absolute;top:-12px;left:50%;transform:translateX(-50%);">
                <div style="display:inline-flex;align-items:center;gap:8px;background:linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);color:#ffffff;padding:8px 20px;border-radius:6px;font-size:12px;font-weight:600;box-shadow:0 4px 12px rgba(220, 38, 38, 0.25);border:1px solid rgba(255,255,255,0.1);">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style="filter:drop-shadow(0 1px 2px rgba(0,0,0,0.2));">
                    <path d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" strokeLinecap="round" strokeLinejoin="round"></path>
                  </svg>
                  RÉSERVATION ANNULÉE
                </div>
              </div>
              <h1 style="margin:20px 0 8px;font-size:24px;font-weight:700;color:#dc2626;letter-spacing:-0.025em;text-shadow:0 1px 2px rgba(220, 38, 38, 0.1);">
                Votre réservation a été annulée
              </h1>
              <p style="margin:0;color:#991b1b;font-size:14px;line-height:1.5;">
                Bonjour <strong style="color:#dc2626">${customerName}</strong>, nous vous confirmons l'annulation de votre réservation
              </p>
            </div>

            <!-- Détails de l'Annulation -->
            <div style="margin-bottom:32px;">
              <div style="background:#f8faf9;border-radius:10px;padding:24px;margin:24px 0;border-left:4px solid #dc2626;">
                
                <div style="display:grid;grid-template-columns:1fr;gap:16px;">
                  <div style="text-align:left;background:#ffffff;border-radius:8px;padding:16px;border:1px solid #e2e8f0;">
                    <div style="font-size:12px;color:#718096;font-weight:500;text-transform:uppercase;letter-spacing:0.5px;">Numéro de Réservation</div>
                    <div style="font-size:16px;color:#dc2626;font-weight:600;margin-top:4px;">${reservationId}</div>
                  </div>

                  <div style="text-align:left;background:#ffffff;border-radius:8px;padding:16px;border:1px solid #e2e8f0;">
                    <div style="font-size:12px;color:#718096;font-weight:500;text-transform:uppercase;letter-spacing:0.5px;">Salle Réservée</div>
                    <div style="font-size:16px;color:#dc2626;font-weight:600;margin-top:4px;">${roomName}</div>
                  </div>

                  <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
                    <div style="text-align:left;background:#ffffff;border-radius:8px;padding:16px;border:1px solid #e2e8f0;">
                      <div style="font-size:12px;color:#718096;font-weight:500;text-transform:uppercase;letter-spacing:0.5px;">Date de Début</div>
                      <div style="font-size:14px;color:#dc2626;font-weight:600;margin-top:4px;">${new Date(startDate).toLocaleDateString("fr-FR", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</div>
                    </div>
                    <div style="text-align:left;background:#ffffff;border-radius:8px;padding:16px;border:1px solid #e2e8f0;">
                      <div style="font-size:12px;color:#718096;font-weight:500;text-transform:uppercase;letter-spacing:0.5px;">Date de Fin</div>
                      <div style="font-size:14px;color:#dc2626;font-weight:600;margin-top:4px;">${new Date(endDate).toLocaleDateString("fr-FR", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</div>
                    </div>
                  </div>
                </div>
              </div>

              <div style="background:#fef2f2;border:1px solid #fecaca;padding:20px;border-radius:8px;margin:20px 0;">
                <h3 style="margin:0 0 12px 0;font-size:16px;color:#dc2626;font-weight:600;">Informations importantes</h3>
                <p style="margin:0;color:#718096;font-size:14px;line-height:1.6;">
                  Si vous n'êtes pas à l'origine de cette annulation ou si vous souhaitez obtenir plus d'informations, 
                  merci de nous contacter immédiatement.
                </p>
              </div>
            </div>

            <!-- Bouton de Contact -->
            <div style="text-align:center;margin:40px 0 32px;">
              <a href="mailto:${process.env.EMAIL_USER}" style="display:inline-block;padding:0;text-decoration:none;width:100%;max-width:320px;">
                <div style="background:linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);padding:3px;border-radius:12px;box-shadow:0 4px 20px rgba(220, 38, 38, 0.25);">
                  <div style="background:linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);padding:16px 32px;border-radius:10px;border:1px solid rgba(255,255,255,0.2);">
                    <div style="display:flex;align-items:center;justify-content:center;gap:12px;">
                      <span style="color:#ffffff;font-weight:600;font-size:16px;letter-spacing:0.5px;text-shadow:0 2px 4px rgba(0,0,0,0.2);">
                        Nous Contacter
                      </span>
                    </div>
                  </div>
                </div>
              </a>
            </div>
          </div>

          <!-- Footer FEG -->
          <div style="text-align:center;padding:40px 20px 30px 20px;color:#718096;font-size:13px;background:linear-gradient(135deg, #f8fafc 0%, #f0f4f0 100%);border-radius:0 0 12px 12px;border:1px solid #e2e8f0;border-top:none;">
            <div style="margin-bottom:20px;">
              <div style="font-family:'Playfair Display',serif;font-weight:700;color:#063d21;margin-bottom:8px;font-size:18px;letter-spacing:-0.025em;">FACULTÉ DES ÉTUDES DE GESTION</div>
              <div style="margin-bottom:6px;font-size:13px;color:#4a5568;font-weight:500;">Service de Réservation de Salles</div>
              <div style="font-size:12px;color:#0a5a31;font-weight:600;letter-spacing:1px;text-transform:uppercase;">Excellence • Professionnalisme • Service</div>
            </div>
            
            <div style="height:2px;background:linear-gradient(90deg, transparent 0%, #063d21 50%, transparent 100%);margin:24px 0 20px 0;opacity:0.1;"></div>
            
            <div style="font-size:12px;color:#718096;line-height:1.6;max-width:460px;margin:0 auto;">
              <div style="font-weight:500;margin-bottom:4px;">&copy; ${new Date().getFullYear()} Faculté des Études de Gestion</div>
              <div style="opacity:0.8;">
                Tous droits réservés. Cet email a été généré automatiquement par le système de gestion FEG.
                Veuillez ne pas répondre directement à cet email.
              </div>
            </div>
          </div>
        </div>
      </body>
      </html>
    `,
  }

  try {
    await emailTransporter.sendMail(mailOptions)
    console.log("Email d'annulation envoyé au client:", customerEmail)
    return { success: true }
  } catch (error) {
    console.error("Erreur envoi email annulation:", error)
    return { success: false, error }
  }
}
