// Wrap every letter in a span for the title animation
document.addEventListener('DOMContentLoaded', () => {
    // Add download functionality
    const downloadBtn = document.querySelector('.download-btn');
    downloadBtn.addEventListener('click', async () => {
        const logo = document.querySelector('.ufldp-logo');
        
        // Create a canvas to draw the SVG
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        // Set canvas size to match the logo's displayed size
        const rect = logo.getBoundingClientRect();
        canvas.width = rect.width;
        canvas.height = rect.height;
        
        // Create an image from the SVG
        const img = new Image();
        img.src = logo.src;
        
        // Wait for image to load then convert to JPEG
        img.onload = () => {
            // Fill canvas with orange background
            ctx.fillStyle = '#FF7F50';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            // Draw the image
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            
            // Convert to JPEG and download
            canvas.toBlob((blob) => {
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'ufldp-logo.jpg';
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
            }, 'image/jpeg', 0.9);
        };
    });

    // Remove the floating class from the logo since we'll control animations via commands
    const logo = document.querySelector('.ufldp-logo');
    logo.classList.remove('floating');

    // Animate title text with staggering letters
    const textWrapper = document.querySelector('.ml12');
    textWrapper.innerHTML = textWrapper.textContent.replace(
        /\S/g,
        "<span class='letter'>$&</span>"
    );

    // Create a timeline for coordinated animations
    const timeline = anime.timeline({
        easing: 'easeOutExpo',
        duration: 2000
    });

    // UFLDP logo animation sequence
    timeline
        .add({
            targets: '.ufldp-logo',
            scale: [0, 1],
            opacity: [0, 1],
            rotate: [180, 0],
            duration: 1500,
            easing: 'cubicBezier(.5, .05, .1, .3)'
        })
        .add({
            targets: '.ml12 .letter',
            translateX: [40, 0],
            translateZ: 0,
            opacity: [0, 1],
            easing: "easeOutExpo",
            duration: 1200,
            delay: (el, i) => 500 + 30 * i
        }, '-=1000')
        .add({
            targets: '.subtitle',
            opacity: [0, 1],
            translateY: [20, 0],
            duration: 800
        }, '-=800');

    // Logo animation commands
    const logoCommands = {
        cartwheel: () => {
            return anime({
                targets: '.ufldp-logo',
                rotate: [0, 360],
                duration: 1200,
                easing: 'cubicBezier(.5, .05, .1, .3)',
                complete: function(anim) {
                    anime.set('.ufldp-logo', {
                        rotate: 0
                    });
                }
            });
        },
        shake: () => {
            return anime({
                targets: '.ufldp-logo',
                translateX: [0, -10, 10, -10, 10, 0],
                duration: 500,
                easing: 'easeInOutSine'
            });
        },
        bounce: () => {
            return anime({
                targets: '.ufldp-logo',
                translateY: [0, -30],
                direction: 'alternate',
                duration: 300, // Faster bounce
                easing: 'spring(1, 80, 10, 0)',
                loop: 2
            });
        },
        spin: () => {
            return anime({
                targets: '.ufldp-logo',
                rotate: '+=360',
                duration: 1000,
                easing: 'easeInOutQuad'
            });
        },
        dance: () => {
            return anime({
                targets: '.ufldp-logo',
                rotate: [0, 15, -15, 15, -15, 0],
                translateY: [0, -15, 0, -15, 0],
                duration: 1000,
                easing: 'easeInOutQuad'
            });
        },
        'dance left': () => {
            return anime({
                targets: '.ufldp-logo',
                translateX: [0, -30],
                rotate: [0, -15],
                duration: 400,
                direction: 'alternate',
                easing: 'easeInOutQuad',
                loop: 2
            });
        },
        'dance right': () => {
            return anime({
                targets: '.ufldp-logo',
                translateX: [0, 30],
                rotate: [0, 15],
                duration: 400,
                direction: 'alternate',
                easing: 'easeInOutQuad',
                loop: 2
            });
        },
        grow: () => {
            return anime({
                targets: '.ufldp-logo',
                scale: [1, 1.5],
                duration: 500,
                direction: 'alternate',
                easing: 'easeOutElastic(1, .5)'
            });
        }
    };

    // Function to execute command with repetition
    const executeCommand = async (command, times = 1) => {
        for (let i = 0; i < times; i++) {
            const animation = logoCommands[command]();
            await animation.finished;
        }
    };

    // Add textarea command listener
    const textarea = document.querySelector('.prompt-box textarea');
    textarea.addEventListener('keydown', async (e) => {
        if (e.key === 'Enter') {
            e.preventDefault(); // Prevent new line
            const command = textarea.value.toLowerCase().trim();
            console.log('Command received:', command); // Debug log
            
            // Check for both "X times command" and "command X times" formats
            const repeatMatch = command.match(/^(\d+)\s*times?\s*(.+)/) || command.match(/(.+)\s+(\d+)\s*times?$/);
            if (repeatMatch) {
                let times, actualCommand;
                if (/^\d/.test(command)) {
                    // "X times command" format
                    times = parseInt(repeatMatch[1]);
                    actualCommand = repeatMatch[2].trim();
                } else {
                    // "command X times" format
                    times = parseInt(repeatMatch[2]);
                    actualCommand = repeatMatch[1].trim();
                }
                console.log('Repeat command:', times, 'times:', actualCommand); // Debug log
                if (logoCommands[actualCommand]) {
                    await executeCommand(actualCommand, times);
                }
            } else if (logoCommands[command]) {
                console.log('Executing command:', command); // Debug log
                await executeCommand(command, 1);
            } else {
                console.log('Unknown command:', command); // Debug log
            }
            
            // Clear the textarea
            textarea.value = '';
        }
    });

    // Example tags click handlers
    const exampleTags = document.querySelectorAll('.example-tags button');
    exampleTags.forEach(button => {
        button.addEventListener('click', () => {
            const command = button.textContent.toLowerCase();
            if (logoCommands[command]) {
                executeCommand(command, 1);
            }
        });
    });

    // Button hover animations
    const buttons = document.querySelectorAll('button');
    buttons.forEach(button => {
        button.addEventListener('mouseenter', () => {
            anime({
                targets: button,
                scale: 1.1,
                duration: 400,
                easing: 'easeOutElastic(1, .5)'
            });
        });

        button.addEventListener('mouseleave', () => {
            anime({
                targets: button,
                scale: 1,
                duration: 400,
                easing: 'easeOutElastic(1, .5)'
            });
        });
    });

    // Prompt box animation with bounce effect
    anime({
        targets: '.prompt-box',
        translateY: [50, 0],
        opacity: [0, 1],
        duration: 1200,
        delay: 1000,
        easing: 'spring(1, 80, 10, 0)'
    });

    // Example tags stagger animation
    anime({
        targets: '.example-tags button',
        scale: [0, 1],
        opacity: [0, 1],
        delay: anime.stagger(100, {start: 1500}),
        duration: 800,
        easing: 'spring(1, 80, 10, 0)'
    });

    // Social proof animation
    anime({
        targets: '.social-proof > *',
        translateY: [20, 0],
        opacity: [0, 1],
        delay: anime.stagger(200, {start: 2000}),
        duration: 800,
        easing: 'easeOutExpo'
    });

    // Dice randomization setup
    const diceElements = document.querySelectorAll('.dice');
    const diceFaces = [
        // Face 1
        `<svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <rect x="4" y="4" width="16" height="16" rx="3" fill="white" stroke="none" />
            <circle cx="12" cy="12" r="1.5" fill="black" stroke="none"/>
        </svg>`,
        // Face 2
        `<svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <rect x="4" y="4" width="16" height="16" rx="3" fill="white" stroke="none" />
            <circle cx="8" cy="8" r="1.5" fill="black" stroke="none"/>
            <circle cx="16" cy="16" r="1.5" fill="black" stroke="none"/>
        </svg>`,
        // Face 3
        `<svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <rect x="4" y="4" width="16" height="16" rx="3" fill="white" stroke="none" />
            <circle cx="8" cy="8" r="1.5" fill="black" stroke="none"/>
            <circle cx="12" cy="12" r="1.5" fill="black" stroke="none"/>
            <circle cx="16" cy="16" r="1.5" fill="black" stroke="none"/>
        </svg>`,
        // Face 4
        `<svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <rect x="4" y="4" width="16" height="16" rx="3" fill="white" stroke="none" />
            <circle cx="8" cy="8" r="1.5" fill="black" stroke="none"/>
            <circle cx="16" cy="8" r="1.5" fill="black" stroke="none"/>
            <circle cx="8" cy="16" r="1.5" fill="black" stroke="none"/>
            <circle cx="16" cy="16" r="1.5" fill="black" stroke="none"/>
        </svg>`,
        // Face 5
        `<svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <rect x="4" y="4" width="16" height="16" rx="3" fill="white" stroke="none" />
            <circle cx="8" cy="8" r="1.5" fill="black" stroke="none"/>
            <circle cx="16" cy="8" r="1.5" fill="black" stroke="none"/>
            <circle cx="12" cy="12" r="1.5" fill="black" stroke="none"/>
            <circle cx="8" cy="16" r="1.5" fill="black" stroke="none"/>
            <circle cx="16" cy="16" r="1.5" fill="black" stroke="none"/>
        </svg>`,
        // Face 6
        `<svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <rect x="4" y="4" width="16" height="16" rx="3" fill="white" stroke="none" />
            <circle cx="8" cy="8" r="1.5" fill="black" stroke="none"/>
            <circle cx="16" cy="8" r="1.5" fill="black" stroke="none"/>
            <circle cx="8" cy="12" r="1.5" fill="black" stroke="none"/>
            <circle cx="16" cy="12" r="1.5" fill="black" stroke="none"/>
            <circle cx="8" cy="16" r="1.5" fill="black" stroke="none"/>
            <circle cx="16" cy="16" r="1.5" fill="black" stroke="none"/>
        </svg>`
    ];

    // Function to get a random dice face
    function getRandomDiceFace() {
        return diceFaces[Math.floor(Math.random() * diceFaces.length)];
    }

    // Add animation end listener to each dice
    diceElements.forEach(dice => {
        // Initial random face
        dice.innerHTML = getRandomDiceFace();

        // Update face when animation repeats
        dice.addEventListener('animationiteration', () => {
            dice.innerHTML = getRandomDiceFace();
        });
    });
}); 