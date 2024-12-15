import { z } from 'zod';

// Validation schema for report data
export const reportSchema = z.object({
  username: z.string().min(2, 'Nome precisa ter pelo menos 2 caracteres'),
  discordUsername: z.string().optional(),
  pronouns: z.string(),
  articleTitle: z.string(),
  articleUrl: z.string(),
  reportType: z.enum([
    'INFORMACAO_INCORRETA',
    'CONTEUDO_DESATUALIZADO',
    'ERRO_GRAMATICAL',
    'LINK_QUEBRADO',
    'OUTRO'
  ]),
  description: z.string().min(10, 'Descrição precisa ter pelo menos 10 caracteres'),
});

export type ReportData = z.infer<typeof reportSchema>;

// Report type colors for Discord embeds
export const getReportTypeColor = (type: ReportData['reportType']): number => {
  switch (type) {
    case 'INFORMACAO_INCORRETA':
      return 0xFF0000; // Red
    case 'CONTEUDO_DESATUALIZADO':
      return 0xFFA500; // Orange
    case 'ERRO_GRAMATICAL':
      return 0xFFFF00; // Yellow
    case 'LINK_QUEBRADO':
      return 0x800080; // Purple
    case 'OUTRO':
      return 0x808080; // Gray
    default:
      return 0x808080; // Default gray
  }
};

// Report type labels
export const getReportTypeLabel = (type: ReportData['reportType']): string => {
  switch (type) {
    case 'INFORMACAO_INCORRETA':
      return 'Informação Incorreta';
    case 'CONTEUDO_DESATUALIZADO':
      return 'Conteúdo Desatualizado';
    case 'ERRO_GRAMATICAL':
      return 'Erro Gramatical';
    case 'LINK_QUEBRADO':
      return 'Link Quebrado';
    case 'OUTRO':
      return 'Outro';
    default:
      return 'Desconhecido';
  }
};
