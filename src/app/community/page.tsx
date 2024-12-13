import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Comunidade & Recursos - Guia de Sobrevivência Trans',
  description: 'Recursos comunitários, sites recomendados e organizações profissionais para saúde trans no Brasil',
};

interface ResourceLink {
  title: string;
  url: string;
  description: string;
}

interface RedditCommunity {
  name: string;
  subreddit: string;
  description: string;
  members?: string;
}

interface Organization {
  name: string;
  url: string;
  description: string;
  type: 'Profissional' | 'ONG' | 'Apoio';
}

const redditCommunities: RedditCommunity[] = [
  {
    name: 'TransBR',
    subreddit: 'transbr',
    description: 'Comunidade brasileira para pessoas trans compartilharem experiências e informações.',
    members: 'Em breve'
  },
  {
    name: 'TransTHBR',
    subreddit: 'transthbr',
    description: 'Comunidade brasileira sobre TH',
    members: 'Em breve'
  },
  {
    name: 'TransDIY',
    subreddit: 'TransDIY',
    description: 'Discussão internacional sobre métodos de TH, segurança e recursos.',
    members: 'Em breve'
  }
];

const recommendedSites: ResourceLink[] = [
  {
    title: 'Portal Ambulatório Trans SP',
    url: 'https://saude.sp.gov.br/centro-de-referencia-e-treinamento-dstaids-sp/assistencia/ambulatorio-de-saude-integral-para-travestis-transexuais',
    description: 'Informações sobre atendimento e acolhimento à população trans em São Paulo.'
  }
];

const organizations: Organization[] = [
  {
    name: 'Associação Nacional de Travestis e Transexuais (ANTRA)',
    url: 'https://antrabrasil.org',
    description: 'Maior organização nacional em defesa dos direitos da população trans.',
    type: 'ONG'
  },
  {
    name: 'Conselho Federal de Medicina (CFM)',
    url: 'https://portal.cfm.org.br',
    description: 'Regulamentação e diretrizes médicas para atendimento à população trans.',
    type: 'Profissional'
  }
];

function RedditLink({ subreddit }: { subreddit: string }) {
  return (
    <Link
      href={`https://reddit.com/r/${subreddit}`}
      className="text-purple-400 hover:text-purple-300"
      target="_blank"
      rel="noopener noreferrer"
    >
      r/{subreddit}
    </Link>
  );
}

export default function CommunityPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8 text-purple-400">Comunidade & Recursos</h1>

      {/* Reddit Communities */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-6 text-purple-400">Comunidades no Reddit</h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {redditCommunities.map((community) => (
            <div
              key={community.subreddit}
              className="bg-gray-800 rounded-lg p-6 hover:bg-gray-700 transition-colors"
            >
              <h3 className="text-xl font-bold mb-2">
                <RedditLink subreddit={community.subreddit} />
                {community.members && (
                  <span className="text-sm font-normal text-gray-400 ml-2">
                    {community.members} membros
                  </span>
                )}
              </h3>
              <p className="text-gray-300">{community.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Recommended Sites */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-6 text-purple-400">Sites Recomendados</h2>
        <div className="space-y-6">
          {recommendedSites.map((site) => (
            <div
              key={site.url}
              className="bg-gray-800 rounded-lg p-6 hover:bg-gray-700 transition-colors"
            >
              <h3 className="text-xl font-bold mb-2">
                <Link
                  href={site.url}
                  className="text-purple-400 hover:text-purple-300"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {site.title}
                </Link>
              </h3>
              <p className="text-gray-300">{site.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Organizations */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-6 text-purple-400">Organizações Profissionais & ONGs</h2>
        <div className="grid gap-6 md:grid-cols-2">
          {organizations.map((org) => (
            <div
              key={org.url}
              className="bg-gray-800 rounded-lg p-6 hover:bg-gray-700 transition-colors"
            >
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-xl font-bold">
                  <Link
                    href={org.url}
                    className="text-purple-400 hover:text-purple-300"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {org.name}
                  </Link>
                </h3>
                <span className="px-2 py-1 text-sm bg-purple-900 text-purple-100 rounded">
                  {org.type}
                </span>
              </div>
              <p className="text-gray-300">{org.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Disclaimer */}
      <div className="bg-gray-800 rounded-lg p-6 mt-8">
        <h2 className="text-xl font-bold mb-4 text-purple-400">Aviso Legal</h2>
        <p className="text-gray-300">
          Os recursos e comunidades listados nesta página são fornecidos apenas para fins informativos. 
          Embora nos esforcemos para manter informações precisas e atualizadas, não podemos garantir o conteúdo 
          ou serviços fornecidos por sites e organizações externos. Sempre tenha cautela e consulte 
          profissionais de saúde para aconselhamento médico.
        </p>
      </div>
    </div>
  );
} 