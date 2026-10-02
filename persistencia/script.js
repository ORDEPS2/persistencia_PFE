let mapa;
let marcador;


/* ELEMENTOS */

const latitudeElemento =
    document.getElementById("latitude");

const longitudeElemento =
    document.getElementById("longitude");

const statusElemento =
    document.getElementById("status");

const enderecoElemento =
    document.getElementById("endereco");

const atualizarBtn =
    document.getElementById("atualizarBtn");

const temaBtn =
    document.getElementById("temaBtn");

const abaGps =
    document.getElementById("abaGps");

const abaCep =
    document.getElementById("abaCep");

const painelGps =
    document.getElementById("painelGps");

const painelCep =
    document.getElementById("painelCep");

const cepInput =
    document.getElementById("cep");

const buscarCepBtn =
    document.getElementById("buscarCepBtn");

const resultadoCep =
    document.getElementById("resultadoCep");


/* GPS */

function obterLocalizacao() {

    statusElemento.textContent =
        "Localizando...";

    enderecoElemento.textContent =
        "Obtendo localização...";


    if (!navigator.geolocation) {

        statusElemento.textContent =
            "Não suportado";

        enderecoElemento.textContent =
            "Seu navegador não suporta geolocalização.";

        return;
    }


    navigator.geolocation.getCurrentPosition(

        function(posicao) {

            const latitude =
                posicao.coords.latitude;

            const longitude =
                posicao.coords.longitude;


            atualizarInformacoes(
                latitude,
                longitude
            );


            atualizarMapa(
                latitude,
                longitude
            );


            buscarEndereco(
                latitude,
                longitude
            );

        },

        function(erro) {

            statusElemento.textContent =
                "Erro";

            enderecoElemento.textContent =
                "Permita o acesso à localização.";

            console.log(erro);

        },

        {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0
        }
    );
}


/* INFORMAÇÕES */

function atualizarInformacoes(
    latitude,
    longitude
) {

    latitudeElemento.textContent =
        latitude.toFixed(6);

    longitudeElemento.textContent =
        longitude.toFixed(6);

    statusElemento.textContent =
        "Localizado";
}


/* MAPA */

function criarMapa(
    latitude,
    longitude
) {

    if (!mapa) {

        mapa = L.map("mapa").setView(
            [
                latitude,
                longitude
            ],
            16
        );


        L.tileLayer(
            "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
            {
                attribution:
                    "&copy; OpenStreetMap contributors"
            }
        ).addTo(mapa);

    }
}


/* ATUALIZAR MAPA */

function atualizarMapa(
    latitude,
    longitude
) {

    criarMapa(
        latitude,
        longitude
    );


    mapa.setView(
        [
            latitude,
            longitude
        ],
        16
    );


    criarMarcador(
        latitude,
        longitude
    );
}


/* MARCADOR */

function criarMarcador(
    latitude,
    longitude
) {

    if (marcador) {

        mapa.removeLayer(
            marcador
        );
    }


    marcador =
        L.marker(
            [
                latitude,
                longitude
            ],
            {
                draggable: true
            }
        )
        .addTo(mapa);


    marcador.bindPopup(
        "Localização selecionada"
    );


    marcador.openPopup();


    marcador.on(
        "dragend",
        function(evento) {

            const novaPosicao =
                evento.target.getLatLng();


            const novaLatitude =
                novaPosicao.lat;


            const novaLongitude =
                novaPosicao.lng;


            atualizarInformacoes(
                novaLatitude,
                novaLongitude
            );


            buscarEndereco(
                novaLatitude,
                novaLongitude
            );

        }
    );
}


/* ENDEREÇO PELA COORDENADA */

function buscarEndereco(
    latitude,
    longitude
) {

    const url =
        `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}&accept-language=pt-BR`;


    fetch(url)

        .then(
            resposta => resposta.json()
        )

        .then(
            dados => {

                enderecoElemento.textContent =
                    dados.display_name ||
                    "Endereço não encontrado.";

            }
        )

        .catch(
            erro => {

                enderecoElemento.textContent =
                    "Não foi possível encontrar o endereço.";

                console.log(erro);

            }
        );
}


/* BUSCAR CEP */

