document.addEventListener('DOMContentLoaded', () => {
    const cartButtons = document.querySelectorAll('.cart-btn');

    cartButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            const card = e.target.closest('.product-card');
            const name = card.querySelector('h3').textContent;
            const price = parseInt(card.dataset.price, 10);
            const product = { name, price };

            // localStorageから現在のカート情報を取得（なければ空の配列）
            let cart = JSON.parse(localStorage.getItem('edo-cart')) || [];

            // カートに商品を追加
            cart.push(product);

            // localStorageに保存
            localStorage.setItem('edo-cart', JSON.stringify(cart));

            // ユーザーに通知
            alert(`${name}を買い物かごに追加しました！`);
        });
    });
});