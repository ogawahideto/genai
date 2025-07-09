document.addEventListener('DOMContentLoaded', () => {
    const cartButtons = document.querySelectorAll('.cart-btn');

    cartButtons.forEach(button => {
        button.addEventListener('click', () => {
            alert('承知いたしました！早馬便にてお届けに上がります！');
        });
    });
});
