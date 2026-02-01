// Contact Form Handler
document.addEventListener('DOMContentLoaded', function() {
    // Initialize Firebase
    const app = firebase.initializeApp(firebaseConfig);
    const db = firebase.firestore();
    
    // Form elements
    const inquiryForm = document.getElementById('inquiryForm');
    const successMessage = document.getElementById('successMessage');
    const errorMessage = document.getElementById('errorMessage');
    const errorText = document.getElementById('errorText');
    
    // Form submission handler
    inquiryForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        // Get form values
        const inquiryData = {
            name: document.getElementById('name').value.trim(),
            email: document.getElementById('email').value.trim(),
            phone: document.getElementById('phone').value.trim() || null,
            company: document.getElementById('company').value.trim() || null,
            product: document.getElementById('product').value || null,
            subject: document.getElementById('subject').value.trim(),
            message: document.getElementById('message').value.trim(),
            status: 'new',
            timestamp: firebase.firestore.FieldValue.serverTimestamp(),
            read: false
        };
        
        // Validation
        if (!validateForm(inquiryData)) return;
        
        // Disable submit button
        const submitBtn = inquiryForm.querySelector('button[type="submit"]');
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
        
        try {
            // Save to Firestore
            await db.collection('inquiries').add(inquiryData);
            
            // Show success message
            showMessage('success', 'Thank you! Your inquiry has been submitted successfully.');
            
            // Reset form
            inquiryForm.reset();
            
            // Log to console (optional)
            console.log('Inquiry submitted:', inquiryData);
            
        } catch (error) {
            console.error('Error submitting inquiry:', error);
            showMessage('error', 'Failed to submit inquiry. Please try again later.');
            
        } finally {
            // Re-enable submit button
            submitBtn.disabled = false;
            submitBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Send Inquiry';
        }
    });
    
    // Form validation
    function validateForm(data) {
        // Required fields
        if (!data.name || !data.email || !data.subject || !data.message) {
            showMessage('error', 'Please fill all required fields.');
            return false;
        }
        
        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(data.email)) {
            showMessage('error', 'Please enter a valid email address.');
            return false;
        }
        
        // Message length
        if (data.message.length < 10) {
            showMessage('error', 'Please enter a more detailed message (minimum 10 characters).');
            return false;
        }
        
        return true;
    }
    
    // Show message function
    function showMessage(type, text) {
        if (type === 'success') {
            errorMessage.style.display = 'none';
            successMessage.style.display = 'flex';
            successMessage.querySelector('span').textContent = text;
            
            // Auto hide after 5 seconds
            setTimeout(() => {
                successMessage.style.display = 'none';
            }, 5000);
            
        } else if (type === 'error') {
            successMessage.style.display = 'none';
            errorMessage.style.display = 'flex';
            errorText.textContent = text;
            
            // Auto hide after 5 seconds
            setTimeout(() => {
                errorMessage.style.display = 'none';
            }, 5000);
        }
    }
    
    // Add validation on input change
    const inputs = inquiryForm.querySelectorAll('input, textarea, select');
    inputs.forEach(input => {
        input.addEventListener('input', function() {
            this.style.borderColor = '';
        });
        
        input.addEventListener('blur', function() {
            if (this.hasAttribute('required') && !this.value.trim()) {
                this.style.borderColor = '#e74c3c';
            }
        });
    });
});