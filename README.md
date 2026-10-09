# Batalha Política LIVE

Protótipo de jogo de luta 2D fictício, neutro e responsivo para transmissão em formato vertical. Dois personagens caricaturais: Flávio Bolsonaro e Lula. Não representa votação, pesquisa ou resultado eleitoral.

## Executar
Requer apenas navegador moderno e servidor HTTP local (módulos ES). Execute `python -m http.server 5173` na raiz e acesse http://localhost:5173.

## Recursos da primeira versão
- Arena canvas 720×960, responsiva, combate automático e cronômetro
- HP, escudo, golpes, efeitos, rodadas e reinício
- Simulador de curtidas, comentários e presentes
- Ranking de participação local
- API de demonstração: `window.batalhaEvent({type:'gift',gift:'rose',target:0,name:'usuario'})`

## Próximas etapas
Criar bridge backend autenticada para eventos oficiais ou integração compatível com TikTok LIVE, com validação de payload, rate limiting e reconexão. A versão atual **não está conectada ao TikTok** e não recebe presentes reais. Validar regras de TikTok LIVE, monetização e conteúdo político antes de transmitir. Presentes não são votos nem devem ser apresentados como influência sobre eleições reais.
