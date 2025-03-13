function saveText() {
    const text = document.getElementById('text-editor').value;
    localStorage.setItem('savedText', text);
    document.getElementById('message').innerText = 'Text saved!';
}

function clearText() {
    document.getElementById('text-editor').value = '';
    document.getElementById('message').innerText = '';
}

// Load saved text on page load
window.onload = function() {
    const savedText = localStorage.getItem('savedText');
    if (savedText) {
        document.getElementById('text-editor').value = savedText;
    }
}
