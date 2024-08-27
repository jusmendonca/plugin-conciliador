import pandas as pd
from datetime import datetime

def calcular_valor_devido(csv_path, data_inicial_parcelas, data_final_parcelas):
    """
    Calcula o valor devido com base nas parcelas de um arquivo CSV.
    
    Argumentos:
    csv_path (str): Caminho para o arquivo CSV.
    data_inicial_parcelas (str): Data inicial das parcelas no formato 'dd/mm/aaaa'.
    data_final_parcelas (str): Data final das parcelas no formato 'dd/mm/aaaa'.
    
    Retorna:
    str: Um resumo formatado do cálculo para o valor devido.
    """
    # Carregar o CSV em um DataFrame
    df = pd.read_csv(csv_path, parse_dates=['dib'], dayfirst=True)
    
    # Converter as datas de string para objetos datetime
    data_inicial_parcelas = datetime.strptime(data_inicial_parcelas, '%d/%m/%Y')
    data_final_parcelas = datetime.strptime(data_final_parcelas, '%d/%m/%Y')

    # Identificar o mês e ano das datas iniciais e finais
    mes_inicial = data_inicial_parcelas.month
    ano_inicial = data_inicial_parcelas.year
    mes_final = data_final_parcelas.month
    ano_final = data_final_parcelas.year

    # Filtrar as linhas do DataFrame onde o mês e o ano de 'dib' são relevantes
    df_inicial = df[(df['dib'].dt.month == mes_inicial) & (df['dib'].dt.year == ano_inicial)]
    df_final = df[(df['dib'].dt.month == mes_final) & (df['dib'].dt.year == ano_final)]

    # Cálculo do número de dias restantes no mês inicial a partir da data de início
    ultimo_dia_mes_inicial = pd.Timestamp(year=ano_inicial, month=mes_inicial, day=1) + pd.offsets.MonthEnd(1)
    dias_no_mes_inicial = (ultimo_dia_mes_inicial - data_inicial_parcelas).days + 1
    
    # Valor proporcional de rm_atual para os dias restantes do mês inicial
    rm_atual_proporcional_inicial = (df_inicial['rm_atual'] / df_inicial['dib'].dt.days_in_month) * dias_no_mes_inicial

    # Calcular a soma dos valores de rm_atual até o mês anterior ao correspondente à coluna dib da data final das parcelas
    df_meio = df[(df['dib'] > df_inicial['dib'].values[0]) & (df['dib'] < df_final['dib'].values[0])]
    soma_rm_atual_intermediario = df_meio['rm_atual'].sum()

    # Cálculo do número de dias no mês final até a data final
    dias_no_mes_final = data_final_parcelas.day

    # Valor proporcional de rm_atual para os dias no mês final
    rm_atual_proporcional_final = (df_final['rm_atual'] / df_final['dib'].dt.days_in_month) * dias_no_mes_final

    # Soma total dos valores devidos
    valor_total_devido = rm_atual_proporcional_inicial.sum() + soma_rm_atual_intermediario + rm_atual_proporcional_final.sum()

    # Formatar o resumo para leitura
    resumo = f"""
    Resumo do Cálculo:
    ---------------------------
    Data Inicial das Parcelas: {data_inicial_parcelas.strftime('%d/%m/%Y')}
    Data Final das Parcelas: {data_final_parcelas.strftime('%d/%m/%Y')}
    
    Dias Restantes no Mês Inicial [{mes_inicial:02}/{ano_inicial}]: {dias_no_mes_inicial} dias
    Valor Proporcional da RM no Mês Inicial (atualizada): R$ {rm_atual_proporcional_inicial.sum():,.2f}
    
    Soma das parcelas da RM até o Mês Anterior ao Final [{df_meio['dib'].min().strftime('%m/%Y') if not df_meio.empty else "N/A"} a {df_meio['dib'].max().strftime('%m/%Y') if not df_meio.empty else "N/A"}] (atualizada): R$ {soma_rm_atual_intermediario:,.2f}
    
    Dias do Mês Final das Parcelas [{mes_final:02}/{ano_final}]: {dias_no_mes_final} dias
    Valor Proporcional da RM no Mês Final (atualizado): R$ {rm_atual_proporcional_final.sum():,.2f}
    
    Valor Total Devido: R$ {valor_total_devido:,.2f}
    ---------------------------
    """

    return resumo

# Exemplo de uso da função
csv_path = 'C:/Users/igor.gomes/Documents/GitHub/automacao/plugin-conciliador/tools/RURAL.csv'
data_inicial_parcelas = '01/09/2021'
data_final_parcelas = '07/03/2024'
resumo_calculo = calcular_valor_devido(csv_path, data_inicial_parcelas, data_final_parcelas)
print(resumo_calculo)
