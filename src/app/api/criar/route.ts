import { NextResponse } from 'next/server';
import { markdownSchema, sendToDiscordWebhook, type MarkdownData } from '@/utils/markdownSystem';
import { headers } from 'next/headers';
import { UAParser } from 'ua-parser-js';

// Rate limiting map
const submissionAttempts = new Map<string, { count: number; lastAttempt: number }>();

// Rate limiting function
const checkRateLimit = (identifier: string): boolean => {
  const now = Date.now();
  const userAttempts = submissionAttempts.get(identifier);

  if (!userAttempts) {
    submissionAttempts.set(identifier, { count: 1, lastAttempt: now });
    return true;
  }

  // Reset count if last attempt was more than 1 hour ago
  if (now - userAttempts.lastAttempt > 3600000) {
    submissionAttempts.set(identifier, { count: 1, lastAttempt: now });
    return true;
  }

  // Allow max 5 submissions per hour
  if (userAttempts.count >= 5) {
    return false;
  }

  userAttempts.count += 1;
  userAttempts.lastAttempt = now;
  submissionAttempts.set(identifier, userAttempts);
  return true;
};

async function verifyCaptcha(token: string) {
  try {
    const verifyUrl = 'https://api.hcaptcha.com/siteverify';
    const secret = process.env.CAPTCHA_SECRET_KEY;

    if (!secret) {
      console.error('CAPTCHA_SECRET_KEY not found in environment variables');
      return false;
    }

    const response = await fetch(verifyUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        secret,
        response: token,
      }),
    });

    const data = await response.json();
    return data.success;
  } catch (error) {
    console.error('Error verifying captcha:', error);
    return false;
  }
}

export async function POST(request: Request) {
  try {
    const { captchaToken, ...data } = await request.json();

    // Verify captcha
    if (!captchaToken) {
      return NextResponse.json(
        { error: 'Captcha não fornecido' },
        { status: 400 }
      );
    }

    const isValidCaptcha = await verifyCaptcha(captchaToken);
    if (!isValidCaptcha) {
      return NextResponse.json(
        { error: 'Captcha inválido' },
        { status: 400 }
      );
    }

    // Get request information
    const headersList = await headers();
    const userAgent = headersList.get('user-agent') || 'Unknown Browser';
    const forwardedFor = headersList.get('x-forwarded-for');
    const ip = forwardedFor ? forwardedFor.split(',')[0] : 'Unknown IP';

    // Parse user agent
    const parser = new UAParser(userAgent);
    const browser = parser.getBrowser();
    const os = parser.getOS();
    const device = parser.getDevice();

    // Get geolocation data
    let geoData = null;
    try {
      const geoResponse = await fetch(`http://ip-api.com/json/${ip}`);
      geoData = await geoResponse.json();
    } catch (error) {
      console.error('Error fetching geolocation:', error);
    }

    // Get local time
    const timezone = geoData?.timezone || 'America/Sao_Paulo';
    const submissionTime = new Date().toLocaleString('pt-BR', { timeZone: timezone });

    // Prepare submission metadata
    const submissionInfo = {
      ip,
      userAgent: {
        browser: `${browser.name} ${browser.version}`,
        os: `${os.name} ${os.version}`,
        device: device.type ? `${device.vendor} ${device.model} (${device.type})` : 'Desktop',
      },
      location: geoData ? {
        country: geoData.country,
        region: geoData.regionName,
        city: geoData.city,
        timezone: geoData.timezone,
      } : null,
      submissionTime,
    };

    // Check rate limit
    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { error: 'Limite de envios excedido. Tente novamente em 1 hora.' },
        { status: 429 }
      );
    }

    const validatedData = markdownSchema.parse(data);

    // Send to Discord webhook
    const webhookUrl = process.env.MARKDOWN_WEBHOOK_URL;
    if (!webhookUrl) {
      throw new Error('MARKDOWN_WEBHOOK_URL não configurada');
    }

    await sendToDiscordWebhook(webhookUrl, validatedData, submissionInfo);

    return NextResponse.json({ 
      success: true,
      message: 'Artigo enviado com sucesso!'
    });
  } catch (error) {
    console.error('Error processing markdown:', error);
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Erro ao processar o markdown'
      },
      { status: 400 }
    );
  }
}
