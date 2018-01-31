export default function (server) {

  server.route({
    path: '/api/kibana-percent-diff/example',
    method: 'GET',
    handler(req, reply) {
      reply({ time: (new Date()).toISOString() });
    }
  });

}
