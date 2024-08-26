# Conciliador Previdenciário

## Pré-requisitos

- **Google Chrome**: Este plugin é uma extensão para o navegador Google Chrome que auxilia nos cálculos de valores atrasados de benefícios previdenciários e assistenciais no valor de um salário-mínimo mensal.

## Passos para Instalação

1. **Acesse a Chrome Web Store**: Visite o [link da extensão](https://chrome.google.com/webstore) na Chrome Web Store.
2. **Instale a Extensão**: Clique no botão "Usar no Chrome" e siga as instruções para adicionar a extensão ao seu navegador.
3. **Fixar na Barra de Extensões**: Para facilitar o acesso, fixe o plugin na barra de extensões do Chrome.

## Uso do Plugin

### 1. Escolher Benefício

Selecione o benefício desejado na caixa de seleção. As opções são:

- **RURAL**: Benefício previdenciário no valor do salário-mínimo.
- **BPC-LOAS**: Benefício de Prestação Continuada (Assistencial).

> **Nota**: O plugin carregará automaticamente os dados do arquivo JSON correspondente, que deve estar na pasta `json`.

### 2. Inserir DIP e DIB

DIP (Data de Início do Pagamento) e DIB (Data de Início do Benefício) devem ser inseridos no formato `DD/MM/AAAA` nas caixas de entrada fornecidas.

### 3. Escolher Estilo de Cópia

Na caixa de seleção, escolha o formato de saída desejado para o cálculo:

- **Valor total da proposta (atrasados)**
- **Parâmetros sem formação**
- **Parâmetros pré-formatados**

### 4. Escolher o percentual de acordo

Trata-se do percentual a ser aplicado sobre o valor do cálculo. Por exemplo, se escolhido 90%, será descontado o percentual de 10% do valor devido. Útil para propostas de acordo.

### 5. Habilitar cálculo de honorários advocatícios.

Se for escolhida a opção, digitar o percentual de honorários a ser aplicado sobre a proposta.

### 6. Calcular e Copiar

Clique no Botão **"CALCULAR E COPIAR"**:

- O plugin processará as informações inseridas (DIP, DIB, Benefício selecionado) e aplicará o percentual de acordo.
- O resultado será exibido na interface do plugin e automaticamente copiado para a área de transferência, bastando ao usuário colar o texto no documento de interesse.

### 6. Gerar Resumo HTML

Clique no Botão **"GERAR RESUMO HTML"**:

- Esta função permite criar um arquivo HTML com o resumo dos cálculos, muito útil para anexar a petições.

#### Inserir Informações Adicionais:

- **Número do Processo**: Será solicitado que você insira o número do processo judicial (20 dígitos, padrão CNJ).
- **Nome do Interessado**: Digite o nome do interessado.
- **Nome do Benefício**: Digite o nome do benefício.

#### Geração do Arquivo HTML:

- Após inserir todas as informações, clique em **"OK"**.
- O plugin gerará o arquivo HTML com todos os detalhes inseridos e realizará o download automaticamente.
- O arquivo HTML incluirá informações como DIP, DIB, RMI, o valor devido, composição dos valores, e, se aplicável, o cálculo dos honorários advocatícios.

### 6. Armazenamento Automático

As últimas configurações (DIP, DIB, percentual de acordo, benefício selecionado) são armazenadas automaticamente pelo plugin para facilitar o uso em sessões futuras.

## Contribuições e Problemas

Se encontrar algum problema ou tiver sugestões de melhorias, entre em contato com o desenvolvedor pelo e-mail: [igormendonca.jus@gmail.com](mailto:igormendonca.jus@gmail.com).

Contribuições através de pull requests são bem-vindas. Certifique-se de discutir grandes mudanças antes de iniciar o trabalho.

## Autor

Desenvolvido por Igor Mendonça Cardoso Gomes.

## Advertência

O desenvolvedor não se responsabiliza pela exatidão dos cálculos, que devem ser conferidos pelo usuário.

## Licença

Copyright (todos os direitos reservados).

