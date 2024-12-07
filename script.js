const canvas = document.getElementById("wheelCanvas");
const ctx = canvas.getContext("2d");
const createWheelBtn = document.getElementById("createWheel");
const spinWheelBtn = document.getElementById("spinWheel");
const numSectionsInput = document.getElementById("numSections");
const sectionNamesInput = document.getElementById("sectionNames");
const playerNamesInput = document.getElementById("playerNames");
const currentResult = document.getElementById("currentResult");
const bgMusic = document.getElementById("bgMusic");

let sections = [];
let players = [];
let currentPlayerIndex = 0;
let anglePerSection;
let currentAngle = 0;

// Ustawienie rozmiaru canvas w zależności od szerokości ekranu
function resizeCanvas() {
    canvas.width = Math.min(window.innerWidth - 40, 400); // Maksymalna szerokość 400px
    canvas.height = canvas.width; // Ustawienie proporcji kwadratu
    drawWheel();
}

window.addEventListener('resize', resizeCanvas);
resizeCanvas(); // Początkowe ustawienie

// Start muzyki w tle
bgMusic.volume = 1;
bgMusic.play();

function drawWheel() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const radius = canvas.width / 2;
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    anglePerSection = (2 * Math.PI) / sections.length;

    sections.forEach((_, i) => {
        const startAngle = i * anglePerSection;
        const endAngle = startAngle + anglePerSection;
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.arc(centerX, centerY, radius, startAngle, endAngle);
        ctx.closePath();
        ctx.fillStyle = i % 2 === 0 ? "#ffdd00" : "#ff5733"; // Alternatywne kolory
        ctx.fill();
        ctx.stroke();
    });
}

function spinWheel() {
    if (sections.length === 0) {
        alert("Koło jest puste!");
        return;
    }

    const spins = Math.floor(Math.random() * 5) + 5; // Ilość obrotów
    const randomAngle = Math.random() * 2 * Math.PI; // Kąt końcowy
    const totalRotation = spins * 2 * Math.PI + randomAngle;

    const spinTime = 3000; // Czas obrotu
    const startTime = performance.now();

    function animateSpin(time) {
        const elapsed = time - startTime;
        const progress = Math.min(elapsed / spinTime, 1);
        const easeOut = 1 - Math.pow(1 - progress, 3);
        currentAngle = totalRotation * easeOut;
        ctx.save();
        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.rotate(currentAngle);
        ctx.translate(-canvas.width / 2, -canvas.height / 2);
        drawWheel();
        ctx.restore();

        if (progress < 1) {
            requestAnimationFrame(animateSpin);
        } else {
            // Filtruj możliwe wyniki, aby uniknąć wylosowania obecnego gracza
            const filteredSections = sections.filter(section => section !== players[currentPlayerIndex]);

            if (filteredSections.length === 0) {
                alert("Nie można znaleźć wyniku, który nie jest graczem!");
                return;
            }

            const winningIndex = Math.floor((2 * Math.PI - (currentAngle % (2 * Math.PI))) / anglePerSection) % sections.length;
            let winner = sections[winningIndex];

            // Upewnij się, że wynik nie jest graczem
            if (winner === players[currentPlayerIndex]) {
                winner = filteredSections[Math.floor(Math.random() * filteredSections.length)];
            }

            // Usuń sekcję z koła
            sections = sections.filter(section => section !== winner);

            drawWheel();
            showResult(players[currentPlayerIndex], winner);
            currentPlayerIndex = (currentPlayerIndex + 1) % players.length; // Następny gracz
        }
    }

    requestAnimationFrame(animateSpin);
}


function showResult(player, winner) {
    currentResult.textContent = `${player} wylosował(a): ${winner}`;

    // Zmiana koloru wyniku na losowy
    const randomColor = `#${Math.floor(Math.random() * 16777215).toString(16)}`;
    currentResult.style.color = randomColor;
    currentResult.style.fontWeight = "bold";

    // Ukrycie wyniku po 4 sekundach
    setTimeout(() => {
        currentResult.textContent = "---";
        currentResult.style.color = ""; // Przywraca domyślny kolor
    }, 4000);
}

createWheelBtn.addEventListener("click", () => {
    const numSections = parseInt(numSectionsInput.value);
    const sectionNames = sectionNamesInput.value.split(",").map(name => name.trim());
    players = playerNamesInput.value.split(",").map(name => name.trim());

    if (sectionNames.length === numSections) {
        sections = sectionNames;
    } else {
        sections = Array.from({ length: numSections }, (_, i) => `Sekcja ${i + 1}`);
    }

    if (players.length === 0) {
        alert("Musisz dodać przynajmniej jednego gracza!");
        return;
    }

    currentPlayerIndex = 0; // Zresetuj indeks gracza
    drawWheel();
});

spinWheelBtn.addEventListener("click", spinWheel);


