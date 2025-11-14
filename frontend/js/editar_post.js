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
    // Salvar alterações
    // =============================
    document.getElementById("formEditarPost").addEventListener("submit", async (e) => {
      e.preventDefault();
  
      const title = document.getElementById("editTitle").value;
      const description = document.getElementById("editDescription").value;
  
      const payload = {
        title,
        description,
        user_id: usuarioId
      };
  
      try {
        const resposta = await fetch(`http://localhost:3030/posts/${postId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
  
        if (!resposta.ok) {
          alert("Erro ao atualizar o post.");
          return;
        }
  
        alert("Post atualizado com sucesso!");
        window.location.href = `post_detalhe.html?id=${postId}`;
  
      } catch (err) {
        console.error("Erro ao salvar alterações:", err);
        alert("Erro ao atualizar o post.");
      }
    });
  });
  