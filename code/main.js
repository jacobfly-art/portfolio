document.addEventListener("DOMContentLoaded", async () => {
    
// =========================================
// 1. INJECT GLOBAL LAYOUT (Nav & Footer)
// =========================================
    const navbarHTML = `
    <header id="top">
        <a href="index.html"><h1>Harper Fly</h1></a>
        <div class="contact-info">
            <p>
                Jacob Harper Fly | 
                <a href="mailto:3842jacob@gmail.com">3842jacob@gmail.com</a> | 
                <a href="tel:7372409353">737-240-9353</a> | 
                <a href="https://linkedin.com" target="_blank">LinkedIn</a>
            </p>
        </div>
    </header>
    <nav class="main-nav">
        <ul>
            <li class="dropdown">
                <a href="index.html">Person</a>
                <ul class="dropdown-content">
                    <li><a href="biography.html">Biography</a></li>
                    <li><a href="resume.html">Resume</a></li>
                </ul>
            </li>
            <li class="dropdown">
                <a href="portfolio.html?category=projects">Data Scientist</a>
                <ul class="dropdown-content">
                    <li><a href="../projects/Python Fundamentals Project/Python Fundamentals Project.html">The Art of Python</a></li>
                    
                    <li><a href="gallery.html?category=projects&item=Business%20Statistics%20Presentation">Business Statistics Presentation</a></li>
                    
                    <li><a href="../projects/Supervised Learning Project/Supervised Learning Project.html">Supervised Learning Techniques</a></li>
                    <li><a href="../projects/Decision Tree Project/Decision Tree Project.html">Decision Tree Models</a></li>
                    
                    <li><a href="gallery.html?category=projects&item=Ensemble%20Methods%20Presentation">Ensemble Methods</a></li>
                    <li><a href="gallery.html?category=projects&item=Unsupervised%20Learning%20Presentation">Unsupervised Learning Techniques</a></li>
                    <li><a href="gallery.html?category=projects&item=Intro%20To%20SQL">SQL Practice</a></li>
                </ul>
            </li>
            <li class="dropdown">
                <a href="portfolio.html?category=plays">Playwright</a>
                <ul class="dropdown-content">
                    <li><a href="portfolio.html?category=plays">Plays</a></li>
                    <li><a href="portfolio.html?category=specs">Spec Scripts</a></li>
                    <li><a href="portfolio.html?category=sketches">Sketches</a></li>
                    <li><a href="portfolio.html?category=jokes">Image Gallery</a></li>
                </ul>
            </li>
            <li class="dropdown">
                <a href="portfolio.html?category=happiness">Essayist</a>
                <ul class="dropdown-content">
                    <li><a href="portfolio.html?category=philosophy">Short Essays</a></li>
                    <li><a href="portfolio.html?category=comedy-theory">Comedic Literary Theory</a></li>
                    <li><a href="portfolio.html?category=happiness">The Pursuit Of Happiness</a></li>
                </ul>
            </li>
            <li class="dropdown">
                <a href="portfolio.html?category=writing">Educator</a>
                <ul class="dropdown-content">
                    <li><a href="portfolio.html?category=writing">Multidisciplinary Writing</a></li>
                    <li><a href="portfolio.html?category=comedy">Comedy For Social Change</a></li>
                </ul> 
            </li>
        </ul>
    </nav>`;

    const navContainer = document.getElementById("navbar-container");
    if (navContainer) navContainer.innerHTML = navbarHTML;

    const contactBarHTML = `
        Jacob Harper Fly | 
        <a href="mailto:3842jacob@gmail.com">3842jacob@gmail.com</a> | 
        <a href="tel:7372409353">(737) 240-9353</a> | 
        <a href="https://linkedin.com" target="_blank">LinkedIn</a>
    `;
    const contactContainer = document.getElementById("contact-bar");
    if (contactContainer) {
        contactContainer.className = 'contact-bar';
        contactContainer.innerHTML = contactBarHTML;
    }

// =========================================
// 2. SMART ROUTING
// =========================================

    const currentPath = window.location.pathname.toLowerCase();
    const urlParams = new URLSearchParams(window.location.search);

    if (currentPath.includes('portfolio.html')) {
        await renderPortfolio(urlParams);
    } else if (currentPath.includes('gallery.html')) {
        await renderGallery(urlParams);
    } else if (currentPath.includes('role.html')) {
        await renderRolePage(urlParams); 
    }
});

// =========================================
// 3. TIMELINE FUNCTION (For Resume.html)
// =========================================
window.toggleTimeline = function(element) {
    element.classList.toggle("active");
};

