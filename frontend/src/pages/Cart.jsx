import { useEffect,useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
const API="http://localhost:5000";
export default function Cart(){
 const [items,setItems]=useState([]);
 useEffect(()=>{setItems(JSON.parse(localStorage.getItem("cart")||"[]"))},[]);
 const total=items.reduce((a,b)=>a+b.price,0);
 const checkout=async()=>{await axios.post(API+"/order",{items,total});alert("Done");localStorage.removeItem("cart");setItems([])};
 return(<div><h2>Cart</h2><Link to="/">Back</Link>
 {items.map((i,k)=>(<div key={k}>{i.name} ₹{i.price}</div>))}
 <h3>Total ₹{total}</h3>
 <button onClick={checkout}>Checkout</button>
 </div>);
}