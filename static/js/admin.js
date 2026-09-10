document.addEventListener('DOMContentLoaded', function() {
    // Seletor de emojis
    const emojiInput = document.getElementById('emojiInput');
    const emojiPicker = document.getElementById('emojiPicker');
    
    if (emojiInput && emojiPicker) {
        emojiInput.addEventListener('click', function() {
            emojiPicker.classList.toggle('active');
        });
        
        document.querySelectorAll('.emoji-option').forEach(option => {
            option.addEventListener('click', function() {
                emojiInput.value = this.getAttribute('data-emoji');
                emojiPicker.classList.remove('active');
            });
        });
        
        document.addEventListener('click', function(e) {
            if (!emojiInput.contains(e.target) && !emojiPicker.contains(e.target)) {
                emojiPicker.classList.remove('active');
            }
        });
    }

    // Filtro de busca
    const searchInput = document.getElementById('searchInput');
    const filterCategoria = document.getElementById('filterCategoria');
    const filterGenero = document.getElementById('filterGenero');
    const produtoItems = document.querySelectorAll('.produto-item');

    function filterProducts() {
        const searchTerm = searchInput.value.toLowerCase();
        const selectedCategoria = filterCategoria.value;
        const selectedGenero = filterGenero ? filterGenero.value : 'all';

        produtoItems.forEach(item => {
            const nome = item.querySelector('h3').textContent.toLowerCase();
            const categoria = item.getAttribute('data-categoria');
            const genero = item.getAttribute('data-genero');

            const matchesSearch = nome.includes(searchTerm);
            const matchesCategoria = selectedCategoria === 'all' || categoria === selectedCategoria;
            const matchesGenero = selectedGenero === 'all' || genero === selectedGenero;

            if (matchesSearch && matchesCategoria && matchesGenero) {
                item.style.display = 'grid';
            } else {
                item.style.display = 'none';
            }
        });
    }

    searchInput.addEventListener('input', filterProducts);
    filterCategoria.addEventListener('change', filterProducts);
    if (filterGenero) {
        filterGenero.addEventListener('change', filterProducts);
    }

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

    // Formulário de nova categoria
    document.getElementById('novaCategoriaForm').addEventListener('submit', function(e) {
        e.preventDefault();
        const formData = new FormData(this);
        const nome = formData.get('nome');
        const emoji = formData.get('emoji');

        fetch('/admin/adicionar-categoria', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ nome: nome, emoji: emoji })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                alert('Categoria adicionada com sucesso!');
                location.reload();
            } else {
                alert(data.error || 'Erro ao adicionar categoria.');
            }
        })
        .catch(error => {
            console.error('Erro:', error);
            alert('Erro ao adicionar categoria.');
        });
    });

    // Formulário de nova subcategoria
    document.getElementById('novaSubcategoriaForm').addEventListener('submit', function(e) {
        e.preventDefault();
        const formData = new FormData(this);
        const categoriaPai = formData.get('categoria_pai');
        const nome = formData.get('nome');

        fetch('/admin/adicionar-subcategoria', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ categoria_pai: categoriaPai, nome: nome })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                alert('Subcategoria adicionada com sucesso!');
                location.reload();
            } else {
                alert(data.error || 'Erro ao adicionar subcategoria.');
            }
        })
        .catch(error => {
            console.error('Erro:', error);
            alert('Erro ao adicionar subcategoria.');
        });
    });

    // Formulário de novo produto
    const novoProdutoForm = document.getElementById('novoProdutoForm');
    if (novoProdutoForm) {
        const categoriaSelect = novoProdutoForm.querySelector('[name="categoria_id"]');
        const subcategoriaSelect = novoProdutoForm.querySelector('[name="subcategoria"]');

        // Buscar subcategorias do servidor
        let subcategoriasData = {};

        async function loadSubcategorias() {
            try {
                const response = await fetch('/api/subcategorias');
                if (response.ok) {
                    subcategoriasData = await response.json();
                }
            } catch (error) {
                console.error('Erro ao carregar subcategorias:', error);
            }
        }

        if (categoriaSelect) {
            categoriaSelect.addEventListener('change', function() {
                const categoriaId = this.value;
                subcategoriaSelect.innerHTML = '<option value="">Selecione...</option>';
                
                // Buscar nome da categoria selecionada
                const option = this.options[this.selectedIndex];
                const catNome = option.text.replace(/^[^\s]+\s/, ''); // Remove emoji
                
                if (subcategoriasData[catNome]) {
                    subcategoriasData[catNome].forEach(function(sub) {
                        subcategoriaSelect.innerHTML += '<option value="' + sub + '">' + sub + '</option>';
                    });
                }
            });
        }

        loadSubcategorias();

        novoProdutoForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const formData = new FormData(this);
            
            // Use FormData directly for file upload
            fetch('/admin/adicionar-produto', {
                method: 'POST',
                body: formData
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    alert('Produto adicionado com sucesso! ID: ' + data.id);
                    location.reload();
                } else {
                    alert(data.error || 'Erro ao adicionar produto.');
                }
            })
            .catch(error => {
                console.error('Erro:', error);
                alert('Erro ao adicionar produto.');
            });
        });
    }

    // Botões de remover subcategoria
    document.querySelectorAll('.btn-remove').forEach(btn => {
        btn.addEventListener('click', function() {
            const categoriaPai = this.getAttribute('data-categoria');
            const nome = this.getAttribute('data-sub');

            if (confirm(`Remover "${nome}" de "${categoriaPai}"?`)) {
                fetch('/admin/remover-subcategoria', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ categoria_pai: categoriaPai, nome: nome })
                })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        location.reload();
                    } else {
                        alert('Erro ao remover subcategoria.');
                    }
                })
                .catch(error => {
                    console.error('Erro:', error);
                    alert('Erro ao remover subcategoria.');
                });
            }
        });
    });

    // Botões de remover categoria
    document.querySelectorAll('.btn-remove-cat').forEach(btn => {
        btn.addEventListener('click', function() {
            const catId = parseInt(this.getAttribute('data-id'));
            const catNome = this.getAttribute('data-nome');

            if (confirm(`Remover a categoria "${catNome}"? Todos os produtos dessa categoria serão afetados!`)) {
                fetch('/admin/remover-categoria', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ id: catId })
                })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        location.reload();
                    } else {
                        alert('Erro ao remover categoria.');
                    }
                })
                .catch(error => {
                    console.error('Erro:', error);
                    alert('Erro ao remover categoria.');
                });
            }
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
                } else if (campo === 'veste' || campo === 'observacao' || campo === 'nome') {
                    produtos[produtoId][campo] = value;
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

    // ===== Pedidos =====
    let ordersData = [];
    const ordersList = document.getElementById('ordersList');
    const filterStatus = document.getElementById('filterStatus');

    async function loadOrders() {
        try {
            const response = await fetch('/api/orders');
            if (response.ok) {
                ordersData = await response.json();
                renderOrders();
            }
        } catch (error) {
            console.error('Erro ao carregar pedidos:', error);
        }
    }

    function renderOrders() {
        const statusFilter = filterStatus ? filterStatus.value : 'all';
        const filtered = ordersData.filter(function(o) {
            return statusFilter === 'all' || o.status === statusFilter;
        });

        if (!filtered.length) {
            ordersList.innerHTML = '<p class="no-orders">Nenhum pedido encontrado.</p>';
            return;
        }

        ordersList.innerHTML = filtered.slice().reverse().map(function(o) {
            var statusClass = 'status-' + o.status.toLowerCase();
            var actions = '';
            if (o.status === 'Solicitado') {
                actions = '<button class="order-btn btn-confirm" data-action="confirm" data-id="' + o.id + '">✅ Confirmar</button>' +
                          '<button class="order-btn btn-cancel" data-action="cancel" data-id="' + o.id + '">❌ Cancelar</button>';
            } else if (o.status === 'Confirmado') {
                actions = '<button class="order-btn btn-ship" data-action="ship" data-id="' + o.id + '">📦 Enviar</button>';
            } else if (o.status === 'Enviado') {
                actions = '<button class="order-btn btn-deliver" data-action="deliver" data-id="' + o.id + '">🚚 Entregue</button>';
            }

            return '<div class="order-item" data-id="' + o.id + '">' +
                '<div class="order-header">' +
                    '<span class="order-status-badge ' + statusClass + '">' + o.status + '</span>' +
                    '<span class="order-date">' + o.data + '</span>' +
                '</div>' +
                '<div class="order-body">' +
                    '<div class="order-line"><strong>Produto:</strong> ' + o.produto + '</div>' +
                    '<div class="order-line"><strong>Cliente:</strong> ' + o.nome + '</div>' +
                    '<div class="order-line"><strong>Telefone:</strong> ' + o.telefone + '</div>' +
                    (o.tamanho ? '<div class="order-line"><strong>Tamanho:</strong> ' + o.tamanho + '</div>' : '') +
                    (o.observacao ? '<div class="order-line"><strong>Obs:</strong> ' + o.observacao + '</div>' : '') +
                '</div>' +
                '<div class="order-actions">' + actions + '</div>' +
            '</div>';
        }).join('');

        ordersList.querySelectorAll('[data-action]').forEach(function(btn) {
            btn.addEventListener('click', function() {
                var action = btn.getAttribute('data-action');
                var id = parseInt(btn.getAttribute('data-id'));
                updateOrderStatus(id, action);
            });
        });
    }

    async function updateOrderStatus(id, action) {
        var order = ordersData.find(function(o) { return o.id === id; });
        if (!order) return;

        var newStatus = '';
        switch (action) {
            case 'confirm': newStatus = 'Confirmado'; break;
            case 'cancel': newStatus = 'Cancelado'; break;
            case 'ship': newStatus = 'Enviado'; break;
            case 'deliver': newStatus = 'Entregue'; break;
        }

        if (newStatus) {
            order.status = newStatus;
            try {
                await fetch('/api/orders/' + id, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(order)
                });
                renderOrders();
                alert('Pedido #' + id + ' atualizado para: ' + newStatus);
            } catch (error) {
                alert('Erro ao atualizar pedido.');
            }
        }
    }

    if (filterStatus) {
        filterStatus.addEventListener('change', renderOrders);
    }

    loadOrders();

    // ===== Relatório de Vendas =====
    const salesReport = document.getElementById('salesReport');

    async function loadSales() {
        try {
            const response = await fetch('/api/sales');
            if (response.ok) {
                const sales = await response.json();
                renderSales(sales);
            }
        } catch (error) {
            console.error('Erro ao carregar vendas:', error);
        }
    }

    function renderSales(sales) {
        if (!sales || !sales.length) {
            salesReport.innerHTML = '<p class="no-sales">Nenhuma venda registrada.</p>';
            return;
        }

        salesReport.innerHTML = sales.slice().reverse().map(function(s) {
            return '<div class="sale-item">' +
                '<div class="sale-image">' +
                    '<img src="/static/vendas/' + s.imagem + '" alt="' + s.produto_nome + '">' +
                '</div>' +
                '<div class="sale-info">' +
                    '<div class="sale-line"><strong>Produto:</strong> ' + s.produto_nome + '</div>' +
                    '<div class="sale-line"><strong>Cliente:</strong> ' + s.cliente + '</div>' +
                    '<div class="sale-line"><strong>Telefone:</strong> ' + s.telefone + '</div>' +
                    '<div class="sale-line"><strong>Data da Venda:</strong> ' + s.data_venda + '</div>' +
                '</div>' +
            '</div>';
        }).join('');
    }

    loadSales();
});
