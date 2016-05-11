var chai = require('chai');
var assert = chai.assert;
var fs = require('fs');
var request = require('request');
var path = require('path');

// console.log('--- 1 --- Run Compression Server Tests!');


describe('hooks', function() {
  before(function() {
    // runs before all tests in this block
    // console.log('--- 1.1 --- Before: download test.wav');

    var testWavUrl = 'https://s3-us-west-1.amazonaws.com/jamrecordtest/indextest/testSourceFiles/test1.wav';
    var destinationPath = path.join(__dirname + '/testFiles/test1.wav');
    // console.log(destinationPath);

    request.get(testWavUrl)
      .on('data', function(chunk) {
        // console.log(chunk);
      })
      .pipe( fs.createWriteStream(destinationPath) );
    // console.log('--- 1.2 --- Download completed');
    
  });

  after(function() {
    // runs after all tests in this block
  });

  beforeEach(function() {
    // runs before each test in this block
  });

  afterEach(function() {
    // runs after each test in this block
  });

  it('it should work', function () {
    assert.equal(1, 1);
  });

  // test cases
});


// describe('Download test.wav', function() {



//   // describe('#indexOf()', function () {
//   //   it('should return -1 when the value is not present', function () {
//   //     assert.equal(1, 1);
//   //   });
//   // });
// });

// https://s3-us-west-1.amazonaws.com/jamrecordtest/indextest/testSourceFiles/test1.wav
