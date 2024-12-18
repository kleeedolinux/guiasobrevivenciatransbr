import { z } from 'zod';

// Sanitize text to remove illegal characters
const sanitizeText = (text: string): string => {
  return text
    .replace(/[[\]]/g, '') // Remove square brackets
    .replace(/[<>]/g, '') // Remove angle brackets
    .replace(/[{}]/g, '') // Remove curly braces
    .replace(/[|]/g, '') // Remove pipes
    .replace(/[@#$%^&*]/g, '') // Remove special characters
    .replace(/\\/g, '') // Remove backslashes
    .trim();
};

// Sanitize text for YAML frontmatter
const sanitizeYAMLText = (text: string) => {
  return text.replace(/[[\]<>]/g, '');
};

// Validation schema for markdown article data
export const markdownSchema = z.object({
  title: z.string()
    .min(1, 'Título é obrigatório')
    .max(100, 'Título deve ter no máximo 100 caracteres'),
  author: z.string()
    .min(1, 'Autor é obrigatório')
    .max(50, 'Autor deve ter no máximo 50 caracteres'),
  date: z.string()
    .min(1, 'Data é obrigatória')
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Data deve estar no formato YYYY-MM-DD'),
  category: z.string()
    .min(1, 'Categoria é obrigatória')
    .max(50, 'Categoria deve ter no máximo 50 caracteres'),
  tags: z.array(z.string())
    .min(1, 'Pelo menos uma tag é obrigatória')
    .max(10, 'Máximo de 10 tags permitidas'),
  keywords: z.array(z.string())
    .min(1, 'Pelo menos uma palavra-chave é obrigatória')
    .max(10, 'Máximo de 10 palavras-chave permitidas'),
  excerpt: z.string()
    .min(50, 'Resumo deve ter pelo menos 50 caracteres')
    .max(300, 'Resumo deve ter no máximo 300 caracteres'),
  content: z.string()
    .min(100, 'Conteúdo deve ter pelo menos 100 caracteres'),
  references: z.record(z.string())
    .refine((refs) => Object.keys(refs).length > 0, {
      message: 'Pelo menos uma referência é obrigatória'
    }),
  justification: z.string()
    .min(100, 'Justificativa deve ter pelo menos 100 caracteres')
    .max(1000, 'Justificativa deve ter no máximo 1000 caracteres')
    .describe('Explique por que este artigo é importante e como ele contribui para a comunidade'),
});

export type MarkdownData = z.infer<typeof markdownSchema>;

interface SubmissionInfo {
  ip: string;
  userAgent: {
    browser: string;
    os: string;
    device: string;
  };
  location: {
    country: string;
    region: string;
    city: string;
    timezone: string;
  } | null;
  submissionTime: string;
}

// Format markdown content
const formatMarkdown = (data: MarkdownData): string => {
  // Escape any remaining special characters in the content
  const escapeYamlValue = (str: string) => {
    if (str.includes('\n') || str.includes('"') || str.includes("'")) {
      return `|
  ${str.split('\n').join('\n  ')}`;
    }
    return str;
  };

  return `---
title: ${escapeYamlValue(data.title)}
author: ${escapeYamlValue(data.author)}
date: '${data.date}'
tags:
${data.tags.map(tag => `    - ${escapeYamlValue(tag)}`).join('\n')}
keywords:
${data.keywords.map(keyword => `  - ${escapeYamlValue(keyword)}`).join('\n')}
category: ${data.category}
excerpt: ${escapeYamlValue(data.excerpt)}
justification: ${escapeYamlValue(data.justification)}
references:
${Object.entries(data.references).map(([key, value]) => `  ${key}: "${escapeYamlValue(value)}"`).join('\n')}
---

${data.content}`;
};

// Get category color for Discord embeds
const getCategoryColor = (category: string): number => {
  switch (category.toUpperCase()) {
    case 'DIY':
      return 0xFF6B6B; // Coral
    case 'GUIA':
      return 0x4ECDC4; // Turquoise
    case 'TUTORIAL':
      return 0x95A5A6; // Gray
    case 'INFORMACAO':
      return 0x45B7D1; // Blue
    default:
      return 0x7F8C8D; // Default gray
  }
};

// Send to Discord webhook
export async function sendToDiscordWebhook(
  webhookUrl: string,
  data: MarkdownData,
  submissionInfo: SubmissionInfo
) {
  // Create the markdown file content with sanitized YAML frontmatter
  const fileContent = `---
title: ${sanitizeYAMLText(data.title)}
author: ${sanitizeYAMLText(data.author)}
date: ${data.date}
category: ${sanitizeYAMLText(data.category)}
tags: ${data.tags.map(tag => sanitizeYAMLText(tag)).join(', ')}
keywords: ${data.keywords.map(keyword => sanitizeYAMLText(keyword)).join(', ')}
excerpt: ${sanitizeYAMLText(data.excerpt)}
justification: ${sanitizeYAMLText(data.justification)}
references:
${Object.entries(data.references)
  .map(([key, value]) => `  ${key}: ${sanitizeYAMLText(value)}`)
  .join('\n')}
---

${data.content}`;

  // Create file blob
  const file = new Blob([fileContent], { type: 'text/markdown' });
  const fileName = `${data.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.md`;

  // Create embed
  const embed = {
    title: '📝 Novo Artigo Submetido',
    description: data.excerpt,
    color: getCategoryColor(data.category),
    fields: [
      { name: '📄 Nome do Arquivo', value: fileName, inline: true },
      { name: '👤 Autor', value: data.author, inline: true },
      { name: '📅 Data', value: new Date(data.date).toLocaleDateString('pt-BR'), inline: true },
      { name: '📂 Categoria', value: data.category, inline: true },
      { name: '🏷️ Tags', value: data.tags.join(', '), inline: true },
      { name: '🔍 Palavras-chave', value: data.keywords.join(', '), inline: true },
      { name: '⚡ Justificativa', value: data.justification.length > 200 ? 
        data.justification.substring(0, 200) + '...' : 
        data.justification, 
        inline: false },
      { name: '🌐 Navegador', value: submissionInfo.userAgent.browser, inline: true },
      { name: '💻 Sistema', value: submissionInfo.userAgent.os, inline: true },
      { name: '📱 Dispositivo', value: submissionInfo.userAgent.device, inline: true },
    ],
    footer: {
      text: `Enviado de ${submissionInfo.location ? 
        `${submissionInfo.location.city}, ${submissionInfo.location.region}, ${submissionInfo.location.country}` : 
        'Local desconhecido'} • IP: ${submissionInfo.ip}`
    },
    timestamp: new Date().toISOString()
  };

  // Create form data
  const formData = new FormData();
  formData.append('file', file, fileName);
  formData.append('payload_json', JSON.stringify({
    embeds: [embed]
  }));

  // Send to webhook
  const response = await fetch(webhookUrl, {
    method: 'POST',
    body: formData
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Webhook error:', errorText);
    throw new Error(`Falha ao enviar para o webhook: ${response.status} ${response.statusText}`);
  }
}
