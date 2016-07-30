var Hapi = require('hapi');
var Inert = require('inert');
var Vision = require('vision');
var H2o2 = require('h2o2');
var Rot13 = require('rot13-transform');
var Joi = require('joi');
var Boom = require('boom');
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

server.state('session', {
  domain: 'localhost',
  path: '/',
  encoding: 'base64json',
  ttl: 10000
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
  path: '/upload',
  method: 'POST',
  handler: function(request, reply) {
    var body = '';

    request.payload.file.on('data', function(data) {
      body += data;
    });

    request.payload.file.on('end', function() {
      var result = {
        description: request.payload.description,
        file: {
          data: body,
          filename: request.payload.file.hapi.filename,
          headers: request.payload.file.hapi.headers
        }
      };

      reply(JSON.stringify(result));
    });
  },
  payload: {
    output: 'stream',
    parse: true,
    allow: 'multipart/form-data'
  }
});

server.route({
  path: '/set-cookie',
  method: 'GET',
  handler: function(request, reply) {
    var session = {
      key: 'makemehapi'
    };
    reply('success').state('session', session);
  },
  config: {
    state: {
      parse: true,
      failAction: 'log'
    }
  }
});

server.route({
  path: '/check-cookie',
  method: 'GET',
  handler: function(request, reply) {
    var session = request.state.session;
    var data;

    if (session) {
      data = {
        user: 'nikolenkoanton92'
      };
    } else {
      data = Boom.unauthorized('Missing authentication');
    }

    reply(data);

  },
  config: {
    state: {
      parse: true,
      failAction: 'log'
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
