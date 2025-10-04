const fs = require('fs');
const { createCanvas } = require('canvas');

// Create canvas
const canvas = createCanvas(300, 120);
const ctx = canvas.getContext('2d');

// White background
ctx.fillStyle = 'white';
ctx.fillRect(0, 0, 300, 120);

// Function to draw dot-matrix text
function drawDotText(text, x, y, fontSize, dotSize) {
    ctx.font = `bold ${fontSize}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    // Get text metrics
    const metrics = ctx.measureText(text);
    const textWidth = metrics.width;
    const textHeight = fontSize;
    
    // Create temporary canvas for text
    const tempCanvas = createCanvas(textWidth + 20, textHeight + 20);
    const tempCtx = tempCanvas.getContext('2d');
    
    // Draw text on temporary canvas
    tempCtx.font = `bold ${fontSize}px Arial`;
    tempCtx.textAlign = 'center';
    tempCtx.textBaseline = 'middle';
    tempCtx.fillStyle = 'black';
    tempCtx.fillText(text, tempCanvas.width/2, tempCanvas.height/2);
    
    // Get image data
    const imageData = tempCtx.getImageData(0, 0, tempCanvas.width, tempCanvas.height);
    const data = imageData.data;
    
    // Draw dots where text pixels are
    for (let i = 0; i < data.length; i += 4) {
        if (data[i] === 0 && data[i + 1] === 0 && data[i + 2] === 0) {
            const pixelX = (i / 4) % tempCanvas.width;
            const pixelY = Math.floor((i / 4) / tempCanvas.width);
            
            // Convert to main canvas coordinates
            const canvasX = x - tempCanvas.width/2 + pixelX;
            const canvasY = y - tempCanvas.height/2 + pixelY;
            
            // Draw dot with slight randomness
            const randomSize = dotSize + (Math.random() - 0.5) * 2;
            if (randomSize > 0) {
                ctx.beginPath();
                ctx.arc(canvasX, canvasY, randomSize, 0, 2 * Math.PI);
                ctx.fillStyle = 'black';
                ctx.fill();
            }
        }
    }
}

// Draw AIR with larger dots
drawDotText('AIR', 150, 40, 36, 4);

// Draw SALON with smaller dots
drawDotText('SALON', 150, 90, 28, 3);

// Save as PNG
const buffer = canvas.toBuffer('image/png');
fs.writeFileSync('airsalon-logo.png', buffer);

console.log('Air Salon logo created successfully!');
