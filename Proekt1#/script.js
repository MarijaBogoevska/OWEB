const galleryData = [
    {
        id: 1,
        title: "Камениот Мост",
        description: "Иконичен симбол на Скопје",
        image: "https://macedonia-timeless.com/wp-content/uploads/2018/09/kamen-most.jpg",
        likes: 45,
        dislikes: 3,
        comments: [
            { author: "Марија", text: "Прекрасна слика!" },
            { author: "Петар", text: "Најубавиот мост во градот" }
        ]
    },
    {
        id: 2,
        title: "Стара Чаршија",
        description: "Историски центар",
        image: "https://visitskopje.mk/vs/wp-content/uploads/2025/08/old-bazaar.jpg",
        likes: 38,
        dislikes: 2,
        comments: [
            { author: "Ана", text: "Морам повторно да посетам" }
        ]
    },
    {
        id: 3,
        title: "Тврдината Кале",
        description: "Средновековна тврдина",
        image: "https://balkankaleidoscope.com/wp-content/uploads/2025/02/skopje-fortress.jpg",
        likes: 52,
        dislikes: 1,
        comments: []
    },
    {
        id: 4,
        title: "Плоштад Македонија",
        description: "Централен плоштад",
        image: "https://visit-skopje.com/wp-content/uploads/2023/11/Macedonia-Square.png",
        likes: 41,
        dislikes: 5,
        comments: [
            { author: "Стефан", text: "Убаво место за прошетка" }
        ]
    },
    {
        id: 5,
        title: "Millennium Cross",
        description: "Крст на Водно",
        image: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/95/Aerial_View_of_The_Millennium_Cross.jpg/1200px-Aerial_View_of_The_Millennium_Cross.jpg",
        likes: 67,
        dislikes: 2,
        comments: [
            { author: "Јана", text: "Прекрасен поглед!" },
            { author: "Димитар", text: "Вреди да се посети" }
        ]
    },
    {
        id: 6,
        title: "Градски Парк",
        description: "Релаксација во природа",
        image: "https://parkovi.com.mk/wp-content/uploads/2019/04/21.jpg",
        likes: 33,
        dislikes: 1,
        comments: []
    }
];

function initializeGallery() {
    const container = document.getElementById('galleryContainer');
    if (!container) return;

    galleryData.forEach(item => {
        const savedLikes = localStorage.getItem(`likes-${item.id}`);
        const savedDislikes = localStorage.getItem(`dislikes-${item.id}`);
        
        if (savedLikes !== null) {
            item.likes = parseInt(savedLikes);
        }
        if (savedDislikes !== null) {
            item.dislikes = parseInt(savedDislikes);
        }
        
        const galleryItem = createGalleryItem(item);
        container.appendChild(galleryItem);
    });
}

function createGalleryItem(item) {
    const col = document.createElement('div');
    col.className = 'col-md-4';

    const userLiked = localStorage.getItem(`liked-${item.id}`);
    const userDisliked = localStorage.getItem(`disliked-${item.id}`);

    col.innerHTML = `
        <div class="gallery-item">
            <img src="${item.image}" alt="${item.title}" class="gallery-img" onclick="openImageModal(${item.id})" style="cursor: pointer;">
            <div class="gallery-overlay">
                <h5>${item.title}</h5>
                <p class="mb-2">${item.description}</p>
                <div class="like-section">
                    <button class="like-btn ${userLiked ? 'active' : ''}" data-id="${item.id}" data-type="like">
                        <i class="bi bi-hand-thumbs-up"></i> <span class="like-count">${item.likes}</span>
                    </button>
                    <button class="dislike-btn ${userDisliked ? 'active' : ''}" data-id="${item.id}" data-type="dislike">
                        <i class="bi bi-hand-thumbs-down"></i> <span class="dislike-count">${item.dislikes}</span>
                    </button>
                </div>
                <div class="mt-3">
                    <button class="btn btn-sm btn-light" onclick="toggleComments(${item.id})">
                        <i class="bi bi-chat"></i> Коментари (${item.comments.length})
                    </button>
                </div>
                <div class="comments-section" id="comments-${item.id}" style="display: none;">
                    <div class="comments-list">
                        ${item.comments.map(comment => `
                            <div class="comment">
                                <div class="comment-author">${comment.author}</div>
                                <div class="comment-text">${comment.text}</div>
                            </div>
                        `).join('')}
                    </div>
                    <div class="mt-2">
                        <input type="text" class="form-control form-control-sm" id="comment-input-${item.id}" placeholder="Додај коментар...">
                        <button class="btn btn-sm btn-primary mt-2" onclick="addComment(${item.id})">Објави</button>
                    </div>
                </div>
            </div>
        </div>
    `;

    return col;
}

function toggleComments(id) {
    const commentsSection = document.getElementById(`comments-${id}`);
    if (commentsSection.style.display === 'none') {
        commentsSection.style.display = 'block';
    } else {
        commentsSection.style.display = 'none';
    }
}

function addComment(id) {
    const input = document.getElementById(`comment-input-${id}`);
    const text = input.value.trim();
    
    if (text) {
        const item = galleryData.find(i => i.id === id);
        item.comments.push({
            author: "Гостин",
            text: text
        });
        
        const container = document.getElementById('galleryContainer');
        container.innerHTML = '';
        initializeGallery();
        
        setTimeout(() => toggleComments(id), 100);
    }
}

