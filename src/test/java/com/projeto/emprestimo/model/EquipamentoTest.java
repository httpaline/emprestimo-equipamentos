package com.projeto.emprestimo.model;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class EquipamentoTest {

    @Test
    void emprestarEquipamentoDisponivelDeveFicarIndisponivel(){
        Equipamento equipamento = new Equipamento();

        equipamento.setDisponivel(true);

        equipamento.emprestar();

        assertFalse(equipamento.isDisponivel());
    }


    @Test
    void emprestarEquipamentoIndisponivelDeveLancarExcecao(){
        Equipamento equipamento = new Equipamento();

        equipamento.setDisponivel(false);

        assertThrows(IllegalStateException.class, () -> equipamento.emprestar());
    }

    @Test
    void devolverEquipamentoDeveFicarIndisponivel(){
        Equipamento equipamento = new Equipamento();

        equipamento.setDisponivel(false);

        equipamento.devolver();

        assertTrue(equipamento.isDisponivel());
    }
}