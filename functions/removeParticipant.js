exports.handler = async function(context, event, callback) {
  const client = context.getTwilioClient();

  const participantSid = event.participantSid;

  if (!participantSid) {
    return callback('Missing participantSid');
  }

  try {
    await client.conversations.v1
      .services(context.CONVERSATIONS_SERVICE_SID)
      .conversations(context.CONVERSATION_SID)
      .participants(participantSid)
      .remove();

    const response = new Twilio.Response();
    response.appendHeader('Access-Control-Allow-Origin', '*');
    response.appendHeader('Content-Type', 'application/json');
    response.setBody({ success: true, message: 'Participant removed!' });

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
