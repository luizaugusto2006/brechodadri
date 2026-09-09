from flask import Flask, render_template, jsonify
import os
import random

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
app = Flask(__name__)

IMAGES_DIR = os.path.join(BASE_DIR, 'static', 'imagem')

def get_products():
    products = []
    images = sorted([f for f in os.listdir(IMAGES_DIR) if f.endswith(('.webp', '.jpeg', '.jpg', '.png'))])
    
    categories = ['Calças', 'Calças', 'Vestidos', 'Camisas', 'Saias', 'Blusas', 'Jaquetas', 'Outros']
    
    for i, img in enumerate(images, 1):
        products.append({
            'id': i,
            'nome': f'Roupa {i:02d}',
            'imagem': f'/static/imagem/{img}',
            'preco': f'R$ {random.randint(15, 89)},{random.randint(0, 9):02d}',
            'categoria': categories[i % len(categories)],
            'tamanhos': random.sample(['P', 'M', 'G', 'GG'], k=random.randint(2, 4)),
            'descricao': f'Peça única em ótimo estado. Encontre outras peças incríveis no Brechó da Adri!'
        })
    return products

@app.route('/')
def index():
    products = get_products()
    return render_template('index.html', products=products)

@app.route('/produto/<int:product_id>')
def produto(product_id):
    products = get_products()
    product = next((p for p in products if p['id'] == product_id), None)
    if product is None:
        return render_template('404.html'), 404
    return render_template('produto.html', product=product)

@app.errorhandler(404)
def page_not_found(e):
    return render_template('404.html'), 404

if __name__ == '__main__':
    app.run(debug=True)
