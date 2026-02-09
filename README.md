# WhatsApp Group Messaging com Twilio Conversations

Sistema completo de grupos multi-canal que permite conversas entre participantes via **WhatsApp** e **Web** simultaneamente, usando a [Twilio Conversations API](https://www.twilio.com/docs/conversations).

## 🌟 Funcionalidades

- ✅ Grupos com até 50 participantes (WhatsApp + Web)
- ✅ Interface web visual para gestão de grupos
- ✅ Criação dinâmica de grupos com nomes personalizados
- ✅ Adicionar/remover participantes em tempo real
- ✅ Mensagens bidirecionais entre todos os canais
- ✅ Roteamento inteligente via webhook
- ✅ Suporte a múltiplos grupos simultâneos

## 📋 Pré-requisitos

### 1. Aprovações da Twilio (pode levar alguns dias)

- **WhatsApp Business Profile** - [Solicitar acesso](https://www.twilio.com/whatsapp/request-access)
- **WhatsApp Sender** - [Solicitar aqui](https://www.twilio.com/console/sms/whatsapp/senders)

### 2. Ferramentas necessárias

- Node.js (v14 ou superior)
- [Twilio CLI](https://www.twilio.com/docs/twilio-cli/quickstart) instalada
- Conta Twilio com credenciais (Account SID e Auth Token)

## 🚀 Instalação e Configuração

### Passo 1: Clonar o repositório

```bash
git clone https://github.com/guucwb/whatsapp-group-messaging.git
cd whatsapp-group-messaging
npm install
```

### Passo 2: Criar recursos da Twilio

#### 2.1 Criar Conversations Service

```bash
twilio api:conversations:v1:services:create --friendly-name "WhatsApp Group Messaging"
```

Salve o `SID` retornado (começa com `IS...`)

#### 2.2 Criar Sync Service

```bash
twilio api:sync:v1:services:create --friendly-name "WhatsApp Groups Sync"
```

Salve o `SID` retornado (começa com `IS...`)

#### 2.3 Criar Sync Map

```bash
twilio api:sync:v1:services:maps:create \
  --service-sid <SEU_SYNC_SERVICE_SID> \
  --unique-name participants
```

Salve o `SID` retornado (começa com `MP...`)

#### 2.4 Criar Messaging Service

```bash
twilio api:messaging:v1:services:create --friendly-name "WhatsApp Groups"
```

Salve o `SID` retornado (começa com `MG...`)

#### 2.5 Criar API Key (para tokens de acesso)

```bash
twilio api:core:keys:create --friendly-name "WhatsApp Groups API Key"
```

Salve o `SID` e o `Secret` retornados.

### Passo 3: Configurar variáveis de ambiente

Crie um arquivo `.env` na raiz do projeto:

```env
ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
AUTH_TOKEN=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
SYNC_SERVICE_SID=ISxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
SYNC_MAP_SID=MPxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
CONVERSATIONS_SERVICE_SID=ISxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
WHATSAPP_NUMBER=+5541XXXXXXXXX
MESSAGE_SERVICE_SID=MGxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_API_KEY=SKxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_API_SECRET=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### Passo 4: Deploy das Functions

```bash
twilio serverless:deploy
```

Isso irá fazer deploy de todas as functions e retornar a URL do serviço (ex: `https://whatsapp-group-messaging-XXXX-dev.twil.io`)

### Passo 5: Configurar webhook no WhatsApp

Substitua `<SEU_WHATSAPP_NUMBER>` e `<SUA_URL>` pelos valores corretos:

```bash
twilio api:core:incoming-phone-numbers:update \
  --phone-number=<SEU_WHATSAPP_NUMBER> \
  --sms-url=<SUA_URL>/joinConversation \
  --sms-method=POST
```

Exemplo:
```bash
twilio api:core:incoming-phone-numbers:update \
  --phone-number=+5541991039019 \
  --sms-url=https://whatsapp-group-messaging-6486-dev.twil.io/joinConversation \
  --sms-method=POST
```

### Passo 6: Configurar Pre-Event Webhook (Conversations)

1. Acesse [Conversations Configuration](https://www.twilio.com/console/conversations/configuration/webhooks)
2. Em **Pre-Event Webhooks**, configure:
   - **Webhook URL**: `<SUA_URL>/message`
   - **Method**: POST
   - Marque apenas: `onMessageAdd`

## 🎯 Como Usar

### Acessar a interface web

Abra no navegador: `https://<SUA_URL>/index.html`

### Criar um grupo

1. Clique em **"Criar Novo Grupo"**
2. Digite o nome do grupo
3. Adicione participantes (nome + número WhatsApp no formato `+5541XXXXXXXXX`)
4. Clique em **"Criar Grupo"**
5. Você será redirecionado automaticamente para o grupo criado

### Gerenciar grupos

- **Listar grupos**: Clique em "Manage Groups"
- **Conectar a grupo**: Clique em "Connect" no grupo desejado
- **Deletar grupo**: Clique em "Delete" no grupo desejado
- **Deletar todos**: Clique em "Delete All Groups" (pede confirmação dupla)

### Adicionar participantes a grupo existente

1. Conecte ao grupo
2. Clique em **"Add Participant"**
3. Digite nome e número WhatsApp
4. O participante receberá convite no WhatsApp

### Remover participantes

1. Conecte ao grupo
2. Na lista de participantes, clique em **"Remove"** ao lado do participante

## 📁 Estrutura do Projeto

```
.
├── functions/
│   ├── createConversation.js    # Cria grupo e adiciona participantes
│   ├── joinConversation.js      # Webhook para mensagens WhatsApp
│   ├── addParticipant.js        # Adiciona participante a grupo
│   ├── removeParticipant.js     # Remove participante de grupo
│   ├── listConversations.js     # Lista todos os grupos
│   ├── deleteConversation.js    # Deleta um grupo
│   ├── getToken.js              # Gera token de acesso para web
│   └── message.js               # Formata mensagens com nome
├── assets/
│   └── index.html               # Interface web completa
├── package.json                 # Dependências
└── README.md                    # Este arquivo
```

## 🔧 Arquitetura Técnica

### Fluxo de mensagens

#### Web → WhatsApp
1. Admin envia mensagem na interface web
2. Conversations SDK adiciona mensagem na Conversation
3. Twilio envia mensagem automaticamente para todos os participantes WhatsApp

#### WhatsApp → Web
1. Participante WhatsApp envia mensagem
2. Webhook `/joinConversation` é acionado
3. Webhook busca no Sync Map qual grupo o participante pertence
4. Webhook adiciona mensagem na Conversation correta
5. Todos os participantes (WhatsApp + Web) recebem a mensagem

### Componentes principais

**Conversations Service**: Gerencia todas as conversas (grupos)

**Sync Map**: Mapeia `whatsapp:+5541XXX` → `conversationSid`
- Permite o webhook saber qual grupo cada participante pertence

**messagingBinding**: Configuração crítica nos participantes
```javascript
{
  'messagingBinding.address': 'whatsapp:+5541991039019',
  'messagingBinding.proxyAddress': 'whatsapp:+5541XXXXXXXX'
}
```

**Webhook Routing**: `/joinConversation` roteia mensagens WhatsApp para o grupo correto

## 🐛 Troubleshooting

### Mensagens não aparecem no WhatsApp

- Verifique se o webhook está configurado no número WhatsApp
- Verifique se o participante foi adicionado com `messagingBinding` correto
- Veja os logs no Twilio Console

### Mensagens do WhatsApp não chegam na web

- Verifique se o webhook `/joinConversation` está recebendo as mensagens
- Verifique se o participante está no Sync Map com `conversationSid` correto
- Veja os logs das Functions no Twilio Console

### Erro "Forbidden" ao conectar a grupo

- O admin precisa estar adicionado como participante do grupo
- Isso é feito automaticamente em `createConversation.js`

## 📝 Variáveis de Ambiente Explicadas

| Variável | Descrição | Exemplo |
|----------|-----------|---------|
| `ACCOUNT_SID` | Account SID da Twilio | `AC...` |
| `AUTH_TOKEN` | Auth Token da Twilio | `...` |
| `SYNC_SERVICE_SID` | SID do Sync Service | `IS...` |
| `SYNC_MAP_SID` | SID do Sync Map | `MP...` |
| `CONVERSATIONS_SERVICE_SID` | SID do Conversations Service | `IS...` |
| `WHATSAPP_NUMBER` | Número WhatsApp sender | `+5541...` |
| `MESSAGE_SERVICE_SID` | SID do Messaging Service | `MG...` |
| `TWILIO_API_KEY` | API Key SID | `SK...` |
| `TWILIO_API_SECRET` | API Key Secret | `...` |

## 🤝 Contribuindo

Contribuições são bem-vindas! Sinta-se livre para abrir issues ou pull requests.

## 📄 Licença

Este projeto está sob a licença MIT.

## 🔗 Links Úteis

- [Twilio Conversations API Docs](https://www.twilio.com/docs/conversations)
- [Twilio WhatsApp API](https://www.twilio.com/docs/whatsapp)
- [Twilio Sync Docs](https://www.twilio.com/docs/sync)
- [Twilio Functions Docs](https://www.twilio.com/docs/runtime/functions)

## 👨‍💻 Autor

Desenvolvido com ❤️ usando Twilio Conversations API

---

**Dúvidas?** Abra uma issue no GitHub!
