// app.js — Home screen: renders gallery from students.js

(function() {
    function getInitials(name) {
        if (!name) return '?';
        return name
            .split(' ')
            .map(w => w.charAt(0))
            .join('')
            .toUpperCase()
            .slice(0, 3);
    }

    function shuffleArray(arr) {
        for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
        return arr;
    }

    function renderGallery() {
        const grid = document.getElementById('studentGrid');
        if (!grid) return;

        const pool = [];
        for (let i = 0; i < 2; i++) pool.push('large');
        for (let i = 0; i < 2; i++) pool.push('tall');
        for (let i = 0; i < 4; i++) pool.push('medium');
        for (let i = 0; i < 4; i++) pool.push('small');
        shuffleArray(pool);

        let html = '';
        students.forEach((student, index) => {
            const size = pool[index % pool.length];
            const initials = getInitials(student.name);
            // Build image with lazy loading and error fallback
            let imgHtml;
            if (student.image) {
                imgHtml = `<img src="${student.image}" alt="${student.name}" class="student-card__image" loading="lazy" onerror="this.style.display='none'; this.parentElement.innerHTML='<div class=\\'student-card__placeholder\\'><span>${initials}</span></div>';">`;
            } else {
                imgHtml = `<div class="student-card__placeholder"><span>${initials}</span></div>`;
            }
            html += `
                <a href="profile.html?id=${student.id}" class="student-card student-card--${size}" data-index="${index}">
                    <div class="student-card__image-wrapper">${imgHtml}</div>
                    <div class="student-card__body"><h3 class="student-card__name">${student.name}</h3></div>
                </a>
            `;
        });

        grid.innerHTML = html;
    }

    if (typeof students !== 'undefined') {
        renderGallery();
    } else {
        console.error('students.js not loaded.');
    }
})();