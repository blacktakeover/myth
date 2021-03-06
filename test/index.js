
var assert = require('assert');
var child = require('child_process');
var exec = child.exec;
var spawn = child.spawn;
var fs = require('fs');
var myth = require('..');
var path = require('path');
var Stream = require('stream').Readable;

/**
 * Myth node API tests.
 */

describe('myth', function () {
  it('should return a css string', function () {
    assert('string' == typeof myth('body {}'));
  });

  it('should return a rework plugin', function () {
    assert('function' == typeof myth());
  });
});

/**
 * Rework feature tests.
 */

describe('features', function () {
  var features = [
    'calc',
    'color',
    'font-variant',
    'hex',
    'prefixes',
    'vars'
  ];

  features.forEach(function (name) {
    it('should add ' + name + ' support', function () {
      var input = read('features/' + name);
      var output = read('features/' + name + '.out');
      assert.equal(myth(input).trim(), output.trim());
    });
  });
});

describe('cli', function () {
  var input = read('cli/input');
  var output = read('cli/input.out');

  afterEach(function () {
    remove('cli/output');
  });

  it('should read from a file and write to a file', function (done) {
    exec('bin/myth test/cli/input.css test/cli/output.css', function (err, stdout) {
      if (err) return done(err);
      var res = read('cli/output');
      assert.equal(res, output);
      done();
    });
  });

  it('should read from a file and write to stdout', function (done) {
    exec('bin/myth test/cli/input.css', function (err, stdout) {
      if (err) return done(err);
      assert.equal(stdout, output);
      done();
    });
  });

  it('should read from stdin and write to stdout', function (done) {
    var child = exec('bin/myth', function (err, stdout) {
      if (err) return done(err);
      assert.equal(stdout, output);
      done();
    });

    child.stdin.write(new Buffer(input));
    child.stdin.end();
  });

  it('should log on verbose', function (done) {
    exec('bin/myth -v test/cli/input.css test/cli/output.css', function (err, stdout) {
      if (err) return done(err);
      assert(-1 != stdout.indexOf('was written.'));
      done();
    });
  });

  it('should log on non-existant file', function (done) {
    exec('bin/myth -v test/cli/non-existant.css', function (err, stdout) {
      if (err) return done(err);
      assert(-1 != stdout.indexOf('does not exist.'));
      done();
    });
  });
});

/**
 * A few real-life test cases.
 */

describe('cases', function () {
  var cases = [
    'myth.io'
  ];

  cases.forEach(function (name) {
    it('should convert ' + name + '\'s css', function () {
      var input = read('cases/' + name);
      var output = read('cases/' + name + '.out');
      assert.equal(myth(input).trim(), output.trim());
    });
  });
});

/**
 * Read a fixture by `filename`.
 *
 * @param {String} filename
 * @return {String}
 */

function read (filename) {
  var file = resolve(filename);
  return fs.readFileSync(file, 'utf8');
}

/**
 * Remove a fixture by `filename`.
 *
 * @param {String} filename
 */

function remove (filename) {
  var file = resolve(filename);
  if (!fs.existsSync(file)) return;
  fs.unlinkSync(file);
}

/**
 * Resolve a fixture by `filename`.
 *
 * @param {String} filename
 * @return {String}
 */

function resolve (filename) {
  return path.resolve(__dirname, filename + '.css');
}