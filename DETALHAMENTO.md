### DASHBOARD
Nessa página é mostrada a visão geral do seu plano e seu desempenho acumulado.

* Radar de atenção:
        Mostra baseado nas taxas de acertos quais disciplinas necessitam de maior atenção, através de uma análise de prioridade
* Diagnóstico IA:
        Baseado na taxa de acertos associados a cada tópico, quais devem ser o foco de estudo.
        Melhorias a serem feitas:
            * Integração como tempo de estudo de cada disciplina
            * Indice de revisão daquela disciplina
            * Taxa de acertos por conteúdo de cada disciplina
            * Análise de prioridade, definida no "Plano de Estudos"

* Meta do Dia:
        Mostra as materias do dia, assim como seus respectivos conteúdos. Possui um botão para iniciar o estudo que leva diretamente para o "Modo Foco".

* Métricas Globais:
        Mostra um gráfico com a  taxa média de acertos e de questões realizadas, além do tempo total de estudos.

* Distribuição de tempo:
        Mostra gráfico com a distruição de tempo por matéria. Gráfico utilizado é o de pizza. Verificar se outro melhor se encaixa.

* Evolução e detalhes

* Mapa do edital:
        Mostra o progresso de cada disciplina, com barra de progresso baseano no número de conteúdos totais e concluídos. Cada disciplina corresponde a um card que ao ser acionado é expandido, indicando se já foi: "Não visto", "Visto", "Revisado", "Domínio". Essa configuração permite com que o usuário tenha uma visualização alternativa do seu progresso.



### PLANO DE ESTUDOS

A funcionalidade "Plano de Estudos" é uma das ferramentas principais, nela será feita o ajuste do plano de estudo de acordo com o que o usuário fornece, assim como a visualização do calendário com a distruibuição das disciplinas. 

* O botão "Ajustar Plano" fornece um menu lateral onde é possível:
    * Criar um !Agendamento de Revisão", caso estiver ativo:
        * Possui a funcionalidade automático, onde: As revisões serão agendadas automaticamente com base na sua taxa de acerto e erros registrados.
        * Possui a funcionalidade manual em que pode-se selecionar:
            * O ritmo fixo das revisões: 
                * Intenso: revisões em diárias, a cada 3 dias e cada semana.
                * Normal: revisões diária, a cada 1 semana e a cada 2 semanas.
                * Suave: revisãoes a cada 3 dias, a cada 10 dias e a cada 20 dias.

* O card "Dias de Estudo", permite selecionar os dias da semana em que o estudo estará ativo. 
* O card "Metas diárias", permite selecionar:
    * O tempo disponível indo de 1h até 10h diárias.
    * Quantidade de matérias por dia.

* O card "Configuração individua", permite selecionar as disciplinas que entrarão para o plano de estudos. Ainda é possível;
    * Selecionar a prioridade do edital: Baixa, Média, Alta
    * Selecionar o nível de domínio da matéria: Iniciante, Médio, Avançado.
Esse dois critérios ajudam a mapear e distruir quantas vezes a matéria será alocada para estudo. A seleção de baixa prioridade e nível de domínio avançado, reduz a quantidade de vezes que ela aparecerá no plano, o caso contrário, alta prioridade e domínio iniciante, fará com que a disciplina apareça mais vezes no plano.

* O "Calendário", mostra o mês completo e as matérias que estão alocadas em cada dia. Ao clicar em um dia, é mostrado em detalhes quais as matérias, o conteúdo a ser estudado e o tempo associado para o estudo da disciplina. É possível alternar entre os meses.



### MODO FOCO

O modo foco é uma das funcionalidades principais. Nele é possível:

* Verificar o progresso diário, isto é, baseado na quantidade de disciplinas a serem estudadas no dia. 

* O indicativo se o estudo está em "Fluxo ativo" ou "Pausado"
    
* No painel central, é indicado a matéria atual, o conteúdo. É possível selecionar os materiais de estudo que são: "PDF/Leitura", "VideoAula", "Questões", "Lei Seca", "Revisão". O usuário pode selecionar quantos materiais que deseja. Ao centro do painel, tem o tempo associado para cada disciplina. O botão de iniciar sessão e de concluir.
* O botão de concluir, permite incluir:
    * Os materiais de estudo
    * O topico estudado associado a disciplina
    * Duração
    * Questão feitas
    * Acertos

* Ao lado do painel central, possui a visualizaçao da fila de disciplinas a serem estudadas no dia. 

* Abaixo do painel central, existe o "Consultor Tutor de IA", que ao ser selecionado é mostrado um chatboot ao lado do painel central. 
    * O tutor possui um prompt próprio que alterna entre as disciplinas. Ele é projetado para ser direto e ainda dar dicas de como as bancas tratam esse assunto. Ele evita perguntas que não estão no escopo.
    * É possível salvar cada resposta gerada pela IA, que é enviada para "Insights IA".

* Uma possível melhoria é mudar a posição de onde fica o tutor de IA, ele deve ser colocado em uma posição que o usuário visualize fácilmente, pois é o trunfo da aplicação WEB. 


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
        * O diagnóstico de erro possui:
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