// =========================================
// 4. PORTFOLIO PAGE LOGIC
// =========================================
async function renderPortfolio(urlParams) {
    const category = urlParams.get('category') || 'projects'; 
    document.getElementById('category-title').innerText = category;
    document.title = `Harper Fly - ${category.charAt(0).toUpperCase() + category.slice(1)}`;
    const container = document.getElementById('content-container');

    try {
        // Fetch everything from the single directory.json file
        const response = await fetch('directory.json');
        const data = await response.json();
        
        // Target the specific dictionaries inside the JSON
        let items = data.portfolio ? data.portfolio[category] : [];
        let dates = data.dates || {};

        if (!items || items.length === 0) {
            container.innerHTML = "<p>No items found for this category yet.</p>";
            return;
        }

        items.sort((a, b) => {
            const dateAStr = dates[a];
            const dateBStr = dates[b];
            const timeA = (dateAStr && dateAStr.trim() !== "") ? new Date(dateAStr).getTime() : -Infinity;
            const timeB = (dateBStr && dateBStr.trim() !== "") ? new Date(dateBStr).getTime() : -Infinity;
            const finalTimeA = isNaN(timeA) ? -Infinity : timeA;
            const finalTimeB = isNaN(timeB) ? -Infinity : timeB;
            return finalTimeA - finalTimeB;
        });

        for (let i = 0; i < items.length; i++) {
            const itemName = items[i];
            const folderPath = `../${category}/${itemName}/`;
            
            const imgPath = `${folderPath}${itemName}.jpeg`;     
            const txtPath = `${folderPath}${itemName}.txt`;     
            const pdfPath = `${folderPath}${itemName}.pdf`;     
            const galleryFirstImg = `${folderPath}${itemName}1.jpeg`; 
            const customHtmlPath = `${folderPath}${itemName}.html`; 

            const itemDate = dates[itemName];
            const dateHTML = (itemDate && itemDate.trim() !== "") ? `<h3 style="margin-top: -15px; color: #6B6259;">${itemDate}</h3>` : "";

            let description = "Description coming soon.";
            try {
                const txtResponse = await fetch(txtPath);
                if (txtResponse.ok) description = await txtResponse.text();
            } catch (e) {}

            // Default to the gallery page viewer
            let linkHref = `gallery.html?category=${encodeURIComponent(category)}&item=${encodeURIComponent(itemName)}`;
            let linkTarget = "_self";
            
            // Override with custom HTML page if it exists
            try {
                const htmlResponse = await fetch(customHtmlPath, { method: 'HEAD' });
                if (htmlResponse.ok) {
                    linkHref = customHtmlPath;
                }
            } catch (e) {}

            const itemHTML = `
                <div class="play-item">
                    <a href="${linkHref}" target="${linkTarget}" class="play-image-link" title="View ${itemName}">
                        <img src="${imgPath}" alt="${itemName} Cover" class="play-image">
                    </a>
                    <div class="play-details">
                        <h2>${itemName}</h2>
                        ${dateHTML}
                        <p class="play-description">${description}</p>
                    </div>
                </div>
            `;
            container.innerHTML += itemHTML;
        }
    } catch (error) {
        container.innerHTML = `<p>Error loading portfolio data: ${error.message}</p>`;
    }
}

