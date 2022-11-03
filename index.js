const cartBtn = document.querySelector('.nav-cart-btn')
const closeCartBtn = document.querySelector('.close-cart')
const clearCartBtn = document.querySelector('.clear-cart')
const cartOverlay = document.querySelector('.cart-overlay')
const cartItems = document.querySelector('.cart-items')
const cartTotal = document.querySelector('.cart-total')
const cartContent = document.querySelector('.cart-content')
const productsDOM = document.querySelector('.myproducts')
const product = document.querySelector('.product')

let cart = []
let btnDOM = []

class Products{
    async getProducts(){
        try{
            let result = await fetch('products.json')
            let data = await result.json()
            let products = data.items 
            products = products.map(item=>{
                const {title, price} =  item.fields
                const id = item.sys.id
                const image = item.fields.image.fields.file.url
                return {title, price, id, image}
            })
            return products
        }catch(err){
           return err
        }
    }
}

class UI{
    displayProducts(products){
        let result =''
        products.forEach(product=>{
            result += `
            <div class="product">
            <div class="product-image">
                <img src=${product.image} alt="" class="img">
                <button class="cart-btn" data-id=${product.id}>add to cart</button>
            </div>
            <h3>${product.title}</h3>
            <h4>${product.price}</h4>
        </div>
            `
        })

        productsDOM.innerHTML = result

    }

    getCartBtn(){
        let btns = Array.from(document.querySelectorAll('.cart-btn'))
        btnDOM = btns
        btns.forEach(btn =>{
            let id = btn.getAttribute('data-id')
            let inCart = cart.find(item=>item.id==id)

            if(inCart){
                btn.textContent= 'In cart'
                btn.disabled = true
            }

            btn.addEventListener('click', e=>{
                e.target.textContent ='In cart'
                btn.disabled = true
                let cartItem= Storage.getProducts(id)
                cartItem.amount = 1
                cart.push(cartItem)
                Storage.saveCart(cart)
                this.setCartValues(cart)
                this.addCartItem(cartItem)
                this.showCart()
                })
            })
    }

    setCartValues(cart){
        let tempTotal = 0
        let itemsTotal = 0
        cart.forEach(item=>{
            tempTotal += item.price * item.amount
            itemsTotal += item.amount
        })
        cartItems.textContent = itemsTotal
        cartTotal.textContent = parseFloat(tempTotal.toFixed(2))
    }

    addCartItem(item){
        cartContent.innerHTML += `
        <div class="my-cart-content">
                <img src=${item.image} alt="">
                <div>
                    <h4>${item.title}</h4>
                    <h5>$${item.price}</h5>
                    <span class="remove-item" data-id=${item.id}>remove</span>
                </div>
                <div class="cart-controls">
                    <span data-id=${item.id} class='up'>+</span>
                    <p class="item-amount">${item.amount}</p>
                    <span data-id=${item.id} class='down'>-</span>
                </div>
            </div>
        
        `
    }

    showCart(){
        cartOverlay.style.display = 'block'
    }

    hideCart(){
        cartOverlay.style.display = 'none'
    }

    setupAPP(){
        cart = Storage.getCart()
        this.setCartValues(cart)
        this.populateCart(cart)
        cartBtn.addEventListener('click',this.showCart)
        closeCartBtn.addEventListener('click', this.hideCart)
    }
    populateCart(cart){
        cart.forEach(item=>this.addCartItem(item))
    }

    cartLogic(){
        clearCartBtn.addEventListener('click', ()=>{
            this.clearCart()
        })

        cartContent.addEventListener('click', e=>{
            if(e.target.classList.contains('remove-item')){
                let removeItem = e.target
                let id = removeItem.dataset.id
                this.removeItem(id)
                removeItem.parentElement.parentElement.remove()
            }else if(e.target.classList.contains('up')){
                let id = e.target.dataset.id
                let tempItem = cart.find(item=>item.id==id)
                tempItem.amount += 1
                Storage.saveCart(cart)
                this.setCartValues(cart)
                e.target.nextElementSibling.textContent = tempItem.amount
            }else if(e.target.classList.contains('down')){
                let id = e.target.dataset.id
                let tempItem = cart.find(item=>item.id==id)
                if(tempItem.amount > 1){
                    tempItem.amount -= 1
                }else{
                    e.target.parentElement.parentElement.remove()
                    this.removeItem(id)
                }
                Storage.saveCart(cart)
                this.setCartValues(cart)
                e.target.previousElementSibling.textContent = tempItem.amount

            }
        })
    }

    clearCart(){
        let cartItems = cart.map(item=>item.id)
        cartItems.forEach(id=>this.removeItem(id))
        while(cartContent.children.length > 0){
            cartContent.children[0].remove()
        }
        this.hideCart()
    }

    removeItem(id){
        cart = cart.filter(item => item.id != id)
        this.setCartValues(cart)
        Storage.saveCart(cart)
        let btn = this.getSingleButton(id)
        btn.disabled = false
        btn.textContent = 'add to cart'
    }

    getSingleButton(id){
        return btnDOM.find(item=>item.dataset.id==id)
    }

}

class Storage{
    static saveProducts(products){
        localStorage.setItem('products', JSON.stringify(products))
    }

    static getProducts(id){
        let products = JSON.parse(localStorage.getItem('products'))
        return products.find(item=>item.id==id)
    }

    static saveCart(cart){
        localStorage.setItem('cart', JSON.stringify(cart))
    }
    static getCart(){ 
        return localStorage.getItem('cart')?JSON.parse(localStorage.getItem('cart')):[]
    }
}


document.addEventListener('DOMContentLoaded', ()=>{
    const products = new Products()
    const ui = new UI()
    ui.setupAPP()
    products.getProducts().then(products=>{
        ui.displayProducts(products)
        Storage.saveProducts(products)
    }).then(()=>{
        ui.getCartBtn()
    }).then(()=>ui.cartLogic())

})

