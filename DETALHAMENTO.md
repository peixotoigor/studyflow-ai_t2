###


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





