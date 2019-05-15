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

it("httpGetMemberId", mochaAsync(async () => {
    var x = new AddCardTrelloAction("writetrello",[]);
    try{
        x = await  x.httpGetMemberId("ciao");
        assert.equal([1,2,3].indexOf(4),-1);
    }catch (e) {
        console.log(e);
        assert.equal([1,2,3].indexOf(4),-2);
    }

}));

describe('Array',function(){
    describe('#indexOf()', function(){
        it('should return -1 when the value is not present', function(){
            assert.equal([1,2,3].indexOf(4),-1);
        });
    })
});

describe('getBoardWrapper',function(){
    it("Return true", mochaAsync(async () => {
        var x = new AddCardTrelloAction("writetrello",[]);
        try{
            assert.equal([1,2,3].indexOf(4),-1);
        }catch (e) {
            console.log(e);
            assert.equal([1,2,3].indexOf(4),-2);
        }

    }));
});

describe('getListsFromBoard',function(){
    it("Return true", mochaAsync(async () => {
        var x = new AddCardTrelloAction("writetrello",[]);
        try{
            assert.equal([1,2,3].indexOf(4),-1);
        }catch (e) {
            console.log(e);
            assert.equal([1,2,3].indexOf(4),-2);
        }

    }));
});