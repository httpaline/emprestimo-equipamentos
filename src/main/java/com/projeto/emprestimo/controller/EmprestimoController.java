package com.projeto.emprestimo.controller;

import com.projeto.emprestimo.model.Emprestimo;
import com.projeto.emprestimo.service.EmprestimoService;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/emprestimos")
public class EmprestimoController {

    private final EmprestimoService emprestimoService;

    public EmprestimoController(EmprestimoService emprestimoService) {
        this.emprestimoService = emprestimoService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Emprestimo emprestar(@RequestParam Long equipamentoId, @RequestParam Long colaboradorId){
        return emprestimoService.emprestar(equipamentoId, colaboradorId);
    }

    @GetMapping
    public List<Emprestimo> listar(@RequestParam(required = false) boolean atrasados){
        return emprestimoService.listar(atrasados);
    }

    @GetMapping("/{id}")
    public Emprestimo buscar(@PathVariable Long id){
        return emprestimoService.buscar(id);
    }

    @PutMapping("/{id}/devolucao")
    public Emprestimo devolver(@PathVariable Long id){
        return emprestimoService.devolver(id);
    }

}
