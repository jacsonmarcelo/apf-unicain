# Finanza: Planejamento & Análise Financeira (FinanzaPulse)

> [!IMPORTANT]
> **⚠️ ATENÇÃO SOBRE A PUBLICAÇÃO E DEPLOY DO APP:**
> Este aplicativo **NÃO** é publicado automaticamente a partir de commits ou alterações feitas diretamente no seu repositório do GitHub.
> A publicação e o deploy da versão estável (**Shared URL / link público**) são gerenciados e atualizados diretamente através do painel do **Google AI Studio** (com as compilações e implantações automáticas no Cloud Run que a plataforma gerencia).
> Fazer commits no GitHub é excelente para manter seu histórico de código, controle de versão e backups, mas lembre-se de que as alterações reais de produção dependem da publicação no painel do AI Studio para ficarem ativas para os usuários finais na URL Pública!

Este aplicativo é uma plataforma de Planejamento e Análise Financeira estruturada em React, Tailwind CSS, Node.js (Express) e Firebase (Auth/Firestore).

---

## 🔗 Atalhos e URLs do Projeto

Para facilitar seu dia a dia, aqui estão os endereços oficiais para acessar o seu sistema:

| Ambiente | URL de Acesso | Objetivo |
| :--- | :--- | :--- |
| **Desenvolvimento (Dev URL)** | [Acessar App de Dev](https://ais-dev-vpizavsvsmcr6mbhgg26zl-709671769699.us-east1.run.app) | Usado para testar novas alterações em tempo real no ambiente interno de testes. |
| **Público / Compartilhado (Shared URL)** | [Acessar App Público](https://ais-pre-vpizavsvsmcr6mbhgg26zl-709671769699.us-east1.run.app) | A versão homologada e estável que você compartilha com clientes ou visualiza externamente. |

---

## ☁️ Google Cloud Run: Como Monitorar e Resolver Erros

Se o aplicativo público parar de funcionar ou não atualizar após uma alteração, o Google Cloud Run é o melhor lugar para encontrar o diagnóstico exato instantaneamente.

### 1. Onde Acessar?
1. Acesse o console do Google Cloud: [https://console.cloud.google.com/](https://console.cloud.google.com/)
2. No menu de navegação esquerdo ou na barra de pesquisa superior, procure por **Cloud Run**.
3. Selecione o seu serviço (nomeado como `finanza-financial-planning-analysis`).

### 2. O que Monitorar no Cloud Run?
* **Aba Registros (Logs)**: Exibe em tempo real tudo o que o servidor escreve no console (`console.log`, erros de banco de dados, falhas de inicialização). Se houver alguma falha (como erro 500 ou banco desconectado), o erro exato de inicialização do container estará listado em vermelho aqui.
* **Aba Revisões (Revisions)**: Mostra o histórico de atualizações enviadas. Se uma nova versão falhar ao iniciar (devido à porta, banco, etc.), a revisão anterior continuará ativa e servindo tráfego para que o site não saia do ar, mas as alterações novas não aparecerão até que o erro seja corrigido.
* **Métricas (Metrics)**: Permite ver a quantidade de requisições por segundo, latência e consumo de memória.

### 3. Erro Crítico Resolvido: Variável de Porta (`PORT`)
* **O que causou o travamento anterior**: O servidor Express no arquivo `server.ts` estava configurado para escutar estritamente na porta `3000` fixa (`const PORT = 3000;`).
* **Como funciona no Cloud Run**: O Google Cloud Run gerencia dinamicamente as portas dos containers injetando uma variável de ambiente chamada `PORT`. Se o container não escutar na porta exata enviada por essa variável, o sistema falha no Health Check (verificação de integridade) e não entra no ar.
* **A Solução Permanente**: Agora o código está dinâmico e seguro:
  ```typescript
  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
  ```
  Isso garante que localmente ou em desenvolvimento ele use a porta `3000`, mas no Cloud Run ele se adapte perfeitamente à porta exigida pelo Google.

---

## 📧 Configuração do Serviço de E-mail (Resend)

O sistema de login envia códigos de acesso únicos (OTP) por e-mail utilizando a API do **Resend**.

1. **Variáveis de Ambiente Necessárias**:
   * `RESEND_API_KEY`: Chave secreta da API gerada no painel do Resend.
   * `RESEND_FROM_EMAIL`: O endereço de e-mail remetente autorizado (ex: `finanza@unicain.com.br`). Se não configurado ou em formato inválido, o servidor assume esse padrão.
2. **Homologação e Erro de Sandbox**:
   * Se você receber o erro **403** no Resend, significa que o e-mail que você está tentando enviar não pertence a um domínio verificado dentro da sua conta do Resend, ou que você está em modo Sandbox de testes tentando enviar para um e-mail diferente do cadastrado como dono da conta.
   * **Bypass de Segurança**: Para fins de teste/desenvolvimento, se o envio de e-mail falhar devido à restrição do Resend, o sistema gera um alerta amigável na tela com o código OTP gerado para que você possa continuar testando sem ficar travado! Além disso, o código universal de testes `123456` está ativo para administradores.

---

## 🗄️ Configuração do Firebase & Firestore

O banco de dados e controle de autenticação do projeto rodam no Firebase:

* **Configurações de Conexão**: Localizadas no arquivo `firebase-applet-config.json`.
* **Regras de Segurança**: Definidas no arquivo `firestore.rules` na raiz.
* **Como implantar atualizações de regras de segurança**:
  ```bash
  firebase deploy --only firestore:rules
  ```

## 🌐 Configuração de Domínio Personalizado (Cloudflare + Cloud Run)

Para colocar o aplicativo para rodar em seu próprio domínio ou subdomínio (ex: `finanza.unicain.com.br`) usando o **Cloudflare** como provedor de DNS, siga o passo a passo abaixo para evitar erros de SSL.

### 1. Mapeamento no Google Cloud Run
1. No menu lateral do console do Cloud Run, selecione **Mapeamentos de domínio** (Domain mappings).
2. Clique em **Adicionar mapeamento** (Add mapping).
3. Selecione o serviço `finanza-financial-planning-analysis`.
4. Digite o seu subdomínio (ex: `finanza.unicain.com.br`) e clique em continuar.
5. O console exibirá as instruções de DNS, indicando que você precisa criar um registro do tipo **CNAME** apontando para `ghs.googlehosted.com`.

### 2. Configuração no Cloudflare (Evitando o Erro 525 SSL)
O erro **525 SSL Handshake Failed** ocorre porque o Cloudflare tenta estabelecer uma conexão segura com o Cloud Run, mas o Cloud Run ainda não conseguiu emitir o certificado SSL para o seu domínio (pois ele está aguardando a validação do DNS).

Para resolver isso de forma definitiva:
1. No painel do Cloudflare, vá em **DNS** -> **Records**.
2. Adicione ou edite o registro **CNAME** do seu subdomínio:
   * **Type**: `CNAME`
   * **Name**: `finanza` (ou o seu subdomínio desejado)
   * **Target**: `ghs.googlehosted.com`
   * **Proxy status**: Mude temporariamente de *Proxied* (Nuvem Laranja) para **DNS Only (Nuvem Cinza)**.
3. **Por que isso é necessário?** Com a nuvem cinza (DNS Only), os servidores do Google conseguem se conectar diretamente ao seu domínio para validar a propriedade com a autoridade certificadora (Let's Encrypt) e emitir o certificado SSL automaticamente.
4. No console do Cloud Run, o status do mapeamento de domínio mostrará um círculo azul girando (em provisionamento). Isso pode levar de **15 minutos a 2 horas** para propagar e validar. 
5. Assim que o círculo azul se transformar em um **check verde (Ativo)**, o certificado SSL de origem foi gerado pelo Google com sucesso!

### 3. Reativando a Nuvem Laranja (Proxy) e Ajustando o SSL/TLS
Depois que o domínio estiver ativo com o check verde no Cloud Run, você pode reativar a segurança do Cloudflare:
1. No painel do Cloudflare, volte ao registro DNS do CNAME e alterne de **DNS Only (Nuvem Cinza)** de volta para **Proxied (Nuvem Laranja)**.
2. **IMPORTANTE (Modo de Criptografia SSL)**:
   * No menu esquerdo do Cloudflare, acesse **SSL/TLS**.
   * Altere o modo de criptografia para **Full** ou **Full (Strict)**.
   * **NÃO use o modo "Flexible"**. O modo *Flexible* tenta falar com o Cloud Run via HTTP comum (porta 80), o que causa loops infinitos de redirecionamento ou falhas de segurança. O Cloud Run exige conexão criptografada (HTTPS/443), portanto o modo **Full / Completo** é obrigatório.

---

## 🛠️ Como Executar o Projeto Localmente

Se algum dia você precisar baixar o projeto e executá-lo em seu próprio computador, siga os passos abaixo:

1. **Instalar Dependências**:
   ```bash
   npm install
   ```
2. **Rodar em Modo de Desenvolvimento (Vite + Express)**:
   ```bash
   npm run dev
   ```
   *O aplicativo estará disponível em `http://localhost:3000`.*
3. **Gerar Versão de Produção (Build)**:
   ```bash
   npm run build
   ```
   *Os arquivos estáticos compilados serão salvos na pasta `dist/`.*
