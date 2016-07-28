var Hapi = require('hapi');
var Inert = require('inert');
var Vision = require('vision');
var server = new Hapi.Server();
var Path = require('path');

server.connection({
  host: 'localhost',
  port: Number(process.argv[2] || 8080)
});

server.register(Inert, function(err) {
  if (err)
    throw err;
});

server.register(Vision, function(err) {
  if (err)
    throw err;
});

server.views({
  engines: {
    html: require('handlebars')
  },
  path: Path.join(__dirname, 'templates')
});

server.route({
  path: '/',
  method: 'GET',
  handler: {
    view: 'index.html'
  }
});

server.route({
  path: '/foo/bar/baz/{filename}',
  method: 'GET',
  handler: {
    directory: {
      path: Path.join(__dirname, 'public')
    }
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