function buscarCep() {

    let cep =
        cepInput.value.replace(
            /\D/g,
            ""
        );


    if (cep.length !== 8) {

        resultadoCep.textContent =
            "Digite um CEP válido com 8 números.";

        resultadoCep.classList.remove(
            "sucesso"
        );

        resultadoCep.classList.add(
            "erro"
        );

        return;
    }


    resultadoCep.textContent =
        "Consultando CEP...";


    resultadoCep.classList.remove(
        "erro"
    );


    const url =
        `https://viacep.com.br/ws/${cep}/json/`;


    fetch(url)

        .then(
            resposta => {

                if (!resposta.ok) {

                    throw new Error(
                        "Erro na API ViaCEP"
                    );
                }

                return resposta.json();

            }
        )

        .then(
            dados => {

                if (dados.erro) {

                    resultadoCep.textContent =
                        "CEP não encontrado.";

                    resultadoCep.classList.add(
                        "erro"
                    );

                    return;
                }


                resultadoCep.classList.remove(
                    "erro"
                );

                resultadoCep.classList.add(
                    "sucesso"
                );


                const endereco =
                    `${dados.logradouro || "Endereço não informado"}, ${dados.bairro || ""}, ${dados.localidade} - ${dados.uf}`;


                resultadoCep.textContent =
                    endereco;


                localizarPorCEP(
                    cep,
                    dados
                );

            }
        )

        .catch(
            erro => {

                resultadoCep.textContent =
                    "Não foi possível consultar o CEP.";

                resultadoCep.classList.add(
                    "erro"
                );

                console.log(erro);

            }
        );
}


/* LOCALIZAR CEP NO MAPA */

function localizarPorCEP(
    cep,
    dados
) {

    statusElemento.textContent =
        "Localizando no mapa...";


    const url =
        `https://nominatim.openstreetmap.org/search?format=jsonv2&street=${encodeURIComponent(dados.logradouro || "")}&city=${encodeURIComponent(dados.localidade)}&state=${encodeURIComponent(dados.uf)}&postalcode=${encodeURIComponent(cep)}&country=Brazil&countrycodes=br&limit=5&addressdetails=1`;


    fetch(url)

        .then(
            resposta => {

                if (!resposta.ok) {

                    throw new Error(
                        "Erro no Nominatim"
                    );
                }

                return resposta.json();

            }
        )

        .then(
            resultados => {

                console.log(
                    "Resultados do mapa:",
                    resultados
                );


                if (
                    resultados.length === 0
                ) {

                    buscarPorEndereco(
                        dados
                    );

                    return;
                }


                const resultado =
                    resultados[0];


                const latitude =
                    parseFloat(
                        resultado.lat
                    );


                const longitude =
                    parseFloat(
                        resultado.lon
                    );


                mostrarLocalizacaoCEP(
                    latitude,
                    longitude,
                    dados
                );

            }
        )

        .catch(
            erro => {

                console.log(
                    erro
                );


                buscarPorEndereco(
                    dados
                );

            }
        );
}


/* SEGUNDA TENTATIVA */

function buscarPorEndereco(
    dados
) {

    const endereco =
        `${dados.logradouro || ""}, ${dados.localidade}, ${dados.uf}, Brasil`;


    const url =
        `https://nominatim.openstreetmap.org/search?format=jsonv2&q=${encodeURIComponent(endereco)}&countrycodes=br&limit=5&addressdetails=1`;


    fetch(url)

        .then(
            resposta => {

                if (!resposta.ok) {

                    throw new Error(
                        "Erro na busca alternativa"
                    );
                }

                return resposta.json();

            }
        )

        .then(
            resultados => {

                if (
                    resultados.length === 0
                ) {

                    buscarPorCidade(
                        dados
                    );

                    return;
                }


                const resultado =
                    resultados[0];


                const latitude =
                    parseFloat(
                        resultado.lat
                    );


                const longitude =
                    parseFloat(
                        resultado.lon
                    );


                mostrarLocalizacaoCEP(
                    latitude,
                    longitude,
                    dados
                );

            }
        )

        .catch(
            erro => {

                console.log(
                    erro
                );


                buscarPorCidade(
                    dados
                );

            }
        );
}


/* ÚLTIMA TENTATIVA */

