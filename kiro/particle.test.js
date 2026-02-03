/**
 * Property-Based Tests for Particle Class
 * Feature: kiro-inspired-webapp
 */

// Mock DOM environment BEFORE importing script
global.document = {
  readyState: 'complete',
  addEventListener: () => {},
  getElementById: () => ({
    getContext: () => ({
      clearRect: () => {},
      save: () => {},
      restore: () => {},
      beginPath: () => {},
      arc: () => {},
      fill: () => {}
    }),
    width: 800,
    height: 600,
    addEventListener: () => {}
  })
};

global.window = {
  innerWidth: 1920,
  innerHeight: 1080,
  addEventListener: () => {},
};

global.requestAnimationFrame = (cb) => setTimeout(cb, 16);

// Set NODE_ENV to prevent auto-initialization
process.env.NODE_ENV = 'test';

const fc = require('fast-check');
const { Particle, COLORS } = require('./script.js');

// Define color palette for testing
const TEST_COLORS = [
  'rgba(255, 223, 0, ',
  'rgba(255, 193, 7, ',
  'rgba(255, 152, 0, ',
  'rgba(255, 255, 255, ',
  'rgba(255, 235, 59, '
];

/**
 * **Feature: kiro-inspired-webapp, Property 3: Particles animate with motion and decay**
 * **Validates: Requirements 1.3**
 * 
 * For any particle, after calling update(), the particle's position should change 
 * (due to velocity) and its life value should decrease
 */
describe('Particle Property-Based Tests', () => {
  test('Property 3: Particles animate with motion and decay', () => {
    fc.assert(
      fc.property(
        // Generate random particle parameters
        fc.double({ min: 0, max: 1000 }), // x position
        fc.double({ min: 0, max: 1000 }), // y position
        fc.constantFrom(...TEST_COLORS), // color from palette
        fc.record({
          x: fc.double({ min: -10, max: 10, noNaN: true }), // velocity x
          y: fc.double({ min: -10, max: 10, noNaN: true })  // velocity y
        }),
        fc.double({ min: 1, max: 10 }), // size
        fc.double({ min: 1, max: 100 }), // deltaTime
        (x, y, color, velocity, size, deltaTime) => {
          // Skip cases with near-zero velocity (below threshold) as they won't cause meaningful motion
          const velocityMagnitude = Math.sqrt(velocity.x * velocity.x + velocity.y * velocity.y);
          if (velocityMagnitude < 0.01) {
            return true; // Skip this test case
          }

          // Create particle
          const particle = new Particle(x, y, color, velocity, size);
          
          // Store initial state
          const initialX = particle.x;
          const initialY = particle.y;
          const initialLife = particle.life;
          
          // Update particle
          particle.update(deltaTime);
          
          // Check that position changed (motion)
          const positionChanged = particle.x !== initialX || particle.y !== initialY;
          
          // Check that life decreased (decay)
          const lifeDecreased = particle.life < initialLife;
          
          // Both conditions must be true
          return positionChanged && lifeDecreased;
        }
      ),
      { numRuns: 100 } // Run 100 iterations as specified in design
    );
  });
});
