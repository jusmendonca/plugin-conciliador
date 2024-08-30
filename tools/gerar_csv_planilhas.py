import pandas as pd
import json
from datetime import datetime
from openpyxl import load_workbook
import os

caminho_arquivo_excel = 'C:/Users/igor.gomes/Documents/GitHub/automacao/plugin-conciliador/tools/planilha_teste2.xlsx'
caminho_pasta_saida ='C:/Users/igor.gomes/Documents/GitHub/automacao/plugin-conciliador/tools'

def gerar_csvs_planilhas(caminho_arquivo_excel, caminho_pasta_saida):
    """
    Gera arquivos CSV a partir das planilhas de um arquivo Excel.
    
    Argumentos:
    caminho_arquivo_excel (str): Caminho completo para o arquivo Excel de entrada (.xltx).
    caminho_pasta_saida (str): Caminho da pasta onde os arquivos CSV gerados serão salvos.
    
    Saídas:
    Cria dois arquivos CSV na pasta especificada:
    - 'RURAL.csv' para a primeira planilha.
    - 'BPC-LOAS.csv' para a terceira planilha.
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
        df = df.iloc[:, list(range(0, 8)) + list(range(9, 12))]
        # Renomear as colunas
        df.columns = ['parcelas', 'dib', 'rm', 'ind_corr', 'v_corr', 'perc_juros', 'v_juros','rm_atual', 'v_ant', 'v_atual', 'soma']

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

        # Reorganizar as colunas na ordem desejada
        df = df[['dip', 'dib', 'rm', 'ind_corr', 'v_corr', 'perc_juros', 'v_juros', 'rm_atual', 'v_ant', 'v_atual', 'soma', 'parcelas', 'p_ant', 'p_atual']]

        # Converter as colunas dib e dip de volta para o formato DD/MM/AAAA
        df['dib'] = df['dib'].dt.strftime('%d/%m/%Y')
        df['dip'] = df['dip']  # dip já está formatado corretamente

        return df

    # Lista de índices das planilhas e seus respectivos arquivos CSV de saída
    planilhas_csv_map = {
        0: 'RURAL.csv',  # Índice 0 corresponde à primeira planilha
        1: 'RURAL+25.csv',
        2: 'BPC-LOAS.csv'  # Índice 2 corresponde à terceira planilha
    }

    # Iterar sobre cada planilha e gerar o CSV correspondente
    for sheet_index, output_csv_file in planilhas_csv_map.items():
        try:
            df = carregar_planilha(sheet_index)
            csv_data = df

            output_csv_path = os.path.join(caminho_pasta_saida, output_csv_file)
            csv_data.to_csv(output_csv_path, index=False, encoding='utf-8')

            print(f"CSV gerado e salvo em: {output_csv_path}")

        except ValueError as e:
            print(f"Erro ao processar a planilha de índice '{sheet_index}': {e}")

gerar_csvs_planilhas(caminho_arquivo_excel, caminho_pasta_saida)
