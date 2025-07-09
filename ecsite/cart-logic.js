document.addEventListener('DOMContentLoaded', () => {
    const cartBody = document.getElementById('cart-body');
    const cartTotalElement = document.getElementById('cart-total');
    const checkoutButton = document.querySelector('.checkout-btn');
    const clearCartButton = document.querySelector('.clear-cart-btn');

    function renderCart() {
        const cart = JSON.parse(localStorage.getItem('edo-cart')) || [];
        cartBody.innerHTML = ''; // かごを一旦空にする
        let total = 0;

        if (cart.length === 0) {
            cartBody.innerHTML = '<tr><td colspan="2">買い物かごは空です。</td></tr>';
            cartTotalElement.textContent = '合計: 零両';
            return;
        }

        cart.forEach(item => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${item.name}</td>
                <td>${item.price}両</td>
            `;
            cartBody.appendChild(row);
            total += item.price;
        });

        cartTotalElement.textContent = `合計: ${total}両`;
    }

    checkoutButton.addEventListener('click', () => {
        const cart = JSON.parse(localStorage.getItem('edo-cart')) || [];
        if(cart.length > 0) {
            alert('毎度ありがとうございます！すぐに飛脚を向かわせまする！');
            localStorage.removeItem('edo-cart');
            renderCart();
        } else {
            alert('かごが空でございます。');
        }
    });

    clearCartButton.addEventListener('click', () => {
        if(confirm('買い物かごを空にしてもよろしいですか？')){
            localStorage.removeItem('edo-cart');
            renderCart();
        }
    });

    // 初期表示
    renderCart();
});
