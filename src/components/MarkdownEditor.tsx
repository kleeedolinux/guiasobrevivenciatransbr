'use client';

import { useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import dynamic from 'next/dynamic';
import '@uiw/react-md-editor/markdown-editor.css';
import '@uiw/react-markdown-preview/markdown.css';
import TagInput from './TagInput';
import HCaptcha from '@hcaptcha/react-hcaptcha';

const MDEditor = dynamic(
  () => import('@uiw/react-md-editor').then((mod) => mod.default),
  { ssr: false }
);

const markdownSchema = z.object({
  title: z.string().min(1, 'Título é obrigatório').max(100, 'Título deve ter no máximo 100 caracteres'),
  author: z.string().min(1, 'Autor é obrigatório').max(50, 'Autor deve ter no máximo 50 caracteres'),
  date: z.string().min(1, 'Data é obrigatória'),
  tags: z.string().min(1, 'Tags são obrigatórias'),
  keywords: z.string().min(1, 'Palavras-chave são obrigatórias'),
  category: z.string().min(1, 'Categoria é obrigatória'),
  excerpt: z.string().min(50, 'Resumo deve ter pelo menos 50 caracteres').max(300, 'Resumo deve ter no máximo 300 caracteres'),
  content: z.string().min(100, 'Conteúdo deve ter pelo menos 100 caracteres'),
  references: z.string().min(1, 'Referências são obrigatórias'),
  justification: z.string()
    .min(100, 'Justificativa deve ter pelo menos 100 caracteres')
    .max(1000, 'Justificativa deve ter no máximo 1000 caracteres')
});

type FormData = z.infer<typeof markdownSchema>;

export default function MarkdownEditor() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [preview, setPreview] = useState<string>('');
  const [token, setToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const captchaRef = useRef<HCaptcha>(null);
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch
  } = useForm<FormData>({
    resolver: zodResolver(markdownSchema),
    defaultValues: {
      date: new Date().toISOString().split('T')[0],
      content: ''
    }
  });

  const content = watch('content');

  const onSubmit = async (data: FormData) => {
    if (!token) {
      setError('Por favor, complete o captcha antes de enviar.');
      return;
    }

    setIsSubmitting(true);
    setError(null);
    try {
      const formattedData = {
        ...data,
        tags: data.tags.split(',').map(t => t.trim()).filter(Boolean),
        keywords: data.keywords.split(',').map(k => k.trim()).filter(Boolean),
        references: data.references.split('\n').reduce((acc, ref, index) => {
          const trimmedRef = ref.trim();
          if (trimmedRef) {
            acc[index + 1] = trimmedRef;
          }
          return acc;
        }, {} as Record<string, string>)
      };

      const response = await fetch('/api/criar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formattedData,
          captchaToken: token
        })
      });

      const result = await response.json();
      
      if (!response.ok) {
        if (result.error) {
          // Handle validation errors
          if (typeof result.error === 'object' && result.error.length > 0) {
            const errorMessages = result.error.map((err: any) => {
              switch (err.code) {
                case 'too_small':
                  return `${getFieldName(err.path[0])}: Mínimo de ${err.minimum} caracteres necessários`;
                case 'too_big':
                  return `${getFieldName(err.path[0])}: Máximo de ${err.maximum} caracteres permitidos`;
                case 'invalid_type':
                  return `${getFieldName(err.path[0])}: Campo obrigatório`;
                default:
                  return err.message || 'Erro de validação';
              }
            });
            throw new Error(errorMessages.join('\n'));
          }
          throw new Error(result.error);
        }
        throw new Error('Erro ao enviar o artigo');
      }
      
      setPreview(result.markdown);
      alert('Artigo enviado com sucesso!');
      
      // Reset captcha
      setToken(null);
      captchaRef.current?.resetCaptcha();
    } catch (error) {
      console.error('Error:', error);
      setError(error instanceof Error ? error.message : 'Erro ao enviar o artigo');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Helper function to get field names in Portuguese
  const getFieldName = (field: string): string => {
    const fieldNames: Record<string, string> = {
      title: 'Título',
      author: 'Autor',
      date: 'Data',
      tags: 'Tags',
      keywords: 'Palavras-chave',
      category: 'Categoria',
      excerpt: 'Resumo',
      content: 'Conteúdo',
      references: 'Referências',
      justification: 'Justificativa'
    };
    return fieldNames[field] || field;
  };

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      {error && (
        <div className="bg-red-50 dark:bg-red-900/50 border-l-4 border-red-500 p-4 mb-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
                Erro ao enviar o artigo
              </h3>
              <div className="mt-2 text-sm text-red-700 dark:text-red-300 whitespace-pre-line">
                {error}
              </div>
            </div>
          </div>
        </div>
      )}
      
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-8 rounded-lg shadow-lg text-white mb-8">
        <h1 className="text-4xl font-bold mb-2">Editor de Artigos</h1>
        <p className="text-blue-100">Crie e formate seu artigo com facilidade</p>
      </div>
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-sm font-medium mb-1">Título</label>
              <input
                {...register('title')}
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700"
                placeholder="Título do artigo"
              />
              {errors.title && (
                <p className="text-red-500 text-sm">{errors.title.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium mb-1">Autor</label>
              <input
                {...register('author')}
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700"
                placeholder="Seu nome"
              />
              {errors.author && (
                <p className="text-red-500 text-sm">{errors.author.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium mb-1">Data</label>
              <input
                type="date"
                {...register('date')}
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium mb-1">Categoria</label>
              <select
                {...register('category')}
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700"
              >
                <option value="DIY">DIY</option>
                <option value="GUIA">Guia</option>
                <option value="TUTORIAL">Tutorial</option>
                <option value="INFORMACAO">Informação</option>
              </select>
            </div>
          </div>

          <TagInput
            value={watch('tags')}
            onChange={(value) => setValue('tags', value)}
            placeholder="Adicione tags..."
            label="Tags"
          />

          <TagInput
            value={watch('keywords')}
            onChange={(value) => setValue('keywords', value)}
            placeholder="Adicione palavras-chave..."
            label="Palavras-chave"
          />

          <div className="space-y-2">
            <label className="block text-sm font-medium mb-1">Resumo</label>
            <textarea
              {...register('excerpt')}
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700"
              rows={3}
              placeholder="Breve resumo do artigo"
            />
            {errors.excerpt && (
              <p className="text-red-500 text-sm">{errors.excerpt.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium mb-1">Justificativa</label>
            <textarea
              {...register('justification')}
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700"
              rows={4}
              placeholder="Explique por que este artigo é importante e como ele contribui para a comunidade (mínimo 100 caracteres)"
            />
            {errors.justification && (
              <p className="text-red-500 text-sm">{errors.justification.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium mb-1">Referências</label>
            <textarea
              {...register('references')}
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700"
              rows={3}
              placeholder="Uma referência por linha (ex: Nome da referência - URL)"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium mb-1">Conteúdo</label>
            <div className="border rounded-lg overflow-hidden" data-color-mode="auto">
              <MDEditor
                value={content}
                onChange={(value) => setValue('content', value || '')}
                height={500}
                preview="live"
                className="!bg-transparent"
              />
            </div>
            {errors.content && (
              <p className="text-red-500 text-sm">{errors.content.message}</p>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex justify-center">
            <HCaptcha
              sitekey="0c407b7a-16d6-44ec-9510-659625d02766"
              onVerify={setToken}
              ref={captchaRef}
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-6 rounded-lg font-medium shadow-lg hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-all duration-200"
        >
          {isSubmitting ? 'Enviando...' : 'Enviar Artigo'}
        </button>
      </form>

      {preview && (
        <div className="mt-8 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-bold mb-4">Preview do Markdown</h2>
          <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 overflow-x-auto">
            <pre className="whitespace-pre-wrap font-mono text-sm">
              {preview}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}
