const form = document.getElementById('cadastroForm');
if (form) {
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const nome = document.getElementById('nome').value;
        const email = document.getElementById('email').value;
        const senha = document.getElementById('senha').value;

        if (!nome || !email || !senha ) {
            alert("Todos os campos são obrigatórios!");
            return;
        }

        const response = await fetch('http://localhost:3030/cadastro', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nome, email, senha })
        });

        const result = await response.json();

        // Verifique se o backend retornou com sucesso e o usuario_id
        if (result.success) {
            console.log("Cadast ro realizado com sucesso! ID do usuário:", result.usuario_id);
            alert("Cadastro realizado com sucesso!");
            window.location.href = "index.html";
            
        } else {
            console.error("Erro no cadastro:", result.message);
            console.error(result)
            alert("Erro no cadastro!");
        }
    });
}
function redirecionarLogin() {
    window.location.href = "login.html";
  }
  document.getElementById('botaoPaginaLogin').addEventListener('click', redirecionarLogin);