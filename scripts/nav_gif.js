document.addEventListener('DOMContentLoaded', () => {
    const gif = document.querySelector('.nav-gif');
    const gifImg = gif.querySelector('img');
    const nav = document.querySelector('.main_menu nav');
    
    // Movement settings
    const settings = {
        fleeDistance: 160,
        wanderRadius: 40,
        fleeThreshold: 100,
        flipPoint: 0.5, // 50% flip point
        movementSpeed: 0.15,
        flipTransition: 'transform 0.3s ease',
        verticalRange: 0.6, // 80% of nav height available
    };
    
    // State tracking
    let state = {
        posX: 0,
        posY: 0,
        isFlipped: false,
        targetX: 0,
        targetY: 0,
        menuWidth: 0,
        menuHeight: 0
    };
    
    // Initialize sizes and positions
    function initSizes() {
        const menuRect = nav.getBoundingClientRect();
        state.menuWidth = menuRect.width;
        state.menuHeight = menuRect.height;
        state.posX = state.menuWidth * 0.1;
        state.posY = state.menuHeight * 0.5;
        state.targetX = state.posX;
        state.targetY = state.posY;
    }
    
    // Apply smooth transitions
    gifImg.style.transition = settings.flipTransition;
    
    // Smoothing function
    function lerp(start, end, t) {
        return start * (1 - t) + end * t;
    }
    
    // Animation loop
    function animate() {
        // Smooth position updates
        state.posX = lerp(state.posX, state.targetX, settings.movementSpeed);
        state.posY = lerp(state.posY, state.targetY, settings.movementSpeed);
        
        // Constrain to menu boundaries with padding
        const xPadding = gif.offsetWidth * 0.5;
        const yPadding = gif.offsetHeight * 0.5;
        const verticalLimit = state.menuHeight * (1 - settings.verticalRange) / 2;
        
        state.posX = Math.max(xPadding, Math.min(
            state.menuWidth - xPadding, 
            state.posX
        ));
        
        state.posY = Math.max(verticalLimit, Math.min(
            state.menuHeight - verticalLimit, 
            state.posY
        ));
        
        // Handle flipping at 50% width
        if (state.posX > state.menuWidth * settings.flipPoint && !state.isFlipped) {
            state.isFlipped = true;
            gifImg.style.transform = 'scaleX(-1)';
        } else if (state.posX < state.menuWidth * settings.flipPoint && state.isFlipped) {
            state.isFlipped = false;
            gifImg.style.transform = 'scaleX(1)';
        }
        
        // Apply movement
        gif.style.transform = `translate(${state.posX - gif.offsetWidth/2}px, ${state.posY - gif.offsetHeight/2}px)`;
        
        requestAnimationFrame(animate);
    }
    
    // Mouse movement handler
    nav.addEventListener('mousemove', (e) => {
        const mouseX = e.clientX - nav.getBoundingClientRect().left;
        const mouseY = e.clientY - nav.getBoundingClientRect().top;
        const distance = Math.hypot(state.posX - mouseX, state.posY - mouseY);
        
        if (distance < settings.fleeThreshold) {
            const angle = Math.atan2(
                state.posY - mouseY, 
                state.posX - mouseX
            );
            state.targetX = state.posX + Math.cos(angle) * settings.fleeDistance;
            state.targetY = state.posY + Math.sin(angle) * settings.fleeDistance;
        }
    });
    
    // Idle wandering with full area movement
    setInterval(() => {
        if (Math.random() > 0.8) {
            // Use full available area
            const verticalLimit = state.menuHeight * (1 - settings.verticalRange) / 2;
            state.targetX = gif.offsetWidth/2 + Math.random() * (state.menuWidth - gif.offsetWidth);
            state.targetY = verticalLimit + Math.random() * (state.menuHeight - 2*verticalLimit);
        }
    }, 2000);
    
    // Handle window resize
    window.addEventListener('resize', initSizes);
    
    // Initialize
    initSizes();
    animate();
});