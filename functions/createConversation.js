exports.handler = async function(context, event, callback) {
  const client = context.getTwilioClient();

  try {
    // Pegar nome do grupo e participantes do request
    const groupName = event.groupName || 'WhatsApp Group';
    const participantsJson = event.participants;

    if (!participantsJson) {
      const response = new Twilio.Response();
      response.appendHeader('Access-Control-Allow-Origin', '*');
      response.appendHeader('Content-Type', 'application/json');
      response.setStatusCode(400);
      response.setBody({
        success: false,
        error: 'Missing participants'
      });
      return callback(null, response);
    }

    // Parse participants: [{ name: "Gustavo", phone: "+5541991039019" }, ...]
    const participants = JSON.parse(participantsJson);

    // 1. Criar conversation com nome personalizado NO NOSSO SERVICE
    const conversation = await client.conversations.v1
      .services(context.CONVERSATIONS_SERVICE_SID)
      .conversations.create({
        friendlyName: groupName
      });

    // 2. Adicionar o admin como participante (web) - ignora se já existe
    try {
      await client.conversations.v1
        .services(context.CONVERSATIONS_SERVICE_SID)
        .conversations(conversation.sid)
        .participants.create({
          identity: 'admin'
        });
    } catch (error) {
      // Ignora erro se admin já for participante
      if (!error.message.includes('already exists')) {
        throw error;
      }
    }

    // 3. Adicionar participantes WhatsApp ao Sync Map + Conversation
    for (const participant of participants) {
      const address = `whatsapp:${participant.phone}`;

      // Adicionar ao Sync Map COM o Conversation SID
      await client.sync.v1
        .services(context.SYNC_SERVICE_SID)
        .syncMaps(context.SYNC_MAP_SID)
        .syncMapItems.create({
          key: address,
          data: {
            name: participant.name,
            conversationSid: conversation.sid // GUARDAR O SID DO GRUPO!
          }
        })
        .catch(() => {}); // Ignora se já existe

      // Adicionar à Conversation COM messagingBinding (dot notation!)
      await client.conversations.v1
        .services(context.CONVERSATIONS_SERVICE_SID)
        .conversations(conversation.sid)
        .participants.create({
          'messagingBinding.address': address,
          'messagingBinding.proxyAddress': `whatsapp:${context.WHATSAPP_NUMBER}`
        });

      // Enviar mensagem ATRAVÉS DA CONVERSATION
      // Isso garante que as respostas venham para a mesma conversation!
      await client.conversations.v1
        .services(context.CONVERSATIONS_SERVICE_SID)
        .conversations(conversation.sid)
        .messages.create({
          author: 'admin',
          body: `Olá ${participant.name}! Você foi adicionado ao grupo "${groupName}". Responda esta mensagem para começar a participar! 👋`
        });
    }

    const response = new Twilio.Response();
    response.appendHeader('Access-Control-Allow-Origin', '*');
    response.appendHeader('Content-Type', 'application/json');
    response.setBody({
      success: true,
      conversationSid: conversation.sid,
      participantsAdded: participants.length
    });

    return callback(null, response);

  } catch (error) {
    const response = new Twilio.Response();
    response.appendHeader('Access-Control-Allow-Origin', '*');
    response.appendHeader('Content-Type', 'application/json');
    response.setStatusCode(500);
    response.setBody({ success: false, error: error.message });
    return callback(null, response);
  }
};
