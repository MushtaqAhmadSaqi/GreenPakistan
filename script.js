document.addEventListener('DOMContentLoaded', () => {
    
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
    const header = document.getElementById('header');
    
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
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

    // --- Newsletter Form Submission Prevent Default (Placeholder functionality) ---
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

});
