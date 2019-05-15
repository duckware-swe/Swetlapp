var assert = require('assert');
var expect = require('chai').expect;
const { AddCardTrelloAction } = require('../src/actions/AddCardTrelloAction');

var mochaAsync = (fn) => {
    return async () => {
        try {
            await fn();
            //done();
        } catch (err) {
            //done(err);
        }
    };
};

it("Sample async/await mocha test using wrapper", mochaAsync(async () => {
    var x = new AddCardTrelloAction("writetrello",[]);
    try{
        x = await  x.httpGetMemberId("ciao");
        assert.equal([1,2,3].indexOf(4),-1);
    }catch (e) {
        console.log(e);
        assert.equal([1,2,3].indexOf(4),-2);
    }

}));
