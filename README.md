# Marques Invest

Projeto estatico de portal de investimentos com:

- paginas separadas
- painel admin online
- login com Supabase Auth
- banco online para posts, agenda, newsletter, contato e configuracoes do site
- fallback local para preview sem quebrar o layout
- integracao opcional com API de noticias para banner, resumo e fonte externa

## Estrutura principal

- `index.html`: home do portal
- `analise-semana.html`: pagina editorial da semana
- `destaques.html`: destaques do site
- `noticias.html`: noticias por categoria
- `agenda.html`: agenda economica
- `newsletter.html`: captacao de newsletter
- `contato.html`: formulario comercial
- `admin.html`: painel admin online
- `assets/css/styles.css`: estilos compartilhados
- `assets/js/script.js`: noticias, agenda, newsletter, contato e panorama
- `assets/js/site-default-content.js`: conteudo padrao das paginas
- `assets/js/site-content.js`: aplicacao de conteudo no site
- `assets/js/supabase-config.js`: configuracao publica do Supabase
- `assets/js/supabase-api.js`: camada de autenticacao e REST para o Supabase
- `assets/js/admin.js`: painel online com login e CRUD
- `supabase/schema.sql`: schema completo do banco e politicas RLS

## O que ja ficou pronto

### Painel online

O `admin.html` agora foi preparado para:

- login por e-mail e senha via Supabase Auth
- editar configuracoes do site
- salvar links de acesso/postagem das redes sociais
- alterar conteudo institucional das paginas
- cadastrar, editar e excluir posts/noticias
- cadastrar, editar e excluir eventos da agenda
- visualizar leads de newsletter
- visualizar leads de contato

### Site publico conectado

Quando o Supabase estiver configurado:

- `noticias.html` passa a puxar os posts publicados do banco
- `agenda.html` passa a puxar os eventos publicados do banco
- `newsletter.html` grava inscritos em `newsletter_subscribers`
- `contato.html` grava leads em `contact_leads`
- o WhatsApp e o conteudo institucional passam a vir do banco

Se o Supabase nao estiver configurado, o site continua usando preview e fallback local.

## Noticias externas automatizadas

A aba de noticias esta preparada para usar:

- `MARKETAUX_API_KEY` como provedor principal
- `NEWSAPI_KEY` como fallback opcional
- feeds RSS como fallback final

Com `Marketaux`, o site consegue carregar melhor:

- imagem/banner da noticia
- descricao ou snippet
- fonte externa
- data de publicacao
- link para leitura na origem

Edite [C:\Users\money\Documents\Modelos Personalizados do Office\.env.example](C:\Users\money\Documents\Modelos Personalizados do Office\.env.example) e configure no deploy:

```env
MARKETAUX_API_KEY=sua_chave_aqui
NEWSAPI_KEY=opcional_fallback_newsapi
FMP_API_KEY=coloque_sua_chave_aqui
```

Na `Vercel`, adicione essas variaveis em `Project Settings > Environment Variables`.
Na `Netlify`, adicione em `Site configuration > Environment variables`.

## Como ativar o Supabase

### 1. Criar o projeto

1. Crie um projeto no [Supabase](https://supabase.com/docs).
2. No painel do projeto, copie:
   - `Project URL`
   - `anon public key`

### 2. Aplicar o schema

1. Abra o `SQL Editor` do Supabase.
2. Cole o conteudo de [supabase/schema.sql](C:\Users\money\Documents\Modelos Personalizados do Office\supabase\schema.sql).
3. Execute o script.

Esse arquivo cria:

- `site_settings`
- `site_content`
- `posts`
- `agenda_events`
- `newsletter_subscribers`
- `contact_leads`

e tambem configura as politicas RLS para leitura publica do que precisa aparecer no site e escrita autenticada no painel.

### 3. Criar o usuario admin

1. No Supabase, abra `Authentication`.
2. Crie um usuario com e-mail e senha.
3. Esse usuario sera usado para entrar em `admin.html`.

### 4. Configurar o site

Edite [supabase-config.js](C:\Users\money\Documents\Modelos Personalizados do Office\assets\js\supabase-config.js):

```js
window.MARQUES_SUPABASE_CONFIG = {
  url: "https://SEU-PROJETO.supabase.co",
  anonKey: "SUA_ANON_KEY_PUBLICA",
};
```

## Fluxo de administracao

Depois da configuracao:

1. abra [admin.html](C:\Users\money\Documents\Modelos Personalizados do Office\admin.html)
2. faca login com o usuario criado no Supabase
3. salve o link do WhatsApp em `Configuracoes`
4. cadastre os links das redes em `Postar nas redes`
5. edite os textos do site em `Conteudo`
6. publique posts em `Posts`
7. publique eventos em `Agenda`
8. acompanhe os leads em `Newsletter` e `Contato`

## Publicacao

O projeto continua pronto para deploy estatico.

### Netlify

1. envie a pasta do projeto
2. publique
3. depois de publicar, o site ja conseguira falar com o Supabase diretamente do browser

### Vercel

1. importe o projeto
2. publique
3. o site tambem funcionara com o Supabase do lado do cliente

## Observacoes importantes

- a `anon key` do Supabase pode ficar no frontend; ela e publica por design
- a seguranca real fica nas politicas `RLS`
- use a aba `Postar nas redes` para guardar links de login, dashboard ou composicao das plataformas
- nao e recomendado salvar senhas das redes dentro do site; deixe apenas os links de acesso/postagem
- se quiser, no proximo passo podemos adicionar:
  - upload de imagem de capa para posts
  - editor rico para noticias
  - pagina individual por post
  - dashboard com graficos e metricas
  - perfis de usuario e permissao por papel

## Referencias oficiais usadas

- [Supabase Docs](https://supabase.com/docs/)
- [Supabase Auth](https://supabase.com/docs/guides/auth)
- [Supabase Database](https://supabase.com/docs/guides/database)
- [Supabase Row Level Security](https://supabase.com/docs/guides/database/postgres/row-level-security)
- [Marketaux Documentation](https://www.marketaux.com/documentation)
- [Marketaux Pricing](https://www.marketaux.com/pricing)
