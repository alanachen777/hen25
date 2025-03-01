// Assuming you have an HTML form with an input type="file" and a button to trigger the upload
document.getElementById('uploadButton').addEventListener('click', async () => {
    const fileInput = document.getElementById('fileInput');
    const file = fileInput.files[0];
  
    if (file) {
      const formData = new FormData();
      formData.append('image', file);
  
      try {
        const response = await fetch('http://localhost:3000/generate-caption', {
          method: 'POST',
          body: formData,
        });
  
        const data = await response.json();
        if (response.ok) {
          document.getElementById('caption').innerText = `Caption: ${data.caption}`;
        } else {
          document.getElementById('caption').innerText = `Error: ${data.error}`;
        }
      } catch (error) {
        console.error('Error:', error);
        document.getElementById('caption').innerText = 'Error: Could not generate caption.';
      }
    } else {
      alert('Please select an image file to upload.');
    }
  });
  