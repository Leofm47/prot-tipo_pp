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
            <p><b>Autor:</b> ${post.author_name}</p>
            ${post.url ? `<img src="http://localhost:3030${post.url}" width="200">` : ""}
            <hr>
          `;
          // Se for do usuário logado
          if (post.author_id == localStorage.getItem("usuarioId")) {
            minhasContainer.appendChild(div.cloneNode(true));
          }
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
  