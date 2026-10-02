# Bússola de Indicadores

MVP estático em português, preparado para GitHub Pages. Os dados vêm da aba `Indicadores_Estrategicos` de `Indicadores_Estrategicos_SharePoint.xlsx`. A aba Leia-me da planilha caracteriza os dados como fictícios e criados para demonstração.

## Arquivos

- `index.html`: estrutura acessível da página.
- `style.css`: apresentação responsiva.
- `data.js`: dados usados no painel.
- `app.js`: busca, respostas por regras e registro local de planos.

## Publicação no GitHub Pages

No repositório público `bussola-indicadores`, envie os quatro arquivos deste diretório para a raiz. Em **Settings → Pages**, escolha **Deploy from a branch**, selecione `main` e `/ (root)` e salve. Aguarde a implantação e abra a URL mostrada pelo GitHub Pages.

Não há backend nem chamada a uma API de IA. Perguntas são respondidas por regras simples sobre os dados carregados nesta página. Planos de ação ficam no `localStorage` do navegador utilizado e podem ser exportados em JSON; não são compartilhados entre pessoas ou dispositivos.

