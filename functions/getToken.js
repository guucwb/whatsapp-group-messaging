const twilio = require('twilio');
const AccessToken = twilio.jwt.AccessToken;
const ChatGrant = AccessToken.ChatGrant;

exports.handler = function(context, event, callback) {
  const identity = event.identity || 'admin';

  // Create access token
  const token = new AccessToken(
    context.ACCOUNT_SID,
    context.TWILIO_API_KEY,
    context.TWILIO_API_SECRET,
    {
      identity: identity,
      ttl: 14400 // 4 hours
    }
  );

  // Create Chat Grant with all permissions
  const chatGrant = new ChatGrant({
    serviceSid: context.CONVERSATIONS_SERVICE_SID,
    pushCredentialSid: undefined
  });

  token.addGrant(chatGrant);

  // Return response
  const response = {
    identity: identity,
    token: token.toJwt()
  };

  callback(null, response);
};
