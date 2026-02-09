exports.handler = async function(context, event, callback) {
  const client = context.getTwilioClient();

  try {
    // Listar todas as conversations DO NOSSO SERVICE
    const conversations = await client.conversations.v1
      .services(context.CONVERSATIONS_SERVICE_SID)
      .conversations.list({ limit: 50 });

    const conversationList = [];

    for (const conv of conversations) {
      // Pegar participantes de cada conversation
      const participants = await client.conversations.v1
        .services(context.CONVERSATIONS_SERVICE_SID)
        .conversations(conv.sid)
        .participants.list();

      conversationList.push({
        sid: conv.sid,
        friendlyName: conv.friendlyName || 'WhatsApp Group',
        dateCreated: conv.dateCreated,
        participantCount: participants.length
      });
    }

    const response = new Twilio.Response();
    response.appendHeader('Access-Control-Allow-Origin', '*');
    response.appendHeader('Content-Type', 'application/json');
    response.setBody({
      success: true,
      conversations: conversationList
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
