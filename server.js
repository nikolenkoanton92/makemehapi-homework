var Hapi = require('hapi');
var Inert = require('inert');
var Vision = require('vision');
var H2o2 = require('h2o2');
var Rot13 = require('rot13-transform');
var Joi = require('joi');
var server = new Hapi.Server();
var Path = require('path');
var Fs = require('fs');

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
  path: '/stream',
  method: 'GET',
  config: {
    handler: function(request, reply) {
      var fileStream = Fs.createReadStream(Path.join(__dirname, 'index.txt'));
      reply(fileStream.pipe(Rot13()));
    }
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
  path: '/chickens/{breed}',
  method: 'GET',
  handler: function(request, reply) {
    reply('Chikens params ' + request.params.breed);
  },
  config: {
    validate: {
      params: {
        breed: Joi.string().required()
      }
    }
  }
});

server.route({
  path: '/login',
  method: 'POST',
  handler: function(request, reply) {
    reply('success login');
  },
  config: {
    validate: {
      payload: Joi.object({
        isGuest: Joi.boolean().required(),
        username: Joi.string().when('isGuest', {
          is: false,
          then: Joi.required()
        }),
        accessToken: Joi.alphanumeric(),
        password: Joi.alphanumeric()
      }).options({
        allUnknown: true
      }).without('password', 'accessToken')
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
