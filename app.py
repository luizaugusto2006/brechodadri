from flask import Flask, render_template, jsonify, request, session, redirect, url_for, send_from_directory
import os
import json
import secrets
import uuid
import hashlib
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from datetime import datetime, timezone, timedelta

# Horário de Brasília (UTC-3)
BRT = timezone(timedelta(hours=-3))

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
app = Flask(__name__)
app.secret_key = secrets.token_hex(32)

IMAGES_DIR = os.path.join(BASE_DIR, 'static', 'imagem')
VENDAS_DIR = os.path.join(BASE_DIR, 'static', 'vendas')
PRODUTOS_FILE = os.path.join(BASE_DIR, 'produtos.json')
ORDERS_FILE = os.path.join(BASE_DIR, 'orders.json')

ADMIN_USER = "admin"
ADMIN_PASS_PADRAO = "brechodadri2026"
ADMIN_CONFIG_FILE = os.path.join(BASE_DIR, 'admin_config.json')

def load_admin_config():
    if not os.path.exists(ADMIN_CONFIG_FILE):
        return {}
    try:
        with open(ADMIN_CONFIG_FILE, 'r', encoding='utf-8') as f:
            return json.load(f)
    except (ValueError, OSError):
        return {}

def hash_senha(senha, salt=None):
    salt = salt or secrets.token_hex(16)
    digesto = hashlib.pbkdf2_hmac('sha256', senha.encode('utf-8'), bytes.fromhex(salt), 200000)
    return salt, digesto.hex()

def senha_correta(senha):
    config = load_admin_config()
    salt = config.get('senha_salt')
    esperado = config.get('senha_hash')
    if not salt or not esperado:
        return senha == ADMIN_PASS_PADRAO
    _, calculado = hash_senha(senha, salt)
    return secrets.compare_digest(calculado, esperado)

def load_produtos():
    with open(PRODUTOS_FILE, 'r', encoding='utf-8') as f:
        return json.load(f)

