class PDFMergeApp {
    constructor() {
        this.files = [];
        this.mergedPdfBytes = null;
        this.initializeElements();
        this.bindEvents();
        this.initializeScrollAnimations();
    }

    initializeElements() {
        this.uploadArea = document.getElementById('uploadArea');
        this.uploadOverlay = document.getElementById('uploadOverlay');
        this.fileInput = document.getElementById('fileInput');
        this.browseBtn = document.getElementById('browseBtn');
        this.fileList = document.getElementById('fileList');
        this.mergeControls = document.getElementById('mergeControls');
        this.mergeBtn = document.getElementById('mergeBtn');
        this.clearBtn = document.getElementById('clearBtn');
        this.progressContainer = document.getElementById('progressContainer');
        this.progressFill = document.getElementById('progressFill');
        this.progressText = document.getElementById('progressText');
        this.downloadContainer = document.getElementById('downloadContainer');
        this.downloadBtn = document.getElementById('downloadBtn');
        this.newMergeBtn = document.getElementById('newMergeBtn');
    }

    bindEvents() {
        // File upload events
        this.uploadArea.addEventListener('click', () => this.fileInput.click());
        this.browseBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.fileInput.click();
        });
        this.fileInput.addEventListener('change', (e) => this.handleFileSelect(e));

        // Drag and drop events
        this.uploadArea.addEventListener('dragover', (e) => this.handleDragOver(e));
        this.uploadArea.addEventListener('dragleave', (e) => this.handleDragLeave(e));
        this.uploadArea.addEventListener('drop', (e) => this.handleDrop(e));

        // Control buttons
        this.mergeBtn.addEventListener('click', () => this.mergePDFs());
        this.clearBtn.addEventListener('click', () => this.clearFiles());
        this.downloadBtn.addEventListener('click', () => this.downloadMergedPDF());
        this.newMergeBtn.addEventListener('click', () => this.startNewMerge());

        // Prevent default drag behaviors on document
        document.addEventListener('dragover', (e) => e.preventDefault());
        document.addEventListener('drop', (e) => e.preventDefault());
    }

    initializeScrollAnimations() {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animated');
                }
            });
        }, observerOptions);

        // Observe elements for scroll animations
        document.querySelectorAll('.section-title, .feature-card').forEach(el => {
            el.classList.add('animate-on-scroll');
            observer.observe(el);
        });
    }

    handleDragOver(e) {
        e.preventDefault();
        this.uploadArea.classList.add('drag-over');
    }

    handleDragLeave(e) {
        e.preventDefault();
        if (!this.uploadArea.contains(e.relatedTarget)) {
            this.uploadArea.classList.remove('drag-over');
        }
    }

    handleDrop(e) {
        e.preventDefault();
        this.uploadArea.classList.remove('drag-over');
        const files = Array.from(e.dataTransfer.files).filter(file => file.type === 'application/pdf');
        this.addFiles(files);
    }

    handleFileSelect(e) {
        const files = Array.from(e.target.files);
        this.addFiles(files);
        e.target.value = ''; // Reset input
    }

    addFiles(newFiles) {
        newFiles.forEach(file => {
            if (file.type === 'application/pdf') {
                const fileObj = {
                    id: Date.now() + Math.random(),
                    file: file,
                    name: file.name,
                    size: this.formatFileSize(file.size)
                };
                this.files.push(fileObj);
            }
        });
        this.renderFileList();
        this.updateControls();
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    renderFileList() {
        this.fileList.innerHTML = '';
        
        this.files.forEach((fileObj, index) => {
            const fileItem = this.createFileItem(fileObj, index);
            this.fileList.appendChild(fileItem);
            
            // Trigger animation
            setTimeout(() => {
                fileItem.style.animationDelay = `${index * 0.1}s`;
            }, 10);
        });

        this.initializeSortable();
    }

    createFileItem(fileObj, index) {
        const fileItem = document.createElement('div');
        fileItem.className = 'file-item';
        fileItem.draggable = true;
        fileItem.dataset.fileId = fileObj.id;

        fileItem.innerHTML = `
            <div class="file-icon">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2H4C3.44772 2 3 2.44772 3 3V17C3 17.5523 3.44772 18 4 18H16C16.5523 18 17 17.5523 17 17V7L12 2Z" stroke="currentColor" stroke-width="1.5" fill="none"/>
                    <path d="M12 2V7H17" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
            </div>
            <div class="file-info">
                <div class="file-name" title="${fileObj.name}">${fileObj.name}</div>
                <div class="file-size">${fileObj.size}</div>
            </div>
            <div class="file-actions">
                <button class="file-action-btn" title="Drag to reorder">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M6 3H6.01M6 8H6.01M6 13H6.01M10 3H10.01M10 8H10.01M10 13H10.01" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                    </svg>
                </button>
                <button class="file-action-btn remove" onclick="app.removeFile('${fileObj.id}')" title="Remove file">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 4L4 12M4 4L12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                    </svg>
                </button>
            </div>
        `;

        return fileItem;
    }

    initializeSortable() {
        const fileItems = this.fileList.querySelectorAll('.file-item');
        
        fileItems.forEach(item => {
            item.addEventListener('dragstart', (e) => {
                item.classList.add('dragging');
                e.dataTransfer.effectAllowed = 'move';
                e.dataTransfer.setData('text/html', item.outerHTML);
                e.dataTransfer.setData('text/plain', item.dataset.fileId);
            });

            item.addEventListener('dragend', () => {
                item.classList.remove('dragging');
            });
        });

        this.fileList.addEventListener('dragover', (e) => {
            e.preventDefault();
            const dragging = this.fileList.querySelector('.dragging');
            const siblings = [...this.fileList.querySelectorAll('.file-item:not(.dragging)')];
            
            const nextSibling = siblings.find(sibling => {
                return e.clientY <= sibling.getBoundingClientRect().top + sibling.offsetHeight / 2;
            });

            this.fileList.insertBefore(dragging, nextSibling);
        });

        this.fileList.addEventListener('drop', (e) => {
            e.preventDefault();
            this.updateFileOrder();
        });
    }

    updateFileOrder() {
        const fileItems = [...this.fileList.querySelectorAll('.file-item')];
        const newOrder = fileItems.map(item => item.dataset.fileId);
        
        this.files = newOrder.map(id => this.files.find(file => file.id == id));
    }

    removeFile(fileId) {
        this.files = this.files.filter(file => file.id != fileId);
        this.renderFileList();
        this.updateControls();
    }

    clearFiles() {
        this.files = [];
        this.renderFileList();
        this.updateControls();
        this.hideAllContainers();
    }

    updateControls() {
        if (this.files.length > 0) {
            this.mergeControls.style.display = 'block';
        } else {
            this.mergeControls.style.display = 'none';
        }
    }

    async mergePDFs() {
        if (this.files.length < 2) {
            this.showNotification('Please add at least 2 PDF files to merge.', 'warning');
            return;
        }

        this.showProgress();
        this.progressText.textContent = 'Initializing merge...';
        this.updateProgress(10);

        try {
            const mergedPdf = await PDFLib.PDFDocument.create();
            const totalFiles = this.files.length;

            for (let i = 0; i < totalFiles; i++) {
                const file = this.files[i];
                this.progressText.textContent = `Processing ${file.name}...`;
                this.updateProgress(20 + (i / totalFiles) * 60);

                const arrayBuffer = await file.file.arrayBuffer();
                const pdf = await PDFLib.PDFDocument.load(arrayBuffer);
                const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
                
                copiedPages.forEach((page) => mergedPdf.addPage(page));
                
                // Small delay to show progress
                await new Promise(resolve => setTimeout(resolve, 100));
            }

            this.progressText.textContent = 'Finalizing merged PDF...';
            this.updateProgress(90);

            this.mergedPdfBytes = await mergedPdf.save();
            
            this.updateProgress(100);
            this.progressText.textContent = 'Merge completed successfully!';

            setTimeout(() => {
                this.hideProgress();
                this.showDownload();
            }, 1000);

        } catch (error) {
            console.error('Error merging PDFs:', error);
            this.hideProgress();
            this.showNotification('Error merging PDFs. Please try again.', 'error');
        }
    }

    showProgress() {
        this.mergeControls.style.display = 'none';
        this.progressContainer.style.display = 'block';
        this.updateProgress(0);
    }

    hideProgress() {
        this.progressContainer.style.display = 'none';
    }

    updateProgress(percentage) {
        this.progressFill.style.width = `${percentage}%`;
    }

    showDownload() {
        this.downloadContainer.style.display = 'block';
    }

    hideAllContainers() {
        this.progressContainer.style.display = 'none';
        this.downloadContainer.style.display = 'none';
        this.mergedPdfBytes = null;
    }

    downloadMergedPDF() {
        if (!this.mergedPdfBytes) {
            this.showNotification('No merged PDF available for download.', 'error');
            return;
        }

        const blob = new Blob([this.mergedPdfBytes], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `merged-pdf-${new Date().toISOString().slice(0, 10)}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        
        URL.revokeObjectURL(url);
        this.showNotification('PDF downloaded successfully!', 'success');
    }

    startNewMerge() {
        this.clearFiles();
        this.hideAllContainers();
        this.scrollToTop();
    }

    scrollToTop() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 16px 24px;
            background: ${type === 'success' ? '#28a745' : type === 'error' ? '#dc3545' : type === 'warning' ? '#ffc107' : '#007bff'};
            color: white;
            border-radius: 8px;
            box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
            z-index: 10000;
            font-family: var(--font-family);
            font-weight: 500;
            transform: translateX(100%);
            transition: transform 0.3s ease;
        `;

        document.body.appendChild(notification);

        // Animate in
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 10);

        // Remove after 4 seconds
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 4000);
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.app = new PDFMergeApp();
});

// Add smooth scrolling for anchor links
document.addEventListener('click', (e) => {
    if (e.target.matches('a[href^="#"]')) {
        e.preventDefault();
        const target = document.querySelector(e.target.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    }
});

// Add header scroll effect
window.addEventListener('scroll', () => {
    const header = document.querySelector('.header');
    if (window.scrollY > 50) {
        header.style.background = 'rgba(255, 255, 255, 0.98)';
        header.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.1)';
    } else {
        header.style.background = 'rgba(255, 255, 255, 0.95)';
        header.style.boxShadow = 'none';
    }
});
