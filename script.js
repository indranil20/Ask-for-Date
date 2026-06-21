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
// AUDIO MANAGEMENT
// ============================================

const bgMusic = document.getElementById('bgMusic');
const musicToggle = document.getElementById('musicToggle');
let isMusicPlaying = false;

// Create a simple romantic audio tone
function initializeAudio() {
    // Create a simple sine wave tone (romantic background music simulation)
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    
    // Create oscillator for a soft tone
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = 220; // A3 note
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(0, audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.03, audioContext.currentTime + 0.1);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 2);
}

function startMusic() {
    if (!isMusicPlaying) {
        try {
            // Use Web Audio API to create soft romantic tone
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            
            // Loop oscillator
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            const filter = audioContext.createBiquadFilter();
            
            oscillator.connect(filter);
            filter.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.frequency.value = 220;
            oscillator.type = 'sine';
            
            filter.type = 'lowpass';
            filter.frequency.value = 440;
            
            gainNode.gain.setValueAtTime(0.02, audioContext.currentTime);
            
            oscillator.start(audioContext.currentTime);
            
            // Stop after experience ends (or keep looping)
            // oscillator.stop(audioContext.currentTime + 120);
            
            isMusicPlaying = true;
            updateMusicToggle();
        } catch (e) {
            console.log('Audio context not available, continuing without audio');
        }
    }
}

function toggleMusic() {
    if (!isMusicPlaying) {
        startMusic();
    } else {
        // In a real scenario, you'd stop the audio here
        isMusicPlaying = false;
        updateMusicToggle();
    }
}

function updateMusicToggle() {
    musicToggle.textContent = isMusicPlaying ? '🔊' : '🔇';
}

musicToggle.addEventListener('click', toggleMusic);

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
    startMusic();
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

// ============================================
// CALENDAR SCREEN
// ============================================

let currentCalendarDate = new Date();

const prevMonthBtn = document.getElementById('prevMonth');
const nextMonthBtn = document.getElementById('nextMonth');
const monthYearDisplay = document.getElementById('monthYear');
const calendarDaysContainer = document.getElementById('calendarDays');
const selectedDateDisplay = document.getElementById('selectedDateDisplay');
const dateNextBtn = document.getElementById('dateNextBtn');

function renderCalendar() {
    const year = currentCalendarDate.getFullYear();
    const month = currentCalendarDate.getMonth();
    
    // Update header
    const monthNames = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];
    monthYearDisplay.textContent = `${monthNames[month]} ${year}`;
    
    // Clear previous days
    calendarDaysContainer.innerHTML = '';
    
    // Get first day of month and number of days
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();
    
    // Today's date
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Add previous month's days (grayed out)
    for (let i = firstDay - 1; i >= 0; i--) {
        const dayDiv = document.createElement('div');
        dayDiv.className = 'calendar-day other-month';
        dayDiv.textContent = daysInPrevMonth - i;
        calendarDaysContainer.appendChild(dayDiv);
    }
    
    // Add current month's days
    for (let day = 1; day <= daysInMonth; day++) {
        const dayDiv = document.createElement('div');
        dayDiv.className = 'calendar-day';
        dayDiv.textContent = day;
        
        const currentDate = new Date(year, month, day);
        currentDate.setHours(0, 0, 0, 0);
        
        // Check if date is in the past
        if (currentDate < today) {
            dayDiv.classList.add('disabled');
        } else {
            // Check if it's today
            if (currentDate.getTime() === today.getTime()) {
                dayDiv.classList.add('today');
            }
            
            // Check if it's selected
            if (proposalData.date) {
                const selectedDateObj = new Date(proposalData.date);
                selectedDateObj.setHours(0, 0, 0, 0);
                if (currentDate.getTime() === selectedDateObj.getTime()) {
                    dayDiv.classList.add('selected');
                }
            }
            
            // Add click handler
            dayDiv.addEventListener('click', () => selectDate(year, month, day));
        }
        
        calendarDaysContainer.appendChild(dayDiv);
    }
    
    // Add next month's days (grayed out)
    const totalCells = calendarDaysContainer.children.length;
    const remainingCells = 42 - totalCells; // 6 rows × 7 days
    for (let day = 1; day <= remainingCells; day++) {
        const dayDiv = document.createElement('div');
        dayDiv.className = 'calendar-day other-month';
        dayDiv.textContent = day;
        calendarDaysContainer.appendChild(dayDiv);
    }
}

function selectDate(year, month, day) {
    const selectedDate = new Date(year, month, day);
    
    // Format as YYYY-MM-DD for storage
    const formattedDate = selectedDate.toISOString().split('T')[0];
    proposalData.date = formattedDate;
    saveDataToStorage();
    
    // Update display
    updateSelectedDateDisplay();
    
    // Re-render calendar to show selection
    renderCalendar();
    
    // Enable next button
    dateNextBtn.disabled = false;
}

function updateSelectedDateDisplay() {
    if (proposalData.date) {
        const dateObj = new Date(proposalData.date + 'T00:00:00');
        const options = { weekday: 'long', month: 'long', day: 'numeric' };
        const formattedDate = dateObj.toLocaleDateString('en-US', options);
        selectedDateDisplay.innerHTML = `<p>💕 ${formattedDate} 💕</p>`;
    } else {
        selectedDateDisplay.innerHTML = '<p>📅 Pick a date for our special day ✨</p>';
    }
}

prevMonthBtn.addEventListener('click', () => {
    currentCalendarDate.setMonth(currentCalendarDate.getMonth() - 1);
    renderCalendar();
});

nextMonthBtn.addEventListener('click', () => {
    currentCalendarDate.setMonth(currentCalendarDate.getMonth() + 1);
    renderCalendar();
});

dateNextBtn.addEventListener('click', () => {
    if (proposalData.date) {
        showScreen('locationScreen');
        focusInput('locationInput');
    } else {
        showAlert('Please select a date 📅');
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
        showAlert('Please enter a location 📍');
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
        showAlert('Please select a time ⏰');
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

function getTimeEmoji(time) {
    const timeMap = {
        'morning': '🌅',
        'evening': '🌇',
        'night': '🌙'
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
    const timeEmoji = getTimeEmoji(proposalData.time);
    const timeLabel = getTimeLabel(proposalData.time);
    
    dateDisplay.innerHTML = `📅 ${formattedDate}`;
    locationDisplay.innerHTML = `📍 ${proposalData.location}`;
    timeDisplay.innerHTML = `${timeEmoji} ${timeLabel.charAt(0).toUpperCase() + timeLabel.slice(1)}`;
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
    currentCalendarDate = new Date();
    renderCalendar();
    updateSelectedDateDisplay();
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

function showAlert(message) {
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
        box-shadow: 0 8px 30px rgba(255, 107, 157, 0.3);
        z-index: 10000;
        font-size: 1.1rem;
        max-width: 90%;
        text-align: center;
        animation: slideInDown 0.3s ease;
    `;
    alertDiv.textContent = message;
    
    document.body.appendChild(alertDiv);
    
    setTimeout(() => {
        alertDiv.style.animation = 'slideInUp 0.3s ease reverse';
        setTimeout(() => alertDiv.remove(), 300);
    }, 2000);
}

// ============================================
// INITIALIZATION
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    loadDataFromStorage();
    
    // Initialize calendar
    renderCalendar();
    updateSelectedDateDisplay();
    
    // If calendar screen is shown, set button state
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
    
    // Prevent zoom on double tap
    document.addEventListener('touchstart', function() {}, { passive: true });
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
    if (e.key === 'Escape') {
        // Could add modal/escape functionality here
    }
});
