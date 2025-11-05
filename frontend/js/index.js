document.addEventListener("DOMContentLoaded", async () => {
  // Carregar posts
  async function carregarPosts() {
    try {
      const res = await fetch("http://localhost:3030/posts");
      const posts = await res.json();

      const minhasContainer = document.getElementById("minhas-postagens");
      const recentesContainer = document.getElementById("recentes");

      if (!minhasContainer || !recentesContainer) return;

      minhasContainer.innerHTML = "";
      recentesContainer.innerHTML = "";

      posts.forEach(post => {
        const div = document.createElement("div");
        div.innerHTML = `
          <h3>${post.title}</h3>
          <p>${post.description}</p>
          <p><b>Autor:</b> 
            <a href="perfil.html?id=${post.author_id}" class="autor-link">
              ${post.author_name}
            </a>
          </p>
          ${post.url ? `<img src="http://localhost:3030${post.url}" width="200">` : ""}
          <hr>
        `;

        // 🔹 Quando o usuário clicar nesse post:
        div.addEventListener("click", () => {
          // Envia ele para a página de detalhe, passando o ID do post pela URL
          window.location.href = `post_detalhe.html?id=${post.id}`;
        });

        // Se for do usuário logado, mostra em "Minhas Postagens"
        if (post.author_id == localStorage.getItem("usuarioId")) {
          const divMinhas = document.createElement("div");
          divMinhas.innerHTML = div.innerHTML;
          divMinhas.addEventListener("click", () => {
            window.location.href = `post_detalhe.html?id=${post.id}`;
          });
          minhasContainer.appendChild(divMinhas);
}

recentesContainer.appendChild(div);

        // Mostra também em "Postagens Recentes"
        recentesContainer.appendChild(div);
      });
    } catch (error) {
      console.error("Erro ao carregar posts:", error);
    }
  }

  // Evento da aba flutuante
  const aba = document.getElementById("abaFlutuante");
  if (aba) {
    aba.addEventListener("click", () => {
      const usuarioId = localStorage.getItem("usuarioId");
      if (usuarioId) {
        window.location.href = "chat.html";
      } else {
        window.location.href = "login.html";
      }
    });
  }

  // Chama a função de carregar os posts
  carregarPosts();
});
