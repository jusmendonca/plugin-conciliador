import pandas as pd
import json
from datetime import datetime
# Metadados para o arquivo JSON
metadata = {
    "data_atualizacao": "2024-08-08",
    "autoria": "Fulano de Tal",
    "origem": "Planilha rural",
    "versao": "1.0",
    "descricao": "Planilha RURAL"
}
# Caminho para o arquivo Excel e planilhas relevantes
excel_file = 'C:/Users/igor.gomes/Downloads/planilha_acordo_setembro.xlsx'
planilhas = ['Benef com 13º']
# Função para calcular o número de meses entre duas datas, não incluindo o mês final
def calcular_meses_exclusivo(data_inicial, data_final):
    return (data_final.year - data_inicial.year) * 12 + data_final.month - data_inicial.month
# Função para calcular o número de meses entre duas datas, incluindo o mês final
def calcular_meses_inclusivo(data_inicial, data_final):
    return (data_final.year - data_inicial.year) * 12 + data_final.month - data_inicial.month + 1
# Função para carregar uma planilha específica e processar os dados
def carregar_planilha(planilha):
    # Carregar a planilha ignorando as primeiras 8 linhas
    df = pd.read_excel(excel_file, sheet_name=planilha, skiprows=9)
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
    # Criar a coluna dip com o primeiro dia do mês atual
    primeiro_dia_mes_atual = datetime.now().replace(day=1)
    # Extrair a DIP da planilha
    df['dip'] = pd.read_excel(excel_file, sheet_name=planilha).iloc[6, 8]
    # Calcular p_atual: meses completos entre 01/01 do ano em curso até o mês anterior ao dip
    inicio_ano_atual = datetime(primeiro_dia_mes_atual.year, 1, 1)
    df['p_atual'] = df['dip'].apply(lambda x: calcular_meses_exclusivo(inicio_ano_atual, x))
    # Calcular p_ant: meses entre dib e 31/12 do ano anterior ao ano em curso, garantindo que não seja negativo
    fim_ano_anterior = datetime(primeiro_dia_mes_atual.year - 1, 12, 31)
    df['p_ant'] = df['dib'].apply(lambda x: max(calcular_meses_inclusivo(x, fim_ano_anterior), 0))
    # Preencher a coluna rmi com a string "um salário-mínimo"
    df['rmi'] = "um salário-mínimo"
    # Reorganizar as colunas na ordem desejada
    df = df[['dip', 'dib', 'rmi', 'p_ant', 'p_atual', 'v_ant', 'v_atual', 'soma']]
    # Converter as colunas dib e dip de volta para o formato DD/MM/AAAA
    df['dib'] = df['dib'].dt.strftime('%d/%m/%Y')
    df['dip'] = df['dip'].dt.strftime('%d/%m/%Y')
    return df
# Processar os dados e criar o JSON
json_data = {"metadata": metadata, "dados": []}
# Processar cada planilha e adicionar os dados ao dicionário json_data
for planilha in planilhas:
    df = carregar_planilha(planilha)
    json_data["dados"].extend(df.to_dict(orient='records'))
# Salvar os dados processados em um arquivo JSON
output_json_file = 'C:/Users/igor.gomes/Downloads/RURAL2.json'
with open(output_json_file, 'w', encoding='utf-8') as f:
    json.dump(json_data, f, ensure_ascii=False, indent=4)
print(f"JSON gerado e salvo em: {output_json_file}")