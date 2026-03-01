// ======= PLANTÕES =======
let time = 1500;
let interval;
let plantões = JSON.parse(localStorage.getItem("plantoes") || "[]");

function updateTimer() {
    let min = Math.floor(time / 60);
    let sec = time % 60;
    document.getElementById("timer").innerText =
        `${min}:${sec < 10 ? '0' : ''}${sec}`;
}

function startPlantao() {
    if (interval) return;
    interval = setInterval(() => {
        time--;
        updateTimer();
        if (time <= 0) {
            clearInterval(interval);
            interval = null;
            plantões.push({ date: new Date().toISOString() });
            localStorage.setItem("plantoes", JSON.stringify(plantões));
            alert("Plantão concluído, doutora 🩺");
            time = 1500;
            updateTimer();
            renderHoras();
        }
    }, 1000);
}

function resetPlantao() {
    clearInterval(interval);
    interval = null;
    time = 1500;
    updateTimer();
}

// ======= MATÉRIAS =======
function addMateria(status) {
    const nome = document.getElementById("nomeMateria").value;
    if (!nome) return;

    const materias = JSON.parse(localStorage.getItem("materias") || "[]");
    materias.push({
        nome,
        status,
        revisoes: [],
        exames: []
    });

    localStorage.setItem("materias", JSON.stringify(materias));
    document.getElementById("nomeMateria").value = "";
    renderMaterias();
}

function renderMaterias() {
    const materias = JSON.parse(localStorage.getItem("materias") || "[]");
    const container = document.getElementById("listaMaterias");
    if (!container) return;

    container.innerHTML = "";

    materias.forEach((m, i) => {
        const div = document.createElement("div");
        div.className = "status-box " + m.status;
        div.innerHTML = `
            <strong>${m.nome}</strong><br>
            Status: ${m.status}<br>
            <button onclick="darAlta(${i})">Dar Alta</button>
            <button onclick="classificar(${i}, 'grave')">Exame Grave</button>
            <button onclick="classificar(${i}, 'estavel')">Exame Estável</button>
        `;
        container.appendChild(div);
    });
}

function darAlta(i) {
    const materias = JSON.parse(localStorage.getItem("materias"));
    materias[i].status = "alta";

    // Curva do esquecimento
    const hoje = new Date();
    const dias = [1, 3, 7, 15, 30];
    materias[i].revisoes = dias.map(d => {
        let data = new Date();
        data.setDate(hoje.getDate() + d);
        return data.toISOString();
    });

    localStorage.setItem("materias", JSON.stringify(materias));
    renderMaterias();
}

function classificar(i, tipo) {
    const materias = JSON.parse(localStorage.getItem("materias"));
    materias[i].exames.push({ tipo, data: new Date().toISOString() });
    localStorage.setItem("materias", JSON.stringify(materias));
    renderMaterias();
}

// ======= HORAS SEMANAIS =======
function renderHoras() {
    const horasBox = document.getElementById("horasSemana");
    if (!horasBox) return;

    const hoje = new Date();
    const semana = plantões.filter(p => {
        const data = new Date(p.date);
        return (hoje - data) <= 7 * 24 * 60 * 60 * 1000;
    });

    const horas = (semana.length * 25) / 60;
    horasBox.innerText = horas.toFixed(1) + " horas essa semana";
}

updateTimer();
renderMaterias();
renderHoras();
