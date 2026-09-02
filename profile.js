// profile.js — Updated for new visual design, keeps all functionality

(function() {
    // DOM refs
    const bg = document.getElementById('profileBg');
    const portrait = document.getElementById('profilePortrait');
    const nameEl = document.getElementById('profileName');
    const roleEl = document.getElementById('profileRole');
    const introEl = document.getElementById('profileIntro');
    const classEl = document.getElementById('profileClass');
    const rollEl = document.getElementById('profileRoll');
    const totalMarksEl = document.getElementById('profileTotalMarks');
    const obtainedMarksEl = document.getElementById('profileObtainedMarks');
    const percentageEl = document.getElementById('profilePercentage');
    const indexEl = document.getElementById('profileIndex');
    const layout = document.getElementById('profileLayout');
    const backBtn = document.getElementById('profileBack');

    let currentStudent = null;
    let currentIndex = -1;
    let typingTimer = null;
    let typeResolve = null;

    // Helpers
    function getInitials(name) {
        if (!name) return '?';
        return name.split(' ').map(w => w.charAt(0)).join('').toUpperCase().slice(0, 3);
    }

    function cancelTyping() {
        if (typingTimer) {
            clearInterval(typingTimer);
            typingTimer = null;
        }
        roleEl.classList.remove('typing');
        if (typeResolve) {
            typeResolve();
            typeResolve = null;
        }
    }

    function typeText(element, text, speed) {
        speed = speed || 40;
        return new Promise(function(resolve) {
            element.textContent = '';
            element.classList.add('typing');
            let i = 0;
            typingTimer = setInterval(function() {
                if (i < text.length) {
                    element.textContent += text.charAt(i);
                    i++;
                } else {
                    clearInterval(typingTimer);
                    element.classList.remove('typing');
                    resolve();
                }
            }, speed);
            typeResolve = resolve;
        });
    }

    // Update background with blurred portrait
    function updateBackground(student) {
        if (student.image) {
            bg.style.backgroundImage = `url(${student.image})`;
            bg.classList.add('has-image');
        } else {
            bg.style.backgroundImage = '';
            bg.classList.remove('has-image');
        }
    }

    // Reveal sequence
    function revealProfile(student) {
        cancelTyping();
        roleEl.textContent = '';
        introEl.classList.remove('visible');
        document.getElementById('profileAcademic').classList.remove('visible');

        // Name and portrait
        nameEl.textContent = student.name;
        if (student.image) {
            portrait.innerHTML = `<img src="${student.image}" alt="${student.name}">`;
        } else {
            const initials = getInitials(student.name);
            portrait.innerHTML = `<div class="placeholder">${initials}</div>`;
        }

        // Background
        updateBackground(student);

        // Index
        const total = students.length;
        const num = currentIndex + 1;
        indexEl.textContent = `${String(num).padStart(2, '0')} / ${String(total).padStart(2, '0')}`;

        // Academic placeholders (will be filled later)
        classEl.textContent = student.className || '—';
        rollEl.textContent = student.rollNumber || 'Not provided';
        totalMarksEl.textContent = student.totalMarks !== null ? student.totalMarks : '—';
        obtainedMarksEl.textContent = student.obtainedMarks !== null ? student.obtainedMarks : '—';
        let pctText = '—';
        if (student.totalMarks !== null && student.obtainedMarks !== null && student.totalMarks > 0) {
            const pct = (student.obtainedMarks / student.totalMarks) * 100;
            pctText = pct.toFixed(2) + '%';
        }
        percentageEl.textContent = pctText;

        // Sequence
        setTimeout(function() {
            typeText(roleEl, student.role || 'No role', 50).then(function() {
                setTimeout(function() {
                    introEl.textContent = student.intro || '';
                    introEl.classList.add('visible');
                    setTimeout(function() {
                        document.getElementById('profileAcademic').classList.add('visible');
                    }, 400);
                }, 300);
            });
        }, 500);
    }

    // Load student from URL
    function loadStudentFromURL() {
        const params = new URLSearchParams(window.location.search);
        const id = params.get('id');
        if (!id) {
            window.location.href = 'list.html';
            return;
        }
        const student = students.find(s => s.id === id);
        if (!student) {
            window.location.href = 'list.html';
            return;
        }
        currentStudent = student;
        currentIndex = students.indexOf(student);
        revealProfile(student);
    }

    // Navigation
    function navigate(direction) {
        if (currentIndex === -1) return;
        const newIndex = currentIndex + direction;
        if (newIndex < 0 || newIndex >= students.length) return;
        const newStudent = students[newIndex];

        // Slide out
        const slideClass = direction === 1 ? 'slide-left' : 'slide-right';
        layout.className = 'profile-layout ' + slideClass;

        setTimeout(function() {
            // Update URL
            const url = new URL(window.location);
            url.searchParams.set('id', newStudent.id);
            window.history.pushState({}, '', url);

            // Update current
            currentStudent = newStudent;
            currentIndex = newIndex;

            // Hide academic and intro for next reveal
            document.getElementById('profileAcademic').classList.remove('visible');
            introEl.classList.remove('visible');
            roleEl.textContent = '';

            // Update name and portrait immediately
            nameEl.textContent = newStudent.name;
            if (newStudent.image) {
                portrait.innerHTML = `<img src="${newStudent.image}" alt="${newStudent.name}">`;
            } else {
                const initials = getInitials(newStudent.name);
                portrait.innerHTML = `<div class="placeholder">${initials}</div>`;
            }
            updateBackground(newStudent);

            // Update index
            const total = students.length;
            const num = currentIndex + 1;
            indexEl.textContent = `${String(num).padStart(2, '0')} / ${String(total).padStart(2, '0')}`;

            // Academic placeholders
            classEl.textContent = newStudent.className || '—';
            rollEl.textContent = newStudent.rollNumber || 'Not provided';
            totalMarksEl.textContent = newStudent.totalMarks !== null ? newStudent.totalMarks : '—';
            obtainedMarksEl.textContent = newStudent.obtainedMarks !== null ? newStudent.obtainedMarks : '—';
            let pctText = '—';
            if (newStudent.totalMarks !== null && newStudent.obtainedMarks !== null && newStudent.totalMarks > 0) {
                const pct = (newStudent.obtainedMarks / newStudent.totalMarks) * 100;
                pctText = pct.toFixed(2) + '%';
            }
            percentageEl.textContent = pctText;

            // Slide in and reveal
            layout.className = 'profile-layout slide-center';
            setTimeout(function() {
                revealProfile(newStudent);
            }, 150);
        }, 400);
    }

    // Event listeners
    backBtn.addEventListener('click', function() {
        window.location.href = 'list.html';
    });

    document.addEventListener('keydown', function(e) {
        if (e.key === 'ArrowLeft') { navigate(-1); e.preventDefault(); }
        else if (e.key === 'ArrowRight') { navigate(1); e.preventDefault(); }
        else if (e.key === 'Escape') { window.location.href = 'list.html'; e.preventDefault(); }
    });

    // Swipe (touch & mouse)
    let startX = 0, startY = 0, isDragging = false;
    const threshold = 30;

    function onPointerDown(e) {
        const point = e.touches ? e.touches[0] : e;
        startX = point.clientX;
        startY = point.clientY;
        isDragging = false;
        e.preventDefault();
    }

    function onPointerMove(e) {
        if (!startX) return;
        const point = e.touches ? e.touches[0] : e;
        const dx = point.clientX - startX;
        const dy = point.clientY - startY;
        if (Math.abs(dx) > 10 || Math.abs(dy) > 10) isDragging = true;
    }

    function onPointerUp(e) {
        if (!startX) return;
        const point = e.changedTouches ? e.changedTouches[0] : e;
        const dx = point.clientX - startX;
        const dy = point.clientY - startY;
        if (isDragging && Math.abs(dx) >= threshold && Math.abs(dx) > Math.abs(dy)) {
            navigate(dx < 0 ? 1 : -1);
        }
        startX = 0; startY = 0; isDragging = false;
    }

    const container = document.querySelector('.profile-container');
    container.addEventListener('pointerdown', onPointerDown);
    container.addEventListener('pointermove', onPointerMove);
    container.addEventListener('pointerup', onPointerUp);
    container.addEventListener('touchstart', onPointerDown, { passive: false });
    container.addEventListener('touchmove', onPointerMove, { passive: false });
    container.addEventListener('touchend', onPointerUp);

    window.addEventListener('popstate', function() {
        loadStudentFromURL();
    });

    // Initialize
    if (typeof students !== 'undefined') {
        loadStudentFromURL();
    } else {
        console.error('students.js not loaded.');
    }
})();