// =========================================
// 5. GALLERY PAGE LOGIC
// =========================================
async function renderGallery(urlParams) {
    const category = urlParams.get('category');
    const itemName = urlParams.get('item');

    if (category && itemName) {
        const galleryTitle = document.getElementById('gallery-title');
        const gallery = document.getElementById('gallery');
        const downloadContainer = document.getElementById('download-container');
        
        // Step out of the /code/ folder
        const folderPath = `../${category}/${itemName}/`; 
        const baseName = itemName;

        // --- NEW LOGIC FOR JOKES OR POSTS ---
        if (category === 'jokes' || category === 'posts') {
            // Bold and underline the title
            galleryTitle.innerHTML = `<u><b>${itemName}</b></u>`;
            
            // Clear out any download buttons just in case
            if (downloadContainer) downloadContainer.innerHTML = '';

            // Fetch text description
            let textContent = "";
            try {
                const txtResponse = await fetch(`${folderPath}${baseName}.txt`);
                if (txtResponse.ok) {
                    textContent = await txtResponse.text();
                }
            } catch (e) {}

            // Inject the text and a single, large image
            // We use an onerror fallback just in case the image is named baseName.jpeg instead of baseName1.jpeg
            gallery.innerHTML = `
                <div style="max-width: 800px; margin: 0 auto;">
                    <p style="font-size: 1.1rem; line-height: 1.7; color: var(--color-text-muted); white-space: pre-wrap; margin-bottom: 2rem;">${textContent}</p>
                    <img src="${folderPath}${baseName}1.jpeg" onerror="this.src='${folderPath}${baseName}.jpeg'" alt="${baseName}" style="width: 100%; height: auto; display: block; margin: 0 auto; box-shadow: 0 10px 30px rgba(0,0,0,0.1); border-radius: 4px;">
                </div>
            `;
            return; // Exit early so it doesn't run the PDF loader below
        }

        // --- STANDARD LOGIC (PDF Viewer) ---
        galleryTitle.innerText = itemName;
        const maxImages = 350;

        try {
            const response = await fetch('directory.json');
            const data = await response.json();
            const restrictedList = data.restricted_downloads || [];
            
            if (!restrictedList.includes(itemName)) {
                const downloadBtn = document.createElement('a');
                downloadBtn.href = `${folderPath}${baseName}.pdf`;
                downloadBtn.download = `${baseName}.pdf`; 
                downloadBtn.innerText = "Download PDF";
                downloadBtn.className = "download-button"; 
                if (downloadContainer) downloadContainer.appendChild(downloadBtn);
            }
        } catch (error) {}

        function loadImagesSequentially(index) {
            if (index > maxImages) return;
            const imgTester = new Image();
            imgTester.src = `${folderPath}${baseName}${index}.jpeg`;
            imgTester.onload = function() {
                const imgElement = document.createElement('img');
                imgElement.className = 'paper-jpeg';
                imgElement.src = imgTester.src;
                gallery.appendChild(imgElement);
                loadImagesSequentially(index + 1);
            };
        }
        loadImagesSequentially(1);
    } else {
        document.getElementById('gallery-title').innerText = "Document not found.";
    }
}

// =========================================
// 6. ROLE PAGE LOGIC (SPA for Resumes & Bios)
// =========================================
async function renderRolePage(urlParams) {
    const view = urlParams.get('category') || 'biography'; 
    document.title = `Harper Fly - ${view.charAt(0).toUpperCase() + view.slice(1).replace('-', ' ')}`;
    
    const headerSection = document.getElementById('role-header-section');
    const contentSection = document.getElementById('role-content-section');

    try {
        const response = await fetch('directory.json');
        const data = await response.json();
        const profileData = data.profiles ? data.profiles[view] : null;

        if (!profileData) {
            headerSection.innerHTML = `<h1>Profile not found.</h1>`;
            return;
        }

        // 1. Render Header (Bio info)
        let headerHTML = `<h1>${profileData.title}</h1>`;
        if (profileData.subtitle) headerHTML += `<h3>${profileData.subtitle}</h3>`;
        if (profileData.bio_text) headerHTML += `<p>${profileData.bio_text}</p>`;
        
        if (profileData.headshots && profileData.headshots.length > 0) {
            headerHTML += `<div class="bio-container">`;
            profileData.headshots.forEach(img => {
                headerHTML += `<img src="${img}" class="bio-image">`;
            });
            headerHTML += `</div>`;
        }

        if (profileData.resume_pdf) {
            headerHTML += `<a href="${profileData.resume_pdf}" class="download-button" download>Download Resume</a>`;
        }
        headerSection.innerHTML = headerHTML;

        // 2. Render Content (Timeline & Skills)
        let contentHTML = "";

        if (profileData.timeline && profileData.timeline.length > 0) {
            contentHTML += `
            <div class="timeline-section">
                <h2>Timeline</h2>
                <p class="timeline-instructions">👆 Click on the photo associated with the timeline event to reveal the description.</p>
                <div class="timeline-grid">`;
            
            profileData.timeline.forEach(event => {
                contentHTML += `
                <div class="flip-card" onclick="this.classList.toggle('flipped')">
                    <div class="flip-card-inner">
                        <div class="flip-card-front">
                            <img src="${event.image || '../gallery/default.jpeg'}" alt="${event.title}" style="width:100%; height:100%; object-fit:cover; border-radius:2px;">
                        </div>
                        <div class="flip-card-back">
                            <p>${event.description}</p>
                        </div>
                    </div>
                </div>
                <div class="play-details" style="text-align: center; margin-bottom: 2rem;">
                    <h3><u>${event.tag}:</u> ${event.title}</h3>
                    <p style="color: #6B6259; margin-top: -10px;">${event.date}</p>
                </div>`;
            });
            contentHTML += `</div></div>`;
        }

        // You can add similar loops here for profileData.skills, profileData.fun_facts, etc.
        
        contentSection.innerHTML = contentHTML;

    } catch (error) {
        headerSection.innerHTML = `<p>Error loading profile data: ${error.message}</p>`;
    }
}