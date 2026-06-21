// ============================================
// DATA MANAGEMENT
// ============================================

const proposalData = {
    date: '',
    location: '',
    time: ''
};

const STORAGE_KEY = 'proposal_data';

// Load data from localStorage on page load
function loadDataFromStorage() {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
        Object.assign(proposalData, JSON.parse(stored));
    }
}

// Save data to localStorage
function saveDataToStorage() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(proposalData));
}

// ============================================
// ICON HELPERS (Lucide)
// ============================================

function refreshIcons() {
    if (window.lucide) lucide.createIcons();
}

function setIcon(el, name) {
    el.innerHTML = `<i data-lucide="${name}"></i>`;
    refreshIcons();
}



// ============================================
// SCREEN NAVIGATION
// ============================================

function showScreen(screenId) {
    // Hide all screens
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
    
    // Show target screen
    document.getElementById(screenId).classList.add('active');
}

function showHeartLoader() {
    const loader = document.getElementById('heartLoader');
    loader.classList.add('active');
    
    // Hide loader after animation completes
    setTimeout(() => {
        loader.classList.remove('active');
    }, 1500);
}

// ============================================
// LANDING SCREEN
// ============================================

const startBtn = document.getElementById('startBtn');

startBtn.addEventListener('click', () => {
    showScreen('questionScreen');
});

// ============================================
// QUESTION SCREEN
// ============================================

const yesBtn = document.getElementById('yesBtn');

yesBtn.addEventListener('click', () => {
    showHeartLoader();

    setTimeout(() => {
        showScreen('calendarScreen');
        focusInput('dateInput');
    }, 1500);
});

// The "No" button always dodges away so it can never actually be pressed
const noBtn = document.getElementById('noBtn');
const noHint = document.getElementById('noHint');
let noHintTimeout;

function showNoHint() {
    noHint.classList.add('show');
    yesBtn.classList.remove('hint-pulse');
    requestAnimationFrame(() => yesBtn.classList.add('hint-pulse'));

    clearTimeout(noHintTimeout);
    noHintTimeout = setTimeout(() => {
        noHint.classList.remove('show');
        yesBtn.classList.remove('hint-pulse');
    }, 2000);
}

function dodgeNoButton() {
    const rect = noBtn.getBoundingClientRect();
    const padding = 16;

    if (noBtn.style.position !== 'fixed') {
        noBtn.style.position = 'fixed';
        noBtn.style.left = `${rect.left}px`;
        noBtn.style.top = `${rect.top}px`;
        noBtn.style.margin = '0';
        noBtn.style.zIndex = '200';
    }

    const maxX = window.innerWidth - rect.width - padding;
    const maxY = window.innerHeight - rect.height - padding;
    const newX = padding + Math.random() * Math.max(0, maxX - padding);
    const newY = padding + Math.random() * Math.max(0, maxY - padding);

    requestAnimationFrame(() => {
        noBtn.style.left = `${newX}px`;
        noBtn.style.top = `${newY}px`;
    });

    showNoHint();
}

noBtn.addEventListener('mouseenter', dodgeNoButton);
noBtn.addEventListener('touchstart', (e) => {
    e.preventDefault();
    dodgeNoButton();
}, { passive: false });
noBtn.addEventListener('click', (e) => {
    e.preventDefault();
    dodgeNoButton();
});

// ============================================
// CALENDAR SCREEN - CURRENT MONTH VIEW
// ============================================

const today = new Date();
today.setHours(0, 0, 0, 0);

let currentYear = today.getFullYear();
let currentMonth = today.getMonth();

const monthHeader = document.getElementById('monthHeader');
const monthWeekdays = document.getElementById('monthWeekdays');
const monthDays = document.getElementById('monthDays');
const prevMonthBtn = document.getElementById('prevMonthBtn');
const nextMonthBtn = document.getElementById('nextMonthBtn');
const dateNextBtn = document.getElementById('dateNextBtn');

const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
                  'July', 'August', 'September', 'October', 'November', 'December'];
const weekdayNames = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

function renderWeekdays() {
    monthWeekdays.innerHTML = '';
    weekdayNames.forEach(day => {
        const weekday = document.createElement('div');
        weekday.className = 'month-weekday';
        weekday.textContent = day;
        monthWeekdays.appendChild(weekday);
    });
}