function buscarPorCidade(
    dados
) {

    const cidade =
        `${dados.localidade}, ${dados.uf}, Brasil`;


    const url =
        `https://nominatim.openstreetmap.org/search?format=jsonv2&q=${encodeURIComponent(cidade)}&countrycodes=br&limit=1`;


    fetch(url)

        .then(
            resposta => resposta.json()
        )

        .then(
            resultados => {

                if (
                    resultados.length === 0
                ) {

                    statusElemento.textContent =
                        "Não localizado";

                    enderecoElemento.textContent =
                        "O CEP foi encontrado, mas não existe uma posição disponível no mapa.";

                    return;
                }


                const latitude =
                    parseFloat(
                        resultados[0].lat
                    );


                const longitude =
                    parseFloat(
                        resultados[0].lon
                    );


                mostrarLocalizacaoCEP(
                    latitude,
                    longitude,
                    dados
                );

            }
        )

        .catch(
            erro => {

                statusElemento.textContent =
                    "Erro";

                enderecoElemento.textContent =
                    "Não foi possível localizar o endereço no mapa.";

                console.log(
                    erro
                );

            }
        );
}


/* MOSTRAR CEP NO MAPA */

function mostrarLocalizacaoCEP(
    latitude,
    longitude,
    dados
) {

    atualizarInformacoes(
        latitude,
        longitude
    );


    criarMapa(
        latitude,
        longitude
    );


    mapa.flyTo(
        [
            latitude,
            longitude
        ],
        18,
        {
            animate: true,
            duration: 1.5
        }
    );


    criarMarcador(
        latitude,
        longitude
    );


    const endereco =
        `${dados.logradouro || "Endereço não informado"}, ${dados.bairro || ""}, ${dados.localidade} - ${dados.uf}`;


    enderecoElemento.textContent =
        endereco;


    statusElemento.textContent =
        "CEP localizado";


    marcador.bindPopup(
        `<strong>Localização do CEP</strong><br>${endereco}`
    );


    marcador.openPopup();


    setTimeout(
        function() {

            mapa.invalidateSize();

        },
        300
    );
}


/* MÁSCARA DO CEP */

cepInput.addEventListener(
    "input",
    function() {

        let valor =
            cepInput.value.replace(
                /\D/g,
                ""
            );


        if (
            valor.length > 5
        ) {

            valor =
                valor.substring(0, 5)
                + "-"
                + valor.substring(5, 8);

        }


        cepInput.value =
            valor;

    }
);


/* ENTER */

cepInput.addEventListener(
    "keydown",
    function(evento) {

        if (
            evento.key === "Enter"
        ) {

            buscarCep();

        }

    }
);


/* BOTÃO CEP */

buscarCepBtn.addEventListener(
    "click",
    function() {

        buscarCep();

    }
);


/* BOTÃO GPS */

atualizarBtn.addEventListener(
    "click",
    function() {

        obterLocalizacao();

    }
);


/* ABA GPS */

abaGps.addEventListener(
    "click",
    function() {

        abaGps.classList.add(
            "ativa"
        );

        abaCep.classList.remove(
            "ativa"
        );

        painelGps.classList.remove(
            "escondido"
        );

        painelCep.classList.add(
            "escondido"
        );


        setTimeout(
            function() {

                if (mapa) {

                    mapa.invalidateSize();

                }

            },
            200
        );

    }
);


/* ABA CEP */

abaCep.addEventListener(
    "click",
    function() {

        abaCep.classList.add(
            "ativa"
        );

        abaGps.classList.remove(
            "ativa"
        );

        painelCep.classList.remove(
            "escondido"
        );

        painelGps.classList.add(
            "escondido"
        );


        setTimeout(
            function() {

                if (mapa) {

                    mapa.invalidateSize();

                }

            },
            200
        );

    }
);


/* TEMA */

temaBtn.addEventListener(
    "click",
    function() {

        document.body.classList.toggle(
            "escuro"
        );


        if (
            document.body.classList.contains(
                "escuro"
            )
        ) {

            temaBtn.textContent =
                "Modo claro";

        } else {

            temaBtn.textContent =
                "Modo escuro";

        }

    }
);


/* INICIAR */

obterLocalizacao();