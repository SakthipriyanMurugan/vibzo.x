// Initialize Lucide Icons
document.addEventListener("DOMContentLoaded", () => {
    lucide.createIcons();
    initScrollAnimation();
    initStatsCounter();
    init3DParallaxBackground();
});

// Mobile Menu Toggle
function toggleMobileMenu() {
    const mobileNav = document.getElementById("mobileNav");
    const menuBtn = document.querySelector(".mobile-menu-btn");
    let menuBtnIcon = document.getElementById("menu-btn-icon");
    
    if (!mobileNav) return;

    mobileNav.classList.toggle("open");
    
    if (mobileNav.classList.contains("open")) {
        if (menuBtnIcon) menuBtnIcon.setAttribute("data-lucide", "x");
        document.body.style.overflow = "hidden";
    } else {
        if (menuBtnIcon) menuBtnIcon.setAttribute("data-lucide", "menu");
        // Keep scroll locked if a modal is still open
        if (!document.querySelector(".modal-overlay.open")) {
            document.body.style.overflow = "";
        }
    }

    if (typeof lucide !== "undefined") {
        lucide.createIcons();
        // Lucide may replace the node; keep a stable id for the next toggle
        if (menuBtn) {
            const icon = menuBtn.querySelector("[data-lucide], svg");
            if (icon && !icon.id) icon.id = "menu-btn-icon";
        }
    }
}

// Modal State Management
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add("open");
        document.body.style.overflow = "hidden"; // Disable background scrolling
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove("open");
        document.body.style.overflow = ""; // Re-enable background scrolling
    }
}

// Close modal if user clicks outside of it
window.addEventListener("click", (event) => {
    if (event.target.classList.contains("modal-overlay")) {
        event.target.classList.remove("open");
        document.body.style.overflow = "";
    }
});

// Open quote modal pre-filled with specific service
function openQuoteWithService(serviceName) {
    openModal("quoteModal");
    const serviceSelect = document.getElementById("quoteService");
    if (serviceSelect) {
        serviceSelect.value = serviceName;
    }
}

// Open course registration modal pre-filled with specific course
function openCourseWithName(courseName) {
    openModal("courseModal");
    const courseSelect = document.getElementById("courseSelect");
    if (courseSelect) {
        courseSelect.value = courseName;
    }
}

// Submit Form Handler via AJAX
async function submitForm(event, endpoint, formId, modalId) {
    event.preventDefault();
    
    const form = document.getElementById(formId);
    const submitBtn = form.querySelector("button[type='submit']");
    const originalBtnText = submitBtn.textContent;
    
    // Disable button & show spinner/loading text
    submitBtn.disabled = true;
    submitBtn.textContent = "Submitting...";
    
    const formData = new FormData(form);
    const data = {};
    formData.forEach((value, key) => {
        data[key] = value;
    });
    
    try {
        const response = await fetch(endpoint, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
        });
        
        const result = await response.json();
        
        if (response.ok && result.status === "success") {
            showToast(result.message || "Submission successful!", "success");
            
            // Redirect to WhatsApp with the filled details
            sendToWhatsApp(formId, data);
            
            form.reset();
            if (modalId) {
                closeModal(modalId);
            }
        } else {
            showToast(result.message || "Something went wrong.", "error");
        }
    } catch (error) {
        console.error("Submission error:", error);
        showToast("Server connection error. Please try again.", "error");
    } finally {
        // Re-enable button
        submitBtn.disabled = false;
        submitBtn.textContent = originalBtnText;
    }
}