function renderMonthCalendar() {
    // Update month/year header
    monthHeader.textContent = `${monthNames[currentMonth]} ${currentYear}`;

    // Disable navigating to months before the current real month
    const isCurrentRealMonth = currentYear === today.getFullYear() && currentMonth === today.getMonth();
    prevMonthBtn.disabled = isCurrentRealMonth;

    // Clear previous days
    monthDays.innerHTML = '';

    const firstDay = new Date(currentYear, currentMonth, 1).getDay();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

    // Add empty cells for days before month starts
    for (let i = 0; i < firstDay; i++) {
        const emptyCell = document.createElement('div');
        emptyCell.className = 'date-cell other-month';
        monthDays.appendChild(emptyCell);
    }

    // Add days of month
    for (let day = 1; day <= daysInMonth; day++) {
        const dateCell = document.createElement('div');
        dateCell.className = 'date-cell';
        dateCell.textContent = day;

        const cellDate = new Date(currentYear, currentMonth, day);
        cellDate.setHours(0, 0, 0, 0);

        // Check if date is in past
        if (cellDate < today) {
            dateCell.classList.add('disabled');
        } else {
            // Check if today
            if (cellDate.getTime() === today.getTime()) {
                dateCell.classList.add('today');
            }

            // Check if selected
            if (proposalData.date) {
                const selectedDate = new Date(proposalData.date + 'T00:00:00');
                selectedDate.setHours(0, 0, 0, 0);
                if (cellDate.getTime() === selectedDate.getTime()) {
                    dateCell.classList.add('selected');
                }
            }

            // Add click handler
            dateCell.addEventListener('click', () => {
                selectDate(currentYear, currentMonth, day);
            });
        }

        monthDays.appendChild(dateCell);
    }
}

function selectDate(year, month, day) {
    const formattedDate = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

    proposalData.date = formattedDate;
    saveDataToStorage();

    renderMonthCalendar();
    dateNextBtn.disabled = false;
}

prevMonthBtn.addEventListener('click', () => {
    currentMonth--;
    if (currentMonth < 0) {
        currentMonth = 11;
        currentYear--;
    }
    renderMonthCalendar();
});

nextMonthBtn.addEventListener('click', () => {
    currentMonth++;
    if (currentMonth > 11) {
        currentMonth = 0;
        currentYear++;
    }
    renderMonthCalendar();
});



dateNextBtn.addEventListener('click', () => {
    if (proposalData.date) {
        showScreen('locationScreen');
        focusInput('locationInput');
    } else {
        showAlert('Please select a date', 'calendar');
    }
});

// ============================================
// LOCATION SCREEN
// ============================================

const locationInput = document.getElementById('locationInput');
const locationNextBtn = document.getElementById('locationNextBtn');

locationInput.addEventListener('change', (e) => {
    proposalData.location = e.target.value;
    saveDataToStorage();
});

locationInput.addEventListener('input', (e) => {
    proposalData.location = e.target.value;
    saveDataToStorage();
});

locationNextBtn.addEventListener('click', () => {
    if (locationInput.value.trim()) {
        showScreen('timeScreen');
    } else {
        showAlert('Please enter a location', 'map-pin');
    }
});

// Keyboard Enter support
locationInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && locationInput.value.trim()) {
        locationNextBtn.click();
    }
});

// ============================================
// TIME SCREEN
// ============================================

const timeButtons = document.querySelectorAll('.time-btn');
const timeNextBtn = document.getElementById('timeNextBtn');

timeButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        // Remove active class from all buttons
        timeButtons.forEach(b => b.classList.remove('active'));
        
        // Add active class to clicked button
        btn.classList.add('active');
        
        // Save selected time
        proposalData.time = btn.dataset.time;
        saveDataToStorage();
    });
});

timeNextBtn.addEventListener('click', () => {
    if (proposalData.time) {
        showHeartLoader();
        
        setTimeout(() => {
            displayFinalScreen();
            showScreen('finalScreen');
        }, 1500);
    } else {
        showAlert('Please select a time', 'clock');
    }
});

// ============================================
// FINAL SCREEN
// ============================================

function formatDate(dateString) {
    const options = { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    };
    return new Date(dateString + 'T00:00:00').toLocaleDateString('en-US', options);
}

function getTimeIcon(time) {
    const timeMap = {
        'evening': 'sunset'
    };
    return timeMap[time] || '';
}

function getTimeLabel(time) {
    const timeMap = {
        'morning': 'morning',
        'evening': 'evening',
        'night': 'night'
    };
    return timeMap[time] || '';
}

