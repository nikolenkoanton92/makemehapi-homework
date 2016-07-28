var Hapi = require('hapi');
var Inert = require('inert');
var server = new Hapi.Server();

server.connection({
  host: 'localhost',
  port: Number(process.argv[2] || 8080)
});

server.register(Inert, function(err) {
  if (err)
    throw err;
});

server.route({
  path: '/',
  method: 'GET',
  handler: {
    file: 'index.html'
  }
});

server.route({
  path: '/{name}',
  method: 'GET',
  handler: function(request, reply) {
    var name = request.params.name;
    reply('Hello ' + name);
  }
});


server.start(function() {
  console.log('Server running at: ', server.info.uri);
});
