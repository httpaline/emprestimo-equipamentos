# Sistema de Empréstimo de Equipamentos

![CI](https://github.com/httpaline/emprestimo-equipamentos/actions/workflows/ci.yml/badge.svg)

API REST para controlar o empréstimo de equipamentos (notebooks, monitores, headsets) a colaboradores: quem está com o quê e o que está atrasado.

- **API e front no ar (Render):** https://emprestimo-equipamentos-jdms.onrender.com
- **Integração contínua (GitHub Actions):** https://github.com/httpaline/emprestimo-equipamentos/actions

> No plano grátis o serviço dorme após 15 minutos parado: a primeira requisição pode levar cerca de 1 minuto. O banco H2 em memória perde os dados a cada reinício.

## Tecnologias

Java, Spring Boot 4.1.2, Spring Data JPA, H2, Bean Validation, JUnit 5, Docker, GitHub Actions. Front-end em HTML, CSS e JavaScript.

## Como rodar

Pré-requisito: JDK instalado (versão do `pom.xml`).

```bash
git clone https://github.com/httpaline/emprestimo-equipamentos.git
cd emprestimo-equipamentos
./mvnw spring-boot:run
```

A API sobe em `http://localhost:8080`, e o front abre na raiz (`/`). O console do H2 fica em `/h2-console` (apenas local).

Para rodar os testes:

```bash
./mvnw test
```

## Front-end

Interface servida pela própria aplicação na raiz (`/`), em HTML, CSS e JavaScript, sem framework. Os arquivos ficam em `src/main/resources/static/`.

- **Visão geral:** indicadores de equipamentos, uso, atrasados e colaboradores, e os últimos empréstimos.
- **Equipamentos, Empréstimos e Colaboradores:** listagens com busca, filtro de status e paginação.
- **Cadastros em modal:** o patrimônio do equipamento é gerado automaticamente a partir do tipo.
- **Responsivo:** no celular a sidebar vira um menu sanduíche.

## Rotas

### Equipamentos

| Método | Rota | O que faz | Status |
|---|---|---|---|
| POST | `/equipamentos` | Cadastra | 201 |
| GET | `/equipamentos` | Lista (filtros `?tipo=` e `?disponivel=`) | 200 |
| GET | `/equipamentos/{id}` | Busca um equipamento | 200 |
| PUT | `/equipamentos/{id}` | Atualiza nome e tipo | 200 |
| DELETE | `/equipamentos/{id}` | Remove (se nunca foi emprestado) | 204 |

### Colaboradores

| Método | Rota | O que faz | Status |
|---|---|---|---|
| POST | `/colaboradores` | Cadastra | 201 |
| GET | `/colaboradores` | Lista | 200 |
| GET | `/colaboradores/{id}` | Busca um colaborador | 200 |
| GET | `/colaboradores/{id}/emprestimos` | Histórico de empréstimos | 200 |

### Empréstimos

| Método | Rota | O que faz | Status |
|---|---|---|---|
| POST | `/emprestimos?equipamentoId=1&colaboradorId=2` | Empresta | 201 |
| GET | `/emprestimos` | Lista (com `?atrasados=true`, só os atrasados) | 200 |
| GET | `/emprestimos/{id}` | Busca um empréstimo | 200 |
| PUT | `/emprestimos/{id}/devolucao` | Registra a devolução | 200 |

## Regras de negócio

- **R1:** não existem dois equipamentos com o mesmo patrimônio.
- **R2:** todo equipamento novo nasce disponível.
- **R3:** não existem dois colaboradores com o mesmo e-mail.
- **R4:** só se empresta equipamento disponível.
- **R5:** ao emprestar, o equipamento fica indisponível, a data do empréstimo é hoje e a devolução prevista é daqui a 14 dias.
- **R6:** empréstimo já devolvido não pode ser devolvido de novo.
- **R7:** ao devolver, a data de devolução é hoje e o equipamento volta a ficar disponível.
- **R8:** um empréstimo está atrasado quando não foi devolvido e a data prevista já passou.
- **R9:** equipamento que já teve empréstimo não pode ser removido.
- **R10:** quem está com empréstimo atrasado não pode pegar outro equipamento.

## Testes

Testes unitários com JUnit 5 em `src/test/java` (`EquipamentoTest` e `EmprestimoTest`), cobrindo as regras das entidades. Eles rodam automaticamente a cada push e Pull Request pelo GitHub Actions (`.github/workflows/ci.yml`).

## Bônus feitos

- **Swagger:** documentação e tela de testes em `/swagger-ui/index.html`
  (https://emprestimo-equipamentos-jdms.onrender.com/swagger-ui/index.html)
- **Relacionamento com `@ManyToOne`:** o empréstimo referencia o equipamento e o colaborador
- **Validação:** campos obrigatórios e formato de e-mail recusados antes de chegar ao service
- **GitHub Actions:** testes rodando a cada push e Pull Request

<!-- Descomente só o que você confirmar nos comandos de conferência:
- **Actuator:** `/actuator/health`
- **Tratamento de erros:** respostas 404, 409 e 400 com mensagem
- **Testes de integração com MockMvc**
-->

## Deploy

Deploy no Render com Docker (`Dockerfile` na raiz). Cada push na `main` publica a versão nova automaticamente.
