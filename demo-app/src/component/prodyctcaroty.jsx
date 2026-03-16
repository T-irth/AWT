import React from 'react'

const ProductCard = (props) => {
    return (
        <div style={{ width: '180px', border: '2px solid black', margin: '5px' }}>
            <img src={props.product.img} height={'180px'} width={'180px'} />
            <p style={{ fontWeight: 'bold' }}>{props.product.title}</p>
            <p>{props.product.description}</p>
            <p>{props.product.price}</p>
            <button>Add to Cart</button>
            <button>Buy Now</button>
        </div>
    )
}

export default ProductCard