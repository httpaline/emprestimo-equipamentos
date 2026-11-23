# Sistema de Empréstimo de Equipamentos

API REST para controlar o empréstimo de equipamentos (notebooks, monitores, headsets) a colaboradores: quem está com o quê e o que está atrasado.

**API no ar (Render):** https://emprestimo-equipamentos-jdms.onrender.com

> No plano grátis o serviço dorme após 15 minutos parado: a primeira requisição pode levar cerca de 1 minuto. O banco H2 em memória perde os dados a cada reinício.

## Tecnologias

Java, Spring Boot 4.1.2, Spring Data JPA, H2, JUnit 5, Docker.

## Como rodar

Pré-requisito: JDK instalado (versão do `pom.xml`).

```bash
git clone https://github.com/httpaline/emprestimo-equipamentos.git
cd emprestimo-equipamentos
./mvnw spring-boot:run
```

A API sobe em `http://localhost:8080`. O console do H2 fica em `/h2-console` (apenas local).

Para rodar os testes:

```bash
./mvnw test
```

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

Testes unitários com JUnit 5 em `src/test/java` (`EquipamentoTest` e `EmprestimoTest`), cobrindo as regras das entidades.

## Bônus feitos

- Swagger: documentação e tela de testes em `/swagger-ui/index.html`
  (https://emprestimo-equipamentos-jdms.onrender.com/swagger-ui/index.html)

## Deploy

Deploy no Render com Docker (`Dockerfile` na raiz). Cada push na `main` publica a versão nova automaticamente.
