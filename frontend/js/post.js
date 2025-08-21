formPost.addEventListener("submit", async (e) => {
    e.preventDefault();

    const usuarioId = localStorage.getItem("usuarioId");
    if (!usuarioId) {
        alert("Você precisa estar logado para postar!");
        return;
    }

    const formData = new FormData(formPost);
    formData.append("author_id", usuarioId);

    try {
        const res = await fetch("http://localhost:3030/posts", {
            method: "POST",
            body: formData
        });

        const data = await res.json();
        console.log(data);

        if (data.success) {
            //alert(data.message);
            window.location.href = "index.html"; 
        } else {
            alert("Erro: " + data.message);
        }
    } catch (err) {
        console.error("Erro ao enviar post:", err);
        alert("Ocorreu um erro ao criar o post.");
    }
});
