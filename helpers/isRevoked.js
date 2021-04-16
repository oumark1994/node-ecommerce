 
const isRevoked = async (req,payload,done)=>{
    if(!payload.isAdmin){
        done(null,true)
    }
    done();
}
module.exports = isRevoked;