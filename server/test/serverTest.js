var assert = chai.assert;
var should = chai.should();
var expect = chai.expect;


describe('API integration', function() {
  var server, setupStub, JSONresponse;

  before(function() {
    setupStub = sinon.stub(todo, 'setup');

    JSONresponse = [
      200,
      { 'Content-type': 'application/json' },
      JSON.stringify(fakeTodos)
    ];

    server = sinon.fakeServer.create();
    server.respondWith(JSONresponse);

  });

  after(function() {
    server.restore();
    setupStub.restore();

  });


  it('todo.setup receives an array of todos when todo.init is called', function() {
    todo.init();
    server.respond();
    sinon.assert.called(setupStub);
    sinon.assert.calledWith(setupStub, fakeTodos.todos);
  });
});
