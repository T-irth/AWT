import React from 'react'
import ProductCard from './ProductCard'

const Category = (props) => {
    return (
        <div >
            <p>{props.category.cat}</p>
            <div style={{ display: "inline-flex" }}>
                {/* {myProds.map((prod) => <ProductCard product={prod} />)} */}
                {props.category.items.map((prod) => <ProductCard product={prod} />)}
            </div>
        </div>
    )
}

export default Category