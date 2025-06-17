
let todosPaises = [];
let paisesFiltrados = [];
let paginaAtual = 1;
const porPagina = 12;

async function carregarPaises() {
  const container = document.getElementById("paises-container");

  try {
    const resposta = await fetch("https://restcountries.com/v3.1/all?fields=name,capital,population,flags,region,currencies,languages,area");

    if (!resposta.ok) throw new Error(`Erro HTTP: ${resposta.status}`);

    todosPaises = await resposta.json();
    paisesFiltrados = todosPaises;
    exibirPaises();
  } catch (erro) {
    container.innerHTML = `<p class="text-danger">Erro ao carregar os dados: ${erro}</p>`;
  }
}

function exibirPaises() {
  const container = document.getElementById("paises-container");
  container.innerHTML = "";

  const inicio = (paginaAtual - 1) * porPagina;
  const fim = inicio + porPagina;
  const pagina = paisesFiltrados.slice(inicio, fim);

  if (pagina.length === 0) {
    container.innerHTML = `<p class="text-center">Nenhum país encontrado.</p>`;
    return;
  }

  pagina.forEach(pais => {
    const moeda = pais.currencies
      ? Object.values(pais.currencies)[0]?.name + " (" + Object.values(pais.currencies)[0]?.symbol + ")"
      : "N/A";
    const capital = pais.capital ? pais.capital[0] : "N/A";

    const card = document.createElement("div");
    card.className = "col-sm-6 col-md-4 col-lg-3";

    card.innerHTML = `
      <div class="card h-100 shadow-sm text-center p-3" onclick='abrirModal(${JSON.stringify(pais).replace(/'/g, "\'")})'>
        <img class="flag-img mx-auto" src="${pais.flags.png}" alt="Bandeira de ${pais.name.common}">
        <h5 class="mt-2">${pais.name.common}</h5>
        <p><strong>Capital:</strong> ${capital}</p>
        <p><strong>Moeda:</strong> ${moeda}</p>
      </div>
    `;

    container.appendChild(card);
  });

  atualizarBotoes();
}

function atualizarBotoes() {
  document.getElementById("prev-btn").disabled = paginaAtual === 1;
  document.getElementById("next-btn").disabled = paginaAtual * porPagina >= paisesFiltrados.length;
}

document.getElementById("prev-btn").addEventListener("click", () => {
  if (paginaAtual > 1) {
    paginaAtual--;
    exibirPaises();
  }
});

document.getElementById("next-btn").addEventListener("click", () => {
  if (paginaAtual * porPagina < paisesFiltrados.length) {
    paginaAtual++;
    exibirPaises();
  }
});

document.getElementById("inicio-btn").addEventListener("click", () => {
  paginaAtual = 1;
  exibirPaises();
});

document.getElementById("limpar-filtros").addEventListener("click", () => {
  document.getElementById("busca").value = "";
  document.getElementById("continente").value = "";
  document.getElementById("moeda").value = "";
  paisesFiltrados = todosPaises;
  paginaAtual = 1;
  exibirPaises();
});

function aplicarFiltros() {
  const termo = document.getElementById("busca").value.toLowerCase();
  const continente = document.getElementById("continente").value;
  const moedaBusca = document.getElementById("moeda").value.toLowerCase();

  paisesFiltrados = todosPaises.filter(p => {
    const nome = p.name.common.toLowerCase();
    const regiao = p.region;
    const moeda = p.currencies ? Object.values(p.currencies)[0]?.name.toLowerCase() : "";
    return nome.includes(termo) &&
           (continente === "" || regiao === continente) &&
           (moedaBusca === "" || moeda.includes(moedaBusca));
  });

  paginaAtual = 1;
  exibirPaises();
}

document.getElementById("busca").addEventListener("input", aplicarFiltros);
document.getElementById("continente").addEventListener("change", aplicarFiltros);
document.getElementById("moeda").addEventListener("input", aplicarFiltros);

function abrirModal(pais) {
  const nome = pais.name.common;
  const capital = pais.capital ? pais.capital[0] : "N/A";
  const populacao = pais.population.toLocaleString();
  const area = pais.area ? `${pais.area.toLocaleString()} km²` : "N/A";
  const moeda = pais.currencies
    ? Object.values(pais.currencies)[0]?.name + " (" + Object.values(pais.currencies)[0]?.symbol + ")"
    : "N/A";
  const idiomas = pais.languages
    ? Object.values(pais.languages).join(", ")
    : "N/A";

  const html = `
    <div class="text-center mb-3">
      <img src="${pais.flags.png}" class="border" width="120">
      <h3 class="mt-3">${nome}</h3>
    </div>
    <p><strong>Capital:</strong> ${capital}</p>
    <p><strong>População:</strong> ${populacao}</p>
    <p><strong>Área:</strong> ${area}</p>
    <p><strong>Continente:</strong> ${pais.region}</p>
    <p><strong>Moeda:</strong> ${moeda}</p>
    <p><strong>Idiomas:</strong> ${idiomas}</p>
  `;

  document.getElementById("modal-content-body").innerHTML = html;
  const modal = new bootstrap.Modal(document.getElementById("paisModal"));
  modal.show();
}

carregarPaises();
