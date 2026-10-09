# Batalha Política LIVE

Jogo fictício de entretenimento com pontuação de energia. Não é enquete, pesquisa nem votação eleitoral.

## Requisitos
- Node.js 20 ou superior
- Uma conta TikTok com acesso à LIVE
- Eventos disponíveis por meio da biblioteca comunitária `tiktok-live-connector` (não é API oficial e pode deixar de funcionar)

## Executar

Abra dois terminais na pasta do projeto.

Terminal 1 (servidor da arena):
```powershell
python -m http.server 5173
```

Terminal 2 (ponte TikTok):
```powershell
npm install
$env:TIKTOK_USERNAME="seu_usuario_sem_arroba"
npm run bridge
```

Abra http://localhost:5173 e clique em **Iniciar**. A ponte fica em http://127.0.0.1:3001/health.

## Como participar
- Comentar **!azul** ou **!flavio** para escolher o lado azul.
- Comentar **!vermelho** ou **!lula** para escolher o lado vermelho.
- O comentário de escolha dá 5 pontos; curtidas dão 2 pontos cada e presentes dão 20 pontos por unidade.
- Cada pessoa precisa escolher um lado antes de suas curtidas/presentes serem contabilizados.
- O espectador pode mudar de lado comentando outro comando.
- Os botões do painel simulam eventos para testar sem LIVE.
- A transmissão deve capturar apenas a arena vertical, não o painel.

## Observações
A conexão usa biblioteca não oficial e pode exigir ajustes se o TikTok mudar seus eventos. Não armazene credenciais do TikTok no código. Use apenas seu nome de usuário público. Nunca exponha a porta 3001 na internet. Se a conexão falhar, o jogo permanece utilizável no modo de simulação.
