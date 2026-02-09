exports.handler = async function(context, event, callback) {
  const client = context.getTwilioClient();

  const conversationSid = event.conversationSid;

  if (!conversationSid) {
    const response = new Twilio.Response();
    response.appendHeader('Access-Control-Allow-Origin', '*');
    response.appendHeader('Content-Type', 'application/json');
    response.setStatusCode(400);
    response.setBody({
      success: false,
      error: 'Missing conversationSid'
    });
    return callback(null, response);
  }

  try {
    // Deletar a conversation DO NOSSO SERVICE
    await client.conversations.v1
      .services(context.CONVERSATIONS_SERVICE_SID)
      .conversations(conversationSid)
      .remove();

    const response = new Twilio.Response();
    response.appendHeader('Access-Control-Allow-Origin', '*');
    response.appendHeader('Content-Type', 'application/json');
    response.setBody({
      success: true,
      message: 'Conversation deleted successfully'
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
