const resolutionSelect = document.getElementById('resolution');
const fileInput = document.getElementById('fileInput');
const resizeButton = document.getElementById('resizeButton');
const imagePreview = document.getElementById('imagePreview');
const downloadButton = document.getElementById('downloadButton');
const originalDimensions = document.getElementById('originalDimensions');
const formatSelector = document.getElementById('formatSelector');

fileInput.addEventListener('change', function() {
    const file = this.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const img = new Image();
            img.src = e.target.result;
            img.onload = function() {
                originalDimensions.textContent = `Original Dimensions: ${this.width} x ${this.height}`;
                imagePreview.src = this.src;
            };
        };
        reader.readAsDataURL(file);
    } else {
        originalDimensions.textContent = 'Original Dimensions: - x -';
    }
});

resizeButton.addEventListener('click', async function() {
    const [widthValue, heightValue] = resolutionSelect.value.split('x').map(Number);

    if (!fileInput.files.length || widthValue <= 0 || heightValue <= 0) {
        return alert('Please select an image, and specify a valid resolution.');
    }

    const img = new Image();
    img.src = imagePreview.src;

    img.onload = async function() {
        const offScreenCanvas = document.createElement('canvas');
        offScreenCanvas.width = widthValue;
        offScreenCanvas.height = heightValue;

        await pica().resize(img, offScreenCanvas);

        const format = formatSelector.value; // Get the selected format
        imagePreview.src = offScreenCanvas.toDataURL(format);
        downloadButton.removeAttribute('disabled'); // Enable the download button
    };
});

downloadButton.addEventListener('click', function() {
    const a = document.createElement('a');
    a.href = imagePreview.src;
    const format = formatSelector.value.split("/")[1]; // Extract the extension from the format
    a.download = `resized-image.${format}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
});
