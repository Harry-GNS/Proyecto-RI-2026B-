const sugerencias = [
  "What is a mutual fund?",
  "How do I build wealth?",
  "Is a car loan bad debt?",
  "How to invest in index funds?",
];
const vocabulario = [
  "account", "budget", "credit", "debt", "investment", "mortgage",
  "retirement", "savings", "stocks", "tax",
];

let estado = {
  q: "",
  model: "bm25",
  k: 10,
  stem: false,
  graph: false,
  view: "buscar",
  route: "home",
  seq: 0,
  nav: 0,
};
let recibir;

document.documentElement.dataset.theme = "dark";
document.title = "goggle";

function crearRespuestaSimulada(solicitud) {
  const consulta = String(solicitud.q || "").trim();
  if (!consulta) {
    return {
      seq: solicitud.seq,
      key: "",
      model: solicitud.model,
      stem: false,
      elapsed_ms: 0,
      terms: [],
      suggestion: "",
      hits: [],
    };
  }

  const términos = consulta.toLowerCase().match(/[a-z]+/g)?.filter((término) => término.length > 2).slice(0, 3) || [];
  const resultados = Array.from({ length: solicitud.k }, (_, índice) => {
    const posición = índice + 1;
    return {
      rank: posición,
      doc_id: `demo-${posición}`,
      text: `Resultado de demostración relacionado con «${consulta}». Este resumen conserva el aspecto de los documentos originales.`,
      score: Number((0.95 - posición * 0.07).toFixed(3)),
      matched: términos,
      spans: [],
    };
  });
  return {
    seq: solicitud.seq,
    key: `${solicitud.model}|${solicitud.k}|${consulta}`,
    model: solicitud.model,
    stem: solicitud.stem,
    elapsed_ms: 12.5,
    terms: términos,
    suggestion: "",
    hits: resultados,
  };
}

function establecerSolicitud(solicitud) {
  estado = { ...estado, ...solicitud };
  recibir?.({
    initial: { ...estado, nav: estado.nav + 1 },
    response: crearRespuestaSimulada(estado),
  });
  mostrarExtras(estado.view);
}

function mostrarExtras(vista) {
  const extras = document.querySelector("#demo-extras");
  if (vista === "comparar") {
    extras.innerHTML = `
      <section class="static-view static-compare" aria-label="Comparacion">
        <div class="static-controls">
          <strong>Top 10</strong>
          <div><button class="static-selected">Todos</button><button>Coincidencias</button></div>
        </div>
        <div class="static-columns">
          ${["Jaccard", "TF-IDF", "BM25", "Embeddings"].map((modelo, columna) => `
            <article class="static-column">
              <header><strong>${modelo}</strong><span>12 ms</span></header>
              ${Array.from({ length: 5 }, (_, índice) => `
                <div class="static-document">
                  <b>${índice + 1}</b>
                  <div><strong>Documento de demostración ${índice + 1}</strong>
                  <p>Resumen relacionado con la consulta seleccionada.</p>
                  <small>${(0.92 - índice * 0.08 - columna * 0.02).toFixed(2)}</small></div>
                </div>`).join("")}
            </article>`).join("")}
        </div>
      </section>`;
  } else if (vista === "metricas") {
    extras.innerHTML = `
      <section class="static-view static-metrics" aria-label="Metricas">
        <h2>Metricas</h2>
        <div class="static-metric-cards">
          <article><strong>P@10</strong><span>0.4286</span></article>
          <article><strong>R@10</strong><span>0.5714</span></article>
          <article><strong>MAP@1000</strong><span>0.3261</span></article>
        </div>
        <p>Vista de demostración sin datos ni cálculos reales.</p>
      </section>`;
  } else {
    extras.innerHTML = "";
  }
}

async function iniciar() {
  const respuesta = await fetch("app/frontend/app.js");
  let codigoFuente = await respuesta.text();
  codigoFuente = codigoFuente.replace("__SUGGESTIONS__", JSON.stringify(sugerencias));
  codigoFuente = codigoFuente.replace("__VOCABULARY__", JSON.stringify(vocabulario));

  const urlMódulo = URL.createObjectURL(new Blob([codigoFuente], { type: "text/javascript" }));
  const módulo = await import(urlMódulo);
  URL.revokeObjectURL(urlMódulo);

  await módulo.default({
    parentElement: document,
    data: {
      initial: estado,
      response: crearRespuestaSimulada(estado),
    },
    setStateValue(_nombre, solicitud) {
      establecerSolicitud(solicitud);
    },
  });

  const root = document.querySelector(".goggle");
  recibir = root?._goggle?.receive;


  document.querySelectorAll("[data-view-link]").forEach((link) => {
    link.addEventListener("click", () => {
      const view = link.dataset.viewLink;
      estado.view = view;
      estado.seq += 1;
      recibir?.({
        initial: { ...estado, nav: estado.nav + 1 },
        response: crearRespuestaSimulada(estado),
      });
      mostrarExtras(view);
    });
  });
}

iniciar();
