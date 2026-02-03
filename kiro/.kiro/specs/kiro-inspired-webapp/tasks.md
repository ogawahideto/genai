# Implementation Plan

- [x] 1. Create basic HTML structure and setup





  - Create index.html with canvas element and UI controls
  - Create styles.css with dark theme and centered layout
  - Create script.js file structure
  - Ensure no external dependencies (all code inline or in local files)
  - _Requirements: 3.1, 3.3, 5.1, 5.2_

- [x] 2. Implement Particle class





  - Create Particle class with constructor for position, velocity, color, size, life
  - Implement update() method to handle position changes and life decay
  - Implement draw() method to render particle on canvas context
  - Implement isDead() method to check if particle life is depleted
  - _Requirements: 1.3_

- [x] 2.1 Write property test for particle animation


  - **Property 3: Particles animate with motion and decay**
  - **Validates: Requirements 1.3**

- [ ] 3. Implement ParticleSystem class
  - Create ParticleSystem class to manage particle array
  - Implement createEffect(x, y) to generate multiple particles at position
  - Implement update(deltaTime) to update all particles and remove dead ones
  - Implement draw(context) to render all active particles
  - Implement clear() to remove all particles
  - _Requirements: 1.1, 1.2, 4.2_

- [ ] 3.1 Write property test for click generates particles
  - **Property 1: Click generates particles at position**
  - **Validates: Requirements 1.1**

- [ ] 3.2 Write property test for multiple particles per effect
  - **Property 2: Effects create multiple particles**
  - **Validates: Requirements 1.2**

- [ ] 3.3 Write property test for clear functionality
  - **Property 6: Clear removes all particles**
  - **Validates: Requirements 4.2**

- [ ] 4. Implement color system
  - Define warm color palette array (yellow, gold, orange, white)
  - Create function to randomly select color from palette
  - Ensure particles in same effect can have different colors
  - _Requirements: 2.1, 2.3_

- [ ] 4.1 Write property test for color palette validation
  - **Property 4: Particles use warm color palette**
  - **Validates: Requirements 2.1**

- [ ] 4.2 Write property test for color variety
  - **Property 5: Effects have color variety**
  - **Validates: Requirements 2.3**

- [ ] 5. Implement application controller and animation loop
  - Create App object with init() method
  - Implement setupCanvas() to initialize canvas and context
  - Implement animate() using requestAnimationFrame for smooth animation
  - Add canvas clearing and particle system update/draw calls
  - _Requirements: 1.5, 3.5_

- [ ] 6. Implement event handling
  - Add click event listener to canvas for creating effects
  - Implement handleClick(event) to get coordinates and create particles
  - Add clear button click handler
  - Add keyboard shortcut (e.g., 'C' key) for clearing
  - _Requirements: 1.1, 4.1, 4.2_

- [ ] 7. Add visual enhancements and styling
  - Apply glow effects to particles using canvas shadowBlur
  - Style the clear button with theme-appropriate colors
  - Add title and instruction text with appropriate fonts
  - Ensure canvas is responsive to window size
  - Apply dark background color scheme
  - _Requirements: 2.2, 2.4, 5.1, 5.2, 5.3, 5.5_

- [ ] 8. Write unit tests for core functionality
  - Test Particle class methods with specific values
  - Test ParticleSystem with edge cases (zero particles, many particles)
  - Test color selection returns valid colors
  - Test clear button exists in DOM
  - Test canvas element exists and has correct properties
  - _Requirements: 3.3, 4.1, 5.1, 5.2_

- [ ] 9. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 10. Final polish and optimization
  - Optimize particle removal for performance
  - Add particle pooling if needed for better performance
  - Fine-tune particle physics (velocity, decay rates, sizes)
  - Adjust visual parameters for best aesthetic effect
  - Test in multiple browsers
  - _Requirements: 1.4, 5.4_
