# Extensão do Chrome - Conciliador Previdenciário

A Extensão do Chrome Conciliador Previdenciário é uma ferramenta projetada para ajudar no cálculo de valores de acordos judiciais e extrajudiciais, a partir de arquivos Excel (formato .xlsx).

## Funcionalidades Principais

Carregamento de Arquivo: Permite ao usuário carregar arquivos Excel (.xlsx) contendo dados relevantes para a conciliação.

> Atenção. O plugin não realiza cálculos; apenas busca os valores na planilha selecionada. Por isso, é fundamental que o usuário certifique-se de que está usando a planilha correta.

- Escolha de formato de saída: permite ao usuário escolher o conteúdo a ser copiado para a área de transferência (parâmetros pré-formatados, parâmetros sem formatação ou apenas valor total da proposta).

- Entrada de DIB: Solicita ao usuário inserir a Data de Início do Benefício (DIB) no formato DD/MM/AAAA para realizar a busca correspondente nos dados carregados.

- Processamento de Dados: Após carregar o arquivo e inserir a DIB, o sistema busca as informações correspondentes e exibe os resultados na interface.

- Cópia para Área de Transferência: O plugin copia as informações correspondentes para a área de transferência, permitindo fácil inserção em documentos externos.

- Armazenamento Local: Utiliza o armazenamento local do navegador para salvar a última DIB inserida e o arquivo selecionado, proporcionando uma experiência contínua mesmo após o fechamento da extensão.

## Instalação

## Uso

- Carregar Arquivo: Selecione um arquivo Excel (.xlsx) que contenha os dados necessários para a conciliação. A planilha teve conter as colunas dip, p_ant, p_atual, dib, v_ant, v_atual, soma (respectivamente, data de início do pagamento, parcelas de exercícios anteriores, parcelas do exercício atual, valor de exercícios anteriores e valor total do acordo). Os valores das colunas p_ant, p_atual, v_ant, v_atual devem estar em formato "número"; os valores das colunas dib e dip devem estar no formato "data".

- Escolher o conteúdo a ser copiado para a área de transferência (parâmetros pré-formatados, parâmetros sem formatação ou apenas valor total da proposta).

- Inserir DIB: Digite a Data de Início do Benefício (DIB) no formato DD/MM/AAAA na caixa de entrada.

- Processar e Copiar: Clique no botão "CALCULAR E COPIAR" para iniciar o processamento. Os resultados serão exibidos na caixa do plugin de forma resumida e serão copiados para a área de transferência no formato detalhado.

- Armazenamento Automático: A última DIB inserida e o arquivo selecionado são armazenados automaticamente para facilitar o uso futuro.

## Contribuições e Problemas

Se encontrar algum problema ou tiver sugestões de melhorias, sinta-se à vontade para abrir uma issue (https://github.com/jusmendonca/plugin-conciliador/issues) no repositório da extensão.

Contribuições através de pull requests são bem-vindas. Certifique-se de discutir grandes mudanças antes de iniciar o trabalho.

## Autor

Desenvolvido por Igor Mendonça Cardoso Gomes

## Licença

MIT License
