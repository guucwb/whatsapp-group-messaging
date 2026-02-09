exports.handler = async function(context, event, callback) {
  const client = context.getTwilioClient();

  // Buscar participante no Sync Map
  let participant = await client.sync.v1.services(context.SYNC_SERVICE_SID)
    .syncMaps(context.SYNC_MAP_SID)
    .syncMapItems(event.Author)
    .fetch()
    .catch(e => null);

  // Se não encontrou no Sync Map, usar o author como nome
  const name = participant ? participant.data.name : event.Author;

  const modifiedBody = `*${name}*: ${event.Body}`;

  return callback(null, { 'body': modifiedBody });
};