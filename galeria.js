let fotos = JSON.parse(
    localStorage.getItem("misFotos")
) || [];

const selectorFotos =
    document.getElementById("selectorFotos");

const listaFotos =
    document.getElementById("listaFotos");

const sinFotos =
    document.getElementById("sinFotos");

const visor =
    document.getElementById("visor");

const imagenGrande =
    document.getElementById("imagenGrande");

const cerrarVisor =
    document.getElementById("cerrarVisor");


/* =========================
   MOSTRAR FOTOS
========================= */

function mostrarFotos() {

    listaFotos.innerHTML = "";

    if (fotos.length === 0) {

        sinFotos.style.display = "block";

        return;
    }

    sinFotos.style.display = "none";


    fotos.forEach((foto) => {

        const tarjeta = document.createElement("div");

        tarjeta.className = "foto";


        const imagen = document.createElement("img");

        imagen.src = foto.imagen;

        imagen.alt = "Nuestro recuerdo";


        imagen.addEventListener("click", () => {

            imagenGrande.src = foto.imagen;

            visor.classList.add("mostrar");

        });


        const eliminar = document.createElement("button");

        eliminar.className = "eliminar";

        eliminar.textContent = "×";

        eliminar.title = "Eliminar foto";


        eliminar.addEventListener("click", (event) => {

            event.stopPropagation();

            const confirmar = confirm(
                "¿Quieres eliminar esta foto? ❤️"
            );

            if (!confirmar) {
                return;
            }

            fotos = fotos.filter(
                item => item.id !== foto.id
            );

            guardarFotos();

            mostrarFotos();

        });


        tarjeta.appendChild(imagen);

        tarjeta.appendChild(eliminar);

        listaFotos.appendChild(tarjeta);

    });

}


/* =========================
   AGREGAR FOTOS
========================= */

selectorFotos.addEventListener(
    "change",
    (event) => {

        const archivos =
            Array.from(event.target.files);


        archivos.forEach((archivo) => {

            if (!archivo.type.startsWith("image/")) {
                return;
            }


            const lector = new FileReader();


            lector.onload = (e) => {

                fotos.unshift({

                    id:
                        Date.now() +
                        Math.random(),

                    imagen:
                        e.target.result

                });


                guardarFotos();

                mostrarFotos();

            };


            lector.readAsDataURL(archivo);

        });


        selectorFotos.value = "";

    }
);


/* =========================
   GUARDAR
========================= */

function guardarFotos() {

    localStorage.setItem(
        "misFotos",
        JSON.stringify(fotos)
    );

}


/* =========================
   CERRAR FOTO
========================= */

cerrarVisor.addEventListener(
    "click",
    () => {

        visor.classList.remove("mostrar");

        imagenGrande.src = "";

    }
);


visor.addEventListener(
    "click",
    (event) => {

        if (event.target === visor) {

            visor.classList.remove("mostrar");

            imagenGrande.src = "";

        }

    }
);


/* =========================
   INICIAR
========================= */

mostrarFotos();