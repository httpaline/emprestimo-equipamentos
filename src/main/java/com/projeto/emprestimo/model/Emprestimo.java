package com.projeto.emprestimo.model;

import jakarta.persistence.*;

import java.time.LocalDate;

@Entity
public class Emprestimo {

    private static final int PRAZO_DIAS = 14;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(nullable = false)
    private Equipamento equipamento;

    @ManyToOne
    @JoinColumn(nullable = false)
    private Colaborador colaborador;

    private LocalDate dataEmprestimo;
    private LocalDate dataPrevistaDevolucao;
    private LocalDate dataDevolucao;

    public Emprestimo(){}

    public Emprestimo(Equipamento equipamento, Colaborador colaborador, LocalDate hoje){
        this.colaborador = colaborador;
        this.equipamento = equipamento;
        dataEmprestimo = hoje;
        dataPrevistaDevolucao = hoje.plusDays(PRAZO_DIAS);
    }

    public void devolver(LocalDate data){
        if(dataDevolucao != null){
            throw new IllegalStateException("Esse empréstimo já foi devolvido em " + dataDevolucao);
        }
        dataDevolucao = data;
    }

    public boolean estaAtrasadoEm(LocalDate data) {
        return dataDevolucao == null && data.isAfter(dataPrevistaDevolucao);
    }

    public boolean isAtrasado(){
        return estaAtrasadoEm(LocalDate.now());
    }

    public Long getId() {
        return id;
    }

    public Equipamento getEquipamento() {
        return equipamento;
    }

    public Colaborador getColaborador() {
        return colaborador;
    }

    public LocalDate getDataEmprestimo() {
        return dataEmprestimo;
    }

    public LocalDate getDataPrevistaDevolucao() {
        return dataPrevistaDevolucao;
    }

    public LocalDate getDataDevolucao() {
        return dataDevolucao;
    }
}
