exports.handler = async function(context, event, callback) {
  const client = context.getTwilioClient();

  const phoneNumber = event.phoneNumber; // formato: +5541999999999
  const name = event.name;

  if (!phoneNumber || !name) {
    return callback('Missing phoneNumber or name');
  }

  try {
    const address = `whatsapp:${phoneNumber}`;

    // Adicionar à conversation COM messagingBinding (dot notation!)
    await client.conversations.v1
      .services(context.CONVERSATIONS_SERVICE_SID)
      .conversations(context.CONVERSATION_SID)
      .participants.create({
        'messagingBinding.address': address,
        'messagingBinding.proxyAddress': `whatsapp:${context.WHATSAPP_NUMBER}`
      });

    // Adicionar ao Sync Map COM o conversationSid
    await client.sync.v1
      .services(context.SYNC_SERVICE_SID)
      .syncMaps(context.SYNC_MAP_SID)
      .syncMapItems.create({
        key: address,
        data: {
          name: name,
          conversationSid: context.CONVERSATION_SID
        }
      })
      .catch(() => {}); // Ignora se já existe

    // Enviar Content Template via Messages API
    await client.messages.create({
      contentSid: context.CONTENT_SID,
      from: context.MESSAGE_SERVICE_SID,
      to: address
    });

    const response = new Twilio.Response();
    response.appendHeader('Access-Control-Allow-Origin', '*');
    response.appendHeader('Content-Type', 'application/json');
    response.setBody({ success: true, message: 'Participant added!' });

    return callback(null, response);

  } catch (error) {
    const response = new Twilio.Response();
    response.appendHeader('Access-Control-Allow-Origin', '*');
    response.appendHeader('Content-Type', 'application/json');
    response.setStatusCode(400);
    response.setBody({ success: false, error: error.message });

    return callback(null, response);
  }
};