def save_produtos(data):
    with open(PRODUTOS_FILE, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

def load_orders():
    if not os.path.exists(ORDERS_FILE):
        return []
    with open(ORDERS_FILE, 'r', encoding='utf-8') as f:
        return json.load(f)

def save_orders(orders):
    with open(ORDERS_FILE, 'w', encoding='utf-8') as f:
        json.dump(orders, f, ensure_ascii=False, indent=2)

TAMANHOS_PADRAO = ['P', 'M', 'G', 'GG', '36', '38', '40', '42', '44', '46', '48', 'Tamanho Único']

def get_tamanhos(data):
    tamanhos = data.get('tamanhos_disponiveis')
    if not tamanhos:
        tamanhos = list(TAMANHOS_PADRAO)
        data['tamanhos_disponiveis'] = tamanhos
    return tamanhos

def agrupar_tamanhos(disponiveis, selecionados=None):
    selecionados = list(selecionados or [])
    todos = list(disponiveis) + [t for t in selecionados if t not in disponiveis]
    grupos = {'Letra': [], 'Número': [], 'Outros': []}
    for t in todos:
        if t.isdigit():
            grupos['Número'].append(t)
        elif len(t) <= 3 and t.isalpha():
            grupos['Letra'].append(t)
        else:
            grupos['Outros'].append(t)
    return [
        {'titulo': nome, 'itens': [{'valor': v, 'checked': v in selecionados} for v in itens]}
        for nome, itens in grupos.items() if itens
    ]

def login_required(f):
    from functools import wraps
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if not session.get('logged_in'):
            return redirect(url_for('login'))
        return f(*args, **kwargs)
    return decorated_function

@app.route('/')
def index():
    data = load_produtos()
    categorias_ativas = [cat['id'] for cat in data['categorias'] if cat.get('ativa', True)]
    produtos = [p for p in data['produtos'] if p['categoria_id'] in categorias_ativas]
    return render_template('index.html', products=produtos, categorias=data['categorias'])

@app.route('/feminino')
def feminino():
    data = load_produtos()
    categorias_ativas = [cat['id'] for cat in data['categorias'] if cat.get('ativa', True)]
    produtos = [p for p in data['produtos'] if p['categoria_id'] in categorias_ativas and p.get('genero') in ['feminino', 'unissex']]
    return render_template('index.html', products=produtos, categorias=data['categorias'], genero='feminino')

@app.route('/masculino')
def masculino():
    data = load_produtos()
    categorias_ativas = [cat['id'] for cat in data['categorias'] if cat.get('ativa', True)]
    produtos = [p for p in data['produtos'] if p['categoria_id'] in categorias_ativas and p.get('genero') in ['masculino', 'unissex']]
    return render_template('index.html', products=produtos, categorias=data['categorias'], genero='masculino')

@app.route('/produto/<int:product_id>')
def produto(product_id):
    data = load_produtos()
    product = next((p for p in data['produtos'] if p['id'] == product_id), None)
    if product is None:
        return render_template('404.html'), 404
    categorias = data['categorias']
    subcategorias = data.get('subcategorias', {})
    return render_template('produto.html', product=product, categorias=categorias, subcategorias=subcategorias)

@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        username = request.form.get('username')
        password = request.form.get('password')
        
        if username == ADMIN_USER and senha_correta(password):
            session['logged_in'] = True
            return redirect(url_for('admin'))
        else:
            return render_template('login.html', error='Usuário ou senha inválidos')
    
    return render_template('login.html', error=None)

@app.route('/logout')
def logout():
    session.pop('logged_in', None)
    return redirect(url_for('index'))

@app.route('/admin')
@login_required
def admin():
    data = load_produtos()
    categorias = data['categorias']
    categorias_ativas = [cat['id'] for cat in categorias if cat.get('ativa', True)]
    produtos = data['produtos']
    subcategorias = data.get('subcategorias', {})
    tamanhos = get_tamanhos(data)
    for produto in produtos:
        produto['tam_grupos'] = agrupar_tamanhos(tamanhos, produto.get('tamanhos', []))
    grupos_novos = agrupar_tamanhos(tamanhos)
    return render_template('admin.html', categorias=categorias, categorias_ativas=categorias_ativas, 
                         produtos=produtos, subcategorias=subcategorias, tamanhos=tamanhos,
                         grupos_novos=grupos_novos)

@app.route('/admin/alterar-senha', methods=['POST'])
@login_required
def alterar_senha():
    data = request.get_json(force=True)
    atual = data.get('atual', '')
    nova = data.get('nova', '')
    confirmacao = data.get('confirmacao', '')

    if not senha_correta(atual):
        return jsonify({'success': False, 'error': 'Senha atual incorreta'})
    if len(nova) < 6:
        return jsonify({'success': False, 'error': 'A nova senha precisa de pelo menos 6 caracteres'})
    if nova != confirmacao:
        return jsonify({'success': False, 'error': 'A confirmação não confere'})
    if nova == atual:
        return jsonify({'success': False, 'error': 'A nova senha é igual à atual'})

    salt, digesto = hash_senha(nova)
    with open(ADMIN_CONFIG_FILE, 'w', encoding='utf-8') as f:
        json.dump({
            'senha_salt': salt,
            'senha_hash': digesto,
            'alterada_em': datetime.now(BRT).strftime('%d/%m/%Y %H:%M')
        }, f, ensure_ascii=False, indent=2)

    return jsonify({'success': True})

@app.route('/admin/salvar-categorias', methods=['POST'])
@login_required
def salvar_categorias():
    data = load_produtos()
    categorias_ativas = request.json.get('categorias', [])
    
    for cat in data['categorias']:
        cat['ativa'] = str(cat['id']) in categorias_ativas
    
    save_produtos(data)
    return jsonify({'success': True})

@app.route('/admin/salvar-produtos', methods=['POST'])
@login_required
def salvar_produtos():
    data = load_produtos()
    produtos_atualizados = request.json.get('produtos', {})
    
    for produto in data['produtos']:
        produto_id = str(produto['id'])
        if produto_id in produtos_atualizados:
            updates = produtos_atualizados[produto_id]
            if 'nome' in updates:
                produto['nome'] = updates['nome']
            if 'categoria' in updates:
                produto['categoria_id'] = int(updates['categoria'])
            if 'subcategoria' in updates:
                produto['subcategoria'] = updates['subcategoria']
            if 'genero' in updates:
                produto['genero'] = updates['genero']
            if 'preco' in updates:
                produto['preco'] = updates['preco']
            if 'tamanhos' in updates:
                produto['tamanhos'] = updates['tamanhos']
            if 'veste' in updates:
                produto['veste'] = updates['veste']
            if 'observacao' in updates:
                produto['observacao'] = updates['observacao']
    
    save_produtos(data)
    return jsonify({'success': True})

@app.route('/admin/adicionar-categoria', methods=['POST'])
@login_required
def adicionar_categoria():
    data = load_produtos()
    nome = request.json.get('nome')
    emoji = request.json.get('emoji')
    
    if not nome or not emoji:
        return jsonify({'success': False, 'error': 'Nome e emoji são obrigatórios'})
    
    novo_id = max([cat['id'] for cat in data['categorias']], default=0) + 1
    
    data['categorias'].append({
        'id': novo_id,
        'nome': nome,
        'emoji': emoji,
        'ativa': True
    })
    
    save_produtos(data)
    return jsonify({'success': True, 'id': novo_id})

@app.route('/admin/adicionar-produto', methods=['POST'])
@login_required
def adicionar_produto():
    data = load_produtos()
    
    # Handle file upload
    imagem_file = request.files.get('imagem')
    imagem_nome = request.form.get('imagem_nome', '')
    
    if imagem_file and imagem_file.filename:
        # Generate unique filename
        ext = imagem_file.filename.rsplit('.', 1)[-1].lower()
        imagem_nome = f"{uuid.uuid4().hex[:8]}.{ext}"
        # Save to static/imagem/
        imagem_file.save(os.path.join(IMAGES_DIR, imagem_nome))
    elif imagem_nome:
        pass  # Use provided filename
    else:
        return jsonify({'success': False, 'error': 'Imagem é obrigatória'})
    
    novo_id = max([p['id'] for p in data['produtos']], default=0) + 1
    
    novo_produto = {
        'id': novo_id,
        'imagem': imagem_nome,
        'nome': request.form.get('nome', ''),
        'categoria_id': int(request.form.get('categoria_id', 1)),
        'subcategoria': request.form.get('subcategoria', ''),
        'genero': request.form.get('genero', 'feminino'),
        'preco': float(request.form.get('preco', 0)),
        'tamanhos': request.form.getlist('tamanhos') if request.form.getlist('tamanhos') else [],
        'veste': request.form.get('veste', ''),
        'observacao': request.form.get('observacao', '')
    }
    
    data['produtos'].append(novo_produto)
    save_produtos(data)
    return jsonify({'success': True, 'id': novo_id, 'imagem': imagem_nome})

@app.route('/admin/adicionar-subcategoria', methods=['POST'])
@login_required
def adicionar_subcategoria():
    data = load_produtos()
    categoria_pai = request.json.get('categoria_pai')
    nome = request.json.get('nome')
    
    if not categoria_pai or not nome:
        return jsonify({'success': False, 'error': 'Categoria e nome são obrigatórios'})
    
    if 'subcategorias' not in data:
        data['subcategorias'] = {}
    
    if categoria_pai not in data['subcategorias']:
        data['subcategorias'][categoria_pai] = []
    
    if nome not in data['subcategorias'][categoria_pai]:
        data['subcategorias'][categoria_pai].append(nome)
    
    save_produtos(data)
    return jsonify({'success': True})

@app.route('/admin/remover-subcategoria', methods=['POST'])
@login_required
def remover_subcategoria():
    data = load_produtos()
    categoria_pai = request.json.get('categoria_pai')
    nome = request.json.get('nome')
    
    if categoria_pai in data.get('subcategorias', {}):
        if nome in data['subcategorias'][categoria_pai]:
            data['subcategorias'][categoria_pai].remove(nome)
    
    save_produtos(data)
    return jsonify({'success': True})

@app.route('/admin/adicionar-tamanho', methods=['POST'])
@login_required
def adicionar_tamanho():
    data = load_produtos()
    nome = (request.json.get('nome') or '').strip()

    if not nome:
        return jsonify({'success': False, 'error': 'Informe o tamanho'})

    tamanhos = get_tamanhos(data)
    if any(t.lower() == nome.lower() for t in tamanhos):
        return jsonify({'success': False, 'error': 'Esse tamanho já existe'})

    tamanhos.append(nome)
    save_produtos(data)
    return jsonify({'success': True, 'tamanhos': tamanhos})

@app.route('/admin/remover-tamanho', methods=['POST'])
@login_required
def remover_tamanho():
    data = load_produtos()
    nome = request.json.get('nome')

    if not nome:
        return jsonify({'success': False, 'error': 'Tamanho não informado'})

    tamanhos = [t for t in get_tamanhos(data) if t != nome]
    data['tamanhos_disponiveis'] = tamanhos
    save_produtos(data)
    return jsonify({'success': True, 'tamanhos': tamanhos})

@app.route('/admin/remover-categoria', methods=['POST'])
@login_required
def remover_categoria():
    data = load_produtos()
    cat_id = request.json.get('id')
    
    data['categorias'] = [cat for cat in data['categorias'] if cat['id'] != cat_id]
    
    if 'subcategorias' in data:
        cat_nome = next((cat['nome'] for cat in data['categorias'] if cat['id'] == cat_id), None)
        if cat_nome and cat_nome in data['subcategorias']:
            del data['subcategorias'][cat_nome]
    
    save_produtos(data)
    return jsonify({'success': True})

# ===== API de Pedidos =====

@app.route('/api/orders', methods=['GET'])
@login_required
def api_list_orders():
    return jsonify(load_orders())

@app.route('/api/orders', methods=['POST'])
def api_create_order():
    orders = load_orders()
    data = request.get_json(force=True)
    required = ['produto', 'produto_id', 'nome', 'telefone']
    missing = [f for f in required if not data.get(f)]
    if missing:
        return jsonify({'error': 'Campos obrigatórios: ' + ', '.join(missing)}), 400
    next_id = max((o['id'] for o in orders), default=0) + 1
    data['id'] = next_id
    data['status'] = 'Solicitado'
    data['data'] = datetime.now(BRT).strftime('%d/%m/%Y %H:%M')
    orders.append(data)
    save_orders(orders)
    return jsonify(data), 201

@app.route('/api/orders/<int:order_id>', methods=['PUT'])
@login_required
def api_update_order(order_id):
    orders = load_orders()
    idx = next((i for i, o in enumerate(orders) if o['id'] == order_id), None)
    if idx is None:
        return jsonify({'error': 'Pedido não encontrado'}), 404
    data = request.get_json(force=True)
    data['id'] = order_id
    
    old_status = orders[idx].get('status', 'Solicitado')
    new_status = data.get('status', '')
    
    # Move image to vendas folder when order is delivered
    if new_status == 'Entregue' and old_status != 'Entregue':
        produto_id = data.get('produto_id')
        if produto_id:
            produtos = load_produtos()
            produto = next((p for p in produtos['produtos'] if p['id'] == produto_id), None)
            if produto:
                imagem = produto.get('imagem')
                if imagem:
                    src = os.path.join(IMAGES_DIR, imagem)
                    dst = os.path.join(VENDAS_DIR, imagem)
                    if os.path.exists(src):
                        import shutil
                        shutil.move(src, dst)
                    # Remove product from produtos.json
                    produtos['produtos'] = [p for p in produtos['produtos'] if p['id'] != produto_id]
                    save_produtos(produtos)
                    # Save sale data
                    sale_data = {
                        'order_id': order_id,
                        'produto_id': produto_id,
                        'produto_nome': produto.get('nome', ''),
                        'imagem': imagem,
                        'cliente': data.get('nome', ''),
                        'telefone': data.get('telefone', ''),
                        'data': data.get('data', ''),
                        'data_venda': datetime.now(BRT).strftime('%d/%m/%Y %H:%M')
                    }
                    # Append to sales.json
                    sales_file = os.path.join(BASE_DIR, 'sales.json')
                    sales = []
                    if os.path.exists(sales_file):
                        with open(sales_file, 'r', encoding='utf-8') as f:
                            sales = json.load(f)
                    sales.append(sale_data)
                    with open(sales_file, 'w', encoding='utf-8') as f:
                        json.dump(sales, f, ensure_ascii=False, indent=2)
    
    orders[idx] = data
    save_orders(orders)
    return jsonify(data)

@app.route('/api/sales', methods=['GET'])
@login_required
def api_list_sales():
    sales_file = os.path.join(BASE_DIR, 'sales.json')
    if not os.path.exists(sales_file):
        return jsonify([])
    with open(sales_file, 'r', encoding='utf-8') as f:
        return jsonify(json.load(f))

@app.route('/api/subcategorias', methods=['GET'])
def api_list_subcategorias():
    data = load_produtos()
    return jsonify(data.get('subcategorias', {}))

@app.route('/api/categorias', methods=['GET'])
def api_list_categorias():
    data = load_produtos()
    return jsonify(data.get('categorias', []))

@app.route('/api/newsletter', methods=['POST'])
def api_newsletter():
    data = request.get_json(force=True)
    email = data.get('email', '')
    if not email or '@' not in email:
        return jsonify({'success': False, 'error': 'E-mail inválido'})
    
    # Salvar email no arquivo
    newsletter_file = os.path.join(BASE_DIR, 'newsletter.json')
    emails = []
    if os.path.exists(newsletter_file):
        with open(newsletter_file, 'r', encoding='utf-8') as f:
            emails = json.load(f)
    
    if email in emails:
        return jsonify({'success': False, 'error': 'E-mail já cadastrado'})
    
    emails.append(email)
    with open(newsletter_file, 'w', encoding='utf-8') as f:
        json.dump(emails, f, ensure_ascii=False, indent=2)
    
    # Tentar enviar email de notificação
    try:
        msg = MIMEMultipart()
        msg['From'] = 'Brechó da Dri <aespaes@gmail.com>'
        msg['To'] = 'aespaes@gmail.com'
        msg['Subject'] = 'Novo cadastro na Newsletter - Brechó da Dri'
        body = f"Olá!\n\nUm novo cliente quer receber informações de novidades do Brechó da Dri!\n\nE-mail: {email}\nData: {datetime.now(BRT).strftime('%d/%m/%Y %H:%M')}\n\nPara enviar ofertas, acesse o painel administrativo."
        msg.attach(MIMEText(body, 'plain'))
        server = smtplib.SMTP('smtp.gmail.com', 587)
        server.starttls()
        server.login('aespaes@gmail.com', 'clutemxspdjduxwi')
        server.sendmail('aespaes@gmail.com', 'aespaes@gmail.com', msg.as_string())
        server.quit()
    except Exception as e:
        pass  # Email opcional, cadastro já foi salvo
    
    return jsonify({'success': True})

@app.route('/api/orders/<int:order_id>', methods=['DELETE'])
@login_required
def api_delete_order(order_id):
    orders = load_orders()
    orders = [o for o in orders if o['id'] != order_id]
    save_orders(orders)
    return jsonify({'success': True})

@app.errorhandler(404)
def page_not_found(e):
    return render_template('404.html'), 404

if __name__ == '__main__':
    app.run(debug=True)
