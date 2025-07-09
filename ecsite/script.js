document.addEventListener('DOMContentLoaded', () => {
    // 商品グリッド全体にイベントリスナーを設定
    const productGrid = document.querySelector('.product-grid');

    if (productGrid) {
        productGrid.addEventListener('click', (e) => {
            // クリックされた要素がカートボタンかどうかを確認
            if (e.target.classList.contains('cart-btn')) {
                const card = e.target.closest('.product-card');
                if (card) {
                    const name = card.querySelector('h3').textContent;
                    const price = parseInt(card.dataset.price, 10);
                    const product = { name, price };

                    let cart = JSON.parse(localStorage.getItem('edo-cart')) || [];
                    cart.push(product);
                    localStorage.setItem('edo-cart', JSON.stringify(cart));

                    alert(`${name}を買い物かごに追加しました！`);
                }
            }
        });
    }
});
