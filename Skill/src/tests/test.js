var assert = require('assert');
var expect = require('chai').expect;


describe('Array',function(){
    describe('#indexOf()', function(){
        it('should return -1 when the value is not present', function(){
            assert.equal([1,2,3].indexOf(4),-1);
        });
    })
});

async function boo(){
    return new Promise(function(resolve, reject) {
        setTimeout(function() {
            resolve(true);
        }, 200);
    });

}

var mochaAsync = (fn) => {
    return async (done) => {
        try {
            await fn();
            done();
        } catch (err) {
            done(err);
        }
    };
};

it("Sample async/await mocha test using wrapper", mochaAsync(async () => {
    var x = await boo();
    expect(x).to.equal(true);
}));

it("Using a Promise with async/await that resolves successfully with wrong expectation!", async function(done) {
    var testPromise = new Promise(function(resolve, reject) {
        setTimeout(function() {
            resolve("Hello World!");
        }, 200);
    });

    try {
        var result = await testPromise;

        expect(result).to.equal("Hello!");

        done();
    } catch(err) {
        done(err);
    }
});

describe('Array', function() {
    describe('#indexOf()', function() {
      it('should return -1 when the value is not present', function() {
        [1, 2, 3].indexOf(5).should.equal(-1);
        [1, 2, 3].indexOf(0).should.equal(-1);
      });
    });
});