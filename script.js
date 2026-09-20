// ==========================================
// CONEXIÓN CON SUPABASE
// ==========================================

const SUPABASE_URL = "https://rkhrbdmvrsiivnraxfex.supabase.co";

// Pega aquí tu publishable key de Supabase
const SUPABASE_KEY = "sb_publishable_JhMh2TVkt5FoPJydmgNbKw_SEnKDexJ";

const supabaseClient = supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
);


// ==========================================
// AL CARGAR LA PÁGINA
// ==========================================

document.addEventListener("DOMContentLoaded", () => {
    mostrarNotas();
    escucharCambios();
});


// ==========================================
// IR A LAS NOTAS
// ==========================================

function irANotas() {
    document.getElementById("recuerdos").scrollIntoView({
        behavior: "smooth"
    });
}


// ==========================================
// ABRIR CARTA
// ==========================================

function abrirCarta() {
    const ventana = document.getElementById("ventanaCarta");

    ventana.classList.add("mostrar");
}


// ==========================================
// CERRAR CARTA
// ==========================================

function cerrarCarta() {
    const ventana = document.getElementById("ventanaCarta");

    ventana.classList.remove("mostrar");
}


// ==========================================
// GUARDAR NOTA EN SUPABASE
// ==========================================

async function guardarNota() {

    const titulo = document
        .getElementById("tituloNota")
        .value
        .trim();

    const texto = document
        .getElementById("textoNota")
        .value
        .trim();

    const autor = document
        .getElementById("autorNota")
        .value
        .trim();


    if (titulo === "" || texto === "") {

        alert("Escribe un título y una nota ❤️");

        return;
    }


    const { error } = await supabaseClient
        .from("notas")
        .insert([
            {
                titulo: titulo,
                texto: texto,
                autor: autor || "Con mucho amor ❤️"
            }
        ]);


    if (error) {

    console.error("ERROR COMPLETO DE SUPABASE:", error);

    alert(
        "Error de Supabase:\n\n" +
        error.message
    );

    return;
}


    // Limpiar formulario

    document.getElementById("tituloNota").value = "";
    document.getElementById("textoNota").value = "";
    document.getElementById("autorNota").value = "";


    cerrarCarta();


    setTimeout(() => {

        document
            .getElementById("recuerdos")
            .scrollIntoView({
                behavior: "smooth"
            });

    }, 300);
}


// ==========================================
// MOSTRAR NOTAS
// ==========================================

async function mostrarNotas() {

    const lista = document.getElementById("listaNotas");


    const { data, error } = await supabaseClient
        .from("notas")
        .select("*")
        .order("fecha", {
            ascending: false
        });


    if (error) {

        console.error("Error obteniendo notas:", error);

        lista.innerHTML = `
            <p class="sin-notas">
                No se pudieron cargar las notas 💔
            </p>
        `;

        return;
    }


    lista.innerHTML = "";


    if (!data || data.length === 0) {

        lista.innerHTML = `
            <div class="sin-notas">
                <div style="font-size:50px;">💌</div>
                <h3>Aún no hay recuerdos</h3>
                <p>Escribe la primera notita ❤️</p>
            </div>
        `;

        return;
    }


    data.forEach(nota => {

        const tarjeta = document.createElement("article");

        tarjeta.className = "nota";


        const fecha = nota.fecha
            ? new Date(nota.fecha).toLocaleDateString("es-EC", {
                day: "numeric",
                month: "long",
                year: "numeric"
            })
            : "";


        tarjeta.innerHTML = `

            <div class="parte-nota foto-nota">

                <img
                    src="img/foto1.jpg"
                    alt="Nuestro recuerdo"
                >

            </div>


            <div class="parte-nota">

                <button
                    class="eliminar-nota"
                    onclick="eliminarNota('${nota.id}')"
                    title="Eliminar recuerdo"
                >
                    🗑️
                </button>


                <span class="fecha-nota">
                    ${escaparHTML(fecha)}
                </span>


                <h3>
                    ${escaparHTML(nota.titulo)}
                </h3>


                <p class="texto-nota">
                    ${escaparHTML(nota.texto)}
                </p>


                <p class="autor-nota">
                    — ${escaparHTML(nota.autor || "Con mucho amor ❤️")}
                </p>

            </div>

        `;


        lista.appendChild(tarjeta);

    });
}


// ==========================================
// ELIMINAR NOTA
// ==========================================

async function eliminarNota(id) {

    const confirmar = confirm(
        "¿Seguro que quieres eliminar este recuerdo? ❤️"
    );


    if (!confirmar) {
        return;
    }


    const { error } = await supabaseClient
        .from("notas")
        .delete()
        .eq("id", id);


    if (error) {

        console.error("Error eliminando:", error);

        alert("No se pudo eliminar la nota 😢");

        return;
    }
}


// ==========================================
// ACTUALIZACIÓN EN TIEMPO REAL
// ==========================================

function escucharCambios() {

    supabaseClient
        .channel("cambios-notas")
        .on(
            "postgres_changes",
            {
                event: "*",
                schema: "public",
                table: "notas"
            },
            () => {

                mostrarNotas();

            }
        )
        .subscribe();

}


// ==========================================
// EVITAR HTML MALICIOSO
// ==========================================

function escaparHTML(texto) {

    if (!texto) {
        return "";
    }


    return texto
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}