document.addEventListener('click', function(e) {
    if (e.target.closest('.like-btn') || e.target.closest('.dislike-btn')) {
        const btn = e.target.closest('button');
        const id = parseInt(btn.dataset.id);
        const type = btn.dataset.type;
        
        const item = galleryData.find(i => i.id === id);
        if (!item) return;

        const likedKey = `liked-${id}`;
        const dislikedKey = `disliked-${id}`;

        if (type === 'like') {
            if (localStorage.getItem(likedKey)) {
                item.likes--;
                localStorage.removeItem(likedKey);
                btn.classList.remove('active');
            } else {
                item.likes++;
                localStorage.setItem(likedKey, 'true');
                btn.classList.add('active');
                
                if (localStorage.getItem(dislikedKey)) {
                    item.dislikes--;
                    localStorage.removeItem(dislikedKey);
                    const dislikeBtn = btn.parentElement.querySelector('.dislike-btn');
                    dislikeBtn.classList.remove('active');
                }
            }
        } else {
            if (localStorage.getItem(dislikedKey)) {
                item.dislikes--;
                localStorage.removeItem(dislikedKey);
                btn.classList.remove('active');
            } else {
                item.dislikes++;
                localStorage.setItem(dislikedKey, 'true');
                btn.classList.add('active');
                
                if (localStorage.getItem(likedKey)) {
                    item.likes--;
                    localStorage.removeItem(likedKey);
                    const likeBtn = btn.parentElement.querySelector('.like-btn');
                    likeBtn.classList.remove('active');
                }
            }
        }

        localStorage.setItem(`likes-${item.id}`, item.likes);
        localStorage.setItem(`dislikes-${item.id}`, item.dislikes);

        btn.parentElement.querySelector('.like-count').textContent = item.likes;
        btn.parentElement.querySelector('.dislike-count').textContent = item.dislikes;
    }
});

const loginForm = document.getElementById('loginForm');
if (loginForm) {
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const username = document.getElementById('username').value;
        alert(`Добредојдовте, ${username}!`);
        bootstrap.Modal.getInstance(document.getElementById('loginModal')).hide();
        loginForm.reset();
    });
}

const surveyForm = document.getElementById('surveyForm');
if (surveyForm) {
    const stars = document.querySelectorAll('.star');
    const ratingValue = document.getElementById('ratingValue');
    
    stars.forEach(star => {
        star.addEventListener('click', function() {
            const rating = this.dataset.rating;
            ratingValue.value = rating;
            
            stars.forEach(s => {
                if (s.dataset.rating <= rating) {
                    s.classList.remove('bi-star');
                    s.classList.add('bi-star-fill', 'active');
                } else {
                    s.classList.remove('bi-star-fill', 'active');
                    s.classList.add('bi-star');
                }
            });
        });

        star.addEventListener('mouseenter', function() {
            const rating = this.dataset.rating;
            stars.forEach(s => {
                if (s.dataset.rating <= rating) {
                    s.classList.remove('bi-star');
                    s.classList.add('bi-star-fill');
                }
            });
        });
    });

    document.getElementById('websiteRating').addEventListener('mouseleave', function() {
        const currentRating = ratingValue.value;
        stars.forEach(s => {
            if (currentRating && s.dataset.rating <= currentRating) {
                s.classList.remove('bi-star');
                s.classList.add('bi-star-fill', 'active');
            } else if (!s.classList.contains('active')) {
                s.classList.remove('bi-star-fill');
                s.classList.add('bi-star');
            }
        });
    });

    surveyForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        if (!ratingValue.value) {
            alert('Ве молиме изберете оценка со ѕвездички!');
            return;
        }

        const formData = {
            fullName: document.getElementById('fullName').value,
            email: document.getElementById('email').value,
            age: document.getElementById('age').value,
            rating: ratingValue.value,
            frequency: document.querySelector('input[name="frequency"]:checked').value,
            features: Array.from(document.querySelectorAll('input[type="checkbox"]:checked')).map(cb => cb.value),
            experience: document.getElementById('experience').value,
            recommend: document.querySelector('input[name="recommend"]:checked').value,
            comments: document.getElementById('comments').value
        };

        console.log('Survey Data:', formData);

        surveyForm.style.display = 'none';
        document.getElementById('successMessage').style.display = 'block';

        setTimeout(() => {
            surveyForm.reset();
            surveyForm.style.display = 'block';
            document.getElementById('successMessage').style.display = 'none';
            stars.forEach(s => {
                s.classList.remove('bi-star-fill', 'active');
                s.classList.add('bi-star');
            });
            ratingValue.value = '';
        }, 3000);
    });
}

function openImageModal(id) {
    const item = galleryData.find(i => i.id === id);
    if (!item) return;

    document.getElementById('modalImage').src = item.image;
    document.getElementById('modalImage').alt = item.title;
    document.getElementById('modalTitle').textContent = item.title;
    document.getElementById('modalDescription').textContent = item.description;

    const modal = new bootstrap.Modal(document.getElementById('imageModal'));
    modal.show();
}

document.addEventListener('DOMContentLoaded', function() {
    initializeGallery();
});
