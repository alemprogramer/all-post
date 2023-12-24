const chai = require('chai');
const chaiHttp = require('chai-http');
const expect = chai.expect;
const app = require('../../app');

chai.use(chaiHttp)
describe('post api',()=>{
    before(function(done) {
        this.timeout(3000); // A very long environment setup.
        setTimeout(done, 2500);
    });
    const formData = {
        text: 'text',
    }
    it('customer apiKey give but not accessToken',(done)=>{
        chai.request(app)
            .post('/api/v1/post/all?apikey=65461bc012aa5849f21ea383')
            .type('form')
            .send(formData)
            .end((err,res)=>{
                expect(res).to.have.status(400)
                expect(res.body.errors.socialMedia).to.equal("Please select one social media field where you want to post. ");
                done();
            })
        
    })
    it('Call with just  accessToken. ',(done)=>{
        chai.request(app)
            .post('/api/v1/post/all')
            .set('Authorization', '1eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY1NDYxYmMwMTJhYTU4NDlmMjFlYTM4MyIsImlhdCI6MTcwMzQyNzI2NiwiZXhwIjoxNzAzNDMwMjY2fQ.x9JJCeuqLTHCQFJZnOafxTXPAExDs3blH2ayiukYrqQ')
            .send(formData)
            .type('form')
            .end((err,res)=>{
                if (res.status == 401) {
                    expect(res).to.have.status(401);
                            expect(res.body.msg).to.equal("Invalid Authentication.");
                            done();
                    return;
                }

                expect(res).to.have.status(400);
                expect(res.body.errors.socialMedia).to.equal("Please select one social media field where you want to post. ");
                done();
            })
    })

    it('if apiKey is not valid ',(done)=>{
        chai.request(app)
        .post('/api/post/all/?apikey=5648764846')
        .send(formData)
        .type('form')
        .end((err, res)=>{
            expect(res).to.have.status(400);
            expect(res.body.msg).to.equal("Please give your valid key.");
            done();
        })
    })

    it('if apiKey and accessToken both are invalid',(done)=>{
        chai.request(app)
        .post('/api/post/all/?apikey=56487')
        .type('form')
        .send(formData)
        .set('access_token','sdhlfjdsfhj')
        .end((err,res)=>{
            expect(res).to.have.status(400);
            expect(res.body.msg).to.equal("Please give your valid key.")
            done();
        });
    })
})