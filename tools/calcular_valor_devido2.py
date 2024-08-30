import pandas as pd
from datetime import datetime

def calcular_valor_devido_com_13(csv_path, data_inicial_parcelas, data_final_parcelas):
    """
    Calcula o valor devido com base nas parcelas de um arquivo CSV, incluindo o cálculo da gratificação natalina e gera uma memória de cálculo.
    
    Argumentos:
    csv_path (str): Caminho para o arquivo CSV.
    data_inicial_parcelas (str): Data inicial das parcelas no formato 'dd/mm/aaaa'.
    data_final_parcelas (str): Data final das parcelas no formato 'dd/mm/aaaa'.
    
    Retorna:
    str: Um resumo formatado do cálculo para o valor devido.
    DataFrame: Uma memória de cálculo detalhada.
    """
    # Carregar o CSV em um DataFrame
    df = pd.read_csv(csv_path, parse_dates=['dib'], dayfirst=True)
    
    # Converter as datas de string para objetos datetime
    data_inicial_parcelas = datetime.strptime(data_inicial_parcelas, '%d/%m/%Y')
    data_final_parcelas = datetime.strptime(data_final_parcelas, '%d/%m/%Y')

    # Dividir os valores de dezembro por 2 para remover a duplicidade da gratificação natalina
    df.loc[df['dib'].dt.month == 12, ['rm', 'v_corr', 'rm_atual']] /= 2

    # Criar uma lista de meses entre as datas inicial e final das parcelas
    date_range = pd.date_range(start=data_inicial_parcelas, end=data_final_parcelas, freq='MS')

    # Inicializar uma lista para armazenar as linhas da memória de cálculo
    calculo_rows = []

    # Preencher a memória de cálculo com dados para cada mês no intervalo
    for date in date_range:
        mes = date.month
        ano = date.year
        df_mes = df[(df['dib'].dt.month == mes) & (df['dib'].dt.year == ano)]
        if not df_mes.empty:
            calculo_rows.append({
                'Data': date.strftime('%m/%Y'),
                'Renda Mensal (RM)': f"{df_mes['rm'].iloc[0]:,.2f}".replace(',', 'temp').replace('.', ',').replace('temp', '.'),
                'Índice de Correção Monetária (ind_corr)': f"{df_mes['ind_corr'].iloc[0]}".replace('.', ','),
                'Renda Mensal Corrigida (v_corr)': f"{df_mes['v_corr'].iloc[0]:,.2f}".replace(',', 'temp').replace('.', ',').replace('temp', '.'),
                'Percentual de Juros (perc_juros)': f"{df_mes['perc_juros'].iloc[0] * 100:.4f}%".replace(',', 'temp').replace('.', ',').replace('temp', '.'),
                'Valor dos Juros (v_juros)': f"{df_mes['v_juros'].iloc[0]:,.2f}".replace(',', 'temp').replace('.', ',').replace('temp', '.'),
                'Renda Mensal Atualizada (rm_atual)': f"{df_mes['rm_atual'].iloc[0]:,.2f}".replace(',', 'temp').replace('.', ',').replace('temp', '.')
            })

    # Converter a lista de dicionários em um DataFrame
    df_calculo = pd.DataFrame(calculo_rows)

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

    # Identificar os registros de dezembro para calcular a gratificação natalina
    dezembro_df = df[df['dib'].dt.month == 12]

    # Calcular a gratificação natalina proporcional para o ano inicial se incompleto
    gratificacao_natalina_proporcional_inicial = 0
    if ano_inicial == data_inicial_parcelas.year:
        meses_incompletos_iniciais = 12 - mes_inicial + 1  # Meses de setembro a dezembro (por exemplo)
        gratificacao_natalina_proporcional_inicial = (dezembro_df[dezembro_df['dib'].dt.year == ano_inicial]['rm_atual'].iloc[0]) * (meses_incompletos_iniciais / 12)

    # Calcular a gratificação natalina integral para os anos completos entre as datas
    gratificacao_natalina_integral = 0
    anos_completos = list(range(ano_inicial + 1, ano_final))
    for ano in anos_completos:
        gratificacao_natalina_integral += dezembro_df[dezembro_df['dib'].dt.year == ano]['rm_atual'].iloc[0]

    # Calcular a gratificação natalina proporcional para o ano final se incompleto
    gratificacao_natalina_proporcional_final = 0
    if ano_final == data_final_parcelas.year:
        meses_completos_finais = mes_final  # Meses de janeiro a março (por exemplo)
        gratificacao_natalina_proporcional_final = (df_final['rm_atual'].iloc[0]) * (meses_completos_finais / 12)

    # Soma total dos valores devidos
    valor_total_devido = (
        rm_atual_proporcional_inicial.sum() +
        soma_rm_atual_intermediario +
        rm_atual_proporcional_final.sum() +
        gratificacao_natalina_proporcional_inicial +
        gratificacao_natalina_integral +
        gratificacao_natalina_proporcional_final
    )

    # Formatação dos valores no padrão XX.XXX,XX
    valor_proporcional_rm_inicial_formatado = f"{rm_atual_proporcional_inicial.sum():,.2f}".replace(',', 'temp').replace('.', ',').replace('temp', '.')
    valor_integral_rm_completos_formatado = f"{soma_rm_atual_intermediario:,.2f}".replace(',', 'temp').replace('.', ',').replace('temp', '.')
    valor_proporcional_rm_final_formatado = f"{rm_atual_proporcional_final.sum():,.2f}".replace(',', 'temp').replace('.', ',').replace('temp', '.')
    gratificacao_natalina_proporcional_inicial_formatado = f"{gratificacao_natalina_proporcional_inicial:,.2f}".replace(',', 'temp').replace('.', ',').replace('temp', '.')
    gratificacao_natalina_integral_formatado = f"{gratificacao_natalina_integral:,.2f}".replace(',', 'temp').replace('.', ',').replace('temp', '.')
    gratificacao_natalina_proporcional_final_formatado = f"{gratificacao_natalina_proporcional_final:,.2f}".replace(',', 'temp').replace('.', ',').replace('temp', '.')
    valor_total_devido_formatado = f"{valor_total_devido:,.2f}".replace(',', 'temp').replace('.', ',').replace('temp', '.')

    # Formatar o resumo para leitura
    resumo = f"""
    ---------------------------------------------------------------------------------------------------------
    
    RESUMO DO CÁLCULO
    
    ---------------------------------------------------------------------------------------------------------
    Data inicial: {data_inicial_parcelas.strftime('%d/%m/%Y')}
    Data final: {data_final_parcelas.strftime('%d/%m/%Y')}    
    ---------------------------------------------------------------------------------------------------------

    Parcelas ordinárias:
    
    Mês inicial ({mes_inicial:02}/{ano_inicial}): {dias_no_mes_inicial} dias
    Valor (proporcional): R$ {valor_proporcional_rm_inicial_formatado}
    
    Meses intermediários ({df_meio['dib'].min().strftime('%m/%Y') if not df_meio.empty else "N/A"} a {df_meio['dib'].max().strftime('%m/%Y') if not df_meio.empty else "N/A"})
    Valor (integral): R$ {valor_integral_rm_completos_formatado}
    
    Mês final ({mes_final:02}/{ano_final}): {dias_no_mes_final} dias
    Valor (proporcional): R$ {valor_proporcional_rm_final_formatado}
    
    Gratificação natalina (13º salário):    
    {ano_inicial} (proporcional): R$ {gratificacao_natalina_proporcional_inicial_formatado}
    {', '.join(map(str, anos_completos)) if anos_completos else 'N/A'}: R$ {gratificacao_natalina_integral_formatado} (integral)
    {ano_final}: R$ {gratificacao_natalina_proporcional_final_formatado} (proporcional)

    
    VALOR DEVIDO: R$ {valor_total_devido_formatado}
    
    ---------------------------------------------------------------------------------------------------------

    """
    
    return resumo, df_calculo