function displayFinalScreen() {
    const dateDisplay = document.getElementById('dateDisplay');
    const locationDisplay = document.getElementById('locationDisplay');
    const timeDisplay = document.getElementById('timeDisplay');

    const formattedDate = formatDate(proposalData.date);
    const timeIcon = getTimeIcon(proposalData.time);
    const timeLabel = getTimeLabel(proposalData.time);

    dateDisplay.innerHTML = `<i data-lucide="calendar"></i> ${formattedDate}`;
    locationDisplay.innerHTML = `<i data-lucide="map-pin"></i> ${proposalData.location}`;
    timeDisplay.innerHTML = `${timeIcon ? `<i data-lucide="${timeIcon}"></i> ` : ''}${timeLabel.charAt(0).toUpperCase() + timeLabel.slice(1)}`;
    refreshIcons();

    // Save this response to the list
    saveResponse(proposalData);
}

const resetBtn = document.getElementById('resetBtn');

resetBtn.addEventListener('click', () => {
    // Reset data
    proposalData.date = '';
    proposalData.location = '';
    proposalData.time = '';
    saveDataToStorage();
    
    // Reset form inputs
    locationInput.value = '';
    timeButtons.forEach(btn => btn.classList.remove('active'));
    
    // Reset calendar
    currentYear = today.getFullYear();
    currentMonth = today.getMonth();
    renderMonthCalendar();
    dateNextBtn.disabled = true;
    
    // Return to landing screen
    showScreen('landingScreen');
});

// ============================================
// UTILITY FUNCTIONS
// ============================================

function focusInput(inputId) {
    setTimeout(() => {
        document.getElementById(inputId).focus();
    }, 300);
}

