mongoose.connect(process.env.DATABASE,{useCreateIndex:true,useNewUrlParser:true,useUnifiedTopology:true}).then(()=>{
    console.log('Database connection is ready...')
}).catch((err)=>{console.log(err);})