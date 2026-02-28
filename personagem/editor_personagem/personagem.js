let skills = [];

function addSkill() {

    const skillDiv = document.createElement("div");

    skillDiv.innerHTML = `
        <input type="text" placeholder="Nome da Skill">
        <input type="number" placeholder="Dano">
        <input type="number" placeholder="Custo MP">
        <button onclick="this.parentElement.remove()">Remover</button>
    `;

    document.getElementById("skillsContainer").appendChild(skillDiv);
}

function salvarPersonagem() {

    const spriteFile =
        document.getElementById("sprite").files[0];

    const personagem = {
        nome: document.getElementById("nome").value,
        classe: document.getElementById("classe").value,

        atributos: {
            atk: parseInt(document.getElementById("atk").value),
            def: parseInt(document.getElementById("def").value),
            sorte: parseInt(document.getElementById("sorte").value),
            fe: parseInt(document.getElementById("fe").value),
            agilidade: parseInt(document.getElementById("agi").value),
            vida: parseInt(document.getElementById("vida").value),
             mp: parseInt(document.getElementById("mp").value),
            precisao: parseInt(document.getElementById("precisao").value)
        },

        skills: []
    };

    const skillDivs =
        document.querySelectorAll("#skillsContainer div");

    skillDivs.forEach(div => {

        const inputs = div.querySelectorAll("input");

        personagem.skills.push({
            nome: inputs[0].value,
            dano: parseInt(inputs[1].value),
            custoMP: parseInt(inputs[2].value)
        });
    });

    const dataStr =
        "data:text/json;charset=utf-8," +
        encodeURIComponent(JSON.stringify(personagem));

    const dl = document.createElement("a");
    dl.setAttribute("href", dataStr);
    dl.setAttribute("download",
        personagem.nome + ".json");

    dl.click();
}