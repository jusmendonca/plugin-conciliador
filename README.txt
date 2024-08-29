# Extensão do Chrome - Conciliador Previdenciário

A Extensão do Chrome Conciliador Previdenciário é uma ferramenta projetada para ajudar no cálculo de valores de acordos judiciais e extrajudiciais, a partir de arquivos CSV contendo dados relevantes para a conciliação.

## Funcionalidades Principais

- **Escolha de Benefício:** Permite ao usuário selecionar o benefício (atualmente, benefícios rurais no valor do salário-mínimo ou BPC-LOAS) a partir de uma caixa de seleção. O plugin então carrega os dados do arquivo CSV correspondente.

- **Escolha de Formato de Saída (Estilo de cópia):** Permite ao usuário escolher o conteúdo a ser copiado para a área de transferência (parâmetros pré-formatados, parâmetros sem formatação ou apenas valor total da proposta).

- **Entrada de DIP e DIB:** Solicita ao usuário inserir a Data de Início do Pagamento (DIP) e a Data de Início do Benefício (DIB) no formato DD/MM/AAAA para realizar a busca correspondente nos dados carregados.

- **Processamento de Dados:** Após selecionar o benefício e inserir a DIP e a DIB, o sistema busca as informações correspondentes e exibe os resultados na interface.

- **Cópia para Área de Transferência:** O plugin copia as informações correspondentes para a área de transferência, permitindo fácil inserção em documentos externos.

- **Armazenamento Local:** Utiliza o armazenamento local do navegador para salvar as últimas DIP, DIB, percentual de acordo, e o benefício selecionado, proporcionando uma experiência contínua mesmo após o fechamento da extensão.

## Instalação

### Pré-requisitos

- Google Chrome

### Passos

1. Acesse o [link da extensão](https://chromewebstore.google.com/detail/conciliador-previdenciari/hajbappncpapkfndnlenmlcfemodffpd?pli=1) na Chrome Web Store
2. Clique no botão "Usar no Chrome".
3. Para melhorar a experiência de uso, fixe o plugin na barra de extensões do seu navegador.

## Uso

1. **Escolher Benefício:** Selecione o benefício (RURAL ou BPC-LOAS) na caixa de seleção. O plugin carregará automaticamente os dados do arquivo CSV correspondente que deve estar na pasta especificada ou no armazenamento local.

2. **Inserir DIP e DIB:** Digite a Data de Início do Pagamento (DIP) e a Data de Início do Benefício (DIB) no formato DD/MM/AAAA nas caixas de entrada.

3. **Escolher Estilo de Cópia:** Selecione o formato de saída desejado na caixa de seleção.

4. **Calcular e Copiar:** Clique no botão "CALCULAR E COPIAR" para iniciar o processamento. Os resultados serão exibidos na caixa do plugin e copiados para a área de transferência, conforme os parâmetros escolhidos.

5. **Gerar Resumo HTML:** Clique no botão "GERAR RESUMO HTML" para criar um arquivo HTML com o resumo dos cálculos. Para usar esta opção, o usuário deverá digitar um número de processo judicial, com 20 dígitos (padrão CNJ) e o nome do benefício a ser incluído no resumo.

6. **Armazenamento Automático:** As últimas DIP, DIB, percentual de acordo, e o benefício selecionado são armazenados automaticamente para facilitar o uso futuro.

## Contribuições e Problemas

Se encontrar algum problema ou tiver sugestões de melhorias, mande um e-mail para o desenvolvedor (igormendonca.jus@gmail.com).

Contribuições através de pull requests são bem-vindas. Certifique-se de discutir grandes mudanças antes de iniciar o trabalho.

## Autor

Desenvolvido por Igor Mendonça Cardoso Gomes

## Advertência

O desenvolvedor não se responsabiliza pela exatidão dos cálculos, que devem ser conferidos pelo usuário.

## Licença

Copyright (todos os direitos reservados)
