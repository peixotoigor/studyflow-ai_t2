### HISTÓRICo

Essa funcionalidade, está conectada com o modo foco. Ao terminar uma sessão de estudo é armazenado nessa página. Ainda é possível adicionar manualmente.

* O botão "Registrar Sessão" tem as mesmas funções encontradas no modo foco.
* É possível fazer a busca  de contéudo.
* É possivel selecionar o filtro com as "Disciplinas".

### SIMULADOS

Essa funcionalidade consiste em regristar o resultado de simulados realizados pelo usuário.

    * O botão "Novo simulado" permite incluir:
        * O nome do simulado
        * Banca/Instituição
        * Data da realização
        * Total de questões
        * Total de acertos

### CADERNOS DE ERROS

Essa funcionalidade consiste em registrar erros para diagnosticar fraquezas e revisar o que realmente importa. 

    * O botão  "Registrar Erro" apresenta as funcionalidades:
        * Selecionar a disciplina
        * Inserir o tópico/assunto (manualmente)
        * Inserir a fonte da questão
        * Inserir o diagnostico do erro.
            O diagnóstico de erro possui:
                * Lacuna Teórica 
                * Falta de atenção
                * Interpretação
                * Pegadinha
                * Falta de tempo
            * Uma possível melhoria seria adicionar a possibilidade do usuário inserior outros diagnósticos de erro, isto é, permitir que o usuário insira um diagnóstico de erro que não está na lista.
        * Por que eu errei? (Análise): o usuário insere uma explicação do por que ele errou a questão.
        * Resumo da Correção (Pulo do Gato): o usuário insere um resumo da correção, buscando a explicação da questão e da resposta.
* Existe o mapeamento da quantidade de erros. Atraves da visualizaçao do card "Total de erros"
* Existe o card para verificar qual é a principal fonte de erro, baseado nos diagnósticos de erro.
    * Uma melhoria a ser feita é mapear a quantidade de erros por disciplina.
* Existe a funcionalidade de buscar por tópico, por disciplina e por diagnóstico de erro.
* A visualização consiste em um grid que contém:
    * Icone associado ao erro
    * Tópico
    * Diagnóstico
    * Data
    * Botão de excluir
    * Campos: Por que eu errei? e Resumo da correção (Pulo do gato)
    * Fonte da questão

* Uma possivel melhoria é incluir o botão para editar o erro. Incluir a visualização por lista onde ao clicar será expandido o card para mostrar os campos: Por que eu errei? e Resumo da correção (Pulo do gato).


### INSIGHTS TUTOR

Essa é a parte da aplicação coleta as explicações, resumos e dicas salvas durantes as sessões de estudo com IA. A IA consiste em um chatboot dispónivel no modo "Foco". O chatboot até o momento está vinculado com a API da OpenAI, mas espera-se que seja integrado com outro modelo de LLM. 
    * O prompt utilizado evita que o usuário envie mensagens que não sejam relevantes para a sessão de estudo. Procurar pelo prompt, e deixar em um arquivo separado, para modificações rápidas.
    * A resposta de um pergunta pode ser salva para futuras referências. Ao salvar, fica disponível as informações da disciplina estudada, o contéudo associado a resposta e a data.
        * É possível editar a resposta salva;
        * Excluir a resposta salva;
* Existe a ferramente de "Busca", para encontrar determinado tópico ou assunto.

*  A implementação de melhoria de visualização das respostas salvas, é uma funcionalidade que espera-se implementar. E ainda espera-se que seja possível organizar em pastas para cada disciplina, afim de facilitar a visualização e a busca.

### DISCIPLINAS

A intenção dessa parte da aplicação é gerenciar as disciplinas e o conteúdo prográmatico. 
    Para o gerenciamento:
        * Existe a oppção de "Ativar ou Arquivar" determinada disciplina. Isso facilita a visualização e ainda permite que o usuário não perca a disciplina. As opções, são tratadas como páginas para garatarir a visualização simplificado.
        * Existe a opção de selecionar tudo para tornar mais simples arquivamento ou ativação.
        * Existe opção de importar de um outro plano de estudos. Assim, garante agilidade e integração entre os planos.

        Para o botão de inserir "Nova disciplina"
            * Adicionar o nome da disciplina
            * Adicionar o peso da disciplina, para alguns editais existem disciplinas que agregam mais pontuação.
            * Adicionar a cor manualmente, mas espera-se que o sistema ja escolha a cor para não ter disicplinas com o mesmo marcador visual.
            * É gerado um ícone automaticamente, baseado no nome da disciplina. Futuramente, será implementado um banco de ícones em que o usuário poderá escolher de seu agrado.
            * Criada a disciplina, é possivel alocar manualmente os tópicos tratados na disciplina. 
                
                A funcionalidade de adição de tópicos/conteúdos:
                    * É possível editar o nome do tópico;
                    * Excluir
                    * Reordenar, arrastando para baixo ou para cima.
                    * IA: O principal componente esta associado ao uso de IA (OpenAI GPT Utilizada atualmente) para a divisão do conteúdo programático em tópicos. O usuário insere o conteúdo programático e a IA divide em tópicos de forma automatica. Ainda em fase experimental, mas se mostrou um sucesso. Melhorar o prompt de extração é um dos caminhos.

* Uma melhoria a ser feita, é os modos de visualização. Atualmente está em grid, implementar visualização em lista pode ser uma opção.

* Uma melhoria a ser feita é a possibilidade de exportar um arquivo com todas as disciplinas atuais. Ao fazer isso, é possivel que um usuário compartilhe com outro e deixe mais fácil a obtenção de disciplinas. Para isso deve ser implementado no sistema a opção de leitura desse arquivo. O arquivo deve ser bem formatado para que seja lido corretamente.





