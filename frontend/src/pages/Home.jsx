import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
const API="http://localhost:5000";
export default function Home(){
 const [products,setProducts]=useState([]);
 useEffect(()=>{axios.get(API+"/products").then(r=>setProducts(r.data))},[]);
 const add=(p)=>{let c=JSON.parse(localStorage.getItem("cart")||"[]");c.push(p);localStorage.setItem("cart",JSON.stringify(c));};
 return(<div><h1>Smart Cart</h1><Link to="/cart">Cart</Link>
 {products.map(p=>(<div key={p.id}>{p.name} ₹{p.price}<button onClick={()=>add(p)}>Add</button></div>))}
 </div>);
}