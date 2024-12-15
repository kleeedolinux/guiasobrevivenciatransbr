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

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    
    // Validate the data
    const validatedData = reportSchema.parse(data);

    // Check rate limit
    const identifier = `${validatedData.username}-${validatedData.discordUsername || ''}-${new Date().toISOString().split('T')[0]}`;
    if (!checkRateLimit(identifier)) {
      throw new Error('Você atingiu o limite de reports por hora. Por favor, tente novamente mais tarde.');
    }
    
    const webhookUrl = process.env.REPORT_WEBHOOK;
    if (!webhookUrl) {
      throw new Error('Webhook URL não configurada');
    }

    // Format article URL
    const articleUrl = validatedData.articleUrl.startsWith('http') 
      ? validatedData.articleUrl 
      : `https://guiadesobrevivenciatrans.com${validatedData.articleUrl.startsWith('/') ? '' : '/'}${validatedData.articleUrl}`;

    const embed = {
      title: '📢 Novo Report de Conteúdo',
      color: getReportTypeColor(validatedData.reportType),
      fields: [
        {
          name: '👤 Usuário',
          value: validatedData.username,
          inline: true,
        },
        {
          name: '🏳️‍⚧️ Pronomes',
          value: validatedData.pronouns,
          inline: true,
        },
        {
          name: '📱 Discord',
          value: validatedData.discordUsername || 'Não informado',
          inline: true,
        },
        {
          name: '📄 Artigo',
          value: `[${validatedData.articleTitle}](${articleUrl})`,
        },
        {
          name: '⚠️ Tipo do Report',
          value: getReportTypeLabel(validatedData.reportType),
        },
        {
          name: '📝 Descrição',
          value: validatedData.description,
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
