document.addEventListener("DOMContentLoaded", async () => {
  const usuarioId = localStorage.getItem("usuarioId");
  if (!usuarioId) {
    alert("Você precisa estar logado para ver suas curtidas!");
    window.location.href = "login.html";
    return;
  }

  try {
    const res = await fetch(`http://localhost:3030/likes/${usuarioId}`);
    const posts = await res.json();

    const container = document.getElementById("curtidas");
    container.innerHTML = "";

    if (posts.length === 0) {
      container.innerHTML = "<p>Você ainda não curtiu nenhum post 💬</p>";
      return;
    }

    posts.forEach(post => {
      const div = document.createElement("div");
      div.classList.add("postagem");

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

      // Ao clicar no post, ir para a página de detalhes
      div.addEventListener("click", () => {
        window.location.href = `post_detalhe.html?id=${post.id}`;
      });

      container.appendChild(div);
    });

  } catch (error) {
    console.error("Erro ao carregar posts curtidos:", error);
    document.getElementById("curtidas").innerHTML = 
      "<p>Erro ao carregar suas curtidas. Tente novamente mais tarde.</p>";
  }
});
