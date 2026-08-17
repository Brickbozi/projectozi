const carousel = document.getElementById("carousel-wheel");
const image_grid = document.getElementById("image-grid");
const img = new Image();
const image_viewer = document.getElementById("image-viewer")
const path_view = document.getElementById("path-view");
const view_left = document.getElementById("view-left");
const view_right = document.getElementById("view-right");

const image_viewer_container = document.getElementById("image-viewer-container");
const content = document.getElementById("content");
let isVisible = true;
let viewerNum = 0;

let cardNum = 0;
let cardIdx = 0;
let carousel_images = [
    "../Assets/Gallery/Completed/Hornet/complete.webp",
    "../Assets/Gallery/Anatomy/Faces/Throwaways/Throwaway(20).webp",
    "../Assets/Gallery/Anatomy/Throwaways/wip3.webp",
    "../Assets/Gallery/Anatomy/Faces/Throwaways/Throwaway(8.5).webp",
    "../Assets/Gallery/Anatomy/Throwaways/Throwaway(39).webp",
    "../Assets/Gallery/Anatomy/Throwaways/Throwaway(35).webp",
    "../Assets/Gallery/Anatomy/Faces/Throwaways/Throwaway(21).webp"
];
let targetAngle = 0;
let cardDistance = 0;
for (let i = 0; i < carousel_images.length; i++) {
    const card = document.createElement('img');
    card.src = carousel_images[i];
    card.data_src = carousel_images[i];
    card.classList.add("carousel-card");
    carousel.appendChild(card);
    card.id = cardNum++;
    card.onclick = function () {
        console.log("open");
        image_viewer.src = card.src;
        path_view.textContent = card.data_src;
        image_viewer_container.classList.toggle("active");
        isVisible = true;
    }
}

const cards = document.querySelectorAll('.carousel-card');
const totalCards = cards.length;
const cardAngleStep = 360 / totalCards;

const cardWidth = 300;
const radius = Math.round((cardWidth / 2) / Math.tan(Math.PI / totalCards));

cards.forEach((card, index) => {
    const cardAngle = cardAngleStep * index;
    card.dataset.angle = cardAngle;
});

function rotateToCard(cardIndex) {
    targetAngle = -cardAngleStep * cardIndex;
    document.getElementById('carousel-wheel').style.transform = `translateZ(-${radius}px) rotateY(${targetAngle}deg)`;
    cards.forEach((card) => {
        const cardAngle = parseFloat(card.dataset.angle);
        card.style.transform = `rotateY(${cardAngle}deg) translateZ(${radius}px) rotateY(${-targetAngle - cardAngle}deg)`;
    });

}

window.addEventListener('load',
    document.querySelector('#left').addEventListener('click', event => {
        cardIdx--;
        rotateToCard(cardIdx);
    }))

window.addEventListener('load',
    document.querySelector('#right').addEventListener('click', event => {
        cardIdx++;
        rotateToCard(cardIdx);
    }))
rotateToCard(0);

let imgNum = totalCards;

Flattened.reverse().forEach((imagePath) => {
    const img = document.createElement('img');
    img.classList.add("image-thumbnail");
    img.data_src = imagePath;
    img.src = (imagePath);
    img.data_src = imagePath;
    img.id = imgNum++;
    img.decoding = "async";
    img.loading = "lazy";
    img.onclick = function () {
        image_viewer.src = img.src;
        path_view.textContent = img.data_src;
        viewerNum = parseInt(img.id, 10);
        image_viewer_container.classList.toggle("active");
        // image_viewer_container.style.display = "flex";
        isVisible = true;
    }

    image_grid.appendChild(img);

});


// var observer = new IntersectionObserver(function (entries) {
//     entries.forEach(function (entry) {
//         var img = entry.target;
//         if (unloadTimers.has(img)) {
//             clearTimeout(unloadTimers.get(img));
//             unloadTimers.delete(img);
//         }
//         if (entry.isIntersecting && img.src != img.data_src) {
//             img.src = img.data_src;
//         } else {
//             var timer = setTimeout(function () {
//                 img.src = "../Assets/PlaySymbol.svg";
//                 unloadTimers.delete(img);
//             }, UNLOAD_DELAY_MS);

//             unloadTimers.set(img, timer);
//         }
//     });
// });

// document.querySelectorAll(".image-thumbnail").forEach(function (img) {
//     observer.observe(img);
// });




image_viewer_container.addEventListener('click', (event) => {
    if (!image_viewer.contains(event.target) && image_viewer_container.classList.contains("active") && !view_left.contains(event.target) && !view_right.contains(event.target)) {
        image_viewer_container.classList.toggle("active");
        // image_viewer_container.style.display = "none";
        content.style.overflowY = "show";
        isVisible = false;
    }
});

path_view.addEventListener('click', (event) => {
    window.location.href = "../Pages/art.html" + `?path=${path_view.textContent}`;
    console.log(path_view.textContent);
});



window.addEventListener("keyup", e => {
    if (e.key == "ArrowRight") {
        if (viewerNum < (imgNum - 1)) {
            viewerNum = viewerNum + 1;
            const element = document.getElementById(viewerNum);
            path_view.textContent = element.data_src;
            image_viewer.src = element.src;
        } else {
            return;
        }
    }
});

window.addEventListener("keyup", e => {
    if (e.key == "ArrowLeft") {
        if (viewerNum > 0) {
            viewerNum = viewerNum - 1;
            const element = document.getElementById(viewerNum);
            path_view.textContent = element.data_src;
            image_viewer.src = element.src;
        } else {
            return;
        }
    }
});

window.addEventListener('load',
    document.querySelector('#view-right').addEventListener('click', event => {
        if (viewerNum < (imgNum - 1)) {
            viewerNum = viewerNum + 1;
            const element = document.getElementById(viewerNum);
            path_view.textContent = element.data_src;
            image_viewer.src = element.src;
        } else {
            return;
        }
    }))

window.addEventListener('load',
    document.querySelector('#view-left').addEventListener('click', event => {
        if (viewerNum > 0) {
            viewerNum = viewerNum - 1;
            const element = document.getElementById(viewerNum);
            path_view.textContent = element.data_src;
            image_viewer.src = element.src;
        } else {
            return;
        }
    }))