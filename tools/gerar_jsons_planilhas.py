import pandas as pd
import json
from datetime import datetime
from openpyxl import load_workbook
import os

def gerar_jsons_planilhas(caminho_arquivo_excel, caminho_pasta_saida):
    """
    Gera arquivos JSON a partir das planilhas de um arquivo Excel.
    
    Argumentos:
    caminho_arquivo_excel (str): Caminho completo para o arquivo Excel de entrada (.xltx).
    caminho_pasta_saida (str): Caminho da pasta onde os arquivos JSON gerados serão salvos.
    
    Saídas:
    Cria dois arquivos JSON na pasta especificada:
    - 'RURAL.json' para a primeira planilha.
    - 'BPC-LOAS.json' para a terceira planilha.
    """
    
    # Carregar o arquivo Excel para capturar os metadados
    wb = load_workbook(caminho_arquivo_excel)
    props = wb.properties

    # Capturar o nome do arquivo (origem)
    arquivo_origem = os.path.basename(caminho_arquivo_excel)

    # Capturar os metadados reais do arquivo Excel
    metadata = {
        "autoria": props.creator,
        "origem": arquivo_origem,
        "modificado_por": props.lastModifiedBy,
        "data_atualizacao": props.modified.strftime('%Y-%m-%d %H:%M:%S')    
    }

    # Função para calcular o número de meses entre duas datas, não incluindo o mês final
    def calcular_meses_exclusivo(data_inicial, data_final):
        return (data_final.year - data_inicial.year) * 12 + data_final.month - data_inicial.month

    # Função para calcular o número de meses entre duas datas, incluindo o mês final
    def calcular_meses_inclusivo(data_inicial, data_final):
        return (data_final.year - data_inicial.year) * 12 + data_final.month - data_inicial.month + 1

    # Função para carregar uma planilha específica e processar os dados
    def carregar_planilha(sheet_index):
        # Extrair o valor da célula específica na linha 8, coluna I
        dip = pd.to_datetime(pd.read_excel(caminho_arquivo_excel, sheet_name=sheet_index).iloc[6, 8]).strftime('%d/%m/%Y')

        # Carregar a planilha ignorando as primeiras 8 linhas
        df = pd.read_excel(caminho_arquivo_excel, sheet_name=sheet_index, skiprows=9)
        # Selecionar as colunas específicas
        df = df.iloc[:, [0, 1, 9, 10, 11]]  # Colunas A, B, J, K, L
        # Ajustar para 2 casas decimais
        df = df.round(2)
        # Renomear as colunas
        df.columns = ['parcelas', 'dib', 'v_ant', 'v_atual', 'soma']

        # Filtrar apenas as linhas onde a coluna "dib" pode ser convertida em data
        df = df[pd.to_datetime(df['dib'], errors='coerce').notnull()]
        # Converter a coluna "dib" para o formato de data datetime
        df['dib'] = pd.to_datetime(df['dib'], format='%d/%m/%Y')

        # Atribuir dip_provisoria à coluna dip
        df['dip'] = dip

        # Calcular p_atual: meses completos entre 01/01 do ano em curso até o mês anterior ao dip
        inicio_ano_atual = datetime.now().replace(day=1).replace(month=1)
        df['p_atual'] = df['dip'].apply(lambda x: calcular_meses_exclusivo(inicio_ano_atual, pd.to_datetime(x, format='%d/%m/%Y')))

        # Calcular p_ant: meses entre dib e 31/12 do ano anterior ao ano em curso, garantindo que não seja negativo
        fim_ano_anterior = datetime(datetime.now().year - 1, 12, 31)
        df['p_ant'] = df['dib'].apply(lambda x: max(calcular_meses_inclusivo(x, fim_ano_anterior), 0))

        # Preencher a coluna rmi com a string "um salário-mínimo"
        df['rmi'] = "um salário-mínimo"

        # Reorganizar as colunas na ordem desejada
        df = df[['dip', 'dib', 'rmi', 'p_ant', 'p_atual', 'v_ant', 'v_atual', 'soma']]

        # Converter as colunas dib e dip de volta para o formato DD/MM/AAAA
        df['dib'] = df['dib'].dt.strftime('%d/%m/%Y')
        df['dip'] = df['dip']  # dip já está formatado corretamente

        return df

    # Lista de índices das planilhas e seus respectivos arquivos JSON de saída
    planilhas_json_map = {
        0: 'RURAL.json',  # Índice 0 corresponde à primeira planilha
        2: 'BPC-LOAS.json'  # Índice 2 corresponde à terceira planilha
    }

    # Iterar sobre cada planilha e gerar o JSON correspondente
    for sheet_index, output_json_file in planilhas_json_map.items():
        try:
            df = carregar_planilha(sheet_index)
            json_data = {"metadata": metadata, "dados": df.to_dict(orient='records')}

            output_json_path = os.path.join(caminho_pasta_saida, output_json_file)
            with open(output_json_path, 'w', encoding='utf-8') as f:
                json.dump(json_data, f, ensure_ascii=False, indent=4)

            print(f"JSON gerado e salvo em: {output_json_path}")

        except ValueError as e:
            print(f"Erro ao processar a planilha de índice '{sheet_index}': {e}")

gerar_jsons_planilhas('C:/Users/igor.gomes/Documents/GitHub/automacao/plugin-conciliador/test/Planilha Acordo PGF_08 2024_IPCA-e_Acordos_Selic_NOVA_mod.xltx', 'C:/Users/igor.gomes/Documents/GitHub/automacao/plugin-conciliador/test')