function showAlert(message, iconName) {
    // Create a simple alert alternative (better UX than window.alert)
    const alertDiv = document.createElement('div');
    alertDiv.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: white;
        padding: 1.5rem 2rem;
        border-radius: 15px;
        box-shadow: 0 8px 30px rgba(230, 57, 80, 0.3);
        z-index: 10000;
        font-size: 1.1rem;
        max-width: 90%;
        text-align: center;
        animation: slideInDown 0.3s ease;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 0.6rem;
    `;
    alertDiv.innerHTML = iconName
        ? `<i data-lucide="${iconName}"></i> <span>${message}</span>`
        : `<span>${message}</span>`;

    document.body.appendChild(alertDiv);
    refreshIcons();

    setTimeout(() => {
        alertDiv.style.animation = 'slideInUp 0.3s ease reverse';
        setTimeout(() => alertDiv.remove(), 300);
    }, 2000);
}

// ============================================
// RESPONSES MANAGEMENT
// ============================================

const RESPONSES_STORAGE_KEY = 'proposal_responses';
let allResponses = [];

function loadAllResponses() {
    const stored = localStorage.getItem(RESPONSES_STORAGE_KEY);
    if (stored) {
        try {
            allResponses = JSON.parse(stored);
        } catch (e) {
            allResponses = [];
        }
    }
}

function saveResponse(data) {
    const response = {
        id: Date.now(),
        date: data.date,
        location: data.location,
        time: data.time,
        timestamp: new Date().toISOString()
    };
    
    allResponses.push(response);
    localStorage.setItem(RESPONSES_STORAGE_KEY, JSON.stringify(allResponses));
    return response;
}

function deleteResponse(id) {
    allResponses = allResponses.filter(r => r.id !== id);
    localStorage.setItem(RESPONSES_STORAGE_KEY, JSON.stringify(allResponses));
    renderResponses();
}

function clearAllResponses() {
    if (confirm('Are you sure? This will delete ALL responses!')) {
        allResponses = [];
        localStorage.setItem(RESPONSES_STORAGE_KEY, '[]');
        renderResponses();
    }
}

function formatDate(dateString) {
    const options = { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    };
    return new Date(dateString + 'T00:00:00').toLocaleDateString('en-US', options);
}

function getTimeLabel(time) {
    const timeMap = {
        'morning': 'Morning',
        'evening': 'Evening',
        'night': 'Night'
    };
    return timeMap[time] || '';
}

function formatTime(timestamp) {
    const date = new Date(timestamp);
    return date.toLocaleString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        hour: '2-digit', 
        minute: '2-digit'
    });
}

function renderResponses() {
    const responsesList = document.getElementById('responsesList');

    if (allResponses.length === 0) {
        responsesList.innerHTML = '<p class="no-responses"><i data-lucide="heart-crack"></i> No responses yet</p>';
        refreshIcons();
        return;
    }

    responsesList.innerHTML = allResponses.map((response, index) => {
        const formattedDate = formatDate(response.date);
        const timeIcon = getTimeIcon(response.time);
        const timeLabel = getTimeLabel(response.time);
        const formattedTime = formatTime(response.timestamp);

        return `
            <div class="response-item">
                <button class="response-delete-btn" onclick="deleteResponse(${response.id})" title="Delete"><i data-lucide="x"></i></button>
                <div class="response-number">Response #${index + 1}</div>

                <div class="response-details">
                    <div class="response-detail">
                        <div class="response-detail-icon"><i data-lucide="calendar"></i></div>
                        <div class="response-detail-content">
                            <div class="response-detail-label">Date</div>
                            <div class="response-detail-value">${formattedDate}</div>
                        </div>
                    </div>

                    <div class="response-detail">
                        <div class="response-detail-icon"><i data-lucide="map-pin"></i></div>
                        <div class="response-detail-content">
                            <div class="response-detail-label">Location</div>
                            <div class="response-detail-value">${response.location}</div>
                        </div>
                    </div>

                    <div class="response-detail">
                        <div class="response-detail-icon"><i data-lucide="${timeIcon}"></i></div>
                        <div class="response-detail-content">
                            <div class="response-detail-label">Time</div>
                            <div class="response-detail-value">${timeLabel}</div>
                        </div>
                    </div>
                </div>

                <div class="response-timestamp">Submitted: ${formattedTime}</div>
            </div>
        `;
    }).join('');
    refreshIcons();
}

// Event listeners for responses view
document.getElementById('closeResponses').addEventListener('click', () => {
    showScreen('landingScreen');
});

document.getElementById('clearResponsesBtn').addEventListener('click', clearAllResponses);

document.addEventListener('DOMContentLoaded', () => {
    loadDataFromStorage();
    loadAllResponses();
    
    // Initialize calendar
    renderWeekdays();
    renderMonthCalendar();
    
    // If date selected, enable next button
    if (proposalData.date) {
        dateNextBtn.disabled = false;
    } else {
        dateNextBtn.disabled = true;
    }
    
    // If data exists in storage, populate form
    if (proposalData.location) {
        locationInput.value = proposalData.location;
    }
    if (proposalData.time) {
        const activeBtn = document.querySelector(
            `.time-btn[data-time="${proposalData.time}"]`
        );
        if (activeBtn) {
            activeBtn.classList.add('active');
        }
    }
    
    // Triple-click landing text to view responses (secret)
    const landingText = document.querySelector('.landing-text');
    if (landingText) {
        landingText.style.cursor = 'pointer';
        landingText.addEventListener('click', function() {
            this.dataset.clicks = (parseInt(this.dataset.clicks) || 0) + 1;
            
            if (this.dataset.clicks === 3) {
                showScreen('responsesScreen');
                renderResponses();
                this.dataset.clicks = 0;
            }
            
            // Reset counter after 1 second
            setTimeout(() => {
                this.dataset.clicks = 0;
            }, 1000);
        });
    }
    
    // Prevent zoom on double tap
    document.addEventListener('touchstart', function() {}, { passive: true });

    // Render all static Lucide icons in the markup
    refreshIcons();
});

// ============================================
// PERFORMANCE OPTIMIZATION
// ============================================

// Smooth scrolling for better mobile experience
if ('scrollRestoration' in window.history) {
    window.history.scrollRestoration = 'manual';
}

// Prevent body scroll when modal/loader is shown
function disableScroll() {
    document.body.style.overflow = 'hidden';
}

function enableScroll() {
    document.body.style.overflow = 'auto';
}

// Update scroll state when showing/hiding loader
const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
        if (mutation.target.id === 'heartLoader') {
            if (mutation.target.classList.contains('active')) {
                disableScroll();
            } else {
                enableScroll();
            }
        }
    });
});

observer.observe(document.getElementById('heartLoader'), {
    attributes: true,
    attributeFilter: ['class']
});

// ============================================
// RESPONSIVE LISTENER
// ============================================

// Adjust spacing on orientation change
window.addEventListener('orientationchange', () => {
    setTimeout(() => {
        window.scrollTo(0, 0);
    }, 300);
});

// Keyboard support for better accessibility
document.addEventListener('keydown', (e) => {
    // Ctrl+Shift+R to view responses (secret shortcut)
    if (e.ctrlKey && e.shiftKey && e.key === 'R') {
        e.preventDefault();
        showScreen('responsesScreen');
        renderResponses();
    }
    
    if (e.key === 'Escape') {
        // Could add modal/escape functionality here
    }
});