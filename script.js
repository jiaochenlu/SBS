// Simple page interactions for the new design
document.addEventListener('DOMContentLoaded', function() {
    // Add loading animation
    document.body.classList.add('loaded');
    
    // Smooth entrance animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                setTimeout(() => {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }, index * 100);
            }
        });
    }, observerOptions);

    // Observe feature cards for scroll animations
    const featureCards = document.querySelectorAll('.feature-card');
    featureCards.forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(30px)';
        card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(card);
    });

    // Button click handlers
    const buttons = document.querySelectorAll('.btn');
    buttons.forEach(button => {
        button.addEventListener('click', function(e) {
            // Add ripple effect
            const ripple = document.createElement('span');
            const rect = this.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            const x = e.clientX - rect.left - size / 2;
            const y = e.clientY - rect.top - size / 2;
            
            ripple.style.cssText = `
                position: absolute;
                left: ${x}px;
                top: ${y}px;
                width: ${size}px;
                height: ${size}px;
                background: rgba(255, 255, 255, 0.3);
                border-radius: 50%;
                pointer-events: none;
                transform: scale(0);
                animation: ripple 0.6s ease-out;
            `;
            
            this.style.position = 'relative';
            this.style.overflow = 'hidden';
            this.appendChild(ripple);
            
            setTimeout(() => {
                ripple.remove();
            }, 600);
        });
    });

    // Add hover effects to feature cards
    featureCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-8px)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
        });
    });
    // Carousel functionality
    const leftArrow = document.querySelector('.carousel-arrow-left');
    const rightArrow = document.querySelector('.carousel-arrow-right');
    const bannerContainers = document.querySelectorAll('.carousel-background-container');
    
    let currentBannerIndex = 0;
    let isAnimating = false;
    let autoSwitchInterval;
    
    function switchBanner(direction) {
        if (isAnimating || bannerContainers.length === 0) return;
        isAnimating = true;
        
        const currentBanner = bannerContainers[currentBannerIndex];
        
        // Calculate next banner index
        let nextBannerIndex;
        if (direction === 'right') {
            nextBannerIndex = (currentBannerIndex + 1) % bannerContainers.length;
        } else {
            nextBannerIndex = (currentBannerIndex - 1 + bannerContainers.length) % bannerContainers.length;
        }
        
        const nextBanner = bannerContainers[nextBannerIndex];
        
        // Position next banner off-screen
        if (direction === 'right') {
            nextBanner.classList.remove('slide-left');
            nextBanner.classList.add('slide-right');
        } else {
            nextBanner.classList.remove('slide-right');
            nextBanner.classList.add('slide-left');
        }
        
        // Force reflow
        nextBanner.offsetHeight;
        
        // Start simultaneous animation
        setTimeout(() => {
            // Current banner slides out
            if (direction === 'right') {
                currentBanner.classList.add('slide-left');
            } else {
                currentBanner.classList.add('slide-right');
            }
            
            // Next banner slides in
            nextBanner.classList.add('active');
            nextBanner.classList.remove('slide-left', 'slide-right');
            
            // Remove active from current banner
            currentBanner.classList.remove('active');
        }, 50);
        
        // Clean up after animation
        setTimeout(() => {
            currentBannerIndex = nextBannerIndex;
            isAnimating = false;
        }, 650);
    }
    
    // Auto-switch functionality
    function startAutoSwitch() {
        // Ensure no existing interval
        if (autoSwitchInterval) {
            clearInterval(autoSwitchInterval);
        }
        
        console.log('Starting new auto-switch interval');
        autoSwitchInterval = setInterval(() => {
            console.log('Auto-switch triggered, isAnimating:', isAnimating);
            if (!isAnimating) {
                switchBanner('right');
            }
        }, 10000); // Switch every 10 seconds
    }
    
    function stopAutoSwitch() {
        if (autoSwitchInterval) {
            console.log('Stopping auto-switch interval:', autoSwitchInterval);
            clearInterval(autoSwitchInterval);
            autoSwitchInterval = null;
        }
    }
    
    function restartAutoSwitch() {
        stopAutoSwitch();
        startAutoSwitch();
    }
    
    if (leftArrow && rightArrow) {
        // Add click event listeners
        leftArrow.addEventListener('click', function() {
            if (isAnimating) return;
            
            console.log('Left arrow clicked - Previous banner');
            stopAutoSwitch(); // Stop immediately to prevent conflicts
            switchBanner('left');
            
            // Restart auto-switch timer after animation completes
            setTimeout(() => {
                console.log('Manual left click - restarting auto-switch after 650ms');
                startAutoSwitch();
            }, 650);
            
            // Visual feedback
            this.style.transform = 'scale(0.9)';
            setTimeout(() => {
                this.style.transform = 'scale(1)';
            }, 150);
        });
        
        rightArrow.addEventListener('click', function() {
            if (isAnimating) return;
            
            console.log('Right arrow clicked - Next banner');
            stopAutoSwitch(); // Stop immediately to prevent conflicts
            switchBanner('right');
            
            // Restart auto-switch timer after animation completes
            setTimeout(() => {
                console.log('Manual right click - restarting auto-switch after 650ms');
                startAutoSwitch();
            }, 650);
            
            // Visual feedback
            this.style.transform = 'scale(0.9)';
            setTimeout(() => {
                this.style.transform = 'scale(1)';
            }, 150);
        });
    }
    
    // Start auto-switching
    startAutoSwitch();
    
    // Pause auto-switching on hover
    const carouselContainer = document.querySelector('.carousel-container');
    if (carouselContainer) {
        carouselContainer.addEventListener('mouseenter', () => {
            console.log('Mouse enter - stopping auto-switch');
            stopAutoSwitch();
        });
        carouselContainer.addEventListener('mouseleave', () => {
            console.log('Mouse leave - starting auto-switch');
            startAutoSwitch();
        });
    }

    // Try it now button functionality
    const tryItNowBtn = document.getElementById('try-it-now-btn');
    const tryItNowBtn2 = document.getElementById('try-it-now-btn-2');
    
    if (tryItNowBtn) {
        tryItNowBtn.addEventListener('click', function() {
            window.open('https://sbs-tool.microsoft.com/arena', '_blank');
        });
    }
    
    if (tryItNowBtn2) {
        tryItNowBtn2.addEventListener('click', function() {
            window.open('https://sbs-tool.microsoft.com/arena', '_blank');
        });
    }
});

// Add ripple animation CSS
const style = document.createElement('style');
style.textContent = `
    @keyframes ripple {
        to {
            transform: scale(2);
            opacity: 0;
        }
    }
    
    body.loaded {
        animation: fadeIn 0.5s ease-out;
    }
    
    @keyframes fadeIn {
        from {
            opacity: 0;
        }
        to {
            opacity: 1;
        }
    }
`;
document.head.appendChild(style);

// Performance optimization: Debounce scroll events
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Simple scroll-based animations
const debouncedScrollHandler = debounce(function() {
    const scrolled = window.scrollY;
    const rate = scrolled * -0.5;
    
    // Parallax effect for main container (subtle)
    const mainContainer = document.querySelector('.main-container');
    if (mainContainer) {
        mainContainer.style.transform = `translateY(${rate * 0.1}px)`;
    }
}, 10);

window.addEventListener('scroll', debouncedScrollHandler);