def exportar_para_html(resumo_calculo, df_calculo, caminho_arquivo_html):
    """
    Exporta o resumo do cálculo e a memória de cálculos para um arquivo HTML.

    Argumentos:
    resumo_calculo (str): Resumo formatado do cálculo.
    df_calculo (DataFrame): DataFrame contendo a memória de cálculos.
    caminho_arquivo_html (str): Caminho onde o arquivo HTML será salvo.
    """
    # Converter o DataFrame para HTML
    tabela_html = df_calculo.to_html(index=False, justify='center', border=0, classes='table table-striped')

    # Criar o conteúdo do HTML
    conteudo_html = f"""
    <html>
        <head>
            <meta charset="utf-8">
            <title>Resumo do Cálculo</title>
            <style>
                body {{ font-family: Arial, sans-serif; margin: 40px; }}
                .resumo {{ margin-bottom: 20px; }}
                .table {{ border-collapse: collapse; width: 100%; margin-top: 20px; }}
                .table th, .table td {{ border: 1px solid #ddd; padding: 8px; text-align: center; }}
                .table th {{ background-color: #f2f2f2; }}
            </style>
        </head>
        <body>
            <div class="resumo">
                <pre>{resumo_calculo}</pre>
            </div>
            <div class="memoria-calculos">
                {tabela_html}
            </div>
        <p>
        Ìndices aplicados: ORTN/OTN/BTN até 02/91 + INPC até 12/92 + IRSM até 02/94 + URV até 06/94 + IPCR até 06/95 + INPC até 04/96 + IGPDI até 09/2006 + IPCA-E + Selic após 12/021.
        </p>
        </body>
    </html>
    """

    # Salvar o conteúdo HTML no arquivo especificado
    with open(caminho_arquivo_html, 'w', encoding='utf-8') as arquivo:
        arquivo.write(conteudo_html)

    print(f"Arquivo HTML exportado com sucesso para: {caminho_arquivo_html}")

# Exemplo de uso da função
csv_path = 'C:/Users/igor.gomes/Documents/GitHub/automacao/plugin-conciliador/tools/RURAL.csv'
data_inicial_parcelas = '16/09/2021'
data_final_parcelas = '07/03/2024'
caminho_arquivo_html = 'C:/Users/igor.gomes/Documents/GitHub/automacao/plugin-conciliador/tools/RURAL.html'
resumo_calculo, df_calculo = calcular_valor_devido_com_13(csv_path, data_inicial_parcelas, data_final_parcelas)
# Imprimir o resumo e a memória de cálculo
print(resumo_calculo)
print(df_calculo)

exportar_para_html(resumo_calculo, df_calculo, caminho_arquivo_html)