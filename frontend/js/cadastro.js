const form = document.getElementById('cadastroForm');
if (form) {
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        if (!name || !email || !password ) {
            alert("Todos os campos são obrigatórios!");
            return;
        }

        const response = await fetch('http://localhost:3030/cadastro', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, password })
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
