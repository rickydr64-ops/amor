const SUPABASE_URL = "https://rkhrbdmvrsiivnraxfex.supabase.co";
const SUPABASE_KEY = "sb_publishable_JhMh2TVkt5FoPJydmgNbKw_SEnKDexJ";

const supabaseClient = supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
);


const selectorFotos = document.getElementById("selectorFotos");
const listaFotos = document.getElementById("listaFotos");
const sinFotos = document.getElementById("sinFotos");
const visor = document.getElementById("visor");
const imagenGrande = document.getElementById("imagenGrande");
const cerrarVisor = document.getElementById("cerrarVisor");


// ===============================
// MOSTRAR FOTOS
// ===============================

async function mostrarFotos() {

    listaFotos.innerHTML = "";

    const { data, error } = await supabaseClient
        .from("fotos")
        .select("*")
        .order("fecha", { ascending: false });


    if (error) {
        console.error("Error cargando fotos:", error);
        return;
    }


    if (!data || data.length === 0) {

        sinFotos.style.display = "block";

        return;
    }


    sinFotos.style.display = "none";


    data.forEach((foto) => {

        const tarjeta = document.createElement("div");

        tarjeta.className = "foto";


        const imagen = document.createElement("img");

        imagen.src = foto.url;

        imagen.alt = "Nuestro recuerdo";


        imagen.addEventListener("click", () => {

            imagenGrande.src = foto.url;

            visor.classList.add("mostrar");

        });


        const eliminar = document.createElement("button");

        eliminar.className = "eliminar";

        eliminar.textContent = "×";

        eliminar.title = "Eliminar foto";


        eliminar.addEventListener("click", async (event) => {

            event.stopPropagation();


            const confirmar = confirm(
                "¿Quieres eliminar esta foto? ❤️"
            );


            if (!confirmar) return;


            const { error } = await supabaseClient
                .from("fotos")
                .delete()
                .eq("id", foto.id);


            if (error) {

                console.error("Error eliminando:", error);

                alert("No se pudo eliminar la foto 😢");

                return;
            }


            mostrarFotos();

        });


        tarjeta.appendChild(imagen);

        tarjeta.appendChild(eliminar);

        listaFotos.appendChild(tarjeta);

    });
}


// ===============================
// SUBIR FOTOS
// ===============================

selectorFotos.addEventListener("change", async (event) => {

    const archivos = Array.from(event.target.files);


    if (archivos.length === 0) {
        return;
    }


    for (const archivo of archivos) {

        if (!archivo.type.startsWith("image/")) {
            continue;
        }


        const nombreArchivo =
            `${Date.now()}-${Math.random().toString(36).substring(2)}-${archivo.name}`;


        const ruta = nombreArchivo;


        // Subir imagen al bucket
        const { error: errorSubida } =
            await supabaseClient.storage
                .from("fotos")
                .upload(ruta, archivo);


        if (errorSubida) {

            console.error(
                "Error subiendo foto:",
                errorSubida
            );

            alert(
                "No se pudo subir una foto:\n\n" +
                errorSubida.message
            );

            continue;
        }


        // Obtener URL pública
        const { data: urlData } =
            supabaseClient.storage
                .from("fotos")
                .getPublicUrl(ruta);


        const url = urlData.publicUrl;


        // Guardar información en la tabla
        const { error: errorBD } =
            await supabaseClient
                .from("fotos")
                .insert({
                    nombre: archivo.name,
                    url: url
                });


        if (errorBD) {

            console.error(
                "Error guardando información:",
                errorBD
            );

            alert(
                "La foto se subió, pero no se pudo guardar en la galería."
            );

            continue;
        }

    }


    selectorFotos.value = "";

    mostrarFotos();

});


// ===============================
// CERRAR VISOR
// ===============================

cerrarVisor.addEventListener("click", () => {

    visor.classList.remove("mostrar");

    imagenGrande.src = "";

});


visor.addEventListener("click", (event) => {

    if (event.target === visor) {

        visor.classList.remove("mostrar");

        imagenGrande.src = "";

    }

});


// ===============================
// INICIAR
// ===============================

mostrarFotos();
