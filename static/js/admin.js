document.addEventListener('DOMContentLoaded', function() {
    // Filtro de busca
    const searchInput = document.getElementById('searchInput');
    const filterCategoria = document.getElementById('filterCategoria');
    const produtoItems = document.querySelectorAll('.produto-item');

    function filterProducts() {
        const searchTerm = searchInput.value.toLowerCase();
        const selectedCategoria = filterCategoria.value;

        produtoItems.forEach(item => {
            const nome = item.querySelector('h3').textContent.toLowerCase();
            const categoria = item.getAttribute('data-categoria');

            const matchesSearch = nome.includes(searchTerm);
            const matchesCategoria = selectedCategoria === 'all' || categoria === selectedCategoria;

            if (matchesSearch && matchesCategoria) {
                item.style.display = 'grid';
            } else {
                item.style.display = 'none';
            }
        });
    }

    searchInput.addEventListener('input', filterProducts);
    filterCategoria.addEventListener('change', filterProducts);

    // Atualizar subcategorias quando a categoria muda
    const subcategorias = {
        'Calças': ['Calça Jeans', 'Calça Alfaiataria', 'Calça Social', 'Calça Moletom', 'Calça Sarja'],
        'Vestidos': ['Vestido Longo', 'Vestido Curto', 'Vestido Midi', 'Vestido Floral', 'Vestido Social'],
        'Camisas': ['Camisa Social', 'Camisa Estampada', 'Camisa Lisa', 'Camisa Manga Longa', 'Camisa Manga Curta'],
        'Saias': ['Saia Jeans', 'Saia Midi', 'Saia Curta', 'Saia Longa', 'Saia Social'],
        'Blusas': ['Blusa Social', 'Blusa Estampada', 'Blusa Lisa', 'Blusa Cropped', 'Blusa Moletom'],
        'Jaquetas': ['Jaqueta Jeans', 'Jaqueta Couro', 'Jaqueta Moletom', 'Jaqueta Corta Vento'],
        'Acessórios': ['Bolsa', 'Cinto', 'Chapéu', 'Bijuterias', 'Cachecol'],
        'Outros': ['Conjunto', 'Macacão', 'Pijama', 'ewear']
    };

    const categoriasNomes = {
        '1': 'Calças',
        '2': 'Vestidos',
        '3': 'Camisas',
        '4': 'Saias',
        '5': 'Blusas',
        '6': 'Jaquetas',
        '7': 'Acessórios',
        '8': 'Outros'
    };

    document.querySelectorAll('[name*="_categoria"]').forEach(select => {
        select.addEventListener('change', function() {
            const produtoId = this.name.split('_')[1];
            const subcategoriaSelect = document.querySelector(`[name="produto_${produtoId}_subcategoria"]`);
            const categoriaId = this.value;
            const categoriaNome = categoriasNomes[categoriaId];

            subcategoriaSelect.innerHTML = '<option value="">Selecione...</option>';

            if (categoriaNome && subcategorias[categoriaNome]) {
                subcategorias[categoriaNome].forEach(sub => {
                    const option = document.createElement('option');
                    option.value = sub;
                    option.textContent = sub;
                    subcategoriaSelect.appendChild(option);
                });
            }
        });
    });

    // Formulário de categorias
    document.getElementById('categoriasForm').addEventListener('submit', function(e) {
        e.preventDefault();
        const formData = new FormData(this);
        const categoriasAtivas = formData.getAll('categorias');

        fetch('/admin/salvar-categorias', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ categorias: categoriasAtivas })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                alert('Categorias salvas com sucesso!');
            } else {
                alert('Erro ao salvar categorias.');
            }
        })
        .catch(error => {
            console.error('Erro:', error);
            alert('Erro ao salvar categorias.');
        });
    });

    // Formulário de produtos
    document.getElementById('produtosForm').addEventListener('submit', function(e) {
        e.preventDefault();
        const formData = new FormData(this);
        const produtos = {};

        formData.forEach((value, key) => {
            const parts = key.split('_');
            if (parts[0] === 'produto') {
                const produtoId = parts[1];
                const campo = parts[2];

                if (!produtos[produtoId]) {
                    produtos[produtoId] = {};
                }

                if (campo === 'tamanhos') {
                    if (!produtos[produtoId].tamanhos) {
                        produtos[produtoId].tamanhos = [];
                    }
                    produtos[produtoId].tamanhos.push(value);
                } else if (campo === 'preco') {
                    produtos[produtoId][campo] = parseFloat(value);
                } else {
                    produtos[produtoId][campo] = value;
                }
            }
        });

        fetch('/admin/salvar-produtos', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ produtos: produtos })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                alert('Produtos salvos com sucesso!');
                location.reload();
            } else {
                alert('Erro ao salvar produtos.');
            }
        })
        .catch(error => {
            console.error('Erro:', error);
            alert('Erro ao salvar produtos.');
        });
    });
});
