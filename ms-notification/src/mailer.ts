const MAILGUN_API_KEY = process.env.MAILGUN_API_KEY || "";
const MAILGUN_DOMAIN = process.env.MAILGUN_DOMAIN || "";
const MAILGUN_FROM = process.env.MAILGUN_FROM || `noreply@${MAILGUN_DOMAIN}`;

const BASE_URL = `https://api.mailgun.net/v3/${MAILGUN_DOMAIN}/messages`;

interface MailOptions {
  to: string;
  subject: string;
  text: string;
}

export async function sendMail({
  to,
  subject,
  text,
}: MailOptions): Promise<boolean> {
  if (!MAILGUN_API_KEY || !MAILGUN_DOMAIN) {
    console.warn("Mailgun não configurado. E-mail não enviado.");
    return false;
  }

  const form = new URLSearchParams({
    from: MAILGUN_FROM,
    to,
    subject,
    text,
  });

  try {
    const res = await fetch(BASE_URL, {
      method: "POST",
      headers: {
        Authorization: `Basic ${btoa(`api:${MAILGUN_API_KEY}`)}`,
      },
      body: form,
    });

    if (res.ok) {
      console.log(`E-mail enviado para ${to}: "${subject}"`);
      return true;
    }

    const err = await res.text();
    console.warn(`Falha ao enviar e-mail: ${res.status} — ${err}`);
    return false;
  } catch (err) {
    console.warn(`Erro ao enviar e-mail: ${err}`);
    return false;
  }
}
