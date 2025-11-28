const CART_KEY = 'edo-cart';

function getCart() {
    return JSON.parse(localStorage.getItem(CART_KEY)) || [];
}

function saveCart(cart) {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
}

export const cartService = {
    getCartItems: getCart,

    addToCart: (product) => {
        const cart = getCart();
        const existingProduct = cart.find(item => item.id === product.id);
        if (existingProduct) {
            existingProduct.quantity = (existingProduct.quantity || 1) + 1;
        } else {
            product.quantity = 1;
            cart.push(product);
        }
        saveCart(cart);
    },

    clearCart: () => {
        localStorage.removeItem(CART_KEY);
    },

    getTotal: () => {
        const cart = getCart();
        return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    },
    
    getCart: getCart,

    saveCart: saveCart
};
