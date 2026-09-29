#!/usr/bin/env python3
"""Troca a extensao das fotos dos produtos para .png, mantendo a numeracao.

Uso:
    python3 atualizar_imagens_png.py --check   # so mostra o que vai mudar
    python3 atualizar_imagens_png.py           # aplica (faz backup antes)
"""
import json
import os
import shutil
import sys

BASE = os.path.dirname(os.path.abspath(__file__))
PRODUTOS_FILE = os.path.join(BASE, 'produtos.json')
IMAGENS_DIR = os.path.join(BASE, 'static', 'imagem')
CSS_FILE = os.path.join(BASE, 'static', 'css', 'style.css')


def nome_png(imagem):
    return os.path.splitext(imagem)[0] + '.png'


def main():
    so_check = '--check' in sys.argv

    with open(PRODUTOS_FILE, encoding='utf-8') as f:
        data = json.load(f)

    mudar, ja_png, faltando = [], 0, []

    for produto in data.get('produtos', []):
        atual = produto.get('imagem', '')
        novo = nome_png(atual)

        if novo == atual:
            ja_png += 1
            continue

        mudar.append((atual, novo))
        if not os.path.exists(os.path.join(IMAGENS_DIR, novo)):
            faltando.append(novo)
        produto['imagem'] = novo

    print('Produtos: %d | ja em .png: %d | a mudar: %d'
          % (len(data.get('produtos', [])), ja_png, len(mudar)))

    css_mudou = False
    if os.path.exists(CSS_FILE):
        with open(CSS_FILE, encoding='utf-8') as f:
            css = f.read()
        if 'static/imagem/01.webp' in css:
            css_mudou = not so_check
            print('Banner do site (style.css): 01.webp -> 01.png')

    if mudar:
        print('\nExemplos de alteracao (descricao preservada):')
        for atual, novo in mudar[:5]:
            print('  %s  ->  %s' % (atual, novo))
        if len(mudar) > 5:
            print('  ... e mais %d' % (len(mudar) - 5))

    if faltando:
        print('\nATENCAO: %d arquivo(s) .png ainda nao existe(m) em static/imagem:' % len(faltando))
        for nome in faltando[:15]:
            print('  - %s' % nome)
        if len(faltando) > 15:
            print('  ... e mais %d' % (len(faltando) - 15))
        print('Suba as fotos antes de usar o site, senao elas nao carregam.')

    if so_check:
        print('\nModo --check: nada foi alterado.')
        return

    if not mudar and not css_mudou:
        print('\nNada a fazer: tudo ja esta em .png.')
        return

    shutil.copyfile(PRODUTOS_FILE, PRODUTOS_FILE + '.bak')
    with open(PRODUTOS_FILE, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

    if css_mudou:
        with open(CSS_FILE, encoding='utf-8') as f:
            css = f.read()
        with open(CSS_FILE, 'w', encoding='utf-8') as f:
            f.write(css.replace('static/imagem/01.webp', 'static/imagem/01.png'))

    print('\nPronto! Backup salvo em produtos.json.bak')
    print('Se estiver no PythonAnywhere, va em Web e clique em Reload.')


if __name__ == '__main__':
    main()
