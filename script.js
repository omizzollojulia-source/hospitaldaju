// ================= DADOS =================
let materias = JSON.parse(localStorage.getItem("materias") || "[]");
let plantoes = JSON.parse(localStorage.getItem("plantoes") || "[]");
let inicioHospital = localStorage.getItem("inicioHospital") || new Date().toISOString();
localStorage.setItem("inicioHospital", inicioHospital);

// ================= TIMER GLOBAL =================
let tempo = 0;
let intervalo = null;

function iniciarProcedimento() {
    const minutos = parseInt(document.getElementById("duracao").value);
    const procedimento = document.getElementById("procedimento").value;
    const materia = document.getElementById("materiaPlantao").value;

    if (!minutos || !materia) return alert("Preencha tudo, doutora.");

    tempo = minutos * 60;

    if (intervalo) return;
    intervalo = setInterval(() => {
        tempo--;
        atualizarTimer();

        if (tempo <= 0) {
            clearInterval(intervalo);
            intervalo = null;

            plantoes.push({
                data: new Date().toISOString(),
                procedimento,
                materia,
                minutos
            });

            localStorage.setItem("plantoes", JSON.stringify(plantoes));
            alert("Procedimento concluído com sucesso 🩺");
            atualizarProjecao();
            renderRanking();
        }
    }, 1000);
}

function atualizarTimer() {
    let min = Math.floor(tempo / 60);
    let seg = tempo % 60;
    const timer = document.getElementById("timerGlobal");
    if (timer) timer.innerText = `${min}:${seg < 10 ? '0' : ''}${seg}`;
}

function emergencia(){
    alert("🚨 Código Azul ativado. 5 minutos de foco imediato.");
    tempo = 300;
    atualizarTimer();
}

// ================= MATÉRIAS =================
function salvar(){
    localStorage.setItem("materias", JSON.stringify(materias));
}

function adicionarMateria(status){
    const nome = document.getElementById("nomeMateria").value;
    if(!nome) return;

    materias.push({
        nome,
        status,
        risco: 20,
        revisoes: [],
        erros: {}
    });

    salvar();
    renderMaterias();
}

function darAlta(i){
    materias[i].status = "saudavel";
    materias[i].risco = 10;

    const hoje = new Date();
    const dias = [1,3,7,15,30];

    materias[i].revisoes = dias.map(d=>{
        let data = new Date();
        data.setDate(hoje.getDate()+d);
        return data.toISOString();
    });

    salvar();
    renderMaterias();
}

function calcularSaude(m){
    if(m.status==="uti") return {classe:"critico",valor:20};
    if(m.status==="vermelha") return {classe:"grave",valor:35};
    if(m.status==="triagem"||m.status==="internacao") return {classe:"doente",valor:60};
    return {classe:"saude",valor:90};
}

function renderMaterias(){
    const lista=document.getElementById("listaMaterias");
    if(!lista) return;

    lista.innerHTML="";

    materias.forEach((m,i)=>{
        const s=calcularSaude(m);

        lista.innerHTML+=`
        <div class="card">
            <strong>${m.nome}</strong><br>
            Status: ${m.status}<br>
            Índice de Risco: ${m.risco}%<br>
            <div class="health-bar">
                <div class="health-fill ${s.classe}" style="width:${s.valor}%"></div>
            </div>
            <button onclick="darAlta(${i})">Dar Alta</button>
        </div>`;
    });
}

// ================= ACOMPANHAMENTO =================
function renderAcompanhamento(){
    const box=document.getElementById("consultas");
    if(!box) return;

    box.innerHTML="<div class='alerta'>🩺 Agende a consulta. Seus pacientes estão esperando.</div>";

    const hoje=new Date();

    materias.forEach((m,i)=>{
        m.revisoes.forEach(r=>{
            if(new Date(r)<=hoje){
                box.innerHTML+=`
                <div class="card">
                ${m.nome} precisa de revisão.
                <button onclick="realizarConsulta(${i})">Consulta realizada</button>
                </div>`;
            }
        });
    });
}

function realizarConsulta(i){
    materias[i].risco-=10;
    materias[i].revisoes.shift();
    salvar();
    renderAcompanhamento();
}

// ================= EXAMES =================
function registrarExame(){
    const materiaNome=document.getElementById("materiaExame").value;
    const tema=document.getElementById("temaExame").value;
    const acerto=parseInt(document.getElementById("acerto").value);

    const m=materias.find(x=>x.nome===materiaNome);
    if(!m) return alert("Matéria não encontrada");

    if(!m.erros[tema]) m.erros[tema]=0;

    if(acerto<60){
        m.risco+=25;
        m.status="vermelha";
        m.erros[tema]++;
    }

    salvar();
    alert("Exame registrado.");
}

// ================= PROJEÇÃO =================
function atualizarProjecao(){
    const box=document.getElementById("projecao");
    if(!box) return;

    const dataExato=new Date("2026-05-17");
    const hoje=new Date();
    const dias=Math.floor((dataExato-hoje)/(1000*60*60*24));

    const horas=plantoes.reduce((s,p)=>s+(p.minutos/60),0);

    box.innerHTML=`
    Faltam ${dias} dias.<br>
    Total acumulado: ${horas.toFixed(1)}h`;
}

// ================= RANKING =================
function renderRanking(){
    const box=document.getElementById("ranking");
    if(!box) return;

    const horas=plantoes.reduce((s,p)=>s+(p.minutos/60),0);

    box.innerHTML=`
    🏆 Total de Plantões: ${plantoes.length}<br>
    ⏳ Total de Horas: ${horas.toFixed(1)}h`;
}

// ================= INIT =================
renderMaterias();
renderAcompanhamento();
atualizarProjecao();
renderRanking();
