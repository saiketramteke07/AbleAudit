/**
 * Main JavaScript file for Accessibility Analyzer
 */

// Show loading indicator for analysis form
document.addEventListener('DOMContentLoaded', function() {
    const analysisForm = document.querySelector('form[action="/analysis/run"]');
    
    if (analysisForm) {
      analysisForm.addEventListener('submit', function() {
        const submitButton = this.querySelector('button[type="submit"]');
        
        if (submitButton) {
          // Disable button and show loading state
          submitButton.disabled = true;
          submitButton.innerHTML = '<span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>Analyzing...';
          
          // Create overlay with loading message
          const overlay = document.createElement('div');
          overlay.style.position = 'fixed';
          overlay.style.top = '0';
          overlay.style.left = '0';
          overlay.style.width = '100%';
          overlay.style.height = '100%';
          overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
          overlay.style.display = 'flex';
          overlay.style.justifyContent = 'center';
          overlay.style.alignItems = 'center';
          overlay.style.zIndex = '9999';
          
          const loadingContainer = document.createElement('div');
          loadingContainer.className = 'bg-white p-4 rounded text-center';
          
          const spinner = document.createElement('div');
          spinner.className = 'loading mx-auto mb-3';
          
          const message = document.createElement('p');
          message.className = 'mb-0';
          message.textContent = 'Analyzing website accessibility. This may take a minute...';
          
          loadingContainer.appendChild(spinner);
          loadingContainer.appendChild(message);
          overlay.appendChild(loadingContainer);
          document.body.appendChild(overlay);
        }
      });
    }
  })

