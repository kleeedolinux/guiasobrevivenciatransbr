import { NextRequest, NextResponse } from 'next/server';
import { reportSchema, getReportTypeColor, getReportTypeLabel } from '@/utils/reportSystem';

// Rate limiting map
const reportAttempts = new Map<string, { count: number; lastAttempt: number }>();

// Rate limiting function
const checkRateLimit = (identifier: string): boolean => {
  const now = Date.now();
  const userAttempts = reportAttempts.get(identifier);

  if (!userAttempts) {
    reportAttempts.set(identifier, { count: 1, lastAttempt: now });
    return true;
  }

  // Reset count if last attempt was more than 1 hour ago
  if (now - userAttempts.lastAttempt > 3600000) {
    reportAttempts.set(identifier, { count: 1, lastAttempt: now });
    return true;
  }

  // Allow max 5 reports per hour
  if (userAttempts.count >= 5) {
    return false;
  }

  userAttempts.count += 1;
  userAttempts.lastAttempt = now;
  reportAttempts.set(identifier, userAttempts);
  return true;
}

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
      }).toString(),
    });

    const data = await response.json();
    console.log('Captcha verification response:', data);

    return data.success;
  } catch (error) {
    console.error('Error verifying captcha:', error);
    return false;
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    console.log('Received request body:', { ...data, captchaToken: '...' });

    const { captchaToken, ...validatedData } = data;

    if (!captchaToken) {
      return NextResponse.json({ error: 'Captcha não fornecido' }, { status: 400 });
    }

    const isValidCaptcha = await verifyCaptcha(captchaToken);
    console.log('Captcha validation result:', isValidCaptcha);

    if (!isValidCaptcha) {
      return NextResponse.json({ error: 'Captcha inválido' }, { status: 400 });
    }

    // Validate the data
    const parsedData = reportSchema.parse(validatedData);

    // Check rate limit
    const identifier = `${parsedData.username}-${parsedData.discordUsername || ''}-${new Date().toISOString().split('T')[0]}`;
    if (!checkRateLimit(identifier)) {
      throw new Error('Você atingiu o limite de reports por hora. Por favor, tente novamente mais tarde.');
    }

    const webhookUrl = process.env.REPORT_WEBHOOK;
    if (!webhookUrl) {
      throw new Error('Webhook URL não configurada');
    }

    // Format article URL
    const articleUrl = parsedData.articleUrl.startsWith('http') 
      ? parsedData.articleUrl 
      : `https://guiadesobrevivenciatrans.com${parsedData.articleUrl.startsWith('/') ? '' : '/'}${parsedData.articleUrl}`;

    const embed = {
      title: '📢 Novo Report de Conteúdo',
      color: getReportTypeColor(parsedData.reportType),
      fields: [
        {
          name: '👤 Usuário',
          value: parsedData.username,
          inline: true,
        },
        {
          name: '🏳️‍⚧️ Pronomes',
          value: parsedData.pronouns,
          inline: true,
        },
        {
          name: '📱 Discord',
          value: parsedData.discordUsername || 'Não informado',
          inline: true,
        },
        {
          name: '📄 Artigo',
          value: `[${parsedData.articleTitle}](${articleUrl})`,
        },
        {
          name: '⚠️ Tipo do Report',
          value: getReportTypeLabel(parsedData.reportType),
        },
        {
          name: '📝 Descrição',
          value: parsedData.description,
        },
      ],
      timestamp: new Date().toISOString(),
      footer: {
        text: 'Guia de Sobrevivência Trans - Sistema de Reports',
      },
    };

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        embeds: [embed],
      }),
    });

    if (!response.ok) {
      throw new Error('Falha ao enviar report');
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error processing report:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erro ao processar report' },
      { status: 400 }
    );
  }
}
