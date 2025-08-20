let usuarioId = localStorage.getItem("usuarioId");

// Seleciona o form
const formPost = document.getElementById("formPost");

formPost.addEventListener("submit", async (e) => {
    e.preventDefault();

    if (!usuarioId) {
        alert("Você precisa estar logado para postar!");
        return;
    }

    // Criar FormData
    const formData = new FormData(formPost);
    formData.append("author_id", usuarioId);

    try {
        const res = await fetch("http://localhost:3030/posts", {
            method: "POST",
            body: formData
        });

        const data = await res.json();

        if (data.success) {
            alert(data.message);
            formPost.reset(); // Limpa o formulário
            window.location.href = "index.html"
        } else {
            alert("Erro: " + data.message);
        }
    } catch (err) {
        console.error("Erro ao enviar post:", err);
        alert("Ocorreu um erro ao criar o post.");
    }
});