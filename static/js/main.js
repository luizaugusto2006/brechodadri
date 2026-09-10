document.addEventListener('DOMContentLoaded', function() {
    // Menu Toggle
    const menuToggle = document.getElementById('menu-toggle');
    const navLinks = document.querySelector('.nav-links');
    
    if (menuToggle) {
        menuToggle.addEventListener('click', function() {
            navLinks.classList.toggle('active');
        });
    }

    // Filter Products
    const filterBtns = document.querySelectorAll('.filter-btn');
    const productCards = document.querySelectorAll('.product-card');

    filterBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            filterBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');

            const filter = this.getAttribute('data-filter');

            productCards.forEach(card => {
                if (filter === 'all' || card.getAttribute('data-category') === filter) {
                    card.style.display = 'block';
                    setTimeout(() => {
                        card.style.opacity = '1';
                        card.style.transform = 'scale(1)';
                    }, 50);
                } else {
                    card.style.opacity = '0';
                    card.style.transform = 'scale(0.8)';
                    setTimeout(() => {
                        card.style.display = 'none';
                    }, 300);
                }
            });
        });
    });

    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
                if (navLinks) {
                    navLinks.classList.remove('active');
                }
            }
        });
    });

    // Voltar ao Topo
    const backToTopBtn = document.getElementById('backToTop');
    
    if (backToTopBtn) {
        window.addEventListener('scroll', function() {
            if (window.pageYOffset > 300) {
                backToTopBtn.classList.add('visible');
            } else {
                backToTopBtn.classList.remove('visible');
            }
        });

        backToTopBtn.addEventListener('click', function() {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }

    // Lightbox
    const lightbox = document.createElement('div');
    lightbox.className = 'lightbox';
    lightbox.innerHTML = `
        <span class="lightbox-close">&times;</span>
        <img src="" alt="Produto">
    `;
    document.body.appendChild(lightbox);

    document.querySelectorAll('.product-image img').forEach(img => {
        img.addEventListener('click', function(e) {
            e.stopPropagation();
            const lightboxImg = lightbox.querySelector('img');
            lightboxImg.src = this.src;
            lightboxImg.alt = this.alt;
            lightbox.classList.add('active');
            document.body.style.overflow = 'hidden';
        });
    });

    lightbox.addEventListener('click', function(e) {
        e.stopPropagation();
        if (e.target === lightbox || e.target.classList.contains('lightbox-close')) {
            lightbox.classList.remove('active');
            document.body.style.overflow = 'auto';
        }
    });

    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && lightbox.classList.contains('active')) {
            lightbox.classList.remove('active');
            document.body.style.overflow = 'auto';
        }
    });

    // Newsletter
    const newsletterForm = document.getElementById('newsletterForm');
    
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const email = this.querySelector('input[type="email"]').value;
            
            alert('Obrigado por se cadastrar! Em breve você receberá nossas novidades.');
            this.reset();
        });
    }

    // Compartilhar
    document.querySelectorAll('.share-btn').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            const url = encodeURIComponent(window.location.href);
            const text = encodeURIComponent('Confira esta peça incrível no Brechó da Adri!');
            
            if (this.classList.contains('whatsapp')) {
                window.open(`https://wa.me/?text=${text}%20${url}`, '_blank');
            } else if (this.classList.contains('instagram')) {
                alert('Para compartilhar no Instagram, faça um print e compartilhe nos stories!');
            }
        });
    });

    // Avaliações
    document.querySelectorAll('.star').forEach(star => {
        star.addEventListener('click', function() {
            const rating = this.getAttribute('data-rating');
            const stars = this.parentElement.querySelectorAll('.star');
            
            stars.forEach((s, index) => {
                if (index < rating) {
                    s.classList.add('filled');
                } else {
                    s.classList.remove('filled');
                }
            });
            
            alert(`Obrigado pela avaliação de ${rating} estrela(s)!`);
        });

        star.addEventListener('mouseenter', function() {
            const rating = this.getAttribute('data-rating');
            const stars = this.parentElement.querySelectorAll('.star');
            
            stars.forEach((s, index) => {
                if (index < rating) {
                    s.style.color = '#ffc107';
                } else {
                    s.style.color = '#ddd';
                }
            });
        });

        star.addEventListener('mouseleave', function() {
            const stars = this.parentElement.querySelectorAll('.star');
            stars.forEach(s => {
                if (!s.classList.contains('filled')) {
                    s.style.color = '#ddd';
                } else {
                    s.style.color = '#ffc107';
                }
            });
        });
    });
});
