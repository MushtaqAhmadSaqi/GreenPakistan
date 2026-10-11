document.addEventListener('DOMContentLoaded', () => {
    const header = document.getElementById('header');
    const cartButton = document.querySelector('.cart-button');
    const cartPanel = document.querySelector('.cart-panel');
    const cartBackdrop = document.querySelector('.cart-backdrop');
    const cartItems = document.querySelector('.cart-items');
    const cartCount = document.querySelector('.cart-count');
    const cartTotal = document.querySelector('.cart-total strong');
    const cart = JSON.parse(localStorage.getItem('regongches-cart') || '[]');

    const formatPrice = (price) => `PKR ${price.toLocaleString('en-PK')}`;

    const saveCart = () => {
        localStorage.setItem('regongches-cart', JSON.stringify(cart));
    };

    const updateCart = () => {
        const itemCount = cart.reduce((total, item) => total + item.quantity, 0);
        const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
        cartCount.textContent = itemCount;
        cartTotal.textContent = formatPrice(total);

        if (cart.length === 0) {
            cartItems.innerHTML = '<p class="cart-empty">Your cart is empty.</p>';
            return;
        }

        cartItems.innerHTML = cart.map((item) => `
            <div class="cart-item" data-cart-id="${item.id}">
                <img src="${item.image}" alt="${item.name}">
                <div>
                    <h3 class="cart-item-name">${item.name}</h3>
                    <p class="cart-item-price">${formatPrice(item.price)}</p>
                    <div class="cart-item-controls">
                        <button type="button" data-cart-action="decrease" aria-label="Decrease quantity">-</button>
                        <span>${item.quantity}</span>
                        <button type="button" data-cart-action="increase" aria-label="Increase quantity">+</button>
                    </div>
                </div>
                <button class="cart-item-remove" type="button" data-cart-action="remove">Remove</button>
            </div>
        `).join('');
    };

    const setCartOpen = (isOpen) => {
        cartPanel.classList.toggle('is-open', isOpen);
        cartBackdrop.classList.toggle('is-open', isOpen);
        cartPanel.setAttribute('aria-hidden', String(!isOpen));
        document.body.classList.toggle('cart-open', isOpen);
    };

    const addToCart = (card) => {
        const name = card.querySelector('.product-name').textContent.trim().replace(' (Sample)', '');
        const price = Number(card.querySelector('.product-price').textContent.replace(/[^\d]/g, ''));
        const image = card.querySelector('.product-img-placeholder img').getAttribute('src');
        const id = image;
        const existingItem = cart.find((item) => item.id === id);

        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            cart.push({ id, name, price, image, quantity: 1 });
        }

        saveCart();
        updateCart();
        setCartOpen(true);
    };

    // --- Announcement Bar Rotation ---
    const announcements = document.querySelectorAll('.announcement-content');
    let currentAnnouncement = 0;

    if(announcements.length > 0) {
        setInterval(() => {
            announcements[currentAnnouncement].classList.remove('active');
            currentAnnouncement = (currentAnnouncement + 1) % announcements.length;
            announcements[currentAnnouncement].classList.add('active');
        }, 4000);
    }

    // --- Sticky Header Shadow on Scroll ---
    window.addEventListener('scroll', () => {
        if (header && window.scrollY > 50) {
            header.classList.add('scrolled');
        } else if (header) {
            header.classList.remove('scrolled');
        }
    });

    // --- Mobile Menu Toggle ---
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const desktopNav = document.querySelector('.desktop-nav');

    if(mobileMenuBtn && desktopNav) {
        mobileMenuBtn.addEventListener('click', () => {
            desktopNav.classList.toggle('active');
            
            // Toggle icon
            const icon = mobileMenuBtn.querySelector('i');
            if(desktopNav.classList.contains('active')) {
                icon.classList.remove('ph-list');
                icon.classList.add('ph-x');
            } else {
                icon.classList.remove('ph-x');
                icon.classList.add('ph-list');
            }
        });

        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            if(desktopNav.classList.contains('active') && !desktopNav.contains(e.target) && !mobileMenuBtn.contains(e.target)) {
                desktopNav.classList.remove('active');
                const icon = mobileMenuBtn.querySelector('i');
                icon.classList.remove('ph-x');
                icon.classList.add('ph-list');
            }
        });
    }

    document.querySelectorAll('.product-card .btn-outline').forEach((button) => {
        button.addEventListener('click', () => addToCart(button.closest('.product-card')));
    });

    document.querySelectorAll('.product-card .icon-btn').forEach((button) => {
        button.addEventListener('click', () => {
            const icon = button.querySelector('i');
            if (button.getAttribute('aria-label') === 'Wishlist') {
                button.classList.toggle('is-active');
                icon.classList.toggle('ph-fill');
                icon.classList.toggle('ph-heart');
                icon.classList.toggle('ph-heart-straight');
            } else {
                const card = button.closest('.product-card');
                const name = card.querySelector('.product-name').textContent.trim();
                alert(`${name}\n${card.querySelector('.product-price').textContent}`);
            }
        });
    });

    const searchButton = document.querySelector('.header-actions button[aria-label="Search"]');
    const accountButton = document.querySelector('.header-actions button[aria-label="Account"]');
    const headerWishlistButton = document.querySelector('.header-actions button[aria-label="Wishlist"]');

    if (searchButton) {
        searchButton.addEventListener('click', () => {
            const query = window.prompt('Search products');
            if (query === null) return;
            const searchTerm = query.trim().toLowerCase();
            const productCards = document.querySelectorAll('.product-card');
            let matches = 0;

            productCards.forEach((card) => {
                const matchesQuery = !searchTerm || card.textContent.toLowerCase().includes(searchTerm);
                card.hidden = !matchesQuery;
                if (matchesQuery) matches += 1;
            });

            document.querySelector('.featured-products').scrollIntoView({ behavior: 'smooth' });
            if (searchTerm && matches === 0) {
                alert(`No products found for "${query}".`);
            }
        });
    }

    if (accountButton) {
        accountButton.addEventListener('click', () => {
            alert('Account sign-in will be available soon.');
        });
    }

    if (headerWishlistButton) {
        headerWishlistButton.addEventListener('click', () => {
            document.querySelector('.featured-products').scrollIntoView({ behavior: 'smooth' });
            alert('Use the heart button on a product to add it to your wishlist.');
        });
    }

    cartButton.addEventListener('click', () => setCartOpen(true));
    document.querySelector('.cart-close').addEventListener('click', () => setCartOpen(false));
    cartBackdrop.addEventListener('click', () => setCartOpen(false));
    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') setCartOpen(false);
    });

    cartItems.addEventListener('click', (event) => {
        const actionButton = event.target.closest('[data-cart-action]');
        if (!actionButton) return;
        const itemElement = actionButton.closest('[data-cart-id]');
        const item = cart.find((cartItem) => cartItem.id === itemElement.dataset.cartId);
        if (!item) return;

        if (actionButton.dataset.cartAction === 'increase') item.quantity += 1;
        if (actionButton.dataset.cartAction === 'decrease') item.quantity -= 1;
        if (actionButton.dataset.cartAction === 'remove' || item.quantity <= 0) {
            cart.splice(cart.indexOf(item), 1);
        }
        saveCart();
        updateCart();
    });

    document.querySelector('.checkout-button').addEventListener('click', () => {
        if (cart.length === 0) {
            alert('Your cart is empty.');
            return;
        }
        alert('Thank you! Checkout will be connected to the order system next.');
    });

    // --- Newsletter Form Submission ---
    const newsletterForm = document.querySelector('.newsletter-form');
    if(newsletterForm) {
        newsletterForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const input = newsletterForm.querySelector('input[type="email"]');
            if(input.value) {
                alert('Thank you for joining the ReGongches community! (This is a placeholder action)');
                input.value = '';
            }
        });
    }

    updateCart();
});
