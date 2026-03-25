
const sounds = {
     start: new Audio("sounds/start.mp3"),
    lap: new Audio("sounds/lap.mp3"),
    reset: new Audio("sounds/reset.mp3")
};
Object.values(sounds).forEach(s => s.volume = 0.4);


let audioUnlocked = false;
function unlockAudio() {
    if (audioUnlocked) return;

    Object.values(sounds).forEach(sound => {
        sound.play().then(() => {
            sound.pause();
            sound.currentTime = 0;
        }).catch(() => {});
    });

    audioUnlocked = true;
}


let ms = 0, s = 0, m = 0, h = 0;
let timer = null;
let running = false;
let lapTimes = JSON.parse(localStorage.getItem("laps")) || [];


const display = document.getElementById("display");
const startBtn = document.getElementById("startBtn");
const lapBtn = document.getElementById("lapBtn");
const resetBtn = document.getElementById("resetBtn");
const lapsBody = document.getElementById("laps");
const themeToggle = document.getElementById("themeToggle");


function formatTime(msTotal) {
    let ms = msTotal % 1000;
    let totalSec = Math.floor(msTotal / 1000);
    let s = totalSec % 60;
    let m = Math.floor(totalSec / 60) % 60;
    let h = Math.floor(totalSec / 3600);

    return `${h.toString().padStart(2,'0')}:${m.toString().padStart(2,'0')}:${s.toString().padStart(2,'0')}:${ms.toString().padStart(3,'0')}`;
}


function updateDisplay() {
    display.textContent = formatTime(h*3600000 + m*60000 + s*1000 + ms);
    display.style.transform = "scale(1.02)";
    setTimeout(() => display.style.transform = "scale(1)", 60);
}


startBtn.onclick = () => {
    unlockAudio(); 

    if (!running) {
        sounds.start.currentTime = 0;
        sounds.start.play();

        timer = setInterval(() => {
            ms += 10;
            if (ms === 1000) { ms = 0; s++; }
            if (s === 60) { s = 0; m++; }
            if (m === 60) { m = 0; h++; }
            updateDisplay();
        }, 10);

        startBtn.textContent = "Pause";
        startBtn.className = "pause";
        running = true;

    } else {
        sounds.start.currentTime = 0;
        sounds.start.play();

        clearInterval(timer);
        startBtn.textContent = "Resume";
        startBtn.className = "resume";
        running = false;
    }
};

lapBtn.onclick = () => {
    unlockAudio();
    if (!running) return;

    sounds.lap.currentTime = 0;
    sounds.lap.play();

    let current = h*3600000 + m*60000 + s*1000 + ms;
    lapTimes.push(current);
    localStorage.setItem("laps", JSON.stringify(lapTimes));

    renderLaps();
};


resetBtn.onclick = () => {
    unlockAudio();

    sounds.reset.currentTime = 0;
    sounds.reset.play();

    clearInterval(timer);
    ms = s = m = h = 0;
    running = false;

    startBtn.textContent = "Start";
    startBtn.className = "start";

    lapTimes = [];
    localStorage.clear();

    updateDisplay();
    renderLaps();
};


function renderLaps() {
    lapsBody.innerHTML = "";

    let diffs = lapTimes.map((t, i) =>
        i === 0 ? t : t - lapTimes[i - 1]
    );

    let fastest = Math.min(...diffs);
    let slowest = Math.max(...diffs);

    lapTimes.forEach((t, i) => {
        let diff = diffs[i];
        let className =
            diff === fastest ? "fastest" :
            diff === slowest ? "slowest" : "";

        lapsBody.innerHTML += `
            <tr class="${className}">
                <td>Lap ${i + 1}</td>
                <td>${formatTime(t)}</td>
                <td>${i === 0 ? "-" : "+" + formatTime(diff)}</td>
            </tr>
        `;
    });
}


themeToggle.onclick = () => {
    document.body.classList.toggle("light");
    document.body.classList.toggle("dark");
    themeToggle.textContent =
        document.body.classList.contains("dark") ? "🌙" : "☀️";
};


document.addEventListener("keydown", e => {
    if (e.code === "Space") startBtn.click();
    if (e.key.toLowerCase() === "l") lapBtn.click();
    if (e.key.toLowerCase() === "r") resetBtn.click();
});


renderLaps();
updateDisplay();