// Format and send form details to WhatsApp
function sendToWhatsApp(formId, data) {
    const phoneNumber = "916379474460";
    let messageText = "";

    if (formId === "quoteForm") {
        messageText = `🚀 *New Quote Request - Vibzo Technologies* 🚀\n\n` +
                      `👤 *Name:* ${data.name || 'N/A'}\n` +
                      `📧 *Email:* ${data.email || 'N/A'}\n` +
                      `📞 *Phone:* ${data.phone || 'N/A'}\n` +
                      `🛠️ *Service:* ${data.service || 'N/A'}\n` +
                      `💰 *Estimated Budget:* ${data.budget || 'N/A'}\n` +
                      `📝 *Project Details:* ${data.message || 'N/A'}`;
    } else if (formId === "projectForm") {
        messageText = `💼 *New Project Launched - Vibzo Technologies* 💼\n\n` +
                      `👤 *Name:* ${data.name || 'N/A'}\n` +
                      `📧 *Email:* ${data.email || 'N/A'}\n` +
                      `📞 *Phone:* ${data.phone || 'N/A'}\n` +
                      `🖥️ *Project Type:* ${data.project_type || 'N/A'}\n` +
                      `💰 *Budget Range:* ${data.budget || 'N/A'}\n` +
                      `📅 *Timeline:* ${data.timeline || 'N/A'}\n` +
                      `📝 *Details:* ${data.details || 'N/A'}`;
    } else if (formId === "courseForm") {
        messageText = `🎓 *New Course Enrollment - Vibzo Technologies* 🎓\n\n` +
                      `👤 *Student Name:* ${data.name || 'N/A'}\n` +
                      `📧 *Email:* ${data.email || 'N/A'}\n` +
                      `📞 *Phone:* ${data.phone || 'N/A'}\n` +
                      `📚 *Course:* ${data.course_name || 'N/A'}\n` +
                      `⏰ *Batch Preference:* ${data.batch_preference || 'N/A'}\n` +
                      `📝 *Inquiry Details:* ${data.message || 'N/A'}`;
    } else if (formId === "contactForm") {
        messageText = `✉️ *New Contact Message - Vibzo Technologies* ✉️\n\n` +
                      `👤 *Name:* ${data.name || 'N/A'}\n` +
                      `📧 *Email:* ${data.email || 'N/A'}\n` +
                      `📞 *Phone:* ${data.phone || 'N/A'}\n` +
                      `📝 *Message:* ${data.message || 'N/A'}`;
    } else {
        messageText = `New Form Submission from Vibzo Technologies:\n` + JSON.stringify(data, null, 2);
    }

    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(messageText)}`;
    
    // Attempt to open in a new window/tab
    const newWindow = window.open(whatsappUrl, '_blank');
    if (!newWindow || newWindow.closed || typeof newWindow.closed === 'undefined') {
        // If blocked by popup blocker, redirect current window
        window.location.href = whatsappUrl;
    }
}

// Toast Notifications System
function showToast(message, type = "success") {
    const container = document.getElementById("toastContainer");
    
    // Create toast element
    const toast = document.createElement("div");
    toast.className = `toast ${type}`;
    
    // Select matching icon
    const iconName = type === "success" ? "check-circle" : "alert-circle";
    
    toast.innerHTML = `
        <i data-lucide="${iconName}" class="toast-icon"></i>
        <span>${message}</span>
    `;
    
    container.appendChild(toast);
    lucide.createIcons();
    
    // Trigger slide-in animation
    setTimeout(() => {
        toast.classList.add("show");
    }, 50);
    
    // Automatically remove after 4 seconds
    setTimeout(() => {
        toast.classList.remove("show");
        // Remove from DOM after transition completes
        setTimeout(() => {
            toast.remove();
        }, 400);
    }, 4000);
}

// Statistics Counters Animation
function initStatsCounter() {
    const statsSection = document.querySelector(".why-choose-section");
    const statNums = document.querySelectorAll(".stat-num");
    
    if (!statsSection || statNums.length === 0) return;
    
    let animated = false;
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !animated) {
                animateCounters();
                animated = true;
                observer.unobserve(statsSection);
            }
        });
    }, { threshold: 0.2 });
    
    observer.observe(statsSection);
    
    function animateCounters() {
        statNums.forEach(num => {
            const target = parseInt(num.getAttribute("data-target"), 10);
            const duration = 1500; // 1.5 seconds animation
            const stepTime = Math.max(Math.floor(duration / target), 15);
            let current = 0;
            
            const timer = setInterval(() => {
                current += Math.ceil(target / (duration / stepTime));
                if (current >= target) {
                    num.textContent = target;
                    clearInterval(timer);
                } else {
                    num.textContent = current;
                }
            }, stepTime);
        });
    }
}

// Smooth scrolling header adjustment
function initScrollAnimation() {
    const header = document.querySelector(".header");
    window.addEventListener("scroll", () => {
        if (window.scrollY > 50) {
            header.style.padding = "0.75rem 0";
            header.style.boxShadow = "0 10px 30px rgba(0, 0, 0, 0.4)";
        } else {
            header.style.padding = "1.25rem 0";
            header.style.boxShadow = "none";
        }
    });
}

// Interactive 3D Parallax effect for Hero background (desktop only)
function init3DParallaxBackground() {
    const heroSection = document.getElementById("heroSection");
    const heroBg = document.getElementById("heroBg");
    
    if (!heroSection || !heroBg) return;

    // Skip parallax on touch / narrow screens to keep mobile layout stable
    const canParallax = () =>
        window.matchMedia("(hover: hover) and (pointer: fine)").matches &&
        window.innerWidth > 768;

    if (!canParallax()) return;
    
    heroSection.addEventListener("mousemove", (e) => {
        if (!canParallax()) {
            heroBg.style.transform = "";
            return;
        }

        const width = heroSection.offsetWidth;
        const height = heroSection.offsetHeight;
        
        // Calculate mouse position relative to center of hero section (-0.5 to 0.5)
        const mouseX = (e.clientX / width) - 0.5;
        const mouseY = (e.clientY / height) - 0.5;
        
        // Tilt variables
        const maxMove = 30; // max pixels to translate
        const maxRotate = 10; // max degrees to rotate
        
        const moveX = mouseX * maxMove;
        const moveY = mouseY * maxMove;
        
        const rotateY = mouseX * maxRotate;
        const rotateX = -mouseY * maxRotate; // invert Y rotation
        
        // Apply 3D transform to background layer
        heroBg.style.transform = `translate3d(${moveX}px, ${moveY}px, 0) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.08)`;
    });
    
    // Reset background orientation when mouse leaves
    heroSection.addEventListener("mouseleave", () => {
        heroBg.style.transform = `translate3d(0px, 0px, 0px) rotateX(0deg) rotateY(0deg) scale(1)`;
        heroBg.style.transition = "transform 0.5s ease-out";
    });

    // Re-enable smooth transition only on mouseenter to avoid lag during move
    heroSection.addEventListener("mouseenter", () => {
        if (!canParallax()) return;
        heroBg.style.transition = "transform 0.1s ease-out";
    });
}
