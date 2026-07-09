async function testUploadFallback() {
    try {
        const formData = new FormData();
        formData.append('file', new Blob(['dummy file content'], { type: 'image/jpeg' }), 'test.jpg');

        const res = await fetch('http://localhost:5000/api/v1/upload', {
            method: 'POST',
            body: formData,
            // Add a valid dummy token or start the server with auth disabled for test
        });
        const data = await res.json();
        console.log("Response:", res.status, data);
    } catch(e) {
        console.log("Error:", e.message);
    }
}

testUploadFallback();
