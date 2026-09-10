# Brechó da Dri

Site de e-commerce para venda de roupas de segunda mão.

## Funcionalidades

- Catálogo de produtos com imagens
- Filtro por categorias
- Página de detalhes do produto
- Link para WhatsApp para compra
- Design responsivo

## Tecnologias

- Python 3
- Flask
- HTML5
- CSS3
- JavaScript

## Estrutura

```
brechodadri/
├── app.py              # Aplicação Flask
├── requirements.txt    # Dependências
├── static/
│   ├── css/
│   │   └── style.css
│   ├── js/
│   │   └── main.js
│   └── imagem/         # Imagens dos produtos
├── templates/
│   ├── base.html
│   ├── index.html
│   ├── produto.html
│   └── 404.html
└── imagem/             # Imagens originais
```

## Deploy no PythonAnywhere

1. Clone o repositório
2. Crie um virtualenv
3. Instale as dependências: `pip install -r requirements.txt`
4. Configure o WSGI
5. Configure os static files

## Licença

MIT
