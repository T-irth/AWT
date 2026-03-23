const express=require("express");
const cors=require("cors");
const app=express();
app.use(cors());app.use(express.json());
let products=[{id:1,name:"Milk",price:50},{id:2,name:"Bread",price:30}];
app.get("/products",(req,res)=>res.json(products));
app.post("/order",(req,res)=>{console.log(req.body);res.json({msg:"ok"});});
app.listen(5000,()=>console.log("Server 5000"));