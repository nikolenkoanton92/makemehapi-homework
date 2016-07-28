var Hapi = require('hapi');
var Inert = require('inert');
var Vision = require('vision');
var H2o2 = require('h2o2');
var server = new Hapi.Server();
var Path = require('path');

server.connection({
  host: 'localhost',
  port: Number(process.argv[2] || 8080)
});

server.register(H2o2, function(err) {
  if (err)
    throw err;
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
  path: Path.join(__dirname, 'templates'),
  helpersPath: Path.join(__dirname, 'helpers')
});

server.route({
  path: '/',
  method: 'GET',
  handler: {
    view: 'index.html'
  }
});

server.route({
  path: '/proxy',
  method: 'GET',
  handler: {
    proxy: {
      host: '127.0.0.1',
      port: 65535
    }
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
