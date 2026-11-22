package com.projeto.emprestimo.model;

import org.junit.jupiter.api.Test;

import java.time.LocalDate;

import static org.junit.jupiter.api.Assertions.*;

class EmprestimoTest {

    @Test
    void criarEmprestimoDeveCalcularDatas(){
        Emprestimo emprestimo = new Emprestimo(new Equipamento(), new Colaborador(), LocalDate.of(2026,11,14));

        assertEquals(LocalDate.of(2026, 11, 14), emprestimo.getDataEmprestimo());
        assertEquals(LocalDate.of(2026, 11, 28), emprestimo.getDataPrevistaDevolucao());
    }

    @Test
    void devolverDeveRegistrarDataInformadaComoDataDevolucao(){
        Emprestimo emprestimo = new Emprestimo();

        emprestimo.devolver(LocalDate.of(2026,11,20));

        assertEquals(LocalDate.of(2026,11,20), emprestimo.getDataDevolucao());
    }

    @Test
    void devolverEmprestimoJaDevolvidoDeveLancarIllegalStateException(){
        Emprestimo emprestimo = new Emprestimo();

        emprestimo.devolver(LocalDate.now());

        assertThrows(IllegalStateException.class, () -> emprestimo.devolver(LocalDate.now()));
    }

    @Test
    void emprestimoNaoDevolvidoAposPrazoDeveEstarAtrasado(){

        LocalDate dataEmprestimo = LocalDate.of(2026, 10, 27);
        LocalDate dataConsulta = LocalDate.of(2026, 11, 14);
        Emprestimo emprestimo = new Emprestimo(new Equipamento(), new Colaborador(), dataEmprestimo);

        assertTrue(emprestimo.estaAtrasadoEm(dataConsulta));
    }

    @Test
    void emprestimoNaoDevolvidoAntesDoPrazoDeveEstarNaoAtrasado(){
        LocalDate dataEmprestimo = LocalDate.of(2026, 11, 6);
        LocalDate dataConsulta = LocalDate.of(2026, 11, 14);
        Emprestimo emprestimo = new Emprestimo(new Equipamento(), new Colaborador(), dataEmprestimo);

        assertFalse(emprestimo.estaAtrasadoEm(dataConsulta));
    }

    @Test
    void consultaAposDevolucaoNaoDeveEstarAtrasadoMesmoQuandoDevolvidoComAtraso(){
        LocalDate dataEmprestimo = LocalDate.of(2026, 10, 27);
        LocalDate dataDevolucao = LocalDate.of(2026, 11, 12);
        LocalDate dataConsulta = LocalDate.of(2026, 11, 14);
        Emprestimo emprestimo = new Emprestimo(new Equipamento(), new Colaborador(), dataEmprestimo);

        emprestimo.devolver(dataDevolucao);

        assertFalse(emprestimo.estaAtrasadoEm(dataConsulta));
    }

    @Test
    void consultaNoUltimoDiaDoPrazoNaoDeveEstarAtrasado(){
        LocalDate dataEmprestimo = LocalDate.of(2026, 10, 31);
        LocalDate dataConsulta = LocalDate.of(2026, 11, 14);
        Emprestimo emprestimo = new Emprestimo(new Equipamento(), new Colaborador(), dataEmprestimo);

        assertFalse(emprestimo.estaAtrasadoEm(dataConsulta));
    }


}