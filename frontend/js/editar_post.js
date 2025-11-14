document.addEventListener("DOMContentLoaded", async () => {
    const params = new URLSearchParams(window.location.search);
    const postId = params.get("id");
    const usuarioId = localStorage.getItem("usuarioId");

    if (!postId) {
        alert("Post inválido!");
        window.location.href = "index.html";
        return;
    }

    // =============================
    // Carregar dados do post
    // =============================
    async function carregarPost() {
        try {
            const res = await fetch(`http://localhost:3030/posts/${postId}`);
            const post = await res.json();

            document.getElementById("editTitle").value = post.title;
            document.getElementById("editDescription").value = post.description;
        } catch (err) {
            console.error("Erro ao carregar post:", err);
            alert("Erro ao carregar o post.");
        }
    }

    await carregarPost();

    // =============================
    // Salvar alterações (CORRIGIDO)
    // =============================
    document.getElementById("formEditarPost").addEventListener("submit", async (e) => {
        e.preventDefault();

        // 1. Criar um objeto FormData
        const formData = new FormData();

        // 2. Adicionar os campos de texto ao FormData
        formData.append("title", document.getElementById("editTitle").value);
        formData.append("description", document.getElementById("editDescription").value);
        formData.append("user_id", usuarioId); // O backend espera 'user_id' no req.body

        // 3. Adicionar o arquivo de imagem (se um novo foi selecionado)
        const imageFile = document.getElementById("editImage").files[0];
        if (imageFile) {
            // O nome 'image' deve bater com o upload.single('image') no backend
            formData.append("image", imageFile);
        }

        try {
            const resposta = await fetch(`http://localhost:3030/posts/${postId}`, {
                method: "PUT",
                // 4. NÃO definir o 'Content-Type'. O browser fará isso
                //    automaticamente ao enviar FormData, incluindo o 'boundary'
                body: formData // Enviar o objeto FormData
            });

            if (!resposta.ok) {
                // Tenta ler a mensagem de erro do backend
                const erro = await resposta.json();
                console.error("Erro do backend:", erro);
                alert(`Erro ao atualizar o post: ${erro.error || 'Erro desconhecido'}`);
                return;
            }

            alert("Post atualizado com sucesso!");
            window.location.href = `../pages/post_detalhe.html?id=${postId}`;

        } catch (err) {
            console.error("Erro ao salvar alterações:", err);
            alert("Erro ao atualizar o post.");
        }
    });
});