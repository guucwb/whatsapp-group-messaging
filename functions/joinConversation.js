exports.handler = async function(context, event, callback) {
  const client = context.getTwilioClient();

  try {
    // Buscar participante no Sync Map para saber qual grupo ele pertence
    let participant = await client.sync.v1
      .services(context.SYNC_SERVICE_SID)
      .syncMaps(context.SYNC_MAP_SID)
      .syncMapItems(event.From)
      .fetch()
      .catch(e => null);

    // Se NÃO é participante de nenhum grupo, ignora
    if (!participant || !participant.data.conversationSid) {
      console.log('Mensagem de não-participante:', event.From);
      return callback(null);
    }

    const conversationSid = participant.data.conversationSid;
    const name = participant.data.name;

    console.log(`Mensagem de ${name} (${event.From}) para grupo ${conversationSid}`);

    // Adicionar a mensagem NO GRUPO CORRETO
    await client.conversations.v1
      .services(context.CONVERSATIONS_SERVICE_SID)
      .conversations(conversationSid)
      .messages.create({
        author: event.From, // Quem enviou
        body: event.Body,   // O que enviou
        xTwilioWebhookEnabled: 'true' // Permite que a mensagem seja enviada via webhook
      });

    console.log('Mensagem adicionada ao grupo com sucesso!');

    // Responder vazio (não enviar nada de volta)
    return callback(null);

  } catch (error) {
    console.error('ERRO ao processar mensagem:', error);
    return callback(null); // Não retorna erro pro Twilio
  }
};
