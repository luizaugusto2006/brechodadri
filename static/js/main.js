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
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                if (navLinks) navLinks.classList.remove('active');
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
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    // Lightbox - Apenas na página de produto
    const productImage = document.querySelector('.product-detail-image img');
    if (productImage) {
        const lightbox = document.createElement('div');
        lightbox.className = 'lightbox';
        lightbox.id = 'imageLightbox';
        lightbox.innerHTML = '<span class="lightbox-close">&times;</span><img src="" alt="Produto">';
        document.body.appendChild(lightbox);

        const lightboxImg = lightbox.querySelector('img');
        const lightboxClose = lightbox.querySelector('.lightbox-close');

        productImage.addEventListener('click', function() {
            lightboxImg.src = this.src;
            lightboxImg.alt = this.alt;
            lightbox.classList.add('active');
        });

        lightboxClose.addEventListener('click', function() {
            lightbox.classList.remove('active');
        });

        lightbox.addEventListener('click', function(e) {
            if (e.target === lightbox) {
                lightbox.classList.remove('active');
            }
        });

        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && lightbox.classList.contains('active')) {
                lightbox.classList.remove('active');
            }
        });
    }

    // Gender filter in hero
    const unisexBtn = document.querySelector('.gender-btn.unissex');
    if (unisexBtn) {
        unisexBtn.addEventListener('click', function(e) {
            e.preventDefault();
            const productCards = document.querySelectorAll('.product-card');
            const filterBtns = document.querySelectorAll('.filter-btn');
            
            filterBtns.forEach(b => b.classList.remove('active'));
            
            productCards.forEach(card => {
                const generoTag = card.querySelector('.genero-tag');
                if (generoTag && generoTag.classList.contains('unissex')) {
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
            
            document.querySelector('#produtos').scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
    }

    // Newsletter
    const newsletterForm = document.getElementById('newsletterForm');
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', function(e) {
            e.preventDefault();
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
                window.open('https://wa.me/?text=' + text + '%20' + url, '_blank');
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
            alert('Obrigado pela avaliação de ' + rating + ' estrela(s)!');
        });

        star.addEventListener('mouseenter', function() {
            const rating = this.getAttribute('data-rating');
            const stars = this.parentElement.querySelectorAll('.star');
            stars.forEach((s, index) => {
                s.style.color = index < rating ? '#ffc107' : '#ddd';
            });
        });

        star.addEventListener('mouseleave', function() {
            const stars = this.parentElement.querySelectorAll('.star');
            stars.forEach(s => {
                s.style.color = s.classList.contains('filled') ? '#ffc107' : '#ddd';
            });
        });
    });
});
