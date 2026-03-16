function errorHandler(err,req,res,next){
    switch(true){
        case typeof err === "string":
            const is404 = err.toLowerCase().includes("not found");
            res.status(is404 ? 404 : 400).json({error:err})
            break;
        case err.name === "ValidationError":
            res.status(400).json({error:err});
            break;
        default:
            res.status(500).json({error: "Internal server error"});
            break;
    }
}
module.exports = {
    errorHandler,
}