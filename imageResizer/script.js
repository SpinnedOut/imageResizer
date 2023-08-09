const fileInput = document.getElementById('fileInput');
const widthInput = document.getElementById('width');
const heightInput = document.getElementById('height');
const resizeButton = document.getElementById('resizeButton');
const imagePreview = document.getElementById('imagePreview');
const downloadButton = document.getElementById('downloadButton');
const originalDimensions = document.getElementById('originalDimensions');

function willDistort(originalWidth, originalHeight, newWidth, newHeight) {
    const widthRatio = newWidth / originalWidth;
    const heightRatio = newHeight / originalHeight;

    // Here, we consider resizing to be extreme if it's more than 3 times 
    // the original dimension or less than a third. Adjust as needed.
    return widthRatio > 2 || widthRatio < 0.5 || heightRatio > 2 || heightRatio < 0.5;
}

fileInput.addEventListener('change', function() {
    const file = this.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            imagePreview.src = e.target.result;
            // When the image loads, display its dimensions
            imagePreview.onload = function() {
                originalDimensions.textContent = `Original Dimensions: ${this.width} x ${this.height}`;
            }
        };
        reader.readAsDataURL(file);
    } else {
        // If no image is selected, reset the displayed dimensions
        originalDimensions.textContent = 'Original Dimensions: - x -';
    }
});

resizeButton.addEventListener('click', async function() {
    if (!fileInput.files.length) return alert('Please select an image.');
    if (!widthInput.value || !heightInput.value) return alert('Please specify both width and height.');

    const img = new Image();
    img.src = imagePreview.src;

    img.onload = async function() {
        if (willDistort(img.width, img.height, Number(widthInput.value), Number(heightInput.value))) {
            const proceed = confirm("The provided dimensions may cause extreme distortion. Do you want to continue?");
            if (!proceed) return;
        }

        const offScreenCanvas = document.createElement('canvas');
        offScreenCanvas.width = Number(widthInput.value);
        offScreenCanvas.height = Number(heightInput.value);

        await pica().resize(img, offScreenCanvas);
        
        imagePreview.src = offScreenCanvas.toDataURL('image/jpeg');
        downloadButton.removeAttribute('disabled');
    }
});

downloadButton.addEventListener('click', function() {
    const selectedFormat = document.getElementById('formatSelector').value;
    let fileExtension;

    switch (selectedFormat) {
        case 'image/jpeg':
            fileExtension = 'jpg';
            break;
        case 'image/png':
            fileExtension = 'png';
            break;
        case 'image/gif':
            fileExtension = 'gif';
            break;
        default:
            fileExtension = 'jpg';
    }

    const a = document.createElement('a');
    a.href = imagePreview.src;
    a.download = `resized-image.${fileExtension}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
});
